import type { APIRoute } from "astro";

import {
  createAccount,
  getAccountByEmail,
  normalizeEmail,
} from "../../../lib/accounts";
import { sendVerificationEmail } from "../../../lib/authEmails";
import { createOneTimeToken } from "../../../lib/authSession";
import { apiError, apiSuccess } from "../../../lib/http";
import { hashPassword, validatePasswordStrength } from "../../../lib/password";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "../../../lib/rateLimit";
import { getRuntimeBindings } from "../../../lib/runtime";

interface RegisterBody {
  email?: string;
  password?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as RegisterBody | null;
  const email = body?.email ? normalizeEmail(body.email) : "";
  const password = body?.password ?? "";

  if (!EMAIL_RE.test(email)) {
    return apiError(
      {
        code: "INVALID_EMAIL",
        message: "请输入有效的邮箱地址",
        retryable: false,
      },
      422,
    );
  }
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

  const bindings = getRuntimeBindings();
  const { DB } = bindings;
  if (!DB) {
    return apiError(
      { code: "AUTH_UNAVAILABLE", message: "账户服务不可用", retryable: true },
      503,
    );
  }

  // 速率限制：每 IP 1 小时内最多 5 次注册。
  const ip = getClientIp(request);
  const rl = await checkRateLimit(`register:${ip}`, RATE_LIMITS.register, DB);
  if (!rl.allowed) {
    return apiError(
      {
        code: "RATE_LIMITED",
        message: "注册请求过于频繁，请稍后再试",
        retryable: true,
      },
      429,
    );
  }

  const existing = await getAccountByEmail(email, DB);
  if (existing) {
    // 不泄露账户是否存在的精确状态，但邮箱唯一冲突需明确告知以便用户去登录。
    return apiError(
      {
        code: "EMAIL_IN_USE",
        message: "该邮箱已注册，请直接登录或找回密码",
        retryable: false,
      },
      409,
    );
  }

  const { hash, salt } = await hashPassword(password);
  const userId = `user_${crypto.randomUUID()}`;
  await createAccount(
    { userId, email, passwordHash: hash, passwordSalt: salt },
    DB,
  );

  const token = await createOneTimeToken(userId, "email_verify", DB);
  let emailSent = false;
  try {
    const result = await sendVerificationEmail(
      email,
      token,
      bindings,
      new URL(request.url).origin,
    );
    emailSent = result.sent;
  } catch {
    // 邮件失败不回滚账户：用户可稍后重新发送验证邮件。
    emailSent = false;
  }

  return apiSuccess(
    {
      registered: true,
      emailSent,
      message: emailSent
        ? "注册成功，请查收验证邮件"
        : "注册成功，但验证邮件暂未发送，请稍后重试发送",
    },
    { status: 201 },
  );
};
