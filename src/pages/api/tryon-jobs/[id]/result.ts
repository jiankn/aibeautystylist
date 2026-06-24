import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { apiError } from "../../../../lib/http";
import { getStoredJobById } from "../../../../lib/jobs";
import { getRuntimeBindings } from "../../../../lib/runtime";

const RESULT_CACHE = "private, max-age=3600, stale-while-revalidate=86400";

export const GET: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const job = params.id
    ? await getStoredJobById(userId, params.id, DB)
    : undefined;

  if (!job?.resultR2Key || !USER_UPLOADS) return resultNotFound();

  const object = await USER_UPLOADS.get(job.resultR2Key).catch(() => null);
  if (!object) return resultNotFound();

  return new Response(object.body as BodyInit, {
    headers: {
      "cache-control": RESULT_CACHE,
      "content-type": object.httpMetadata?.contentType ?? "image/png",
      "x-content-type-options": "nosniff",
    },
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
