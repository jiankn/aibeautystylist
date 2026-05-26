/**
 * POST /api/auth/email-login — 邮箱密码登录
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { buildSessionCookie } from '../../../lib/services/authService';
import { createSession } from '../../../lib/repositories/sessionRepository';
import { findUserByEmail } from '../../../lib/repositories/userRepository';
import {
  normalizeEmail,
  validateEmail,
  verifyPassword,
} from '../../../lib/services/passwordService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();

  try {
    const body = await request.json() as { email?: string; password?: string; next?: string };
    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';

    if (!validateEmail(email) || !password) {
      return json({ error: 'invalid_credentials', message: 'Invalid email or password.' }, 400);
    }

    const user = await findUserByEmail(env, email);
    const passwordOk = await verifyPassword(password, user?.password_hash);
    if (!user || !passwordOk) {
      return json({ error: 'invalid_credentials', message: 'Invalid email or password.' }, 401);
    }

    const sessionId = await createSession(env, {
      userId: user.id,
      userAgent: request.headers.get('user-agent') ?? undefined,
      ipAddress: getClientIp(request),
    });
    if (!sessionId) return json({ error: 'session_failed' }, 500);

    return json(
      { success: true, next: sanitizeNextPath(body.next) ?? '/dashboard' },
      200,
      { 'Set-Cookie': buildSessionCookie(sessionId, env.APP_ENV !== 'production') },
    );
  } catch (error) {
    console.error('[auth/email-login]', error);
    return json({ error: 'login_failed' }, 500);
  }
};

function json(data: unknown, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function getClientIp(request: Request): string | undefined {
  return request.headers.get('cf-connecting-ip') ??
         request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
         undefined;
}

function sanitizeNextPath(next: string | undefined): string | undefined {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return undefined;
  return next;
}
