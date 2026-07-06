import type { APIRoute } from "astro";

import {
  normalizeAnalyticsEvent,
  persistAnalyticsEvent,
  type AnalyticsEventInput,
} from "../../lib/analyticsEvents";
import { getRuntimeBindings } from "../../lib/runtime";

const MAX_BODY_BYTES = 16 * 1024;

function json(body: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const requestOrigin = request.headers.get("Origin");
    if (
      requestOrigin &&
      new URL(requestOrigin).host !== new URL(request.url).host
    ) {
      return json({ ok: false }, 403);
    }

    const contentLength = Number(request.headers.get("Content-Length") || "0");
    if (contentLength > MAX_BODY_BYTES) return json({ ok: false }, 413);

    const rawBody = await request.text();
    if (!rawBody || rawBody.length > MAX_BODY_BYTES) {
      return json({ ok: false }, rawBody ? 413 : 400);
    }

    let payload: AnalyticsEventInput;
    try {
      payload = JSON.parse(rawBody) as AnalyticsEventInput;
    } catch {
      return json({ ok: false }, 400);
    }
    const event = normalizeAnalyticsEvent(payload);
    if (!event) return json({ ok: false }, 400);

    const { DB } = getRuntimeBindings();
    if (!DB) return json({ ok: false, retryable: true }, 503);

    await persistAnalyticsEvent(DB, event);
    return json({ ok: true }, 202);
  } catch (error) {
    console.error("[Analytics] Failed to store event", error);
    return json({ ok: false, retryable: true }, 503);
  }
};
