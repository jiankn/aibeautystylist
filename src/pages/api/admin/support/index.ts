// Admin API: 工单列表。
import type { APIRoute } from "astro";

import { getBoundedIntParam } from "../../../../lib/adminApi";
import { checkAdmin } from "../../../../lib/adminGuard";
import { apiError, apiSuccess } from "../../../../lib/http";
import { getRuntimeBindings } from "../../../../lib/runtime";

export const GET: APIRoute = async ({ cookies, url }) => {
  const { DB } = getRuntimeBindings();
  if (!DB)
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: false },
      503,
    );

  const auth = await checkAdmin(cookies, DB);
  if (!auth.authorized) {
    return apiError(
      { code: "FORBIDDEN", message: "需要管理员权限", retryable: false },
      403,
    );
  }

  const page = getBoundedIntParam(url.searchParams, "page", 1, 1, 10_000);
  const limit = getBoundedIntParam(url.searchParams, "limit", 25, 1, 100);
  const status = url.searchParams.get("status") || "";
  const offset = (page - 1) * limit;

  let whereClause = "";
  const params: unknown[] = [];

  if (status && ["open", "resolved", "pending", "closed"].includes(status)) {
    whereClause = "WHERE status = ?";
    params.push(status);
  }

  const countRow = await (
    params.length
      ? DB.prepare(
          `SELECT COUNT(*) as cnt FROM support_requests ${whereClause}`,
        ).bind(...params)
      : DB.prepare(
          `SELECT COUNT(*) as cnt FROM support_requests ${whereClause}`,
        )
  ).first<{ cnt: number }>();
  const total = Number(countRow?.cnt ?? 0);

  const rows = await DB.prepare(
    `
    SELECT id, ticket_code, name, email, topic, message, locale, status, created_at, updated_at
    FROM support_requests
    ${whereClause}
    ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END, created_at DESC
    LIMIT ? OFFSET ?
  `,
  )
    .bind(...params, limit, offset)
    .all<{
      id: string;
      ticket_code: string;
      name: string;
      email: string;
      topic: string;
      message: string;
      locale: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>();

  return apiSuccess({
    generatedAt: new Date().toISOString(),
    filters: {
      status: status || "all",
    },
    tickets: rows.results ?? [],
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
};
