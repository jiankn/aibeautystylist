import {
  PLAN_DEFINITIONS,
  PLAN_CODES,
  type BillingInterval,
  type PlanCode,
} from "./plans";
import { fulfillCreditPackCheckout } from "./creditPackFulfillment";
import { resetQuotaForPlanUpgrade } from "./quota";
import type { D1DatabaseLike, RuntimeBindings } from "./runtime";
import {
  getEffectivePlan,
  saveStripeCustomer,
  upsertSubscription,
} from "./subscriptions";
import type { StripeEvent } from "./stripeWebhook";
import type { StripeCheckoutSession } from "./stripe";

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
  if (await hasRecordedStripeEvent(event.id, bindings.DB)) {
    return { handled: false, duplicate: true };
  }
  if (!HANDLED_TYPES.has(event.type)) {
    await recordStripeEvent(event.id, event.type, bindings.DB);
    return { handled: false, duplicate: false };
  }

  const object = event.data.object;
  if (
    event.type === "checkout.session.completed" &&
    extractMetadataValue(object, "purchaseType") === "credit_pack"
  ) {
    const session = checkoutSessionFromEvent(object);
    if (!session) return { handled: false, duplicate: false };
    await fulfillCreditPackCheckout({ session, bindings, now });
    await recordStripeEvent(event.id, event.type, bindings.DB);
    return { handled: true, duplicate: false };
  }

  const userId = extractUserId(object);
  const stripeSubscriptionId = extractSubscriptionId(object);
  if (!userId || !stripeSubscriptionId) {
    await recordStripeEvent(event.id, event.type, bindings.DB);
    return { handled: false, duplicate: false };
  }

  const priceId = extractPriceId(object);
  const planCode = priceId ? priceToPlan(priceId, bindings) : undefined;
  const status = normalizeStatus(event.type, object);
  if (!planCode) {
    await recordStripeEvent(event.id, event.type, bindings.DB);
    return { handled: false, duplicate: false };
  }

  const customerId = extractCustomerId(object);
  if (customerId) {
    await saveStripeCustomer(userId, customerId, bindings.DB, now);
  }

  const previousPlan = await getEffectivePlan(userId, bindings.DB, now);
  const currentPeriodStart = extractCurrentPeriodStart(object);
  const currentPeriodEnd = extractCurrentPeriodEnd(object);
  await upsertSubscription(
    {
      userId,
      stripeSubscriptionId,
      planCode,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    },
    bindings.DB,
    now,
  );
  if (canResetQuotaForStatus(status)) {
    await resetQuotaForPlanUpgrade({
      userId,
      fromPlanCode: previousPlan.planCode,
      toPlanCode: planCode,
      sourceId: stripeSubscriptionId,
      DB: bindings.DB,
      now,
      allowSamePlan: event.type === "checkout.session.completed",
      quotaPeriod: { start: currentPeriodStart, end: currentPeriodEnd },
    });
  }
  await recordStripeEvent(event.id, event.type, bindings.DB);
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

async function hasRecordedStripeEvent(
  eventId: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (!DB) return mockSeenEvents.has(eventId);
  const row = await DB.prepare("SELECT id FROM stripe_events WHERE id = ?")
    .bind(eventId)
    .first<{ id: string }>();
  return Boolean(row);
}

async function recordStripeEvent(
  eventId: string,
  eventType: string,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (!DB) {
    mockSeenEvents.add(eventId);
    return;
  }

  await DB.prepare(
    "INSERT OR IGNORE INTO stripe_events (id, type, received_at) VALUES (?, ?, ?)",
  )
    .bind(eventId, eventType, new Date().toISOString())
    .run();
}

const mockSeenEvents = new Set<string>();

export function resetMockStripeEvents(): void {
  mockSeenEvents.clear();
}

function extractMetadataValue(
  object: Record<string, unknown>,
  key: string,
): string | undefined {
  const metadata = object["metadata"];
  if (!metadata || typeof metadata !== "object") return undefined;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function checkoutSessionFromEvent(
  object: Record<string, unknown>,
): StripeCheckoutSession | undefined {
  const id = object["id"];
  if (typeof id !== "string" || !id) return undefined;
  const metadataValue = object["metadata"];
  const metadata =
    metadataValue && typeof metadataValue === "object"
      ? Object.fromEntries(
          Object.entries(metadataValue).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : undefined;
  return {
    id,
    mode: stringValue(object["mode"]),
    payment_status: stringValue(object["payment_status"]),
    amount_total: numberValue(object["amount_total"]),
    currency: stringValue(object["currency"]),
    client_reference_id: stringValue(object["client_reference_id"]),
    customer: stringValue(object["customer"]),
    metadata,
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
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

function extractCurrentPeriodStart(
  object: Record<string, unknown>,
): string | undefined {
  const value = object["current_period_start"];
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

function canResetQuotaForStatus(status: string): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
