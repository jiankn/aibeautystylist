export const CATALOG_TRYON_QUALITY_VERSION = "1.0.0";

export interface CatalogTryOnQuality {
  schemaVersion: typeof CATALOG_TRYON_QUALITY_VERSION;
  overallScore: number;
  makeupExecutionScore: number;
  identityPreservationScore: number;
  scenePreservationScore: number;
  skinTexturePreservationScore: number;
  criticalDefects: string[];
  correctionInstructions: string[];
}

export const catalogTryOnQualityJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "overallScore",
    "makeupExecutionScore",
    "identityPreservationScore",
    "scenePreservationScore",
    "skinTexturePreservationScore",
    "criticalDefects",
    "correctionInstructions",
  ],
  properties: {
    schemaVersion: {
      type: "string",
      enum: [CATALOG_TRYON_QUALITY_VERSION],
    },
    overallScore: scoreSchema(),
    makeupExecutionScore: scoreSchema(),
    identityPreservationScore: scoreSchema(),
    scenePreservationScore: scoreSchema(),
    skinTexturePreservationScore: scoreSchema(),
    criticalDefects: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
    correctionInstructions: {
      type: "array",
      items: { type: "string" },
      maxItems: 6,
    },
  },
} as const;

export function parseCatalogTryOnQuality(value: unknown): CatalogTryOnQuality {
  const record = objectRecord(value);
  if (record.schemaVersion !== CATALOG_TRYON_QUALITY_VERSION) {
    throw new Error("Unsupported catalog try-on quality version");
  }
  return {
    schemaVersion: CATALOG_TRYON_QUALITY_VERSION,
    overallScore: score(record.overallScore, "overallScore"),
    makeupExecutionScore: score(
      record.makeupExecutionScore,
      "makeupExecutionScore",
    ),
    identityPreservationScore: score(
      record.identityPreservationScore,
      "identityPreservationScore",
    ),
    scenePreservationScore: score(
      record.scenePreservationScore,
      "scenePreservationScore",
    ),
    skinTexturePreservationScore: score(
      record.skinTexturePreservationScore,
      "skinTexturePreservationScore",
    ),
    criticalDefects: textArray(record.criticalDefects),
    correctionInstructions: textArray(record.correctionInstructions),
  };
}

export function passesCatalogTryOnQuality(
  quality: CatalogTryOnQuality,
): boolean {
  return (
    quality.overallScore >= 72 &&
    quality.makeupExecutionScore >= 68 &&
    quality.identityPreservationScore >= 92 &&
    quality.scenePreservationScore >= 94 &&
    quality.skinTexturePreservationScore >= 85 &&
    quality.criticalDefects.length === 0
  );
}

export function isAcceptableCatalogTryOnFallback(
  quality: CatalogTryOnQuality,
): boolean {
  return (
    quality.overallScore >= 62 &&
    quality.makeupExecutionScore >= 58 &&
    quality.identityPreservationScore >= 90 &&
    quality.scenePreservationScore >= 92 &&
    quality.skinTexturePreservationScore >= 78 &&
    quality.criticalDefects.length === 0
  );
}

export function catalogTryOnCandidateScore(
  quality: CatalogTryOnQuality,
): number {
  if (
    quality.identityPreservationScore < 88 ||
    quality.scenePreservationScore < 90
  ) {
    return Number.NEGATIVE_INFINITY;
  }
  return (
    quality.makeupExecutionScore * 0.3 +
    quality.identityPreservationScore * 0.25 +
    quality.scenePreservationScore * 0.2 +
    quality.skinTexturePreservationScore * 0.15 +
    quality.overallScore * 0.1 -
    quality.criticalDefects.length * 30
  );
}

export function catalogTryOnQualityPrompt(target: string): string {
  return [
    "Input image order: Image 1 is the ORIGINAL USER SELFIE; Image 2 is the GENERATED MAKEUP TRY-ON CANDIDATE.",
    "Act as a strict production quality gate for a photorealistic virtual makeup result.",
    `Target makeup: ${target}`,
    "Score makeupExecution for clearly visible, tasteful execution of the target makeup; an unchanged selfie or generic near-invisible edit must score below 55.",
    "When the target requests localized complexion correction, lower makeupExecution if focal red or brown discoloration remains nearly unchanged while the surrounding complexion is visibly corrected; do not reward blur or texture loss as coverage.",
    "Score identityPreservation by comparing facial geometry, eyes, nose, lips, jaw, age, expression, head angle and body position. Beautification or face reshaping is a serious defect.",
    "Score scenePreservation by comparing crop, camera perspective, hands, arms, hair, ears, jewelry, clothing, background, seats, windows, lighting and every non-makeup object.",
    "Score skinTexturePreservation by comparing pores, fine lines, moles, freckles, natural skin grain, under-eye texture and lip lines. Smoothing, de-aging, airbrushing or porcelain skin is a serious defect.",
    "List only blocking defects in criticalDefects: identity/geometry drift, changed or missing scene objects, added people or limbs, major smoothing/de-aging, text/watermark, malformed anatomy, or effectively no makeup change.",
    "Give short, actionable correctionInstructions that can be applied to the candidate while preserving successful makeup.",
  ].join(" ");
}

export function catalogTryOnCorrectionPrompt(
  quality: CatalogTryOnQuality,
): string {
  const corrections = [
    ...quality.criticalDefects,
    ...quality.correctionInstructions,
  ]
    .slice(0, 6)
    .join("; ");
  return [
    corrections ? `Correct these defects: ${corrections}.` : "",
    "Retain successful makeup from the current candidate, but restore the exact identity, scene, anatomy and real skin texture from the original selfie wherever they differ.",
    "The corrected makeup must remain clearly visible and photorealistic.",
  ]
    .filter(Boolean)
    .join(" ");
}

function scoreSchema() {
  return { type: "number", minimum: 0, maximum: 100 } as const;
}

function objectRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Catalog try-on quality must be an object");
  }
  return value as Record<string, unknown>;
}

function score(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a number`);
  }
  return Math.max(0, Math.min(100, value));
}

function textArray(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("Quality notes must be an array");
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((item) => item.slice(0, 500));
}
