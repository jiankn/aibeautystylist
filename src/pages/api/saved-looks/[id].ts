import type { APIRoute } from "astro";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";

// 取消收藏某个妆容
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
  const userId = auth.user.id;

  const targetId = params.id;
  if (!targetId) {
    return apiError(
      {
        code: "INVALID_REQUEST",
        message: "缺少要取消的收藏ID或任务ID",
        retryable: false,
      },
      422,
    );
  }

  // 检查是否存在并且属于当前用户
  const existing = await DB.prepare(
    "SELECT id FROM saved_looks WHERE user_id = ? AND (id = ? OR job_id = ?)",
  )
    .bind(userId, targetId, targetId)
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

  // 执行删除
  await DB.prepare(
    "DELETE FROM saved_looks WHERE user_id = ? AND (id = ? OR job_id = ?)",
  )
    .bind(userId, targetId, targetId)
    .run();

  return apiSuccess({
    id: existing.id,
    deleted: true,
    message: "已成功取消收藏",
  });
};
