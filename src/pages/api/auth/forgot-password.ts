import type { APIRoute } from "astro";

import { isPasswordAuthDisabledEmail } from "../../../lib/adminPolicy";
import { getAccountByEmail, normalizeEmail } from "../../../lib/accounts";
import { sendPasswordResetEmail } from "../../../lib/authEmails";
import { createOneTimeToken } from "../../../lib/authSession";
import { apiSuccess } from "../../../lib/http";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMITS,
} from "../../../lib/rateLimit";
import { getRuntimeBindings } from "../../../lib/runtime";

interface ForgotBody {
  email?: string;
}

// 始终返回成功，避免泄露邮箱是否存在（账户枚举防护）。
export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as ForgotBody | null;
  const email = body?.email ? normalizeEmail(body.email) : "";
  const bindings = getRuntimeBindings();
  const { DB } = bindings;

  const genericOk = () =>
    apiSuccess({
      message: "如果该邮箱已注册，我们已发送密码重置邮件",
    });

  if (!DB || !email) return genericOk();
  if (isPasswordAuthDisabledEmail(email)) return genericOk();

  // 速率限制：每 IP 15 分钟内最多 5 次密码重置请求。
  const ip = getClientIp(request);
  const rl = await checkRateLimit(
    `forgot:${ip}`,
    RATE_LIMITS.forgotPassword,
    DB,
  );
  if (!rl.allowed) {
    // 仍然返回统一的成功响应，但不实际发送邮件（账户枚举防护 + 限频）。
    return genericOk();
  }

  const account = await getAccountByEmail(email, DB);
  if (account) {
    try {
      const token = await createOneTimeToken(
        account.userId,
        "password_reset",
        DB,
      );
      await sendPasswordResetEmail(
        account.email,
        token,
        bindings,
        new URL(request.url).origin,
      );
    } catch {
      // 邮件失败也返回统一响应，不暴露内部状态。
    }
  }
  return genericOk();
};
