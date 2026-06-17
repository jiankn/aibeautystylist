// 管理员身份验证守卫。
// 校验当前请求是否来自 role='admin' 的已登录用户。

import type { AstroCookies } from "astro";
import { isPrimaryAdminEmail } from "./adminPolicy";
import { AUTH_COOKIE, resolveSessionUserId } from "./authSession";
import type { D1DatabaseLike } from "./runtime";

export type AdminRole = "admin" | "user";

interface AdminCheckResult {
  authorized: boolean;
  userId?: string;
  role?: AdminRole;
}

/**
 * 检查当前会话是否为管理员。
 * 返回 { authorized, userId, role }。
 */
export async function checkAdmin(
  cookies: AstroCookies,
  DB: D1DatabaseLike,
): Promise<AdminCheckResult> {
  const token = cookies.get(AUTH_COOKIE)?.value;
  if (!token) return { authorized: false };

  const userId = await resolveSessionUserId(token, DB);
  if (!userId) return { authorized: false };

  const row = await DB.prepare(
    "SELECT email, role, password_hash FROM auth_accounts WHERE user_id = ?",
  )
    .bind(userId)
    .first<{ email: string; role: string; password_hash: string | null }>();

  const role = row?.role === "admin" ? "admin" : "user";
  const authorized =
    role === "admin" && isPrimaryAdminEmail(row?.email) && !row?.password_hash;
  return { authorized, userId, role };
}

/**
 * 记录管理员操作审计日志。
 */
export async function logAdminAction(
  adminUserId: string,
  action: string,
  DB: D1DatabaseLike,
  opts?: { targetType?: string; targetId?: string; details?: unknown },
): Promise<void> {
  await DB.prepare(
    "INSERT INTO admin_audit_logs (id, admin_user_id, action, target_type, target_id, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      crypto.randomUUID(),
      adminUserId,
      action,
      opts?.targetType ?? null,
      opts?.targetId ?? null,
      opts?.details ? JSON.stringify(opts.details) : null,
      new Date().toISOString(),
    )
    .run();
}
