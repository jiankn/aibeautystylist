import type { APIRoute } from 'astro';
import { getRuntimeEnv } from '../../../lib/cloudflare/runtime';
import { getAuthUser } from '../../../lib/services/authService';
import {
  LOOK_ANALYTICS_EVENTS,
  recordLookAnalyticsEvent,
  type LookAnalyticsEventName,
} from '../../../lib/repositories/lookAnalyticsRepository';

const allowedEvents = new Set<string>(LOOK_ANALYTICS_EVENTS);

export const POST: APIRoute = async (context) => {
  const { request } = context;
  const env = getRuntimeEnv(context);
  const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
  const eventName = typeof payload.eventName === 'string' ? payload.eventName : '';
  const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : '';

  if (!allowedEvents.has(eventName) || !sessionId) {
    return json({ ok: false, error: 'invalid_event' }, 400);
  }

  const user = await getAuthUser(env, request.headers.get('cookie')).catch(() => null);

  const ok = await recordLookAnalyticsEvent({
    env,
    eventName: eventName as LookAnalyticsEventName,
    anonymousId: readString(payload.anonymousId),
    sessionId,
    userId: user?.id ?? null,
    source: readString(payload.source),
    lookSlug: readString(payload.lookSlug),
    styleSlug: readString(payload.styleSlug),
    position: readNumber(payload.position),
    route: readString(payload.route),
    referrer: readString(payload.referrer),
    metadata: isPlainObject(payload.metadata) ? payload.metadata : undefined,
  }).catch((error) => {
    console.error('[analytics/look-event]', error);
    return false;
  });

  return json({ ok }, ok ? 200 : 202);
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

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
