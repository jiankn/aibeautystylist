// 基于 D1 的滑动窗口速率限制器。
// 用于保护认证端点（login / register / forgot-password）免受暴力破解与滥用。
// key 格式：`action:ip`（如 `login:203.0.113.5`）。

import type { D1DatabaseLike } from "./runtime";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export interface RateLimitConfig {
  /** 窗口大小（毫秒） */
  windowMs: number;
  /** 窗口内允许的最大请求数 */
  maxRequests: number;
}

// 预定义的限频策略。
export const RATE_LIMITS = {
  /** 登录：每 IP 15 分钟内最多 10 次 */
  login: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  } satisfies RateLimitConfig,
  /** 注册：每 IP 1 小时内最多 5 次 */
  register: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  } satisfies RateLimitConfig,
  /** 忘记密码：每 IP 15 分钟内最多 5 次 */
  forgotPassword: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  } satisfies RateLimitConfig,
} as const;

/**
 * 检查并记录一次速率限制事件。
 * 在窗口内超出 maxRequests 则拒绝；否则记录本次请求并放行。
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<RateLimitResult> {
  const windowStart = new Date(now.getTime() - config.windowMs).toISOString();
  const nowIso = now.toISOString();

  // 查询窗口内的请求计数。
  const row = await DB.prepare(
    "SELECT COUNT(*) AS cnt FROM rate_limit_events WHERE key = ? AND created_at >= ?",
  )
    .bind(key, windowStart)
    .first<{ cnt: number }>();

  const count = row?.cnt ?? 0;

  if (count >= config.maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // 放行：记录本次请求事件。
  await DB.prepare(
    "INSERT INTO rate_limit_events (key, created_at) VALUES (?, ?)",
  )
    .bind(key, nowIso)
    .run();

  return { allowed: true, remaining: config.maxRequests - count - 1 };
}

/**
 * 从 Request 中提取客户端 IP（优先 Cloudflare 的 CF-Connecting-IP）。
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

/**
 * 清理过期的速率限制记录（节省 D1 存储）。
 * 删除所有早于 maxAge 毫秒之前的记录。
 */
export async function cleanupRateLimitEvents(
  DB: D1DatabaseLike,
  maxAgeMs = 2 * 60 * 60 * 1000, // 默认 2 小时
  now = new Date(),
): Promise<number> {
  const cutoff = new Date(now.getTime() - maxAgeMs).toISOString();
  const result = (await DB.prepare(
    "DELETE FROM rate_limit_events WHERE created_at < ?",
  )
    .bind(cutoff)
    .run()) as { meta?: { changes?: number } } | undefined;
  return result?.meta?.changes ?? 0;
}
