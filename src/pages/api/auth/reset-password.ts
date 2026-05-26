/**
 * POST /api/auth/reset-password — 使用重置 token 设置新密码
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import {
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} from '../../../lib/repositories/passwordResetRepository';
import { updateUserPassword } from '../../../lib/repositories/userRepository';
import {
  hashPassword,
  sha256Hex,
  validatePassword,
} from '../../../lib/services/passwordService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();

  try {
    const body = await request.json() as { token?: string; password?: string };
    const token = body.token?.trim() ?? '';
    const password = body.password ?? '';

    if (!token) {
      return json({ error: 'invalid_token', message: 'Reset link is invalid or expired.' }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.ok) {
      return json({ error: 'invalid_password', message: passwordValidation.error }, 400);
    }

    const tokenHash = await sha256Hex(token);
    const tokenRecord = await findValidPasswordResetToken(env, tokenHash);
    if (!tokenRecord) {
      return json({ error: 'invalid_token', message: 'Reset link is invalid or expired.' }, 400);
    }

    const passwordHash = await hashPassword(password);
    await updateUserPassword(env, tokenRecord.user_id, passwordHash);
    await markPasswordResetTokenUsed(env, tokenRecord.id);

    return json({ success: true }, 200);
  } catch (error) {
    console.error('[auth/reset-password]', error);
    return json({ error: 'reset_failed' }, 500);
  }
};

function json(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
