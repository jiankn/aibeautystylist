import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../lib/cloudflare/runtime';
import { deleteTryOnPhoto } from '../../lib/services/uploadService';

export const DELETE: APIRoute = async (context) => {
  const payload = await context.request.json().catch(() => ({}));
  const key = typeof payload.key === 'string' ? payload.key : '';

  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_key' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const deleted = await deleteTryOnPhoto(getRuntimeEnv(context), key);
  return new Response(JSON.stringify({ ok: deleted }), {
    status: deleted ? 200 : 404,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
