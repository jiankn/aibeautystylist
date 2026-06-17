// Admin API: 用户列表（分页、搜索、筛选）。
import type { APIRoute } from "astro";

import { getBoundedIntParam } from "../../../lib/adminApi";
import { checkAdmin } from "../../../lib/adminGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";

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
  const search = url.searchParams.get("search")?.trim() || "";
  const plan = url.searchParams.get("plan") || "";
  const now = new Date().toISOString();
  const offset = (page - 1) * limit;

  // 构建查询条件
  let whereClause = "WHERE u.deleted_at IS NULL";
  const params: unknown[] = [now];

  if (search) {
    whereClause += " AND (u.email LIKE ? OR a.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (plan && ["free", "pro", "premium"].includes(plan)) {
    if (plan === "free") {
      whereClause += " AND (s.user_id IS NULL OR s.plan_code = 'free')";
    } else {
      whereClause += " AND s.plan_code = ?";
      params.push(plan);
    }
  }

  // 查询总数
  const countQuery = `
    WITH ranked_subscriptions AS (
      SELECT user_id, plan_code, status,
        ROW_NUMBER() OVER (
          PARTITION BY user_id
          ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'pro' THEN 2 ELSE 1 END DESC, updated_at DESC
        ) as rn
      FROM subscriptions
      WHERE status IN ('active', 'trialing', 'past_due')
        OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > ?)
    )
    SELECT COUNT(DISTINCT u.id) as cnt FROM users u
    LEFT JOIN auth_accounts a ON u.id = a.user_id
    LEFT JOIN ranked_subscriptions s ON u.id = s.user_id AND s.rn = 1
    ${whereClause}
  `;
  const countStmt = DB.prepare(countQuery);
  const countRow = await (
    params.length > 0 ? countStmt.bind(...params) : countStmt
  ).first<{ cnt: number }>();
  const total = Number(countRow?.cnt ?? 0);

  // 查询用户列表（含订阅信息和用量统计）
  const listQuery = `
    WITH ranked_subscriptions AS (
      SELECT user_id, plan_code, status,
        ROW_NUMBER() OVER (
          PARTITION BY user_id
          ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'pro' THEN 2 ELSE 1 END DESC, updated_at DESC
        ) as rn
      FROM subscriptions
      WHERE status IN ('active', 'trialing', 'past_due')
        OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > ?)
    )
    SELECT
      u.id,
      COALESCE(a.email, u.email) as email,
      u.created_at,
      COALESCE(s.plan_code, 'free') as plan_code,
      COALESCE(s.status, 'none') as subscription_status,
      (SELECT COUNT(*) FROM tryon_jobs t WHERE t.user_id = u.id) as tryon_count,
      (SELECT COALESCE(-SUM(amount), 0) FROM usage_records ur
       WHERE ur.user_id = u.id AND ur.occurred_at >= datetime('now', 'start of month')
       AND ur.type = 'reserve') as monthly_used
    FROM users u
    LEFT JOIN auth_accounts a ON u.id = a.user_id
    LEFT JOIN ranked_subscriptions s ON u.id = s.user_id AND s.rn = 1
    ${whereClause}
    GROUP BY u.id
    ORDER BY u.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const allParams = [...params, limit, offset];
  const listStmt = DB.prepare(listQuery);
  const rows = await listStmt.bind(...allParams).all<{
    id: string;
    email: string;
    created_at: string;
    plan_code: string;
    subscription_status: string;
    tryon_count: number;
    monthly_used: number;
  }>();

  return apiSuccess({
    users: rows.results ?? [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
