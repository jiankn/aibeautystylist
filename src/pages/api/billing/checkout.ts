import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
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
    const session = await stripe.createCheckoutSession({
      priceId,
      successUrl: `${baseUrl}/pricing?checkout=success`,
      cancelUrl: `${baseUrl}/pricing?checkout=cancel`,
      clientReferenceId: userId,
      customerId: await getStripeCustomerId(userId, bindings.DB),
      metadata: { userId, planCode: body.planCode, priceId },
    });
    return apiSuccess({ id: session.id, url: session.url });
  } catch (error) {
    const message =
      error instanceof StripeError ? error.message : "创建结账会话失败";
    return apiError({ code: "CHECKOUT_FAILED", message, retryable: true }, 502);
  }
};
