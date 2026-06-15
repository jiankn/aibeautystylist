import { beforeEach, describe, expect, it } from "vitest";

import { getEffectivePlan, resetMockSubscriptions } from "./subscriptions";
import {
  handleStripeEvent,
  priceToPlan,
  resetMockStripeEvents,
} from "./stripeEvents";
import type { StripeEvent } from "./stripeWebhook";

const bindings = {
  STRIPE_PRICE_PRO_MONTHLY: "price_pro_monthly",
  STRIPE_PRICE_PRO_YEARLY: "price_pro_yearly",
  STRIPE_PRICE_PREMIUM_MONTHLY: "price_premium_monthly",
  STRIPE_PRICE_PREMIUM_YEARLY: "price_premium_yearly",
};

const now = new Date("2026-06-07T00:00:00.000Z");

function subscriptionEvent(
  id: string,
  type: string,
  overrides: Record<string, unknown> = {},
): StripeEvent {
  return {
    id,
    type,
    data: {
      object: {
        object: "subscription",
        id: "sub_1",
        status: "active",
        customer: "cus_1",
        client_reference_id: "visitor_1",
        current_period_end: Math.floor(
          new Date("2026-07-07T00:00:00.000Z").getTime() / 1000,
        ),
        items: { data: [{ price: { id: "price_pro_monthly" } }] },
        ...overrides,
      },
    },
  };
}

describe("priceToPlan", () => {
  it("maps configured price ids to plan codes", () => {
    expect(priceToPlan("price_pro_monthly", bindings)).toBe("pro");
    expect(priceToPlan("price_premium_yearly", bindings)).toBe("premium");
    expect(priceToPlan("price_unknown", bindings)).toBeUndefined();
  });
});

describe("handleStripeEvent", () => {
  beforeEach(() => {
    resetMockSubscriptions();
    resetMockStripeEvents();
  });

  it("activates a subscription from a subscription.updated event", async () => {
    const result = await handleStripeEvent(
      subscriptionEvent("evt_1", "customer.subscription.updated"),
      bindings,
      now,
    );
    expect(result).toMatchObject({
      handled: true,
      duplicate: false,
      planCode: "pro",
      status: "active",
    });
    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toMatchObject({ planCode: "pro" });
  });

  it("ignores a duplicate event id (idempotent)", async () => {
    await handleStripeEvent(
      subscriptionEvent("evt_dup", "customer.subscription.updated"),
      bindings,
      now,
    );
    const second = await handleStripeEvent(
      subscriptionEvent("evt_dup", "customer.subscription.updated"),
      bindings,
      now,
    );
    expect(second).toMatchObject({ handled: false, duplicate: true });
  });

  it("downgrades to free when a subscription is deleted", async () => {
    await handleStripeEvent(
      subscriptionEvent("evt_create", "customer.subscription.updated"),
      bindings,
      now,
    );
    await handleStripeEvent(
      subscriptionEvent("evt_delete", "customer.subscription.deleted", {
        status: "canceled",
        current_period_end: Math.floor(
          new Date("2026-06-01T00:00:00.000Z").getTime() / 1000,
        ),
      }),
      bindings,
      now,
    );
    await expect(
      getEffectivePlan("visitor_1", undefined, now),
    ).resolves.toEqual({ planCode: "free", source: "default" });
  });

  it("skips events without a resolvable user or price", async () => {
    const result = await handleStripeEvent(
      {
        id: "evt_nouser",
        type: "customer.subscription.updated",
        data: { object: { object: "subscription", id: "sub_x" } },
      },
      bindings,
      now,
    );
    expect(result).toMatchObject({ handled: false });
  });

  it("ignores unrelated event types", async () => {
    const result = await handleStripeEvent(
      { id: "evt_other", type: "invoice.paid", data: { object: {} } },
      bindings,
      now,
    );
    expect(result).toMatchObject({ handled: false, duplicate: false });
  });
});
