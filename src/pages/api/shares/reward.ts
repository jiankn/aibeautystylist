import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import { getStoredJobById } from "../../../lib/jobs";
import { grantShareReward } from "../../../lib/quota";
import { getRuntimeBindings } from "../../../lib/runtime";

// 分享奖励：每 UTC 自然日最多奖励 1 次额度。
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
  } | null;
  if (!body?.jobId) {
    return apiError(
      {
        code: "MISSING_JOB_ID",
        message: "请指定要分享的试妆结果",
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
        message: "只有已完成的试妆结果可以领取分享奖励",
        retryable: false,
      },
      409,
    );
  }

  const grant = await grantShareReward(userId, job.id, DB);
  if (!grant.rewarded) {
    return apiSuccess({
      rewarded: false,
      reason: "今日已获得分享奖励，每天最多 1 次",
      quota: grant.snapshot,
    });
  }

  return apiSuccess({
    rewarded: true,
    message: "分享成功，额度 +1！",
    quota: grant.snapshot,
  });
};
