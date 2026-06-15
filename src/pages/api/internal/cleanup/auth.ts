import type { APIRoute } from "astro";

import { apiError, apiSuccess } from "../../../../lib/http";
import { cleanupRateLimitEvents } from "../../../../lib/rateLimit";
import { getRuntimeBindings } from "../../../../lib/runtime";

// 清理过期的认证数据：sessions、tokens、rate_limit_events。
// 用 CLEANUP_SECRET 保护，可由 Cloudflare Cron Trigger 或外部调度定期调用。
export const POST: APIRoute = async ({ request }) => {
  const bindings = getRuntimeBindings();
  const { CLEANUP_SECRET, DB } = bindings;

  if (!CLEANUP_SECRET) {
    return apiError(
      {
        code: "CLEANUP_NOT_CONFIGURED",
        message: "清理任务尚未配置",
        retryable: false,
      },
      503,
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${CLEANUP_SECRET}`) {
    return apiError(
      {
        code: "FORBIDDEN",
        message: "无权执行清理任务",
        retryable: false,
      },
      403,
    );
  }
  if (!DB) {
    return apiError(
      {
        code: "CLEANUP_NOT_CONFIGURED",
        message: "数据库绑定不可用",
        retryable: true,
      },
      503,
    );
  }

  const now = new Date();
  const nowIso = now.toISOString();

  // 1. 清理过期的 session（expires_at 已过 + 至少 7 天缓冲）。
  const sessionCutoff = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const sessionResult = (await DB.prepare(
    "DELETE FROM auth_sessions WHERE expires_at < ? OR revoked_at IS NOT NULL AND revoked_at < ?",
  )
    .bind(sessionCutoff, sessionCutoff)
    .run()) as { meta?: { changes?: number } } | undefined;
  const sessionsDeleted = sessionResult?.meta?.changes ?? 0;

  // 2. 清理已消费或已过期的 token。
  const tokenResult = (await DB.prepare(
    "DELETE FROM auth_tokens WHERE consumed_at IS NOT NULL OR expires_at < ?",
  )
    .bind(nowIso)
    .run()) as { meta?: { changes?: number } } | undefined;
  const tokensDeleted = tokenResult?.meta?.changes ?? 0;

  // 3. 清理速率限制事件（默认 2 小时前）。
  const rateLimitDeleted = await cleanupRateLimitEvents(DB, undefined, now);

  return apiSuccess({
    sessionsDeleted,
    tokensDeleted,
    rateLimitDeleted,
    cleanedAt: nowIso,
  });
};
