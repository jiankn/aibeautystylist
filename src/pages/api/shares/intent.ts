import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import { getStoredJobById } from "../../../lib/jobs";
import {
  createShareClaimIntent,
  isShareIntentMethod,
} from "../../../lib/shareIntents";
import { getRuntimeBindings } from "../../../lib/runtime";

export const POST: APIRoute = async ({ cookies, request }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;

  const body = (await request.json().catch(() => null)) as {
    jobId?: string;
    method?: string;
  } | null;
  if (!body?.jobId || !isShareIntentMethod(body.method)) {
    return apiError(
      {
        code: "INVALID_SHARE_INTENT",
        message: "请先完成一次有效的分享动作",
        retryable: false,
      },
      422,
    );
  }

  const { plan } = await getEntitlementContext(userId, DB);
  if (plan.planCode !== "free") {
    return apiError(
      {
        code: "FORBIDDEN",
        message: "分享奖励仅适用于 Free 用户",
        retryable: false,
      },
      403,
    );
  }

  const job = await getStoredJobById(userId, body.jobId, DB);
  if (!job) {
    return apiError(
      {
        code: "JOB_NOT_FOUND",
        message: "没有找到可分享的试妆结果",
        retryable: false,
      },
      404,
    );
  }

  if (job.status !== "succeeded") {
    return apiError(
      {
        code: "JOB_NOT_SHAREABLE",
        message: "只有已完成的试妆结果可以分享领奖",
        retryable: false,
      },
      409,
    );
  }

  const intent = await createShareClaimIntent({
    userId,
    jobId: job.id,
    method: body.method,
    DB,
  });

  return apiSuccess(intent, { status: 201 });
};
