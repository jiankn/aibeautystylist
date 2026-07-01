export const MAKEUP_REFERENCE_SPEC_VERSION = "1.0.0";
export const MAKEUP_TRANSFER_QUALITY_VERSION = "1.0.0";

export interface MakeupAreaSpec {
  colors: string[];
  placement: string[];
  finish: string[];
  intensity: "none" | "subtle" | "medium" | "strong";
}

export interface MakeupReferenceSpec {
  schemaVersion: typeof MAKEUP_REFERENCE_SPEC_VERSION;
  summary: string;
  focalAreas: string[];
  base: MakeupAreaSpec;
  eyes: MakeupAreaSpec;
  brows: MakeupAreaSpec;
  cheeks: MakeupAreaSpec;
  lips: MakeupAreaSpec;
  contourHighlight: MakeupAreaSpec;
  mustMatch: string[];
  mustAvoid: string[];
}

export interface MakeupTransferQuality {
  schemaVersion: typeof MAKEUP_TRANSFER_QUALITY_VERSION;
  overallScore: number;
  makeupSimilarityScore: number;
  identityPreservationScore: number;
  criticalMissing: string[];
  conflicts: string[];
  correctionInstructions: string[];
}

export const makeupReferenceSpecJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "summary",
    "focalAreas",
    "base",
    "eyes",
    "brows",
    "cheeks",
    "lips",
    "contourHighlight",
    "mustMatch",
    "mustAvoid",
  ],
  properties: {
    schemaVersion: {
      type: "string",
      enum: [MAKEUP_REFERENCE_SPEC_VERSION],
    },
    summary: { type: "string" },
    focalAreas: { type: "array", items: { type: "string" } },
    base: makeupAreaJsonSchema(),
    eyes: makeupAreaJsonSchema(),
    brows: makeupAreaJsonSchema(),
    cheeks: makeupAreaJsonSchema(),
    lips: makeupAreaJsonSchema(),
    contourHighlight: makeupAreaJsonSchema(),
    mustMatch: { type: "array", items: { type: "string" } },
    mustAvoid: { type: "array", items: { type: "string" } },
  },
} as const;

export const makeupTransferQualityJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "overallScore",
    "makeupSimilarityScore",
    "identityPreservationScore",
    "criticalMissing",
    "conflicts",
    "correctionInstructions",
  ],
  properties: {
    schemaVersion: {
      type: "string",
      enum: [MAKEUP_TRANSFER_QUALITY_VERSION],
    },
    overallScore: { type: "number", minimum: 0, maximum: 100 },
    makeupSimilarityScore: { type: "number", minimum: 0, maximum: 100 },
    identityPreservationScore: { type: "number", minimum: 0, maximum: 100 },
    criticalMissing: { type: "array", items: { type: "string" } },
    conflicts: { type: "array", items: { type: "string" } },
    correctionInstructions: { type: "array", items: { type: "string" } },
  },
} as const;

export function parseMakeupReferenceSpec(value: unknown): MakeupReferenceSpec {
  const record = objectRecord(value, "Makeup reference spec");
  if (record.schemaVersion !== MAKEUP_REFERENCE_SPEC_VERSION) {
    throw new Error("Unsupported makeup reference spec version");
  }

  return {
    schemaVersion: MAKEUP_REFERENCE_SPEC_VERSION,
    summary: requiredText(record.summary, "summary"),
    focalAreas: textArray(record.focalAreas, "focalAreas"),
    base: parseArea(record.base, "base"),
    eyes: parseArea(record.eyes, "eyes"),
    brows: parseArea(record.brows, "brows"),
    cheeks: parseArea(record.cheeks, "cheeks"),
    lips: parseArea(record.lips, "lips"),
    contourHighlight: parseArea(record.contourHighlight, "contourHighlight"),
    mustMatch: textArray(record.mustMatch, "mustMatch"),
    mustAvoid: textArray(record.mustAvoid, "mustAvoid"),
  };
}

