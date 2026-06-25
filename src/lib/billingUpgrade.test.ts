import { beforeEach, describe, expect, it } from "vitest";

import {
  previewActiveSubscriptionUpgrade,
  SubscriptionUpgradeError,
  upgradeActiveSubscriptionPlan,
  type SubscriptionUpgradePreviewStripe,
  type SubscriptionUpgradeStripe,
} from "./billingUpgrade";
import { getQuotaSnapshot, reserveQuota, resetMockQuota } from "./quota";
import {
  getEffectivePlan,
  resetMockSubscriptions,
  upsertSubscription,
} from "./subscriptions";

const now = new Date("2026-06-18T00:00:00.000Z");
const nextPeriod = Math.floor(
  new Date("2026-07-18T00:00:00.000Z").getTime() / 1000,
);

function createStripeMock(options: { missingItem?: boolean } = {}) {
  const updates: Parameters<
    SubscriptionUpgradeStripe["updateSubscriptionPrice"]
  >[0][] = [];
  const stripe: SubscriptionUpgradeStripe = {
    async retrieveSubscription(subscriptionId) {
      return {
        id: subscriptionId,
        status: "active",
        customer: "cus_123",
        current_period_end: nextPeriod,
        items: {
          data: options.missingItem
            ? [{ price: { id: "price_pro_monthly" } }]
            : [{ id: "si_123", price: { id: "price_pro_monthly" } }],
        },
      };
    },
    async updateSubscriptionPrice(input) {
      updates.push(input);
      return {
        id: input.subscriptionId,
        status: "active",
        customer: "cus_123",
        current_period_end: nextPeriod,
        items: { data: [{ id: input.itemId, price: { id: input.priceId } }] },
      };
    },
  };
  return { stripe, updates };
}

describe("subscription upgrades", () => {
  beforeEach(() => {
    resetMockQuota();
    resetMockSubscriptions();
  });

  it("upgrades an exhausted Pro subscription to Premium and refills the new quota", async () => {
    await upsertSubscription(
      {
        userId: "user_123",
        stripeSubscriptionId: "sub_123",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );
    for (let i = 0; i < 70; i++) {
      await reserveQuota(
        "user_123",
        `job_${i}`,
        `request_${i}`,
        undefined,
        now,
        70,
      );
    }
    await expect(
      getQuotaSnapshot("user_123", undefined, now, 70),
    ).resolves.toMatchObject({ total: 70, remaining: 0 });

    const { stripe, updates } = createStripeMock();
    const result = await upgradeActiveSubscriptionPlan({
      userId: "user_123",
      toPlanCode: "premium",
      interval: "monthly",
      priceId: "price_premium_monthly",
      stripe,
      now,
      prorationDate: 1781712000,
    });

    expect(updates[0]).toMatchObject({
      subscriptionId: "sub_123",
      itemId: "si_123",
      priceId: "price_premium_monthly",
      prorationBehavior: "always_invoice",
      prorationDate: 1781712000,
      paymentBehavior: "error_if_incomplete",
      metadata: {
        userId: "user_123",
        planCode: "premium",
        billingInterval: "monthly",
      },
    });
    expect(result).toMatchObject({
      upgraded: true,
      fromPlanCode: "pro",
      toPlanCode: "premium",
      quota: { total: 150, remaining: 150 },
    });
    await expect(
      getEffectivePlan("user_123", undefined, now),
    ).resolves.toMatchObject({ planCode: "premium", status: "active" });
  });

  it("previews only the immediate prorated upgrade charge", async () => {
    await upsertSubscription(
      {
        userId: "user_123",
        stripeSubscriptionId: "sub_123",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );
    const previews: Parameters<
      SubscriptionUpgradePreviewStripe["createPreviewInvoice"]
    >[0][] = [];
    const stripe: SubscriptionUpgradePreviewStripe = {
      async retrieveSubscription(subscriptionId) {
        return {
          id: subscriptionId,
          status: "active",
          customer: "cus_123",
          current_period_end: nextPeriod,
          items: {
            data: [{ id: "si_123", price: { id: "price_pro_monthly" } }],
          },
        };
      },
      async createPreviewInvoice(input) {
        previews.push(input);
        return {
          id: "upcoming_in_123",
          amount_due: 5627,
          total: 5627,
          currency: "usd",
          subscription_details: { proration_date: input.prorationDate },
          lines: {
            data: [
              { amount: -372, currency: "usd", proration: true },
              {
                amount: 2000,
                currency: "usd",
                parent: { subscription_item_details: { proration: true } },
              },
              { amount: 3999, currency: "usd", proration: false },
            ],
          },
        };
      },
    };

    const preview = await previewActiveSubscriptionUpgrade({
      userId: "user_123",
      toPlanCode: "premium",
      interval: "monthly",
      priceId: "price_premium_monthly",
      stripe,
      now,
    });

    expect(previews[0]).toMatchObject({
      customerId: "cus_123",
      subscriptionId: "sub_123",
      itemId: "si_123",
      priceId: "price_premium_monthly",
    });
    expect(preview).toMatchObject({
      fromPlanCode: "pro",
      toPlanCode: "premium",
      interval: "monthly",
      amountDue: 1628,
      currency: "usd",
      prorationDate: Math.floor(now.getTime() / 1000),
    });
  });

  it("rejects non-upgrade plan changes", async () => {
    await upsertSubscription(
      {
        userId: "user_123",
        stripeSubscriptionId: "sub_123",
        planCode: "premium",
        status: "active",
      },
      undefined,
      now,
    );

    await expect(
      upgradeActiveSubscriptionPlan({
        userId: "user_123",
        toPlanCode: "pro",
        interval: "monthly",
        priceId: "price_pro_monthly",
        stripe: createStripeMock().stripe,
        now,
      }),
    ).rejects.toBeInstanceOf(SubscriptionUpgradeError);
    await expect(
      upgradeActiveSubscriptionPlan({
        userId: "user_123",
        toPlanCode: "pro",
        interval: "monthly",
        priceId: "price_pro_monthly",
        stripe: createStripeMock().stripe,
        now,
      }),
    ).rejects.toMatchObject({ code: "NOT_UPGRADE" });
  });

  it("rejects subscriptions without an item id", async () => {
    await upsertSubscription(
      {
        userId: "user_123",
        stripeSubscriptionId: "sub_123",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );

    await expect(
      upgradeActiveSubscriptionPlan({
        userId: "user_123",
        toPlanCode: "premium",
        interval: "monthly",
        priceId: "price_premium_monthly",
        stripe: createStripeMock({ missingItem: true }).stripe,
        now,
      }),
    ).rejects.toMatchObject({ code: "SUBSCRIPTION_ITEM_MISSING" });
  });
});
