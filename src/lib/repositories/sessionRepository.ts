/**
 * Session Repository — D1 持久化 + KV 缓存双写
 * 用于 Auth 系统的服务端 Session 管理
 */
import type { RuntimeEnv, D1DatabaseLike, KVNamespaceLike } from '../cloudflare/runtime';

// ─── 类型定义 ───────────────────────────────────────────────
export interface SessionRecord {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
  user_agent: string | null;
  ip_address: string | null;
}

export interface SessionData {
  userId: string;
  expiresAt: Date;
}

// ─── 配置 ───────────────────────────────────────────────────
/** Session 有效期（默认 30 天） */
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const SESSION_KV_PREFIX = 'session:';

// ─── 辅助方法 ───────────────────────────────────────────────
function getDb(env?: RuntimeEnv): D1DatabaseLike | null {
  return env?.DB ?? null;
}

function getKV(env?: RuntimeEnv): KVNamespaceLike | null {
  return env?.SESSION ?? null;
}

// ─── 创建 Session ───────────────────────────────────────────
export async function createSession(
  env: RuntimeEnv | undefined,
  input: {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    ttlSeconds?: number;
  },
): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;

  const id = crypto.randomUUID();
  const now = new Date();
  const ttl = input.ttlSeconds ?? SESSION_TTL_SECONDS;
  const expiresAt = new Date(now.getTime() + ttl * 1000);

  // D1 持久化
  await db
    .prepare(
      `INSERT INTO auth_sessions (id, user_id, expires_at, created_at, user_agent, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId,
      expiresAt.toISOString(),
      now.toISOString(),
      input.userAgent ?? null,
      input.ipAddress ?? null,
    )
    .run();

  // KV 缓存写入（快速查找）
  const kv = getKV(env);
  if (kv) {
    await kv.put(
      `${SESSION_KV_PREFIX}${id}`,
      JSON.stringify({ userId: input.userId, expiresAt: expiresAt.toISOString() }),
      { expirationTtl: ttl },
    );
  }

  return id;
}

// ─── 验证 Session ───────────────────────────────────────────
export async function validateSession(
  env: RuntimeEnv | undefined,
  sessionId: string,
): Promise<SessionData | null> {
  if (!sessionId) return null;

  // 先查 KV 缓存（快）
  const kv = getKV(env);
  if (kv) {
    const cached = await kv.get(`${SESSION_KV_PREFIX}${sessionId}`);
    if (cached) {
      try {
        const data = JSON.parse(cached) as { userId: string; expiresAt: string };
        const expiresAt = new Date(data.expiresAt);
        if (expiresAt > new Date()) {
          return { userId: data.userId, expiresAt };
        }
      } catch { /* 缓存损坏，fallback 到 D1 */ }
    }
  }

  // Fallback 到 D1
  const db = getDb(env);
  if (!db) return null;

  const row = await db
    .prepare('SELECT user_id, expires_at FROM auth_sessions WHERE id = ?')
    .bind(sessionId)
    .first<{ user_id: string; expires_at: string }>();

  if (!row) return null;

  const expiresAt = new Date(row.expires_at);
  if (expiresAt <= new Date()) {
    // Session 已过期，清理
    await deleteSession(env, sessionId);
    return null;
  }

  // 回写 KV 缓存
  if (kv) {
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await kv.put(
        `${SESSION_KV_PREFIX}${sessionId}`,
        JSON.stringify({ userId: row.user_id, expiresAt: row.expires_at }),
        { expirationTtl: ttl },
      );
    }
  }

  return { userId: row.user_id, expiresAt };
}

// ─── 删除 Session ───────────────────────────────────────────
export async function deleteSession(
  env: RuntimeEnv | undefined,
  sessionId: string,
): Promise<void> {
  const db = getDb(env);
  if (db) {
    await db
      .prepare('DELETE FROM auth_sessions WHERE id = ?')
      .bind(sessionId)
      .run();
  }

  const kv = getKV(env);
  if (kv?.delete) {
    await kv.delete(`${SESSION_KV_PREFIX}${sessionId}`);
  }
}

// ─── 清理用户所有 Session（退出所有设备）──────────────────────
export async function deleteUserSessions(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('DELETE FROM auth_sessions WHERE user_id = ?')
    .bind(userId)
    .run();

  // 注意：KV 中的 session 会自然过期，无法批量删除
  // 下次 validateSession 时会因 D1 查不到而返回 null
}
