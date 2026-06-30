import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { deleteOwnedPrivateLookTemplate } from "../../../lib/privateLookTemplates";
import { getRuntimeBindings } from "../../../lib/runtime";

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const { DB, USER_UPLOADS } = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  if (!params.id) return notFound();

  try {
    const deleted = await deleteOwnedPrivateLookTemplate(
      auth.user.id,
      params.id,
      DB,
      USER_UPLOADS,
    );
    if (!deleted) return notFound();
    return apiSuccess({ id: deleted.id, deletedAt: deleted.deletedAt });
  } catch {
    return apiError(
      {
        code: "PRIVATE_TEMPLATE_DELETE_FAILED",
        message: "参考妆容删除失败，请稍后重试",
        retryable: true,
      },
      503,
    );
  }
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
