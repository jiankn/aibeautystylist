import { describe, expect, it } from "vitest";

import {
  isAcceptableMakeupTransferFallback,
  MAKEUP_REFERENCE_SPEC_VERSION,
  MAKEUP_TRANSFER_QUALITY_VERSION,
  makeupTransferCandidateScore,
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
      baseCoverage: fullFaceBaseCoverage(),
      eyes: area,
      brows: area,
      cheeks: area,
      lips: area,
      contourHighlight: area,
      mustMatch: ["reflective lid"],
      mustAvoid: ["matte brown shadow"],
    });

    expect(spec.eyes.finish).toEqual(["wet-look"]);
    expect(spec.baseCoverage.forehead).toBe("medium");
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
      baseCoverage: fullFaceBaseCoverage(),
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
      baseCoverageContinuityScore: 94,
      baseCoverageMissing: [],
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
        overallScore: 40,
        makeupSimilarityScore: 65,
        identityPreservationScore: 80,
      }),
    ).toBe(false);
    expect(
      passesMakeupTransferQuality({
        ...quality,
        makeupSimilarityScore: 64,
      }),
    ).toBe(false);
  });

  it("accepts the best safe partial candidate when a retry becomes worse", () => {
    const partial: MakeupTransferQuality = {
      schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
      overallScore: 45,
      makeupSimilarityScore: 40,
      identityPreservationScore: 95,
      baseCoverageContinuityScore: 82,
      baseCoverageMissing: [],
      criticalMissing: [],
      conflicts: ["lip gloss is too subtle"],
      correctionInstructions: ["increase lip gloss"],
    };
    const noOp: MakeupTransferQuality = {
      ...partial,
      overallScore: 0,
      makeupSimilarityScore: 0,
      identityPreservationScore: 100,
      criticalMissing: ["silver shimmer eyeshadow", "high gloss lips"],
    };

    expect(isAcceptableMakeupTransferFallback(partial)).toBe(false);
    expect(isAcceptableMakeupTransferFallback(noOp)).toBe(false);
    expect(makeupTransferCandidateScore(partial)).toBeGreaterThan(
      makeupTransferCandidateScore(noOp),
    );
  });

  it("rejects an otherwise strong result when forehead base coverage is missing", () => {
    const quality: MakeupTransferQuality = {
      schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
      overallScore: 88,
      makeupSimilarityScore: 91,
      identityPreservationScore: 96,
      baseCoverageContinuityScore: 58,
      baseCoverageMissing: ["forehead"],
      criticalMissing: [],
      conflicts: [],
      correctionInstructions: [
        "continue the reference foundation finish across the forehead",
      ],
    };

    expect(passesMakeupTransferQuality(quality)).toBe(false);
    expect(isAcceptableMakeupTransferFallback(quality)).toBe(false);
  });
});

function fullFaceBaseCoverage() {
  return {
    forehead: "medium",
    temples: "medium",
    nose: "medium",
    cheeks: "medium",
    chinJaw: "medium",
    expectedContinuity: "full-face",
  } as const;
}
