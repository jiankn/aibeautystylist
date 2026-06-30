import { describe, expect, it } from "vitest";

import {
  canPlanBuyCreditPacks,
  CREDIT_PACKS,
  getCreditPackByPriceId,
} from "./creditPacks";

describe("credit pack catalog", () => {
  it("keeps packs priced above subscription credit rates", () => {
    expect(CREDIT_PACKS.boost_20).toMatchObject({
      credits: 20,
      priceUsdCents: 799,
    });
    expect(CREDIT_PACKS.boost_60).toMatchObject({
      credits: 60,
      priceUsdCents: 1899,
      featured: true,
    });
    expect(CREDIT_PACKS.boost_20.priceUsdCents / 20).toBeGreaterThan(30);
    expect(CREDIT_PACKS.boost_60.priceUsdCents / 60).toBeGreaterThan(30);
  });

  it("allows only paid plans to buy packs", () => {
    expect(canPlanBuyCreditPacks("free")).toBe(false);
    expect(canPlanBuyCreditPacks("pro")).toBe(true);
    expect(canPlanBuyCreditPacks("premium")).toBe(true);
  });

  it("resolves configured Stripe prices without trusting client metadata", () => {
    const pack = getCreditPackByPriceId("price_credits_60", {
      STRIPE_PRICE_CREDITS_20: "price_credits_20",
      STRIPE_PRICE_CREDITS_60: "price_credits_60",
    });
    expect(pack?.code).toBe("boost_60");
  });
});
