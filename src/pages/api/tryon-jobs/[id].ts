import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  deleteOwnedJob,
  getStoredJobById,
  isRunningJobStatus,
  timeoutStoredJobIfExpired,
  toLocalizedJobResponse,
} from "../../../lib/jobs";
import {
  completePinterestGuestJob,
  pinterestGuestPassState,
  resolvePinterestGuestJobOwner,
} from "../../../lib/pinterestGuestPass";
import { refundQuota } from "../../../lib/quota";
import { getRuntimeBindings } from "../../../lib/runtime";
import { getOwnedUpload } from "../../../lib/uploadRecords";

export const GET: APIRoute = async ({ cookies, locals, params }) => {
  const { DB } = getRuntimeBindings();
  const jobId = params.id;
  if (!jobId) return jobNotFound();
  const auth = await requireAuthenticatedUser(cookies, DB);
  const guestPass = auth.ok
    ? undefined
    : await resolvePinterestGuestJobOwner(cookies, jobId, DB);
  if (!auth.ok && !guestPass) return auth.response;
  const userId = auth.ok ? auth.user.id : guestPass?.guestUserId;
  if (!userId) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Please sign in before continuing.",
        retryable: false,
      },
      401,
    );
  }
  const job = await getStoredJobById(userId, jobId, DB);

  if (!job) return jobNotFound();

  const timeoutResult = await timeoutStoredJobIfExpired(job, DB);
  if (timeoutResult.timedOut) {
    await refundQuota(userId, job.id, DB);
  }
  const { quota } = await getEntitlementContext(userId, DB);
  const latestJob = timeoutResult.job;
  if (guestPass && !isRunningJobStatus(latestJob.status)) {
    await completePinterestGuestJob(guestPass.id, DB).catch(() => undefined);
  }
  const upload = await getOwnedUpload(userId, latestJob.uploadId, DB);
  const originalImage =
    upload?.r2Key && !upload.deletedAt
      ? `/api/tryon-jobs/${latestJob.id}/original`
      : undefined;

  return apiSuccess({
    ...toLocalizedJobResponse(latestJob, locals.audienceContext),
    originalImage,
    quota,
    guestTry: guestPass
      ? pinterestGuestPassState({
          ...guestPass,
          completedAt: isRunningJobStatus(latestJob.status)
            ? guestPass.completedAt
            : (guestPass.completedAt ?? new Date().toISOString()),
        })
      : undefined,
  });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const jobId = params.id;
  if (!jobId) return jobNotFound();
  const auth = await requireAuthenticatedUser(cookies, DB);
  const guestPass = auth.ok
    ? undefined
    : await resolvePinterestGuestJobOwner(cookies, jobId, DB);
  if (!auth.ok && !guestPass) return auth.response;
  const userId = auth.ok ? auth.user.id : guestPass?.guestUserId;
  if (!userId) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Please sign in before continuing.",
        retryable: false,
      },
      401,
    );
  }
  let result;
  try {
    result = await deleteOwnedJob(userId, jobId, DB, USER_UPLOADS);
  } catch {
    return apiError(
      {
        code: "DELETE_FAILED",
        message: "试妆结果删除失败，请稍后重试",
        retryable: true,
      },
      503,
    );
  }

  if (!result) return jobNotFound();
  return apiSuccess(result);
};

function jobNotFound(): Response {
  return apiError(
    {
      code: "JOB_NOT_FOUND",
      message: "没有找到该任务",
      retryable: false,
    },
    404,
  );
}
