export const DIAGNOSIS_SCHEMA_VERSION = "2026-06-26";
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
const photoQualityLevels = ["good", "usable", "limited"] as const;
const paletteUsages = ["base", "eyes", "cheeks", "lips", "multi"] as const;
const makeupScenarios = ["work", "date", "camera", "daily"] as const;

type SkinDepth = (typeof skinDepths)[number];
type Undertone = (typeof undertones)[number];
type FaceShape = (typeof faceShapes)[number];
type EyeShape = (typeof eyeShapes)[number];
type ColorSeason = (typeof colorSeasons)[number];
type ConfidenceBand = (typeof confidenceBands)[number];
type PhotoQualityLevel = (typeof photoQualityLevels)[number];
type PaletteUsage = (typeof paletteUsages)[number];
type MakeupScenario = (typeof makeupScenarios)[number];

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
  reportSummary: {
    archetype: string;
    primaryStrategy: string;
    oneLineAdvice: string;
  };
  photoQuality: {
    level: PhotoQualityLevel;
    notes: string[];
  };
  makeupPlan: {
    base: string[];
    brows: string[];
    eyes: string[];
    cheeks: string[];
    lips: string[];
    contourHighlight: string[];
  };
  colorPalette: {
    recommended: Array<{
      name: string;
      usage: PaletteUsage;
    }>;
    avoid: string[];
  };
  scenarioStrategies: Array<{
    scenario: MakeupScenario;
    lookName: string;
    colors: string[];
    keyTechniques: string[];
    avoid: string[];
    validation: string;
  }>;
  recommendationReasoning: Array<{
    directionTitle: string;
    matchedFactors: string[];
    watchOut: string[];
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
    reportSummary: {
      type: "object",
      properties: {
        archetype: { type: "string" },
        primaryStrategy: { type: "string" },
        oneLineAdvice: { type: "string" },
      },
      required: ["archetype", "primaryStrategy", "oneLineAdvice"],
    },
    photoQuality: {
      type: "object",
      properties: {
        level: { type: "string", enum: photoQualityLevels },
        notes: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 4,
        },
      },
      required: ["level", "notes"],
    },
    makeupPlan: {
      type: "object",
      properties: {
        base: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
        brows: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
        eyes: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
        cheeks: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
        lips: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
        contourHighlight: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 3,
        },
      },
      required: ["base", "brows", "eyes", "cheeks", "lips", "contourHighlight"],
    },
    colorPalette: {
      type: "object",
      properties: {
        recommended: {
          type: "array",
          minItems: 4,
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              usage: { type: "string", enum: paletteUsages },
            },
            required: ["name", "usage"],
          },
        },
        avoid: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 5,
        },
      },
      required: ["recommended", "avoid"],
    },
    scenarioStrategies: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          scenario: { type: "string", enum: makeupScenarios },
          lookName: { type: "string" },
          colors: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 4,
          },
          keyTechniques: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 4,
          },
          avoid: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 4,
          },
          validation: { type: "string" },
        },
        required: [
          "scenario",
          "lookName",
          "colors",
          "keyTechniques",
          "avoid",
          "validation",
        ],
      },
    },
    recommendationReasoning: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          directionTitle: { type: "string" },
          matchedFactors: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 4,
          },
          watchOut: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 4,
          },
        },
        required: ["directionTitle", "matchedFactors", "watchOut"],
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
    "reportSummary",
    "photoQuality",
    "makeupPlan",
    "colorPalette",
    "scenarioStrategies",
    "recommendationReasoning",
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
  const reportSummary = objectValue(root.reportSummary, "reportSummary");
  const photoQuality = objectValue(root.photoQuality, "photoQuality");
  const makeupPlan = objectValue(root.makeupPlan, "makeupPlan");
  const colorPalette = objectValue(root.colorPalette, "colorPalette");
  const recommendedColors = arrayValue(
    colorPalette.recommended,
    "colorPalette.recommended",
  );
  if (recommendedColors.length < 4 || recommendedColors.length > 8)
    invalid("colorPalette.recommended");
  const scenarioStrategies = arrayValue(
    root.scenarioStrategies,
    "scenarioStrategies",
  );
  if (scenarioStrategies.length !== 4) invalid("scenarioStrategies");
  const recommendationReasoning = arrayValue(
    root.recommendationReasoning,
    "recommendationReasoning",
  );
  if (recommendationReasoning.length !== 3) invalid("recommendationReasoning");

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
    reportSummary: {
      archetype: stringValue(
        reportSummary.archetype,
        "reportSummary.archetype",
      ),
      primaryStrategy: stringValue(
        reportSummary.primaryStrategy,
        "reportSummary.primaryStrategy",
      ),
      oneLineAdvice: stringValue(
        reportSummary.oneLineAdvice,
        "reportSummary.oneLineAdvice",
      ),
    },
    photoQuality: {
      level: enumValue(
        photoQuality.level,
        photoQualityLevels,
        "photoQuality.level",
      ),
      notes: stringArray(photoQuality.notes, "photoQuality.notes", 1, 4),
    },
    makeupPlan: {
      base: stringArray(makeupPlan.base, "makeupPlan.base", 1, 3),
      brows: stringArray(makeupPlan.brows, "makeupPlan.brows", 1, 3),
      eyes: stringArray(makeupPlan.eyes, "makeupPlan.eyes", 1, 3),
      cheeks: stringArray(makeupPlan.cheeks, "makeupPlan.cheeks", 1, 3),
      lips: stringArray(makeupPlan.lips, "makeupPlan.lips", 1, 3),
      contourHighlight: stringArray(
        makeupPlan.contourHighlight,
        "makeupPlan.contourHighlight",
        1,
        3,
      ),
    },
    colorPalette: {
      recommended: recommendedColors.map((item, index) => {
        const value = objectValue(item, `colorPalette.recommended.${index}`);
        return {
          name: stringValue(
            value.name,
            `colorPalette.recommended.${index}.name`,
          ),
          usage: enumValue(
            value.usage,
            paletteUsages,
            `colorPalette.recommended.${index}.usage`,
          ),
        };
      }),
      avoid: stringArray(colorPalette.avoid, "colorPalette.avoid", 1, 5),
    },
    scenarioStrategies: scenarioStrategies.map((item, index) => {
      const value = objectValue(item, `scenarioStrategies.${index}`);
      return {
        scenario: enumValue(
          value.scenario,
          makeupScenarios,
          `scenarioStrategies.${index}.scenario`,
        ),
        lookName: stringValue(
          value.lookName,
          `scenarioStrategies.${index}.lookName`,
        ),
        colors: stringArray(
          value.colors,
          `scenarioStrategies.${index}.colors`,
          1,
          4,
        ),
        keyTechniques: stringArray(
          value.keyTechniques,
          `scenarioStrategies.${index}.keyTechniques`,
          1,
          4,
        ),
        avoid: stringArray(
          value.avoid,
          `scenarioStrategies.${index}.avoid`,
          1,
          4,
        ),
        validation: stringValue(
          value.validation,
          `scenarioStrategies.${index}.validation`,
        ),
      };
    }),
    recommendationReasoning: recommendationReasoning.map((item, index) => {
      const value = objectValue(item, `recommendationReasoning.${index}`);
      return {
        directionTitle: stringValue(
          value.directionTitle,
          `recommendationReasoning.${index}.directionTitle`,
        ),
        matchedFactors: stringArray(
          value.matchedFactors,
          `recommendationReasoning.${index}.matchedFactors`,
          1,
          4,
        ),
        watchOut: stringArray(
          value.watchOut,
          `recommendationReasoning.${index}.watchOut`,
          1,
          4,
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
