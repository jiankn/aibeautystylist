import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { apiError } from "../../../../lib/http";
import { getStoredJobById } from "../../../../lib/jobs";
import { resolvePinterestGuestJobOwner } from "../../../../lib/pinterestGuestPass";
import { getRuntimeBindings } from "../../../../lib/runtime";
import { getOwnedUpload } from "../../../../lib/uploadRecords";

export const GET: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const jobId = params.id;
  if (!jobId) return originalNotFound();
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

  if (!job?.uploadId || !USER_UPLOADS) return originalNotFound();

  const upload = await getOwnedUpload(userId, job.uploadId, DB);
  if (!upload?.r2Key || upload.deletedAt) return originalNotFound();

  const object = await USER_UPLOADS.get(upload.r2Key).catch(() => null);
  if (!object) return originalNotFound();

  return new Response(object.body as BodyInit, {
    headers: {
      "cache-control": "private, max-age=3600, stale-while-revalidate=86400",
      "content-type":
        object.httpMetadata?.contentType ?? upload.contentType ?? "image/jpeg",
      "x-content-type-options": "nosniff",
    },
  });
};

function originalNotFound(): Response {
  return apiError(
    {
      code: "ORIGINAL_NOT_FOUND",
      message: "没有找到该原始自拍或原图已删除",
      retryable: false,
    },
    404,
  );
}
