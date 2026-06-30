import { beforeEach, describe, expect, it } from "vitest";

import {
  CreditPackFulfillmentError,
  fulfillCreditPackCheckout,
} from "./creditPackFulfillment";
import { resetMockQuota } from "./quota";

const bindings = {
  STRIPE_PRICE_CREDITS_20: "price_credits_20",
  STRIPE_PRICE_CREDITS_60: "price_credits_60",
};

describe("credit pack fulfillment", () => {
  beforeEach(() => resetMockQuota());

  it("grants paid credits once and includes them in the quota total", async () => {
    const session = {
      id: "cs_pack_123",
      mode: "payment",
      payment_status: "paid",
      amount_total: 799,
      currency: "usd",
      client_reference_id: "user_123",
      metadata: {
        purchaseType: "credit_pack",
        userId: "user_123",
        planCode: "pro",
        packCode: "boost_20",
        priceId: "price_credits_20",
        periodStart: "2026-06-01T00:00:00.000Z",
        periodEnd: "2026-07-01T00:00:00.000Z",
      },
    };
    const first = await fulfillCreditPackCheckout({
      session,
      bindings,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });
    const duplicate = await fulfillCreditPackCheckout({
      session,
      bindings,
      now: new Date("2026-06-20T00:00:00.000Z"),
    });

    expect(first).toMatchObject({
      credits: 20,
      duplicate: false,
      quota: { total: 90, remaining: 90 },
    });
    expect(duplicate).toMatchObject({
      duplicate: true,
      quota: { total: 90, remaining: 90 },
    });
  });

  it("rejects a mismatched amount", async () => {
    await expect(
      fulfillCreditPackCheckout({
        session: {
          id: "cs_pack_bad",
          mode: "payment",
          payment_status: "paid",
          amount_total: 1,
          client_reference_id: "user_123",
          metadata: {
            planCode: "premium",
            packCode: "boost_20",
            priceId: "price_credits_20",
          },
        },
        bindings,
      }),
    ).rejects.toBeInstanceOf(CreditPackFulfillmentError);
  });
});
