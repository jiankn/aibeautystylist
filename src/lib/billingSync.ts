import { getEntitlementContext } from "./entitlements";
import { resetQuotaForPlanUpgrade } from "./quota";
import type { RuntimeBindings } from "./runtime";
import type { StripeCheckoutSession, StripeSubscription } from "./stripe";
import { priceToPlan } from "./stripeEvents";
import {
  getEffectivePlan,
  saveStripeCustomer,
  upsertSubscription,
} from "./subscriptions";

export type CheckoutSyncErrorCode =
  | "INVALID_CHECKOUT_SESSION"
  | "CHECKOUT_SESSION_FORBIDDEN"
  | "CHECKOUT_SESSION_UNSUPPORTED"
  | "CHECKOUT_SESSION_INCOMPLETE"
  | "CHECKOUT_SUBSCRIPTION_MISSING"
  | "CHECKOUT_PLAN_UNKNOWN";

export class CheckoutSyncError extends Error {
  constructor(
    public readonly code: CheckoutSyncErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

export interface CheckoutSyncStripe {
  retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession>;
  retrieveSubscription(subscriptionId: string): Promise<StripeSubscription>;
}

const CHECKOUT_SESSION_ID_PATTERN = /^cs_(test_)?[A-Za-z0-9_]+$/;

export function assertCheckoutSessionId(sessionId: string | undefined): string {
  const value = sessionId?.trim();
  if (!value || !CHECKOUT_SESSION_ID_PATTERN.test(value)) {
    throw new CheckoutSyncError(
      "INVALID_CHECKOUT_SESSION",
      "无效的结账会话",
      422,
      false,
    );
  }
  return value;
}

export async function syncCheckoutSessionForUser(input: {
  sessionId: string;
  userId: string;
  stripe: CheckoutSyncStripe;
  bindings: RuntimeBindings;
  now?: Date;
}) {
  const sessionId = assertCheckoutSessionId(input.sessionId);
  const session = await input.stripe.retrieveCheckoutSession(sessionId);
  const sessionUserId = session.client_reference_id || session.metadata?.userId;
  if (sessionUserId !== input.userId) {
    throw new CheckoutSyncError(
      "CHECKOUT_SESSION_FORBIDDEN",
      "结账会话与当前账户不匹配",
      403,
      false,
    );
  }
  if (session.mode && session.mode !== "subscription") {
    throw new CheckoutSyncError(
      "CHECKOUT_SESSION_UNSUPPORTED",
      "此结账会话不是订阅订单",
      422,
      false,
    );
  }
  if (session.status && session.status !== "complete") {
    throw new CheckoutSyncError(
      "CHECKOUT_SESSION_INCOMPLETE",
      "结账尚未完成",
      409,
      true,
    );
  }
  if (!session.subscription) {
    throw new CheckoutSyncError(
      "CHECKOUT_SUBSCRIPTION_MISSING",
      "结账会话缺少订阅信息",
      409,
      true,
    );
  }

  const subscription = await input.stripe.retrieveSubscription(
    session.subscription,
  );
  const priceId =
    subscription.items?.data?.[0]?.price?.id || session.metadata?.priceId;
  const planCode = priceId ? priceToPlan(priceId, input.bindings) : undefined;
  if (!planCode || planCode === "free") {
    throw new CheckoutSyncError(
      "CHECKOUT_PLAN_UNKNOWN",
      "无法识别订阅计划",
      409,
      true,
    );
  }

  const now = input.now ?? new Date();
  const previousPlan = await getEffectivePlan(
    input.userId,
    input.bindings.DB,
    now,
  );
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : session.customer;
  if (customerId) {
    await saveStripeCustomer(input.userId, customerId, input.bindings.DB, now);
  }
  const currentPeriodStart = subscription.current_period_start
    ? new Date(subscription.current_period_start * 1000).toISOString()
    : undefined;
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : undefined;

  await upsertSubscription(
    {
      userId: input.userId,
      stripeSubscriptionId: subscription.id,
      planCode,
      status: subscription.status || "active",
      currentPeriodStart,
      currentPeriodEnd,
    },
    input.bindings.DB,
    now,
  );
  if (canResetQuotaForStatus(subscription.status || "active")) {
    await resetQuotaForPlanUpgrade({
      userId: input.userId,
      fromPlanCode: previousPlan.planCode,
      toPlanCode: planCode,
      sourceId: subscription.id,
      DB: input.bindings.DB,
      now,
      allowSamePlan: true,
      quotaPeriod: { start: currentPeriodStart, end: currentPeriodEnd },
    });
  }

  const { plan, quota } = await getEntitlementContext(
    input.userId,
    input.bindings.DB,
    now,
  );
  return {
    synced: true,
    plan: plan.planCode,
    subscription:
      plan.source === "subscription"
        ? {
            status: plan.status,
            currentPeriodStart: plan.currentPeriodStart,
            currentPeriodEnd: plan.currentPeriodEnd,
          }
        : null,
    quota,
  };
}

function canResetQuotaForStatus(status: string): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
