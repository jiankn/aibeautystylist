import { beforeEach, describe, expect, it } from "vitest";

import {
  assertCheckoutSessionId,
  CheckoutSyncError,
  syncCheckoutSessionForUser,
  type CheckoutSyncStripe,
} from "./billingSync";
import { getQuotaSnapshot, reserveQuota, resetMockQuota } from "./quota";
import {
  getEffectivePlan,
  resetMockSubscriptions,
  upsertSubscription,
} from "./subscriptions";

const bindings = {
  STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly",
  STRIPE_PRICE_PRO_YEARLY: "price_pro_yearly",
  STRIPE_PRICE_PREMIUM_MONTHLY: "price_premium_monthly",
  STRIPE_PRICE_PREMIUM_YEARLY: "price_premium_yearly",
};

const now = new Date("2026-06-18T00:00:00.000Z");

function createStripeMock(
  overrides: {
    session?: Record<string, unknown>;
    subscription?: Record<string, unknown>;
  } = {},
): CheckoutSyncStripe {
  return {
    async retrieveCheckoutSession(sessionId) {
      return {
        id: sessionId,
        mode: "subscription",
        status: "complete",
        subscription: "sub_123",
        customer: "cus_123",
        client_reference_id: "user_123",
        metadata: { priceId: "price_pro_monthly", userId: "user_123" },
        ...overrides.session,
      };
    },
    async retrieveSubscription(subscriptionId) {
      return {
        id: subscriptionId,
        status: "active",
        customer: "cus_123",
        current_period_end: Math.floor(
          new Date("2026-07-18T00:00:00.000Z").getTime() / 1000,
        ),
        items: { data: [{ price: { id: "price_pro_monthly" } }] },
        ...overrides.subscription,
      };
    },
  };
}

describe("billing checkout sync", () => {
  beforeEach(() => {
    resetMockQuota();
    resetMockSubscriptions();
  });

  it("validates Checkout Session ids", () => {
    expect(assertCheckoutSessionId("cs_test_123")).toBe("cs_test_123");
    expect(() => assertCheckoutSessionId("pi_123")).toThrow(CheckoutSyncError);
  });

  it("syncs a completed Checkout Session into the effective plan", async () => {
    const result = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock(),
      bindings,
      now,
    });

    expect(result).toMatchObject({
      synced: true,
      plan: "pro",
      quota: { total: 70, remaining: 70 },
    });
    await expect(
      getEffectivePlan("user_123", undefined, now),
    ).resolves.toMatchObject({ planCode: "pro", status: "active" });
  });

  it("restores full Pro quota after a Free user has used all free credits", async () => {
    await reserveQuota("user_123", "job_1", "request_1", undefined, now);
    await reserveQuota("user_123", "job_2", "request_2", undefined, now);
    await reserveQuota("user_123", "job_3", "request_3", undefined, now);

    const result = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock(),
      bindings,
      now,
    });

    expect(result).toMatchObject({
      plan: "pro",
      quota: { total: 70, remaining: 70 },
    });

    await reserveQuota(
      "user_123",
      "job_pro",
      "request_pro",
      undefined,
      now,
      70,
    );
    const duplicateSync = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock(),
      bindings,
      now,
    });

    expect(duplicateSync.quota).toMatchObject({ total: 70, remaining: 69 });
  });

  it("does not refill paid usage on a duplicate Checkout sync", async () => {
    const firstSync = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock(),
      bindings,
      now,
    });
    expect(firstSync.quota).toMatchObject({ total: 70, remaining: 70 });

    await reserveQuota(
      "user_123",
      "job_pro",
      "request_pro",
      undefined,
      now,
      70,
    );
    const duplicateSync = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock(),
      bindings,
      now,
    });

    expect(duplicateSync.quota).toMatchObject({ total: 70, remaining: 69 });
  });

  it("restores full Premium quota when an exhausted Pro user upgrades", async () => {
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
        `job_pro_${i}`,
        `request_pro_${i}`,
        undefined,
        now,
        70,
      );
    }
    await expect(
      getQuotaSnapshot("user_123", undefined, now, 70),
    ).resolves.toMatchObject({ total: 70, remaining: 0 });

    const result = await syncCheckoutSessionForUser({
      sessionId: "cs_test_123",
      userId: "user_123",
      stripe: createStripeMock({
        subscription: {
          items: { data: [{ price: { id: "price_premium_monthly" } }] },
        },
      }),
      bindings,
      now,
    });

    expect(result).toMatchObject({
      plan: "premium",
      quota: { total: 150, remaining: 150 },
    });
  });

  it("rejects sessions that belong to another user", async () => {
    await expect(
      syncCheckoutSessionForUser({
        sessionId: "cs_test_123",
        userId: "user_456",
        stripe: createStripeMock(),
        bindings,
        now,
      }),
    ).rejects.toMatchObject({ code: "CHECKOUT_SESSION_FORBIDDEN" });
  });

  it("rejects unknown price ids", async () => {
    await expect(
      syncCheckoutSessionForUser({
        sessionId: "cs_test_123",
        userId: "user_123",
        stripe: createStripeMock({
          subscription: {
            items: { data: [{ price: { id: "price_unknown" } }] },
          },
        }),
        bindings,
        now,
      }),
    ).rejects.toMatchObject({ code: "CHECKOUT_PLAN_UNKNOWN" });
  });
});
