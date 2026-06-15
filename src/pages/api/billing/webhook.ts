import type { APIRoute } from "astro";

import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { handleStripeEvent } from "../../../lib/stripeEvents";
import {
  verifyStripeWebhook,
  WebhookVerifyError,
} from "../../../lib/stripeWebhook";

export const POST: APIRoute = async ({ request }) => {
  const bindings = getRuntimeBindings();
  if (!bindings.STRIPE_WEBHOOK_SECRET) {
    return apiError(
      {
        code: "WEBHOOK_NOT_CONFIGURED",
        message: "Webhook 尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const payload = await request.text();
  let event;
  try {
    event = await verifyStripeWebhook({
      payload,
      signatureHeader: request.headers.get("stripe-signature"),
      secret: bindings.STRIPE_WEBHOOK_SECRET,
    });
  } catch (error) {
    const code =
      error instanceof WebhookVerifyError ? error.code : "WEBHOOK_INVALID";
    // 签名/负载问题返回 400，让 Stripe 不再以「已接受」对待。
    return apiError(
      { code, message: "Webhook 校验失败", retryable: false },
      400,
    );
  }

  try {
    const result = await handleStripeEvent(event, bindings);
    return apiSuccess({
      received: true,
      handled: result.handled,
      duplicate: result.duplicate,
    });
  } catch {
    // 处理失败返回 500，Stripe 会重试（幂等去重保证不会重复生效）。
    return apiError(
      {
        code: "WEBHOOK_PROCESSING_FAILED",
        message: "Webhook 处理失败",
        retryable: true,
      },
      500,
    );
  }
};
