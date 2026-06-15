import { beforeEach, describe, expect, it } from "vitest";

import {
  hasValidPhotoConsent,
  recordPhotoConsent,
  resetMockConsents,
} from "./consent";

describe("photo consent", () => {
  beforeEach(() => resetMockConsents());

  it("requires the current user and consent version", async () => {
    expect(await hasValidPhotoConsent("visitor_1", "v1")).toBe(false);

    const recorded = await recordPhotoConsent(
      "visitor_1",
      "v1",
      undefined,
      new Date("2026-06-07T00:00:00.000Z"),
    );

    expect(recorded).toMatchObject({
      version: "v1",
      acceptedAt: "2026-06-07T00:00:00.000Z",
      persisted: false,
    });
    expect(await hasValidPhotoConsent("visitor_1", "v1")).toBe(true);
    expect(await hasValidPhotoConsent("visitor_2", "v1")).toBe(false);
    expect(await hasValidPhotoConsent("visitor_1", "v2")).toBe(false);
  });
});
