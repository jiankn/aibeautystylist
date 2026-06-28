import { describe, expect, it } from "vitest";

import {
  buildCheckoutStatusPath,
  buildCheckoutStatusUrl,
  safeCheckoutPricingPath,
  safeCheckoutReturnPath,
} from "./checkoutRedirect";

describe("checkout redirect helpers", () => {
  it("keeps localized pricing paths for Stripe return URLs", () => {
    expect(safeCheckoutPricingPath("/zh-cn/pricing?return_to=/dashboard")).toBe(
      "/zh-cn/pricing",
    );
    expect(safeCheckoutPricingPath("/ja/pricing")).toBe("/ja/pricing");
  });

  it("falls back when the pricing path is not a pricing route", () => {
    expect(safeCheckoutPricingPath("/dashboard")).toBe("/pricing");
    expect(safeCheckoutPricingPath("https://example.com/pricing")).toBe(
      "/pricing",
    );
  });

  it("accepts internal product return targets", () => {
    expect(safeCheckoutReturnPath("/zh-cn/tryon?look=rose-milk-date")).toBe(
      "/zh-cn/tryon?look=rose-milk-date",
    );
  });

  it("rejects unsafe or non-product return targets", () => {
    expect(safeCheckoutReturnPath("https://example.com/dashboard")).toBe(
      undefined,
    );
    expect(safeCheckoutReturnPath("//example.com/dashboard")).toBe(undefined);
    expect(safeCheckoutReturnPath("/api/session")).toBe(undefined);
    expect(safeCheckoutReturnPath("/zh-cn/pricing")).toBe(undefined);
  });

  it("builds success paths with encoded return targets", () => {
    expect(
      buildCheckoutStatusPath({
        pricingPath: "/zh-cn/pricing",
        status: "success",
        returnTo: "/zh-cn/tryon?look=rose-milk-date",
      }),
    ).toBe(
      "/zh-cn/pricing?checkout=success&return_to=%2Fzh-cn%2Ftryon%3Flook%3Drose-milk-date",
    );
  });

  it("builds absolute Stripe URLs on the configured origin", () => {
    expect(
      buildCheckoutStatusUrl({
        baseUrl: "https://aibeautystylist.com/app",
        pricingPath: "/ja/pricing",
        status: "cancel",
        returnTo: "/ja/diagnosis",
      }),
    ).toBe(
      "https://aibeautystylist.com/ja/pricing?checkout=cancel&return_to=%2Fja%2Fdiagnosis",
    );
  });
});
