import type { APIRoute } from "astro";

import {
  getAccountByUserId,
  markEmailVerified,
  setAccountPassword,
} from "../../../lib/accounts";
import { isPasswordAuthDisabledEmail } from "../../../lib/adminPolicy";
import {
  consumeOneTimeToken,
  createSession,
  setSessionCookie,
} from "../../../lib/authSession";
import { apiError, apiSuccess } from "../../../lib/http";
import { hashPassword, validatePasswordStrength } from "../../../lib/password";
import { getRuntimeBindings } from "../../../lib/runtime";

interface ResetBody {
  token?: string;
  password?: string;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request.json().catch(() => null)) as ResetBody | null;
  const token = body?.token ?? "";
  const password = body?.password ?? "";

  if (!validatePasswordStrength(password)) {
    return apiError(
      {
        code: "WEAK_PASSWORD",
        message: "密码至少 8 位，且包含字母和数字",
        retryable: false,
      },
      422,
    );
  }

  const { DB } = getRuntimeBindings();
  if (!DB || !token) {
    return apiError(
      {
        code: "INVALID_TOKEN",
        message: "重置链接无效或已过期",
        retryable: false,
      },
      400,
    );
  }

  const userId = await consumeOneTimeToken(token, "password_reset", DB);
  if (!userId) {
    return apiError(
      {
        code: "INVALID_TOKEN",
        message: "重置链接无效或已过期",
        retryable: false,
      },
      400,
    );
  }

  const account = await getAccountByUserId(userId, DB);
  if (account && isPasswordAuthDisabledEmail(account.email)) {
    return apiError(
      {
        code: "OAUTH_REQUIRED",
        message: "该管理员账号仅支持 Google 登录",
        retryable: false,
      },
      403,
    );
  }

  const { hash, salt } = await hashPassword(password);
  await setAccountPassword(userId, hash, salt, DB);

  // 重置成功视为邮箱可达，确保账户可登录；并直接建立会话。
  if (account && !account.emailVerifiedAt) {
    await markEmailVerified(userId, DB);
  }
  const session = await createSession(userId, DB);
  setSessionCookie(cookies, session.token, import.meta.env.PROD);
  return apiSuccess({ reset: true });
};
