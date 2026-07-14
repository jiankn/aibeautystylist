import { describe, expect, it } from "vitest";

import {
  CATALOG_TRYON_QUALITY_VERSION,
  catalogTryOnCorrectionPrompt,
  catalogTryOnQualityPrompt,
  isAcceptableCatalogTryOnFallback,
  parseCatalogTryOnQuality,
  passesCatalogTryOnQuality,
  type CatalogTryOnQuality,
} from "./catalogTryOnQuality";

describe("catalog try-on quality", () => {
  it("requires identity, scene and skin texture preservation", () => {
    const passing = quality();
    expect(passesCatalogTryOnQuality(passing)).toBe(true);
    expect(
      passesCatalogTryOnQuality({
        ...passing,
        identityPreservationScore: 91,
      }),
    ).toBe(false);
    expect(
      passesCatalogTryOnQuality({
        ...passing,
        skinTexturePreservationScore: 84,
      }),
    ).toBe(false);
    expect(
      passesCatalogTryOnQuality({
        ...passing,
        criticalDefects: ["hand removed"],
      }),
    ).toBe(false);
  });

  it("allows only a conservative best-candidate fallback", () => {
    expect(
      isAcceptableCatalogTryOnFallback({
        ...quality(),
        overallScore: 64,
        makeupExecutionScore: 60,
        skinTexturePreservationScore: 80,
      }),
    ).toBe(true);
    expect(
      isAcceptableCatalogTryOnFallback({
        ...quality(),
        scenePreservationScore: 89,
      }),
    ).toBe(false);
  });

  it("parses bounded structured scores and emits retry corrections", () => {
    const parsed = parseCatalogTryOnQuality({
      ...quality(),
      overallScore: 120,
      correctionInstructions: ["restore pores"],
    });
    expect(parsed.overallScore).toBe(100);
    expect(catalogTryOnCorrectionPrompt(parsed)).toContain("restore pores");
  });

  it("checks localized correction without accepting smoothing as coverage", () => {
    const prompt = catalogTryOnQualityPrompt(
      "localized correction of forehead discoloration",
    );
    expect(prompt).toContain(
      "focal red or brown discoloration remains nearly unchanged",
    );
    expect(prompt).toContain("do not reward blur or texture loss as coverage");
  });
});

function quality(): CatalogTryOnQuality {
  return {
    schemaVersion: CATALOG_TRYON_QUALITY_VERSION,
    overallScore: 90,
    makeupExecutionScore: 86,
    identityPreservationScore: 97,
    scenePreservationScore: 98,
    skinTexturePreservationScore: 92,
    criticalDefects: [],
    correctionInstructions: [],
  };
}
