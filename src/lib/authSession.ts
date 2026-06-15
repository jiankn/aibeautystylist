import type { AstroCookies } from "astro";

import type { TokenPurpose } from "./accounts";
import type { D1DatabaseLike } from "./runtime";
import { generateToken, hashToken } from "./tokens";

export const AUTH_COOKIE = "abs_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 天
const VERIFY_TTL_MS = 1000 * 60 * 60 * 24; // 邮箱验证 24 小时
const RESET_TTL_MS = 1000 * 60 * 60; // 密码重置 1 小时

export interface CreatedSession {
  token: string;
  expiresAt: string;
}

// 创建会话：返回明文 token（写入 cookie），库内只存哈希。
export async function createSession(
  userId: string,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<CreatedSession> {
  const token = generateToken(32);
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  await DB.prepare(
    "INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(crypto.randomUUID(), userId, tokenHash, now.toISOString(), expiresAt)
    .run();
  return { token, expiresAt };
}

export async function resolveSessionUserId(
  token: string | undefined,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<string | undefined> {
  if (!token) return undefined;
  const tokenHash = await hashToken(token);
  const row = await DB.prepare(
    "SELECT user_id, expires_at, revoked_at FROM auth_sessions WHERE token_hash = ?",
  )
    .bind(tokenHash)
    .first<{
      user_id: string;
      expires_at: string;
      revoked_at: string | null;
    }>();
  if (!row || row.revoked_at) return undefined;
  if (new Date(row.expires_at).getTime() <= now.getTime()) return undefined;
  return row.user_id;
}

export async function revokeSession(
  token: string | undefined,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  if (!token) return;
  const tokenHash = await hashToken(token);
  await DB.prepare(
    "UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
  )
    .bind(now.toISOString(), tokenHash)
    .run();
}

export function setSessionCookie(
  cookies: AstroCookies,
  token: string,
  isProd: boolean,
): void {
  cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(AUTH_COOKIE, { path: "/" });
}

// 一次性令牌（邮箱验证 / 密码重置）。
export async function createOneTimeToken(
  userId: string,
  purpose: TokenPurpose,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<string> {
  const token = generateToken(32);
  const tokenHash = await hashToken(token);
  const ttl = purpose === "password_reset" ? RESET_TTL_MS : VERIFY_TTL_MS;
  const expiresAt = new Date(now.getTime() + ttl).toISOString();
  await DB.prepare(
    "INSERT INTO auth_tokens (id, user_id, purpose, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(
      crypto.randomUUID(),
      userId,
      purpose,
      tokenHash,
      now.toISOString(),
      expiresAt,
    )
    .run();
  return token;
}

// 消费一次性令牌：校验有效且未用过，标记 consumed，返回 userId。
export async function consumeOneTimeToken(
  token: string,
  purpose: TokenPurpose,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<string | undefined> {
  const tokenHash = await hashToken(token);
  const row = await DB.prepare(
    "SELECT id, user_id, expires_at, consumed_at FROM auth_tokens WHERE token_hash = ? AND purpose = ?",
  )
    .bind(tokenHash, purpose)
    .first<{
      id: string;
      user_id: string;
      expires_at: string;
      consumed_at: string | null;
    }>();
  if (!row || row.consumed_at) return undefined;
  if (new Date(row.expires_at).getTime() <= now.getTime()) return undefined;

  const consumedAt = now.toISOString();
  const result = (await DB.prepare(
    "UPDATE auth_tokens SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL",
  )
    .bind(consumedAt, row.id)
    .run()) as { meta?: { changes?: number } } | undefined;
  // 并发保护：只有真正完成更新（changes>0）的请求拿到 userId。
  if (result?.meta && typeof result.meta.changes === "number") {
    return result.meta.changes > 0 ? row.user_id : undefined;
  }
  return row.user_id;
}
