import type { APIRoute } from "astro";

import { getAccountByUserId } from "../../../lib/accounts";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { buildCheckoutStatusUrl } from "../../../lib/checkoutRedirect";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  isPlanCode,
  PLAN_DEFINITIONS,
  type BillingInterval,
} from "../../../lib/plans";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings, type RuntimeBindings } from "../../../lib/runtime";
import { createStripeClient, StripeError } from "../../../lib/stripe";
import { getStripeCustomerId } from "../../../lib/subscriptions";

interface CheckoutBody {
  planCode?: string;
  interval?: string;
  pricingPath?: string;
  returnTo?: string;
}

function withCheckoutSessionId(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  const interval: BillingInterval =
    body?.interval === "yearly" ? "yearly" : "monthly";

  if (!isPlanCode(body?.planCode) || body?.planCode === "free") {
    return apiError(
      {
        code: "INVALID_PLAN",
        message: "请选择 Pro 或 Premium 计划",
        retryable: false,
      },
      422,
    );
  }

  const bindings = getRuntimeBindings();
  if (!bindings.STRIPE_SECRET_KEY) {
    return apiError(
      {
        code: "BILLING_NOT_CONFIGURED",
        message: "支付尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const priceEnvKey = PLAN_DEFINITIONS[body.planCode].priceEnvKeys[interval];
  const priceId = priceEnvKey
    ? bindings[priceEnvKey as keyof RuntimeBindings]
    : undefined;
  if (!priceId || typeof priceId !== "string") {
    return apiError(
      {
        code: "PRICE_NOT_CONFIGURED",
        message: "所选计划的价格尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const baseUrl = bindings.APP_PUBLIC_URL ?? new URL(request.url).origin;
  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    const account = bindings.DB
      ? await getAccountByUserId(userId, bindings.DB)
      : undefined;
    const customerId = await getStripeCustomerId(userId, bindings.DB);
    if (customerId && account?.email) {
      await stripe.updateCustomer({ customerId, email: account.email });
    }

    const session = await stripe.createCheckoutSession({
      priceId,
      successUrl: withCheckoutSessionId(
        buildCheckoutStatusUrl({
          baseUrl,
          pricingPath: body?.pricingPath,
          status: "success",
          returnTo: body?.returnTo,
        }),
      ),
      cancelUrl: buildCheckoutStatusUrl({
        baseUrl,
        pricingPath: body?.pricingPath,
        status: "cancel",
        returnTo: body?.returnTo,
      }),
      clientReferenceId: userId,
      customerId,
      customerEmail: account?.email,
      metadata: { userId, planCode: body.planCode, priceId },
    });
    return apiSuccess({ id: session.id, url: session.url });
  } catch (error) {
    const message =
      error instanceof StripeError ? error.message : "创建结账会话失败";
    return apiError({ code: "CHECKOUT_FAILED", message, retryable: true }, 502);
  }
};
