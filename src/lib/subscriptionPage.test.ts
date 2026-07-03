import { describe, expect, it } from "vitest";

import creditPackSource from "../components/CreditPackPanel.astro?raw";
import pageSource from "../pages/subscription.astro?raw";
import sessionSource from "../pages/api/session.ts?raw";

describe("subscription page", () => {
  it("uses real billing intervals instead of always presenting a monthly price", () => {
    expect(pageSource).toContain('billingInterval === "yearly"');
    expect(pageSource).toContain("meta.yearlyPriceUsd");
    expect(pageSource).toContain("copy.priceUnavailable");
    expect(sessionSource).toContain("billingInterval: plan.billingInterval");
  });

  it("only exposes credit pack actions to eligible plans", () => {
    expect(pageSource).toContain("data-credit-pack-action");
    expect(pageSource).toContain('plan !== "pro" && plan !== "premium"');
    expect(pageSource).toContain("hideWhenUnavailable");
    expect(creditPackSource).toContain("panel.hidden = !canBuy");
  });

  it("keeps the compact mobile layout accessible", () => {
    expect(pageSource).toContain('role="progressbar"');
    expect(pageSource).toContain('aria-live="polite"');
    expect(pageSource).toContain("min-height: 44px");
    expect(pageSource).toContain(
      "grid-template-columns: repeat(2, minmax(0, 1fr))",
    );
  });
});
