import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { getEntitlementContext } from "../../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../../lib/http";
import {
  getStoredJobById,
  isRunningJobStatus,
  timeoutStoredJobIfExpired,
  toJobResponse,
  transitionStoredJob,
} from "../../../../lib/jobs";
import { refundQuota } from "../../../../lib/quota";
import { getRuntimeBindings } from "../../../../lib/runtime";

export const POST: APIRoute = async ({ cookies, params }) => {
  const { DB } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const storedJob = params.id
    ? await getStoredJobById(userId, params.id, DB)
    : undefined;

  if (!storedJob) {
    return apiError(
      {
        code: "JOB_NOT_FOUND",
        message: "没有找到该任务",
        retryable: false,
      },
      404,
    );
  }

  const timeoutResult = await timeoutStoredJobIfExpired(storedJob, DB);
  if (timeoutResult.timedOut) {
    await refundQuota(userId, storedJob.id, DB);
  }

  if (!isRunningJobStatus(timeoutResult.job.status)) {
    return apiError(
      {
        code: "JOB_NOT_CANCELLABLE",
        message:
          timeoutResult.job.status === "timed_out"
            ? "任务已超时，额度已自动返还"
            : "当前任务状态不能取消",
        retryable: false,
      },
      409,
    );
  }

  const cancelled = await transitionStoredJob(
    timeoutResult.job,
    "cancelled",
    DB,
  );
  await refundQuota(userId, cancelled.id, DB);
  const { quota } = await getEntitlementContext(userId, DB);

  return apiSuccess({
    ...toJobResponse(cancelled),
    quota,
  });
};
