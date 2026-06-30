import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { apiError } from "../../../../lib/http";
import { getOwnedPrivateLookTemplate } from "../../../../lib/privateLookTemplates";
import { getRuntimeBindings } from "../../../../lib/runtime";

export const GET: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  if (!params.id || !USER_UPLOADS) return notFound();

  const template = await getOwnedPrivateLookTemplate(
    auth.user.id,
    params.id,
    DB,
  );
  if (!template) return notFound();

  const object = await USER_UPLOADS.get(template.r2Key);
  if (!object) return notFound();
  return new Response(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? template.contentType,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

function notFound(): Response {
  return apiError(
    {
      code: "PRIVATE_TEMPLATE_NOT_FOUND",
      message: "没有找到该私有参考妆容",
      retryable: false,
    },
    404,
  );
}
