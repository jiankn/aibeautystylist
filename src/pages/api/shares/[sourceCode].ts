import type { APIRoute } from "astro";

import { apiError, apiSuccess } from "../../../lib/http";
import { getStoredJobById, toLocalizedJobResponse } from "../../../lib/jobs";
import { getRuntimeBindings } from "../../../lib/runtime";
import { getPublicShareCardByCode } from "../../../lib/shareCards";

export const GET: APIRoute = async ({ locals, params }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) return shareNotFound();

  const sourceCode = params.sourceCode || "";
  const shareCard = await getPublicShareCardByCode(sourceCode, DB);
  if (!shareCard) return shareNotFound();

  const job = await getStoredJobById(shareCard.userId, shareCard.jobId, DB);
  if (!job || job.status !== "succeeded" || !job.resultImage) {
    return shareNotFound();
  }

  const resultImage = `/api/shares/${encodeURIComponent(
    shareCard.sourceCode,
  )}/result`;
  return apiSuccess({
    ...toLocalizedJobResponse(job, locals.audienceContext),
    shareCode: shareCard.sourceCode,
    resultImage,
  });
};

function shareNotFound(): Response {
  return apiError(
    {
      code: "SHARE_NOT_FOUND",
      message: "没有找到该分享结果",
      retryable: false,
    },
    404,
  );
}
