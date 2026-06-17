// Admin API: AI 成本分析数据。
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

  const [byModel, byDay, byOperation, recentCalls] = await Promise.all([
    // 按模型分组统计
    DB.prepare(
      `
      SELECT
        COALESCE(model, 'unknown') as model,
        provider,
        COUNT(*) as call_count,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as success_count,
        COALESCE(SUM(total_tokens), 0) as total_tokens,
        COALESCE(SUM(estimated_cost_micros), 0) as total_cost_micros,
        ROUND(AVG(duration_ms), 0) as avg_duration_ms
      FROM ai_call_logs
      WHERE created_at >= ?
      GROUP BY model, provider
      ORDER BY total_cost_micros DESC
    `,
    )
      .bind(since)
      .all<{
        model: string;
        provider: string;
        call_count: number;
        success_count: number;
        total_tokens: number;
        total_cost_micros: number;
        avg_duration_ms: number;
      }>(),

    // 按天统计成本趋势
    DB.prepare(
      `
      SELECT
        DATE(created_at) as day,
        COUNT(*) as call_count,
        COALESCE(SUM(estimated_cost_micros), 0) as cost_micros,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as success_count
      FROM ai_call_logs
      WHERE created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY day
    `,
    )
      .bind(since)
      .all<{
        day: string;
        call_count: number;
        cost_micros: number;
        success_count: number;
      }>(),

    // 按操作类型分组
    DB.prepare(
      `
      SELECT
        operation,
        COUNT(*) as call_count,
        COALESCE(SUM(estimated_cost_micros), 0) as total_cost_micros,
        ROUND(AVG(duration_ms), 0) as avg_duration_ms,
        SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) as success_count
      FROM ai_call_logs
      WHERE created_at >= ?
      GROUP BY operation
    `,
    )
      .bind(since)
      .all<{
        operation: string;
        call_count: number;
        total_cost_micros: number;
        avg_duration_ms: number;
        success_count: number;
      }>(),

    // 最近 20 条调用记录
    DB.prepare(
      `
      SELECT
        id, user_id, job_id, provider, operation, model, status,
        duration_ms, prompt_tokens, output_tokens, total_tokens,
        estimated_cost_micros, error_code, created_at
      FROM ai_call_logs
      ORDER BY created_at DESC
      LIMIT 20
    `,
    ).all<{
      id: string;
      user_id: string;
      job_id: string;
      provider: string;
      operation: string;
      model: string;
      status: string;
      duration_ms: number;
      prompt_tokens: number;
      output_tokens: number;
      total_tokens: number;
      estimated_cost_micros: number;
      error_code: string;
      created_at: string;
    }>(),
  ]);

  return apiSuccess({
    byModel: byModel.results ?? [],
    byDay: byDay.results ?? [],
    byOperation: byOperation.results ?? [],
    recentCalls: recentCalls.results ?? [],
  });
};
