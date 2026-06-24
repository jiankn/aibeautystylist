import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { ensureFavoriteLooksSchema } from "../../../lib/favoriteLooksSchema";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  await ensureFavoriteLooksSchema(DB);

  const lookSlug = params.slug;
  if (!lookSlug) {
    return apiError(
      {
        code: "INVALID_REQUEST",
        message: "缺少要取消收藏的妆容标识",
        retryable: false,
      },
      422,
    );
  }

  const existing = await DB.prepare(
    "SELECT id FROM favorite_looks WHERE user_id = ? AND look_slug = ?",
  )
    .bind(auth.user.id, lookSlug)
    .first<{ id: string }>();

  if (!existing) {
    return apiError(
      {
        code: "NOT_FOUND",
        message: "未找到该收藏记录，或该记录不属于您",
        retryable: false,
      },
      404,
    );
  }

  await DB.prepare(
    "DELETE FROM favorite_looks WHERE user_id = ? AND look_slug = ?",
  )
    .bind(auth.user.id, lookSlug)
    .run();

  return apiSuccess({
    id: existing.id,
    lookSlug,
    deleted: true,
  });
};
