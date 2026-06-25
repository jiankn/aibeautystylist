import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  previewActiveSubscriptionUpgrade,
  SubscriptionUpgradeError,
} from "../../../lib/billingUpgrade";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  isPlanCode,
  PLAN_DEFINITIONS,
  type BillingInterval,
  type PlanCode,
} from "../../../lib/plans";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings, type RuntimeBindings } from "../../../lib/runtime";
import { createStripeClient, StripeError } from "../../../lib/stripe";

interface UpgradePreviewBody {
  planCode?: string;
  interval?: string;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request
    .json()
    .catch(() => null)) as UpgradePreviewBody | null;
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
  const planCode = body.planCode as Exclude<PlanCode, "free">;

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

  const priceEnvKey = PLAN_DEFINITIONS[planCode].priceEnvKeys[interval];
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

  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    const preview = await previewActiveSubscriptionUpgrade({
      userId: auth.user.id,
      toPlanCode: planCode,
      interval,
      priceId,
      stripe,
      DB: bindings.DB,
    });
    return apiSuccess(preview);
  } catch (error) {
    if (error instanceof SubscriptionUpgradeError) {
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
      error instanceof StripeError ? error.message : "无法预览升级金额";
    return apiError(
      { code: "UPGRADE_PREVIEW_FAILED", message, retryable: true },
      502,
    );
  }
};
