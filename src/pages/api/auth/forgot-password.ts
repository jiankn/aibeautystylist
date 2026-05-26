/**
 * POST /api/auth/forgot-password — 发送密码重置邮件
 *
 * 安全策略：无论邮箱是否存在，都返回 success，避免用户枚举。
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv, getRuntimeValue } from '../../../lib/cloudflare/runtime';
import { findUserByEmail } from '../../../lib/repositories/userRepository';
import {
  createPasswordResetToken,
  deleteExpiredPasswordResetTokens,
} from '../../../lib/repositories/passwordResetRepository';
import {
  generateSecureToken,
  normalizeEmail,
  sha256Hex,
  validateEmail,
} from '../../../lib/services/passwordService';
import {
  buildPasswordResetEmail,
  sendEmail,
} from '../../../lib/services/emailService';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();

  try {
    const body = await request.json() as { email?: string };
    const email = normalizeEmail(body.email ?? '');

    if (!validateEmail(email)) {
      return json({ error: 'invalid_email', message: 'Please enter a valid email address.' }, 400);
    }

    await deleteExpiredPasswordResetTokens(env).catch(() => undefined);

    const user = await findUserByEmail(env, email);
    if (user) {
      const token = generateSecureToken();
      const tokenHash = await sha256Hex(token);
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await createPasswordResetToken(env, {
        userId: user.id,
        tokenHash,
        expiresAt,
        ipAddress: getClientIp(request),
      });

      const origin = getRuntimeValue(env, 'APP_PUBLIC_URL') ?? new URL(request.url).origin;
      const resetUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
      const emailContent = buildPasswordResetEmail({
        resetUrl,
        recipientName: user.name,
      });

      await sendEmail(env, {
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        tag: 'password-reset',
      });
    }

    return json({ success: true }, 200);
  } catch (error) {
    console.error('[auth/forgot-password]', error);
    // 对前端仍返回成功，避免泄露邮箱状态；服务端日志保留真实错误
    return json({ success: true }, 200);
  }
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getClientIp(request: Request): string | undefined {
  return request.headers.get('cf-connecting-ip') ??
         request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
         undefined;
}
