import type { APIRoute } from "astro";

import { apiError } from "../../../../lib/http";
import { getStoredJobById } from "../../../../lib/jobs";
import { getRuntimeBindings } from "../../../../lib/runtime";
import { getPublicShareCardByCode } from "../../../../lib/shareCards";

const PUBLIC_RESULT_CACHE =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

export const GET: APIRoute = async ({ params, request }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  if (!DB) return resultNotFound();

  const sourceCode = params.sourceCode || "";
  const shareCard = await getPublicShareCardByCode(sourceCode, DB);
  if (!shareCard) return resultNotFound();

  const job = await getStoredJobById(shareCard.userId, shareCard.jobId, DB);
  if (!job || job.status !== "succeeded" || !job.resultImage) {
    return resultNotFound();
  }

  if (job.resultR2Key) {
    if (!USER_UPLOADS) return resultNotFound();
    const object = await USER_UPLOADS.get(job.resultR2Key).catch(() => null);
    if (!object) return resultNotFound();

    return new Response(object.body as BodyInit, {
      headers: {
        "cache-control": PUBLIC_RESULT_CACHE,
        "content-type": object.httpMetadata?.contentType ?? "image/png",
        "x-content-type-options": "nosniff",
      },
    });
  }

  if (job.resultImage && !job.resultImage.startsWith("/api/tryon-jobs/")) {
    return Response.redirect(new URL(job.resultImage, request.url), 302);
  }

  return resultNotFound();
};

function resultNotFound(): Response {
  return apiError(
    {
      code: "RESULT_NOT_FOUND",
      message: "没有找到该分享图片",
      retryable: false,
    },
    404,
  );
}
