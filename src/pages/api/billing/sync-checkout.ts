import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  assertCheckoutSessionId,
  CheckoutSyncError,
  syncCheckoutSessionForUser,
} from "../../../lib/billingSync";
import { apiError, apiSuccess } from "../../../lib/http";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../lib/runtime";
import { createStripeClient, StripeError } from "../../../lib/stripe";

interface SyncCheckoutBody {
  sessionId?: string;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request
    .json()
    .catch(() => null)) as SyncCheckoutBody | null;
  let sessionId: string;
  try {
    sessionId = assertCheckoutSessionId(body?.sessionId);
  } catch (error) {
    const syncError = error as CheckoutSyncError;
    return apiError(
      {
        code: syncError.code,
        message: syncError.message,
        retryable: syncError.retryable,
      },
      syncError.status,
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

  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;

  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    const result = await syncCheckoutSessionForUser({
      sessionId,
      userId: auth.user.id,
      stripe,
      bindings,
    });
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof CheckoutSyncError) {
      return apiError(
        {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
        error.status,
      );
    }

    const message =
      error instanceof StripeError ? error.message : "同步结账状态失败";
    return apiError(
      { code: "CHECKOUT_SYNC_FAILED", message, retryable: true },
      502,
    );
  }
};
