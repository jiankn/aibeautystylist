import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getStoredJobById } from "../../../lib/jobs";
import { getRuntimeBindings } from "../../../lib/runtime";
import {
  createOrGetPublicShareCard,
  hasRequiredPublicShareConsent,
} from "../../../lib/shareCards";

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

  const body = (await request.json().catch(() => null)) as {
    jobId?: string;
    visibilityConsent?: boolean;
    consentVersion?: string;
  } | null;
  if (!body?.jobId) {
    return apiError(
      {
        code: "INVALID_SHARE_REQUEST",
        message: "缺少可分享的试妆结果",
        retryable: false,
      },
      422,
    );
  }

  const job = await getStoredJobById(auth.user.id, body.jobId, DB);
  if (!job) {
    return apiError(
      {
        code: "JOB_NOT_FOUND",
        message: "没有找到该试妆结果",
        retryable: false,
      },
      404,
    );
  }
  if (job.status !== "succeeded" || !job.resultImage) {
    return apiError(
      {
        code: "JOB_NOT_SHAREABLE",
        message: "只有已完成的试妆结果可以分享",
        retryable: false,
      },
      409,
    );
  }
  if (
    !hasRequiredPublicShareConsent({
      lookSource: job.lookSource,
      visibilityConsent: body.visibilityConsent,
      consentVersion: body.consentVersion,
    })
  ) {
    return apiError(
      {
        code: "PUBLIC_SHARE_CONSENT_REQUIRED",
        message: "公开分享私有参考妆容前需要确认分享范围",
        retryable: false,
      },
      422,
    );
  }
  const shareCard = await createOrGetPublicShareCard({
    userId: auth.user.id,
    jobId: job.id,
    DB,
  });

  return apiSuccess(
    {
      jobId: job.id,
      sourceCode: shareCard.sourceCode,
      sharePath: `/share/${encodeURIComponent(shareCard.sourceCode)}`,
    },
    { status: 201 },
  );
};
