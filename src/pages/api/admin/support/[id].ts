// Admin API: 工单状态更新。
import type { APIRoute } from "astro";

import { checkAdmin, logAdminAction } from "../../../../lib/adminGuard";
import { apiError, apiSuccess } from "../../../../lib/http";
import { getRuntimeBindings } from "../../../../lib/runtime";

const VALID_STATUSES = new Set(["open", "pending", "resolved", "closed"]);

export const PATCH: APIRoute = async ({ cookies, request, params }) => {
  const { DB } = getRuntimeBindings();
  if (!DB)
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: false },
      503,
    );

  const auth = await checkAdmin(cookies, DB);
  if (!auth.authorized || !auth.userId) {
    return apiError(
      { code: "FORBIDDEN", message: "需要管理员权限", retryable: false },
      403,
    );
  }

  const ticketId = params.id;
  if (!ticketId) {
    return apiError(
      { code: "INVALID_ID", message: "缺少工单 ID", retryable: false },
      400,
    );
  }

  const body = (await request.json().catch(() => null)) as {
    status?: string;
  } | null;
  if (!body?.status || !VALID_STATUSES.has(body.status)) {
    return apiError(
      { code: "INVALID_STATUS", message: "无效的工单状态", retryable: false },
      400,
    );
  }

  const existing = await DB.prepare(
    "SELECT status FROM support_requests WHERE id = ?",
  )
    .bind(ticketId)
    .first<{ status: string }>();
  if (!existing) {
    return apiError(
      { code: "NOT_FOUND", message: "工单不存在", retryable: false },
      404,
    );
  }

  const now = new Date().toISOString();
  const result = (await DB.prepare(
    "UPDATE support_requests SET status = ?, updated_at = ? WHERE id = ?",
  )
    .bind(body.status, now, ticketId)
    .run()) as { meta?: { changes?: number } } | undefined;
  if (
    result?.meta &&
    typeof result.meta.changes === "number" &&
    result.meta.changes < 1
  ) {
    return apiError(
      { code: "NOT_FOUND", message: "工单不存在", retryable: false },
      404,
    );
  }

  // 记录审计日志
  await logAdminAction(auth.userId, "update_ticket_status", DB, {
    targetType: "support_request",
    targetId: ticketId,
    details: { oldStatus: existing.status, newStatus: body.status },
  });

  return apiSuccess({ id: ticketId, status: body.status, updatedAt: now });
};
