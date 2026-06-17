import type { APIRoute } from "astro";

import { getAccountByEmail, normalizeEmail } from "../../../lib/accounts";
import { isPasswordAuthDisabledEmail } from "../../../lib/adminPolicy";
import { createSession, setSessionCookie } from "../../../lib/authSession";
import { apiError, apiSuccess } from "../../../lib/http";
import { verifyPassword } from "../../../lib/password";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "../../../lib/rateLimit";
import { getRuntimeBindings } from "../../../lib/runtime";

interface LoginBody {
  email?: string;
  password?: string;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request.json().catch(() => null)) as LoginBody | null;
  const email = body?.email ? normalizeEmail(body.email) : "";
  const password = body?.password ?? "";

  if (isPasswordAuthDisabledEmail(email)) {
    return apiError(
      {
        code: "OAUTH_REQUIRED",
        message: "该管理员账号仅支持 Google 登录",
        retryable: false,
      },
      403,
    );
  }

  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "AUTH_UNAVAILABLE", message: "账户服务不可用", retryable: true },
      503,
    );
  }

  // 速率限制：每 IP 15 分钟内最多 10 次登录尝试。
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`login:${ip}`, RATE_LIMITS.login, DB);
  if (!rl.allowed) {
    return apiError(
      {
        code: "RATE_LIMITED",
        message: "登录尝试过于频繁，请稍后再试",
        retryable: true,
      },
      429,
    );
  }

  const account = email ? await getAccountByEmail(email, DB) : undefined;
  // 统一的失败响应，避免泄露邮箱是否存在。
  const invalid = () =>
    apiError(
      {
        code: "INVALID_CREDENTIALS",
        message: "邮箱或密码不正确",
        retryable: false,
      },
      401,
    );

  if (!account || !account.passwordHash || !account.passwordSalt) {
    return invalid();
  }
  const ok = await verifyPassword(password, {
    hash: account.passwordHash,
    salt: account.passwordSalt,
  });
  if (!ok) return invalid();

  if (!account.emailVerifiedAt) {
    return apiError(
      {
        code: "EMAIL_NOT_VERIFIED",
        message: "请先完成邮箱验证后再登录",
        retryable: false,
      },
      403,
    );
  }

  const session = await createSession(account.userId, DB);
  setSessionCookie(cookies, session.token, import.meta.env.PROD);
  return apiSuccess({ authenticated: true, email: account.email });
};
