import {
  PLAN_DEFINITIONS,
  PLAN_CODES,
  type BillingInterval,
  type PlanCode,
} from "./plans";
import type { D1DatabaseLike, RuntimeBindings } from "./runtime";
import { upsertSubscription, saveStripeCustomer } from "./subscriptions";
import type { StripeEvent } from "./stripeWebhook";

// 处理与订阅生命周期相关的 Stripe 事件，把订阅状态同步到本地 subscriptions 表。
// Webhook 幂等由 stripe_events 去重表保证（见 recordEventOnce）。
const HANDLED_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export interface HandleEventResult {
  handled: boolean;
  duplicate: boolean;
  planCode?: PlanCode;
  status?: string;
}

export async function handleStripeEvent(
  event: StripeEvent,
  bindings: RuntimeBindings,
  now = new Date(),
): Promise<HandleEventResult> {
  const firstTime = await recordEventOnce(event.id, event.type, bindings.DB);
  if (!firstTime) {
    return { handled: false, duplicate: true };
  }
  if (!HANDLED_TYPES.has(event.type)) {
    return { handled: false, duplicate: false };
  }

  const object = event.data.object;
  const userId = extractUserId(object);
  const stripeSubscriptionId = extractSubscriptionId(object);
  if (!userId || !stripeSubscriptionId) {
    return { handled: false, duplicate: false };
  }

  const priceId = extractPriceId(object);
  const planCode = priceId ? priceToPlan(priceId, bindings) : undefined;
  const status = normalizeStatus(event.type, object);
  if (!planCode) {
    return { handled: false, duplicate: false };
  }

  const customerId = extractCustomerId(object);
  if (customerId) {
    await saveStripeCustomer(userId, customerId, bindings.DB, now);
  }

  await upsertSubscription(
    {
      userId,
      stripeSubscriptionId,
      planCode,
      status,
      currentPeriodEnd: extractCurrentPeriodEnd(object),
    },
    bindings.DB,
    now,
  );
  return { handled: true, duplicate: false, planCode, status };
}

export function priceToPlan(
  priceId: string,
  bindings: RuntimeBindings,
): PlanCode | undefined {
  for (const code of PLAN_CODES) {
    const def = PLAN_DEFINITIONS[code];
    for (const interval of ["monthly", "yearly"] as BillingInterval[]) {
      const envKey = def.priceEnvKeys[interval];
      if (envKey && bindings[envKey as keyof RuntimeBindings] === priceId) {
        return code;
      }
    }
  }
  return undefined;
}

// 幂等去重：首次见到该 event id 返回 true，重复返回 false。
async function recordEventOnce(
  eventId: string,
  eventType: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (!DB) return mockRecordEventOnce(eventId);

  const result = (await DB.prepare(
    "INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)",
  )
    .bind(eventId, eventType, new Date().toISOString())
    .run()) as { meta?: { changes?: number } } | undefined;
  // D1 run() 返回 meta.changes；INSERT OR IGNORE 重复时 changes=0。
  const changes = result?.meta?.changes;
  if (typeof changes === "number") return changes > 0;
  // 回退：无 meta 时显式查存在性。
  const row = await DB.prepare("SELECT id FROM stripe_events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string }>();
  return Boolean(row);
}

const mockSeenEvents = new Set<string>();

function mockRecordEventOnce(eventId: string): boolean {
  if (mockSeenEvents.has(eventId)) return false;
  mockSeenEvents.add(eventId);
  return true;
}

export function resetMockStripeEvents(): void {
  mockSeenEvents.clear();
}

function extractUserId(object: Record<string, unknown>): string | undefined {
  const clientReferenceId = object["client_reference_id"];
  if (typeof clientReferenceId === "string" && clientReferenceId) {
    return clientReferenceId;
  }
  const metadata = object["metadata"];
  if (metadata && typeof metadata === "object") {
    const userId = (metadata as Record<string, unknown>)["userId"];
    if (typeof userId === "string" && userId) return userId;
  }
  return undefined;
}

function extractSubscriptionId(
  object: Record<string, unknown>,
): string | undefined {
  // checkout.session 用 `subscription` 字段；subscription 对象本身用 `id`。
  const subscription = object["subscription"];
  if (typeof subscription === "string" && subscription) return subscription;
  const id = object["id"];
  const objectType = object["object"];
  if (objectType === "subscription" && typeof id === "string") return id;
  return undefined;
}

function extractPriceId(object: Record<string, unknown>): string | undefined {
  const items = object["items"];
  if (items && typeof items === "object") {
    const data = (items as Record<string, unknown>)["data"];
    if (Array.isArray(data) && data[0] && typeof data[0] === "object") {
      const price = (data[0] as Record<string, unknown>)["price"];
      if (price && typeof price === "object") {
        const priceId = (price as Record<string, unknown>)["id"];
        if (typeof priceId === "string") return priceId;
      }
    }
  }
  const metadata = object["metadata"];
  if (metadata && typeof metadata === "object") {
    const priceId = (metadata as Record<string, unknown>)["priceId"];
    if (typeof priceId === "string" && priceId) return priceId;
  }
  return undefined;
}

function extractCustomerId(
  object: Record<string, unknown>,
): string | undefined {
  const customer = object["customer"];
  return typeof customer === "string" && customer ? customer : undefined;
}

function extractCurrentPeriodEnd(
  object: Record<string, unknown>,
): string | undefined {
  const value = object["current_period_end"];
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value * 1000).toISOString();
  }
  return undefined;
}

function normalizeStatus(
  eventType: string,
  object: Record<string, unknown>,
): string {
  if (eventType === "customer.subscription.deleted") return "canceled";
  const status = object["status"];
  if (typeof status === "string" && status) return status;
  // checkout.session.completed 没有 subscription status，视为已激活。
  return "active";
}
