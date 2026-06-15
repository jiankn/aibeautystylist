import type { APIRoute } from "astro";

import { markEmailVerified } from "../../../lib/accounts";
import {
  consumeOneTimeToken,
  createSession,
  setSessionCookie,
} from "../../../lib/authSession";
import { getRuntimeBindings } from "../../../lib/runtime";

// GET：用户点击邮件链接。校验 token → 标记已验证 → 直接登录 → 跳转。
export const GET: APIRoute = async ({ cookies, request, redirect }) => {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const { DB } = getRuntimeBindings();
  if (!DB || !token) {
    return redirect("/login?verify=invalid", 302);
  }

  const userId = await consumeOneTimeToken(token, "email_verify", DB);
  if (!userId) {
    return redirect("/login?verify=invalid", 302);
  }

  await markEmailVerified(userId, DB);
  const session = await createSession(userId, DB);
  setSessionCookie(cookies, session.token, import.meta.env.PROD);
  return redirect("/?verify=success", 302);
};
