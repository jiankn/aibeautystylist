import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  CreditPackFulfillmentError,
  fulfillCreditPackCheckout,
} from "../../../lib/creditPackFulfillment";
import { apiError, apiSuccess } from "../../../lib/http";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../lib/runtime";
import { createStripeClient, StripeError } from "../../../lib/stripe";

export const POST: APIRoute = async ({ cookies, request }) => {
  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => null)) as {
    sessionId?: string;
  } | null;
  if (!body?.sessionId || !body.sessionId.startsWith("cs_")) {
    return apiError(
      {
        code: "INVALID_CHECKOUT_SESSION",
        message: "额度包订单编号无效",
        retryable: false,
      },
      422,
    );
  }
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

  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });
  try {
    const session = await stripe.retrieveCheckoutSession(body.sessionId);
    const sessionUserId =
      session.client_reference_id || session.metadata?.userId;
    if (sessionUserId !== auth.user.id) {
      return apiError(
        {
          code: "CHECKOUT_SESSION_FORBIDDEN",
          message: "该额度包订单不属于当前账户",
          retryable: false,
        },
        403,
      );
    }
    const result = await fulfillCreditPackCheckout({ session, bindings });
    return apiSuccess(result);
  } catch (error) {
    const code =
      error instanceof CreditPackFulfillmentError
        ? error.code
        : "CREDIT_PACK_SYNC_FAILED";
    const message =
      error instanceof Error ? error.message : "额度包到账同步失败";
    const retryable = error instanceof StripeError;
    return apiError({ code, message, retryable }, retryable ? 502 : 409);
  }
};
