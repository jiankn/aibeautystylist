import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../lib/runtime";
import { createStripeClient, StripeError } from "../../../lib/stripe";
import { getStripeCustomerId } from "../../../lib/subscriptions";

export const POST: APIRoute = async ({ cookies, request }) => {
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

  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const customerId = await getStripeCustomerId(auth.user.id, bindings.DB);
  if (!customerId) {
    return apiError(
      {
        code: "NO_BILLING_CUSTOMER",
        message: "没有可管理的订阅",
        retryable: false,
      },
      404,
    );
  }

  const baseUrl = bindings.APP_PUBLIC_URL ?? new URL(request.url).origin;
  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    const session = await stripe.createBillingPortalSession({
      customerId,
      returnUrl: `${baseUrl}/pricing`,
    });
    return apiSuccess({ url: session.url });
  } catch (error) {
    const message =
      error instanceof StripeError ? error.message : "创建管理会话失败";
    return apiError({ code: "PORTAL_FAILED", message, retryable: true }, 502);
  }
};
