/**
 * Admin Access — 基于邮箱白名单的管理员鉴权
 *
 * 配置：在 wrangler.jsonc.vars.ADMIN_EMAILS 或 .dev.vars 中
 * 用逗号分隔多个邮箱，例如 "you@example.com,co@example.com"。
 */
import type { APIContext } from 'astro';
import { getRuntimeEnv, getRuntimeValue, type RuntimeEnv } from '../cloudflare/runtime';
import { getAuthUser, type AuthUser } from './authService';

export function getAdminEmails(env: RuntimeEnv | undefined): string[] {
  const raw = getRuntimeValue(env, 'ADMIN_EMAILS' as keyof RuntimeEnv);
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function isAdminEmail(env: RuntimeEnv | undefined, email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAdminEmails(env);
  if (allowed.length === 0) return false;
  return allowed.includes(email.toLowerCase());
}

export function isAdminUser(env: RuntimeEnv | undefined, user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  return isAdminEmail(env, user.email);
}

/**
 * 在 API 路由中强制要求当前请求为管理员。
 * 返回 user / null：null 时调用方应该立即返回 forbiddenResponse()。
 */
export async function requireAdminUser(context: APIContext): Promise<{
  env: RuntimeEnv | undefined;
  user: AuthUser | null;
  ok: boolean;
}> {
  const env = getRuntimeEnv(context);
  const user = await getAuthUser(env, context.request.headers.get('cookie')).catch(() => null);
  const ok = isAdminUser(env, user);
  return { env, user, ok };
}

export function adminForbiddenResponse(reason: 'unauthenticated' | 'forbidden'): Response {
  const status = reason === 'unauthenticated' ? 401 : 403;
  return new Response(
    JSON.stringify({ error: reason }),
    {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    },
  );
}
