import {
  getMonthlyQuota,
  getPlanRank,
  type BillingInterval,
  type PlanCode,
} from "./plans";
import { getQuotaSnapshot, resetQuotaForPlanUpgrade } from "./quota";
import type { D1DatabaseLike } from "./runtime";
import type { StripeSubscription } from "./stripe";
import {
  getEffectiveSubscription,
  saveStripeCustomer,
  upsertSubscription,
} from "./subscriptions";

export type SubscriptionUpgradeErrorCode =
  | "NO_ACTIVE_SUBSCRIPTION"
  | "NOT_UPGRADE"
  | "SUBSCRIPTION_ITEM_MISSING";

export class SubscriptionUpgradeError extends Error {
  constructor(
    public readonly code: SubscriptionUpgradeErrorCode,
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
  }
}

export interface SubscriptionUpgradeStripe {
  retrieveSubscription(subscriptionId: string): Promise<StripeSubscription>;
  updateSubscriptionPrice(input: {
    subscriptionId: string;
    itemId: string;
    priceId: string;
    prorationBehavior?: "always_invoice" | "create_prorations" | "none";
    paymentBehavior?:
      | "allow_incomplete"
      | "default_incomplete"
      | "pending_if_incomplete"
      | "error_if_incomplete";
    metadata?: Record<string, string>;
  }): Promise<StripeSubscription>;
}

export async function upgradeActiveSubscriptionPlan(input: {
  userId: string;
  toPlanCode: Exclude<PlanCode, "free">;
  interval: BillingInterval;
  priceId: string;
  stripe: SubscriptionUpgradeStripe;
  DB?: D1DatabaseLike;
  now?: Date;
  metadata?: Record<string, string>;
}) {
  const now = input.now ?? new Date();
  const current = await getEffectiveSubscription(input.userId, input.DB, now);
  if (!current) {
    throw new SubscriptionUpgradeError(
      "NO_ACTIVE_SUBSCRIPTION",
      "没有可升级的当前订阅",
      409,
      false,
    );
  }
  if (getPlanRank(input.toPlanCode) <= getPlanRank(current.planCode)) {
    throw new SubscriptionUpgradeError(
      "NOT_UPGRADE",
      "当前订阅已包含该计划权益，请在订阅管理中调整。",
      409,
      false,
    );
  }

  const subscription = await input.stripe.retrieveSubscription(
    current.stripeSubscriptionId,
  );
  const itemId = subscription.items?.data?.[0]?.id;
  if (!itemId) {
    throw new SubscriptionUpgradeError(
      "SUBSCRIPTION_ITEM_MISSING",
      "无法识别当前订阅项目，请前往订阅管理页面处理。",
      409,
      true,
    );
  }

  const updated = await input.stripe.updateSubscriptionPrice({
    subscriptionId: current.stripeSubscriptionId,
    itemId,
    priceId: input.priceId,
    prorationBehavior: "always_invoice",
    paymentBehavior: "error_if_incomplete",
    metadata: {
      userId: input.userId,
      planCode: input.toPlanCode,
      priceId: input.priceId,
      billingInterval: input.interval,
      ...(input.metadata ?? {}),
    },
  });

  const stripeSubscriptionId = updated.id || current.stripeSubscriptionId;
  const currentPeriodEnd =
    updated.current_period_end ?? subscription.current_period_end;
  const customerId =
    typeof updated.customer === "string"
      ? updated.customer
      : typeof subscription.customer === "string"
        ? subscription.customer
        : undefined;
  if (customerId) {
    await saveStripeCustomer(input.userId, customerId, input.DB, now);
  }

  await upsertSubscription(
    {
      userId: input.userId,
      stripeSubscriptionId,
      planCode: input.toPlanCode,
      status: updated.status || current.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : current.currentPeriodEnd,
    },
    input.DB,
    now,
  );

  const status = updated.status || current.status;
  const quota = canResetQuotaForStatus(status)
    ? (
        await resetQuotaForPlanUpgrade({
          userId: input.userId,
          fromPlanCode: current.planCode,
          toPlanCode: input.toPlanCode,
          sourceId: stripeSubscriptionId,
          DB: input.DB,
          now,
        })
      ).snapshot
    : await getQuotaSnapshot(
        input.userId,
        input.DB,
        now,
        getMonthlyQuota(input.toPlanCode),
      );

  return {
    upgraded: true,
    fromPlanCode: current.planCode,
    toPlanCode: input.toPlanCode,
    subscription: {
      id: stripeSubscriptionId,
      status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : current.currentPeriodEnd,
    },
    quota,
  };
}

function canResetQuotaForStatus(status: string): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}
