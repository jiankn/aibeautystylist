import { beforeEach, describe, expect, it } from "vitest";

import {
  getEntitlementContext,
  requireFeature,
  requirePlan,
} from "./entitlements";
import { resetMockQuota } from "./quota";
import { resetMockSubscriptions, upsertSubscription } from "./subscriptions";

const now = new Date("2026-06-07T00:00:00.000Z");

describe("entitlements", () => {
  beforeEach(() => {
    resetMockQuota();
    resetMockSubscriptions();
  });

  it("gives free users a 3-use monthly quota", async () => {
    const context = await getEntitlementContext("visitor_1", undefined, now);
    expect(context.plan.planCode).toBe("free");
    expect(context.quota).toMatchObject({ total: 3, remaining: 3 });
  });

  it("gives pro users a 70-use monthly quota", async () => {
    await upsertSubscription(
      {
        userId: "visitor_1",
        stripeSubscriptionId: "sub_pro",
        planCode: "pro",
        status: "active",
        currentPeriodStart: "2026-06-07T00:00:00.000Z",
        currentPeriodEnd: "2026-07-07T00:00:00.000Z",
      },
      undefined,
      now,
    );

    const context = await getEntitlementContext("visitor_1", undefined, now);
    expect(context.plan.planCode).toBe("pro");
    expect(context.quota).toMatchObject({
      total: 70,
      remaining: 70,
      periodStart: "2026-06-07T00:00:00.000Z",
      nextRefreshAt: "2026-07-07T00:00:00.000Z",
    });
  });

  it("gates a feature behind the plan that includes it", async () => {
    await expect(
      requireFeature("visitor_1", "hdDownload", undefined, now),
    ).resolves.toMatchObject({ allowed: false, planCode: "free" });

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

    await expect(
      requireFeature("visitor_1", "hdDownload", undefined, now),
    ).resolves.toMatchObject({ allowed: true, planCode: "pro" });
  });

  it("enforces a minimum plan rank", async () => {
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

    await expect(
      requirePlan("visitor_1", "pro", undefined, now),
    ).resolves.toMatchObject({ allowed: true });
    await expect(
      requirePlan("visitor_1", "premium", undefined, now),
    ).resolves.toMatchObject({ allowed: false, planCode: "pro" });
  });
});
