import { beforeEach, describe, expect, it } from "vitest";

import {
  getEffectivePlan,
  listUserSubscriptions,
  resetMockSubscriptions,
  upsertSubscription,
} from "./subscriptions";

const now = new Date("2026-06-07T00:00:00.000Z");

describe("subscriptions", () => {
  beforeEach(() => {
    resetMockSubscriptions();
  });

  it("defaults to the free plan without any subscription", async () => {
    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toEqual({ planCode: "free", source: "default" });
  });

  it("returns the active subscription plan", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "pro",
        status: "active",
        currentPeriodStart: "2026-06-07T00:00:00.000Z",
        currentPeriodEnd: "2026-07-07T00:00:00.000Z",
      },
      undefined,
      now,
    );

    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toMatchObject({
      planCode: "pro",
      source: "subscription",
      status: "active",
      currentPeriodStart: "2026-06-07T00:00:00.000Z",
    });
  });

  it("keeps entitlement for a canceled subscription still within the paid period", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "premium",
        status: "canceled",
        currentPeriodEnd: "2026-06-20T00:00:00.000Z",
      },
      undefined,
      now,
    );

    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toMatchObject({ planCode: "premium", source: "subscription" });
  });

  it("drops entitlement once a canceled subscription period has ended", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "premium",
        status: "canceled",
        currentPeriodEnd: "2026-06-01T00:00:00.000Z",
      },
      undefined,
      now,
    );

    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toEqual({ planCode: "free", source: "default" });
  });

  it("picks the highest active plan when multiple subscriptions exist", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_pro",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_premium",
        planCode: "premium",
        status: "active",
      },
      undefined,
      now,
    );

    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toMatchObject({ planCode: "premium" });
  });

  it("upserts the same stripe subscription id without duplicating", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "pro",
        status: "canceled",
        currentPeriodEnd: "2026-06-01T00:00:00.000Z",
      },
      undefined,
      now,
    );

    const subscriptions = await listUserSubscriptions("visitor_1");
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0]).toMatchObject({ status: "canceled" });
  });

  it("preserves existing period dates when a later event omits them", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "pro",
        status: "active",
        currentPeriodStart: "2026-06-07T00:00:00.000Z",
        currentPeriodEnd: "2026-07-07T00:00:00.000Z",
      },
      undefined,
      now,
    );
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_1",
        planCode: "pro",
        status: "active",
      },
      undefined,
      now,
    );

    const subscriptions = await listUserSubscriptions("visitor_1");
    expect(subscriptions[0]).toMatchObject({
      currentPeriodStart: "2026-06-07T00:00:00.000Z",
      currentPeriodEnd: "2026-07-07T00:00:00.000Z",
    });
  });
});
