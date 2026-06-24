import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  deleteOwnedJob,
  getStoredJobById,
  timeoutStoredJobIfExpired,
  toLocalizedJobResponse,
} from "../../../lib/jobs";
import { refundQuota } from "../../../lib/quota";
import { getRuntimeBindings } from "../../../lib/runtime";
import { getOwnedUpload } from "../../../lib/uploadRecords";

export const GET: APIRoute = async ({ cookies, locals, params }) => {
  const { DB } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const job = params.id
    ? await getStoredJobById(userId, params.id, DB)
    : undefined;

  if (!job) return jobNotFound();

  const timeoutResult = await timeoutStoredJobIfExpired(job, DB);
  if (timeoutResult.timedOut) {
    await refundQuota(userId, job.id, DB);
  }
  const { quota } = await getEntitlementContext(userId, DB);
  const latestJob = timeoutResult.job;
  const upload = await getOwnedUpload(userId, latestJob.uploadId, DB);
  const originalImage =
    upload?.r2Key && !upload.deletedAt
      ? `/api/tryon-jobs/${latestJob.id}/original`
      : undefined;

  return apiSuccess({
    ...toLocalizedJobResponse(latestJob, locals.audienceContext),
    originalImage,
    quota,
  });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  let result;
  try {
    result = params.id
      ? await deleteOwnedJob(userId, params.id, DB, USER_UPLOADS)
      : undefined;
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
