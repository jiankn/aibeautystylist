export const DIAGNOSIS_SCHEMA_VERSION = "2026-06-07";
export const DIAGNOSIS_DISCLAIMER =
  "AI 建议仅供美妆参考，不构成医疗或专业意见；实际效果因光线、设备和个人条件而异。";

const skinDepths = ["fair", "light", "medium", "tan", "deep"] as const;
const undertones = ["cool", "warm", "neutral", "olive", "uncertain"] as const;
const faceShapes = [
  "oval",
  "round",
  "square",
  "heart",
  "oblong",
  "diamond",
  "uncertain",
] as const;
const eyeShapes = [
  "almond",
  "round",
  "hooded",
  "monolid",
  "upturned",
  "downturned",
  "uncertain",
] as const;
const colorSeasons = [
  "bright-spring",
  "warm-spring",
  "light-spring",
  "light-summer",
  "cool-summer",
  "soft-summer",
  "soft-autumn",
  "warm-autumn",
  "deep-autumn",
  "deep-winter",
  "cool-winter",
  "bright-winter",
  "uncertain",
] as const;
const confidenceBands = ["low", "medium", "high"] as const;

type SkinDepth = (typeof skinDepths)[number];
type Undertone = (typeof undertones)[number];
type FaceShape = (typeof faceShapes)[number];
type EyeShape = (typeof eyeShapes)[number];
type ColorSeason = (typeof colorSeasons)[number];
type ConfidenceBand = (typeof confidenceBands)[number];

export interface DiagnosisResult {
  schemaVersion: typeof DIAGNOSIS_SCHEMA_VERSION;
  confidence: {
    overall: number;
    band: ConfidenceBand;
    limitations: string[];
  };
  skinTone: {
    depth: SkinDepth;
    undertone: Undertone;
    summary: string;
  };
  faceShape: {
    primary: FaceShape;
    evidence: string[];
  };
  eyeShape: {
    primary: EyeShape;
    evidence: string[];
  };
  colorSeason: {
    season: ColorSeason;
    rationale: string;
  };
  strengths: string[];
  cautions: string[];
  makeupDirections: Array<{
    title: string;
    rationale: string;
    palette: string[];
  }>;
  disclaimer: typeof DIAGNOSIS_DISCLAIMER;
}

export const diagnosisJsonSchema = {
  type: "object",
  properties: {
    confidence: {
      type: "object",
      properties: {
        overall: { type: "number", minimum: 0, maximum: 1 },
        band: { type: "string", enum: confidenceBands },
        limitations: { type: "array", items: { type: "string" } },
      },
      required: ["overall", "band", "limitations"],
    },
    skinTone: {
      type: "object",
      properties: {
        depth: { type: "string", enum: skinDepths },
        undertone: { type: "string", enum: undertones },
        summary: { type: "string" },
      },
      required: ["depth", "undertone", "summary"],
    },
    faceShape: {
      type: "object",
      properties: {
        primary: { type: "string", enum: faceShapes },
        evidence: { type: "array", items: { type: "string" } },
      },
      required: ["primary", "evidence"],
    },
    eyeShape: {
      type: "object",
      properties: {
        primary: { type: "string", enum: eyeShapes },
        evidence: { type: "array", items: { type: "string" } },
      },
      required: ["primary", "evidence"],
    },
    colorSeason: {
      type: "object",
      properties: {
        season: { type: "string", enum: colorSeasons },
        rationale: { type: "string" },
      },
      required: ["season", "rationale"],
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 4,
    },
    cautions: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 4,
    },
    makeupDirections: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          rationale: { type: "string" },
          palette: {
            type: "array",
            items: { type: "string" },
            minItems: 2,
            maxItems: 5,
          },
        },
        required: ["title", "rationale", "palette"],
      },
    },
  },
  required: [
    "confidence",
    "skinTone",
    "faceShape",
    "eyeShape",
    "colorSeason",
    "strengths",
    "cautions",
    "makeupDirections",
  ],
} as const;

export function parseDiagnosisResult(input: unknown): DiagnosisResult {
  const root = objectValue(input, "diagnosis");
  const confidence = objectValue(root.confidence, "confidence");
  const overall = numberValue(confidence.overall, "confidence.overall");
  if (overall < 0 || overall > 1) invalid("confidence.overall");
  const band = enumValue(confidence.band, confidenceBands, "confidence.band");
  if (
    (overall < 0.6 && band !== "low") ||
    (overall >= 0.6 && overall < 0.8 && band !== "medium") ||
    (overall >= 0.8 && band !== "high")
  ) {
    invalid("confidence.band");
  }

  const skinTone = objectValue(root.skinTone, "skinTone");
  const faceShape = objectValue(root.faceShape, "faceShape");
  const eyeShape = objectValue(root.eyeShape, "eyeShape");
  const colorSeason = objectValue(root.colorSeason, "colorSeason");
  const directions = arrayValue(root.makeupDirections, "makeupDirections");
  if (directions.length !== 3) invalid("makeupDirections");

  return {
    schemaVersion: DIAGNOSIS_SCHEMA_VERSION,
    confidence: {
      overall,
      band,
      limitations: stringArray(
        confidence.limitations,
        "confidence.limitations",
      ),
    },
    skinTone: {
      depth: enumValue(skinTone.depth, skinDepths, "skinTone.depth"),
      undertone: enumValue(
        skinTone.undertone,
        undertones,
        "skinTone.undertone",
      ),
      summary: stringValue(skinTone.summary, "skinTone.summary"),
    },
    faceShape: {
      primary: enumValue(faceShape.primary, faceShapes, "faceShape.primary"),
      evidence: stringArray(faceShape.evidence, "faceShape.evidence"),
    },
    eyeShape: {
      primary: enumValue(eyeShape.primary, eyeShapes, "eyeShape.primary"),
      evidence: stringArray(eyeShape.evidence, "eyeShape.evidence"),
    },
    colorSeason: {
      season: enumValue(colorSeason.season, colorSeasons, "colorSeason.season"),
      rationale: stringValue(colorSeason.rationale, "colorSeason.rationale"),
    },
    strengths: stringArray(root.strengths, "strengths", 2, 4),
    cautions: stringArray(root.cautions, "cautions", 1, 4),
    makeupDirections: directions.map((direction, index) => {
      const value = objectValue(direction, `makeupDirections.${index}`);
      return {
        title: stringValue(value.title, `makeupDirections.${index}.title`),
        rationale: stringValue(
          value.rationale,
          `makeupDirections.${index}.rationale`,
        ),
        palette: stringArray(
          value.palette,
          `makeupDirections.${index}.palette`,
          2,
          5,
        ),
      };
    }),
    disclaimer: DIAGNOSIS_DISCLAIMER,
  };
}

function objectValue(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalid(field);
  return value as Record<string, unknown>;
}

function arrayValue(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) invalid(field);
  return value;
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) invalid(field);
  return value.trim();
}

function numberValue(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) invalid(field);
  return value;
}

function enumValue<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) invalid(field);
  return value as T[number];
}

function stringArray(
  value: unknown,
  field: string,
  min = 0,
  max = 8,
): string[] {
  const values = arrayValue(value, field);
  if (values.length < min || values.length > max) invalid(field);
  return values.map((item, index) => stringValue(item, `${field}.${index}`));
}

function invalid(field: string): never {
  throw new Error(`INVALID_DIAGNOSIS_SCHEMA:${field}`);
}
