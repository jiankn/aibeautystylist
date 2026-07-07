import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { apiError } from "../../../../lib/http";
import {
  createResultImageResponse,
  isImageVariantsEnabled,
  normalizeResultImageVariant,
} from "../../../../lib/imageVariants";
import { getStoredJobById } from "../../../../lib/jobs";
import { resolvePinterestGuestJobOwner } from "../../../../lib/pinterestGuestPass";
import { getRuntimeBindings } from "../../../../lib/runtime";

const RESULT_CACHE = "private, max-age=3600, stale-while-revalidate=86400";
const RESULT_VARIANT_CACHE =
  "private, max-age=86400, stale-while-revalidate=604800";

export const GET: APIRoute = async ({ cookies, params, url }) => {
  const bindings = getRuntimeBindings();
  const { DB, USER_UPLOADS } = bindings;
  const jobId = params.id;
  if (!jobId) return resultNotFound();
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

  if (!job?.resultR2Key || !USER_UPLOADS) return resultNotFound();

  const object = await USER_UPLOADS.get(job.resultR2Key).catch(() => null);
  if (!object) return resultNotFound();

  return createResultImageResponse({
    object,
    images: bindings.IMAGES,
    variant: normalizeResultImageVariant(url.searchParams.get("variant")),
    variantsEnabled: isImageVariantsEnabled(bindings.ENABLE_CF_IMAGE_VARIANTS),
    fallbackContentType: "image/png",
    originalCacheControl: RESULT_CACHE,
    variantCacheControl: RESULT_VARIANT_CACHE,
    context: `tryon-job:${job.id}`,
  });
};

function resultNotFound(): Response {
  return apiError(
    {
      code: "RESULT_NOT_FOUND",
      message: "没有找到该试妆结果或结果已删除",
      retryable: false,
    },
    404,
  );
}