export function parseMakeupTransferQuality(
  value: unknown,
): MakeupTransferQuality {
  const record = objectRecord(value, "Makeup transfer quality");
  if (record.schemaVersion !== MAKEUP_TRANSFER_QUALITY_VERSION) {
    throw new Error("Unsupported makeup transfer quality version");
  }

  return {
    schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
    overallScore: score(record.overallScore, "overallScore"),
    makeupSimilarityScore: score(
      record.makeupSimilarityScore,
      "makeupSimilarityScore",
    ),
    identityPreservationScore: score(
      record.identityPreservationScore,
      "identityPreservationScore",
    ),
    criticalMissing: textArray(record.criticalMissing, "criticalMissing"),
    conflicts: textArray(record.conflicts, "conflicts"),
    correctionInstructions: textArray(
      record.correctionInstructions,
      "correctionInstructions",
    ),
  };
}

export function passesMakeupTransferQuality(
  quality: MakeupTransferQuality,
): boolean {
  return (
    quality.overallScore >= 80 &&
    quality.makeupSimilarityScore >= 80 &&
    quality.identityPreservationScore >= 75 &&
    quality.criticalMissing.length === 0
  );
}

export function makeupReferenceSpecPrompt(spec: MakeupReferenceSpec): string {
  const area = (name: string, value: MakeupAreaSpec) =>
    `${name}: colors [${value.colors.join(", ")}]; placement [${value.placement.join(", ")}]; finish [${value.finish.join(", ")}]; intensity ${value.intensity}.`;

  return [
    `Reference makeup summary: ${spec.summary}`,
    `Primary focal areas: ${spec.focalAreas.join(", ")}.`,
    area("Base", spec.base),
    area("Eyes", spec.eyes),
    area("Brows", spec.brows),
    area("Cheeks", spec.cheeks),
    area("Lips", spec.lips),
    area("Contour and highlight", spec.contourHighlight),
    `Non-negotiable features to match: ${spec.mustMatch.join("; ")}.`,
    `Features and generic substitutions to avoid: ${spec.mustAvoid.join("; ")}.`,
  ].join(" ");
}

export function makeupTransferCorrectionPrompt(
  quality: MakeupTransferQuality,
): string {
  return [
    "The previous result failed the makeup fidelity review.",
    quality.criticalMissing.length
      ? `Missing critical features: ${quality.criticalMissing.join("; ")}.`
      : "",
    quality.conflicts.length
      ? `Conflicting or incorrect features: ${quality.conflicts.join("; ")}.`
      : "",
    quality.correctionInstructions.length
      ? `Required corrections: ${quality.correctionInstructions.join("; ")}.`
      : "",
    "Correct every listed issue while continuing to preserve the selfie person's identity.",
  ]
    .filter(Boolean)
    .join(" ");
}

function makeupAreaJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["colors", "placement", "finish", "intensity"],
    properties: {
      colors: { type: "array", items: { type: "string" } },
      placement: { type: "array", items: { type: "string" } },
      finish: { type: "array", items: { type: "string" } },
      intensity: {
        type: "string",
        enum: ["none", "subtle", "medium", "strong"],
      },
    },
  } as const;
}

function parseArea(value: unknown, field: string): MakeupAreaSpec {
  const record = objectRecord(value, field);
  const intensity = record.intensity;
  if (
    intensity !== "none" &&
    intensity !== "subtle" &&
    intensity !== "medium" &&
    intensity !== "strong"
  ) {
    throw new Error(`${field}.intensity is invalid`);
  }
  return {
    colors: textArray(record.colors, `${field}.colors`),
    placement: textArray(record.placement, `${field}.placement`),
    finish: textArray(record.finish, `${field}.finish`),
    intensity,
  };
}

function objectRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${field} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} must be non-empty text`);
  }
  return value.trim().slice(0, 1_000);
}

function textArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20)
    .map((item) => item.slice(0, 500));
}

function score(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${field} must be a number`);
  }
  return Math.max(0, Math.min(100, value));
}
