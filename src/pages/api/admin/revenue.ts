// Admin API: 收入与订阅分析数据。
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

  const days = getBoundedIntParam(url.searchParams, "days", 30, 7, 90);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const [
    planDistribution,
    subscriptionsByDay,
    statusDistribution,
    totalSubscriptions,
    recentSubscriptions,
  ] = await Promise.all([
    // 各计划订阅分布
    DB.prepare(
      `
      WITH ranked_subscriptions AS (
        SELECT user_id, plan_code,
          ROW_NUMBER() OVER (
            PARTITION BY user_id
            ORDER BY CASE plan_code WHEN 'premium' THEN 3 WHEN 'pro' THEN 2 ELSE 1 END DESC, updated_at DESC
          ) as rn
        FROM subscriptions
        WHERE status IN ('active', 'trialing', 'past_due')
          OR (status = 'canceled' AND current_period_end IS NOT NULL AND current_period_end > ?)
      )
      SELECT plan_code, COUNT(*) as cnt
      FROM ranked_subscriptions
      WHERE rn = 1
      GROUP BY plan_code
    `,
    )
      .bind(now)
      .all<{ plan_code: string; cnt: number }>(),

    // 每日新增订阅趋势
    DB.prepare(
      `
      SELECT DATE(created_at) as day, plan_code, COUNT(*) as cnt
      FROM subscriptions
      WHERE created_at >= ?
      GROUP BY DATE(created_at), plan_code
      ORDER BY day
    `,
    )
      .bind(since)
      .all<{ day: string; plan_code: string; cnt: number }>(),

    // 订阅状态分布
    DB.prepare(
      `
      SELECT status, COUNT(*) as cnt
      FROM subscriptions
      GROUP BY status
    `,
    ).all<{ status: string; cnt: number }>(),

    // 总订阅数（所有状态）
    DB.prepare("SELECT COUNT(*) as cnt FROM subscriptions").first<{
      cnt: number;
    }>(),

    // 最近 10 条订阅变动
    DB.prepare(
      `
      SELECT s.id, s.user_id, COALESCE(a.email, u.email, 'unknown') as email,
        s.plan_code, s.status, s.stripe_subscription_id, s.created_at, s.updated_at
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN auth_accounts a ON s.user_id = a.user_id
      ORDER BY s.updated_at DESC
      LIMIT 10
    `,
    ).all<{
      id: string;
      user_id: string;
      email: string;
      plan_code: string;
      status: string;
      stripe_subscription_id: string;
      created_at: string;
      updated_at: string;
    }>(),
  ]);

  return apiSuccess({
    planDistribution: planDistribution.results ?? [],
    subscriptionsByDay: subscriptionsByDay.results ?? [],
    statusDistribution: statusDistribution.results ?? [],
    totalSubscriptions: Number(totalSubscriptions?.cnt ?? 0),
    recentSubscriptions: recentSubscriptions.results ?? [],
  });
};
