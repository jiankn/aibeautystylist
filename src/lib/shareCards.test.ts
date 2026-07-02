import { describe, expect, it } from "vitest";

import {
  hasRequiredPublicShareConsent,
  PUBLIC_SHARE_CONSENT_VERSION,
} from "./shareCards";

describe("public share consent", () => {
  it("does not add friction to catalog try-on results", () => {
    expect(hasRequiredPublicShareConsent({ lookSource: "catalog" })).toBe(true);
  });

  it("requires an explicit, current consent for private reference results", () => {
    expect(
      hasRequiredPublicShareConsent({ lookSource: "private-template" }),
    ).toBe(false);
    expect(
      hasRequiredPublicShareConsent({
        lookSource: "private-template",
        visibilityConsent: true,
        consentVersion: "outdated",
      }),
    ).toBe(false);
    expect(
      hasRequiredPublicShareConsent({
        lookSource: "private-template",
        visibilityConsent: true,
        consentVersion: PUBLIC_SHARE_CONSENT_VERSION,
      }),
    ).toBe(true);
  });
});
