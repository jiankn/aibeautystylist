/**
 * POST /api/auth/register — 邮箱密码注册
 */
import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { buildSessionCookie } from '../../../lib/services/authService';
import { createSession } from '../../../lib/repositories/sessionRepository';
import { createLocalUser, findUserByEmail } from '../../../lib/repositories/userRepository';
import {
  hashPassword,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from '../../../lib/services/passwordService';

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();

  try {
    const body = await request.json() as {
      email?: string;
      password?: string;
      name?: string;
      next?: string;
    };

    const email = normalizeEmail(body.email ?? '');
    const password = body.password ?? '';
    const name = body.name?.trim() || undefined;

    if (!validateEmail(email)) {
      return json({ error: 'invalid_email', message: 'Please enter a valid email address.' }, 400);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.ok) {
      return json({ error: 'invalid_password', message: passwordValidation.error }, 400);
    }

    const existing = await findUserByEmail(env, email);
    if (existing) {
      return json({ error: 'email_exists', message: 'This email is already registered. Please sign in instead.' }, 409);
    }

    const passwordHash = await hashPassword(password);
    const userId = await createLocalUser(env, { email, passwordHash, name });
    if (!userId) return json({ error: 'registration_failed' }, 500);

    const sessionId = await createSession(env, {
      userId,
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
    console.error('[auth/register]', error);
    return json({ error: 'registration_failed' }, 500);
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
