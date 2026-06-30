import {
  CREDIT_PACKS,
  getCreditPackByPriceId,
  type CreditPackCode,
} from "./creditPacks";
import { getMonthlyQuota, isPlanCode, type PlanCode } from "./plans";
import { grantCreditPack, type QuotaSnapshot } from "./quota";
import type { D1DatabaseLike, RuntimeBindings } from "./runtime";
import type { StripeCheckoutSession } from "./stripe";

export class CreditPackFulfillmentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface CreditPackFulfillmentResult {
  packCode: CreditPackCode;
  credits: number;
  duplicate: boolean;
  quota: QuotaSnapshot;
}

export async function fulfillCreditPackCheckout(input: {
  session: StripeCheckoutSession;
  bindings: RuntimeBindings;
  now?: Date;
}): Promise<CreditPackFulfillmentResult> {
  const { session, bindings } = input;
  const metadata = session.metadata ?? {};
  if (
    session.mode !== "payment" ||
    (session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required")
  ) {
    throw new CreditPackFulfillmentError(
      "CREDIT_PACK_PAYMENT_INCOMPLETE",
      "额度包支付尚未完成",
    );
  }

  const userId = session.client_reference_id || metadata.userId;
  const priceId = metadata.priceId;
  const pack = priceId ? getCreditPackByPriceId(priceId, bindings) : undefined;
  if (!userId || !pack || metadata.packCode !== pack.code) {
    throw new CreditPackFulfillmentError(
      "CREDIT_PACK_METADATA_INVALID",
      "额度包订单信息无效",
    );
  }
  if (
    typeof session.amount_total === "number" &&
    session.amount_total !== pack.priceUsdCents
  ) {
    throw new CreditPackFulfillmentError(
      "CREDIT_PACK_AMOUNT_MISMATCH",
      "额度包支付金额不匹配",
    );
  }

  const planCode = isPlanCode(metadata.planCode)
    ? (metadata.planCode as PlanCode)
    : "premium";
  if (!pack.eligiblePlans.includes(planCode)) {
    throw new CreditPackFulfillmentError(
      "CREDIT_PACK_PLAN_INVALID",
      "当前套餐不能购买额度包",
    );
  }

  const periodStart = safeIso(metadata.periodStart);
  const periodEnd = safeIso(metadata.periodEnd);
  const grant = await grantCreditPack({
    userId,
    checkoutSessionId: session.id,
    credits: pack.credits,
    DB: bindings.DB,
    now: input.now,
    monthlyQuota: getMonthlyQuota(planCode),
    quotaPeriod: { start: periodStart, end: periodEnd },
  });

  await recordCreditPackOrder({
    DB: bindings.DB,
    sessionId: session.id,
    userId,
    packCode: pack.code,
    credits: pack.credits,
    amountCents: session.amount_total ?? pack.priceUsdCents,
    currency: session.currency ?? "usd",
    purchasedAt: (input.now ?? new Date()).toISOString(),
  });

  return {
    packCode: pack.code,
    credits: pack.credits,
    duplicate: grant.duplicate,
    quota: grant.snapshot,
  };
}

function safeIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : undefined;
}

async function recordCreditPackOrder(input: {
  DB?: D1DatabaseLike;
  sessionId: string;
  userId: string;
  packCode: CreditPackCode;
  credits: number;
  amountCents: number;
  currency: string;
  purchasedAt: string;
}): Promise<void> {
  if (!input.DB) return;
  await input.DB.prepare(
    `INSERT OR IGNORE INTO credit_pack_orders
      (stripe_checkout_session_id, user_id, pack_code, credits, amount_cents, currency, status, purchased_at)
      VALUES (?, ?, ?, ?, ?, ?, 'paid', ?)`,
  )
    .bind(
      input.sessionId,
      input.userId,
      input.packCode,
      input.credits,
      input.amountCents,
      input.currency,
      input.purchasedAt,
    )
    .run();
}

export function creditPackPublicCatalog() {
  return Object.values(CREDIT_PACKS).map((pack) => ({
    code: pack.code,
    credits: pack.credits,
    priceUsdCents: pack.priceUsdCents,
    featured: pack.featured,
  }));
}
