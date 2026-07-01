import { describe, expect, it } from "vitest";

import {
  MAKEUP_REFERENCE_SPEC_VERSION,
  MAKEUP_TRANSFER_QUALITY_VERSION,
  parseMakeupReferenceSpec,
  passesMakeupTransferQuality,
} from "./makeupTransfer";

describe("makeup transfer contracts", () => {
  it("parses a zone-specific reference specification", () => {
    const area = {
      colors: ["silver"],
      placement: ["mobile lid"],
      finish: ["wet-look"],
      intensity: "strong",
    };
    const spec = parseMakeupReferenceSpec({
      schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
      summary: "Reflective silver lid",
      focalAreas: ["eyes"],
      base: area,
      eyes: area,
      brows: area,
      cheeks: area,
      lips: area,
      contourHighlight: area,
      mustMatch: ["reflective lid"],
      mustAvoid: ["matte brown shadow"],
    });

    expect(spec.eyes.finish).toEqual(["wet-look"]);
    expect(spec.mustAvoid).toEqual(["matte brown shadow"]);
  });

  it("requires makeup fidelity, identity preservation, and no critical omissions", () => {
    const quality = {
      schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
      overallScore: 90,
      makeupSimilarityScore: 92,
      identityPreservationScore: 95,
      criticalMissing: [],
      conflicts: [],
      correctionInstructions: [],
    };

    expect(passesMakeupTransferQuality(quality)).toBe(true);
    expect(
      passesMakeupTransferQuality({
        ...quality,
        criticalMissing: ["inner-corner highlight"],
      }),
    ).toBe(false);
  });
});
