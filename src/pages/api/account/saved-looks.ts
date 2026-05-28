import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import {
  deleteSavedLook,
  listSavedLooksByUserId,
  syncSavedLooksForUser,
} from '../../../lib/repositories/savedLookRepository';

export const GET: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const user = await getAuthUser(env, request.headers.get('cookie')).catch(() => null);
  if (!user) return json({ error: 'unauthorized' }, 401);

  const savedLooks = await listSavedLooksByUserId(env, user.id, { limit: 24 });
  return json({ savedLooks });
};

export const POST: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const user = await getAuthUser(env, request.headers.get('cookie')).catch(() => null);
  if (!user) return json({ error: 'unauthorized' }, 401);

  const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
  const lookSlugs = Array.isArray(payload.lookSlugs)
    ? payload.lookSlugs.filter((slug): slug is string => typeof slug === 'string')
    : [];

  const savedLooks = await syncSavedLooksForUser({ env, userId: user.id, lookSlugs });
  return json({ savedLooks });
};

export const DELETE: APIRoute = async ({ request }) => {
  const env = getRuntimeEnv();
  const user = await getAuthUser(env, request.headers.get('cookie')).catch(() => null);
  if (!user) return json({ error: 'unauthorized' }, 401);

  const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
  const lookSlug = typeof payload.lookSlug === 'string' ? payload.lookSlug : '';
  await deleteSavedLook(env, user.id, lookSlug);
  const savedLooks = await listSavedLooksByUserId(env, user.id, { limit: 24 });
  return json({ savedLooks });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
