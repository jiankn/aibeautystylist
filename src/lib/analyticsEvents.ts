import type { D1DatabaseLike } from "./runtime";

const EVENT_NAME_PATTERN = /^[a-z][a-z0-9_.:-]{0,63}$/;
const VISITOR_KEY_PATTERN = /^[a-zA-Z0-9_-]{16,128}$/;
const PROPERTY_KEY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_.:-]{0,63}$/;
const MAX_PROPERTIES = 40;
const MAX_PROPERTY_TEXT_LENGTH = 500;

type AnalyticsScalar = string | number | boolean;

export interface AnalyticsEventInput {
  event?: unknown;
  visitorId?: unknown;
  timestamp?: unknown;
  properties?: unknown;
}

export interface NormalizedAnalyticsEvent {
  id: string;
  eventName: string;
  occurredAt: string;
  day: string;
  visitorKey: string | null;
  path: string | null;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  content: string | null;
  term: string | null;
  referrerHost: string | null;
  properties: Record<string, AnalyticsScalar>;
}

function cleanText(value: unknown, maxLength = MAX_PROPERTY_TEXT_LENGTH) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function sanitizeProperties(value: unknown): Record<string, AnalyticsScalar> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const sanitized: Record<string, AnalyticsScalar> = {};
  for (const [key, propertyValue] of Object.entries(value).slice(
    0,
    MAX_PROPERTIES,
  )) {
    if (!PROPERTY_KEY_PATTERN.test(key)) continue;
    if (typeof propertyValue === "string") {
      const text = cleanText(propertyValue);
      if (text !== null) sanitized[key] = text;
    } else if (typeof propertyValue === "boolean") {
      sanitized[key] = propertyValue;
    } else if (
      typeof propertyValue === "number" &&
      Number.isFinite(propertyValue)
    ) {
      sanitized[key] = propertyValue;
    }
  }
  return sanitized;
}

function propertyText(
  properties: Record<string, AnalyticsScalar>,
  key: string,
  maxLength = 200,
) {
  return cleanText(properties[key], maxLength);
}

export function normalizeAnalyticsEvent(
  input: AnalyticsEventInput,
  now = new Date(),
): NormalizedAnalyticsEvent | null {
  if (
    typeof input.event !== "string" ||
    !EVENT_NAME_PATTERN.test(input.event)
  ) {
    return null;
  }

  const properties = sanitizeProperties(input.properties);
  const visitorId = cleanText(input.visitorId, 128);
  const visitorKey =
    visitorId && VISITOR_KEY_PATTERN.test(visitorId) ? visitorId : null;
  const pathValue = propertyText(properties, "path", 500);
  const path = pathValue?.startsWith("/") ? pathValue : null;
  const occurredAt = now.toISOString();

  return {
    id: crypto.randomUUID(),
    eventName: input.event,
    occurredAt,
    day: occurredAt.slice(0, 10),
    visitorKey,
    path,
    source: propertyText(properties, "source", 100),
    medium: propertyText(properties, "medium", 100),
    campaign: propertyText(properties, "campaign", 150),
    content: propertyText(properties, "content", 200),
    term: propertyText(properties, "term", 150),
    referrerHost: propertyText(properties, "referrerHost", 255),
    properties,
  };
}

export async function persistAnalyticsEvent(
  DB: D1DatabaseLike,
  event: NormalizedAnalyticsEvent,
) {
  await DB.prepare(
    `INSERT INTO analytics_events (
      id, event_name, occurred_at, day, visitor_key, path,
      source, medium, campaign, content, term, referrer_host, properties_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      event.id,
      event.eventName,
      event.occurredAt,
      event.day,
      event.visitorKey,
      event.path,
      event.source,
      event.medium,
      event.campaign,
      event.content,
      event.term,
      event.referrerHost,
      JSON.stringify(event.properties),
    )
    .run();
}
