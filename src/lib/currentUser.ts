import type { AstroCookies } from "astro";

import { AUTH_COOKIE, resolveSessionUserId } from "./authSession";
import type { D1DatabaseLike } from "./runtime";
import { getOrCreateVisitorId } from "./session";

export interface CurrentUser {
  id: string;
  authenticated: boolean;
}

// 解析当前用户：有有效登录会话则用账户 user id（authenticated=true），
// 否则回落匿名 visitor id。所有按用户隔离的数据据此归属。
export async function resolveCurrentUser(
  cookies: AstroCookies,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<CurrentUser> {
  if (DB) {
    const token = cookies.get(AUTH_COOKIE)?.value;
    const userId = await resolveSessionUserId(token, DB, now);
    if (userId) return { id: userId, authenticated: true };
  }
  return { id: getOrCreateVisitorId(cookies), authenticated: false };
}
