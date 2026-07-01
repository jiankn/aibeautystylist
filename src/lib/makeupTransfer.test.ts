import { describe, expect, it } from "vitest";

import {
  MAKEUP_REFERENCE_SPEC_VERSION,
  MAKEUP_TRANSFER_QUALITY_VERSION,
  parseMakeupReferenceSpec,
  passesMakeupTransferQuality,
  type MakeupTransferQuality,
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

  it("keeps only the dominant focal requirements", () => {
    const area = {
      colors: ["silver"],
      placement: ["mobile lid"],
      finish: ["wet-look"],
      intensity: "strong",
    };
    const spec = parseMakeupReferenceSpec({
      schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
      summary: "Reflective silver lid",
      focalAreas: ["eyes", "inner corners", "lips", "cheeks"],
      base: area,
      eyes: area,
      brows: area,
      cheeks: area,
      lips: area,
      contourHighlight: area,
      mustMatch: ["one", "two", "three", "routine brow detail"],
      mustAvoid: ["one", "two", "three", "four", "five", "six"],
    });

    expect(spec.focalAreas).toHaveLength(3);
    expect(spec.mustMatch).toEqual(["one", "two", "three"]);
    expect(spec.mustAvoid).toHaveLength(5);
  });

  it("requires makeup fidelity, identity preservation, and no critical omissions", () => {
    const quality: MakeupTransferQuality = {
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
    expect(
      passesMakeupTransferQuality({
        ...quality,
        overallScore: 75,
        makeupSimilarityScore: 75,
        identityPreservationScore: 80,
      }),
    ).toBe(true);
    expect(
      passesMakeupTransferQuality({
        ...quality,
        makeupSimilarityScore: 74,
      }),
    ).toBe(false);
  });
});
