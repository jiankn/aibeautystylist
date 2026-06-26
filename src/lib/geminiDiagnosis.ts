import {
  diagnosisJsonSchema,
  parseDiagnosisResult,
  type DiagnosisResult,
} from "./diagnosis";
import { normalizeLocale, type SupportedLocale } from "./i18n";

export type DiagnosisProviderErrorCode =
  | "GEMINI_UNAVAILABLE"
  | "GEMINI_TIMEOUT"
  | "GEMINI_BLOCKED"
  | "GEMINI_INVALID_RESPONSE";

export class DiagnosisProviderError extends Error {
  constructor(
    public readonly code: DiagnosisProviderErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface GeminiDiagnosisOptions {
  apiKey: string;
  model: string;
  photo: {
    data: ArrayBuffer;
    mimeType: string;
  };
  preferredLookSlug?: string;
  locale?: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export interface GeminiDiagnosisResponse {
  result: DiagnosisResult;
  model: string;
  durationMs: number;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

interface GeminiPayload {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  promptFeedback?: { blockReason?: string };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: { message?: string };
}

export async function generateGeminiDiagnosis(
  options: GeminiDiagnosisOptions,
): Promise<GeminiDiagnosisResponse> {
  if (!options.apiKey || !options.model) {
    throw new DiagnosisProviderError("GEMINI_UNAVAILABLE", "Gemini 配置不完整");
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 120_000,
  );
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": options.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: diagnosisPrompt({
                    preferredLookSlug: options.preferredLookSlug,
                    locale: options.locale,
                  }),
                },
                {
                  inlineData: {
                    mimeType: options.photo.mimeType,
                    data: arrayBufferToBase64(options.photo.data),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseJsonSchema: diagnosisJsonSchema,
          },
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    throw new DiagnosisProviderError(
      error instanceof DOMException && error.name === "AbortError"
        ? "GEMINI_TIMEOUT"
        : "GEMINI_UNAVAILABLE",
      error instanceof Error ? error.message : "Gemini 请求失败",
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as GeminiPayload | null;
  if (!response.ok || !payload) {
    throw new DiagnosisProviderError(
      "GEMINI_UNAVAILABLE",
      payload?.error?.message ?? `Gemini 返回 HTTP ${response.status}`,
    );
  }
  if (payload.promptFeedback?.blockReason) {
    throw new DiagnosisProviderError(
      "GEMINI_BLOCKED",
      payload.promptFeedback.blockReason,
    );
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw new DiagnosisProviderError(
      "GEMINI_INVALID_RESPONSE",
      "Gemini 未返回结构化诊断",
    );
  }

  let result: DiagnosisResult;
  try {
    result = parseDiagnosisResult(JSON.parse(text));
  } catch (error) {
    throw new DiagnosisProviderError(
      "GEMINI_INVALID_RESPONSE",
      error instanceof Error ? error.message : "Gemini 诊断格式无效",
    );
  }

  return {
    result,
    model: options.model,
    durationMs: Date.now() - startedAt,
    usage: {
      promptTokens: payload.usageMetadata?.promptTokenCount,
      outputTokens: payload.usageMetadata?.candidatesTokenCount,
      totalTokens: payload.usageMetadata?.totalTokenCount,
    },
  };
}

const diagnosisOutputLanguages: Record<
  SupportedLocale,
  { name: string; writingSystem?: string }
> = {
  en: { name: "English" },
  "zh-CN": { name: "Simplified Chinese", writingSystem: "简体中文" },
  "de-DE": { name: "German", writingSystem: "Deutsch" },
  "fr-FR": { name: "French", writingSystem: "français" },
  "ja-JP": { name: "Japanese", writingSystem: "日本語" },
  "ko-KR": { name: "Korean", writingSystem: "한국어" },
  "zh-TW": { name: "Traditional Chinese", writingSystem: "繁體中文" },
  "es-ES": { name: "Spanish", writingSystem: "español" },
  "es-419": { name: "Latin American Spanish", writingSystem: "español" },
  "pt-BR": {
    name: "Brazilian Portuguese",
    writingSystem: "português do Brasil",
  },
};

function diagnosisPrompt(options: {
  preferredLookSlug?: string;
  locale?: string;
}): string {
  const locale = normalizeLocale(options.locale);
  const outputLanguage = diagnosisOutputLanguages[locale];
  const languageInstruction = outputLanguage.writingSystem
    ? `${outputLanguage.name} (${outputLanguage.writingSystem})`
    : outputLanguage.name;

  return [
    "Analyze only visible, non-medical beauty styling characteristics in this photo.",
    "Do not identify the person, infer health, ethnicity, age, or other sensitive traits.",
    "Be cautious about lighting and camera uncertainty. Use 'uncertain' when evidence is weak.",
    `The active UI locale is "${locale}". Write every user-visible free-text field in ${languageInstruction}.`,
    "User-visible free-text fields include confidence.limitations, skinTone.summary, faceShape.evidence, eyeShape.evidence, colorSeason.rationale, strengths, cautions, every makeupDirections title, rationale, and palette entry, reportSummary, photoQuality.notes, makeupPlan, colorPalette names and avoid entries, scenarioStrategies, and recommendationReasoning.",
    "Keep schema enum values exactly as defined in English, including depth, undertone, face shape, eye shape, color season, confidence band, photo quality level, palette usage, and scenario keys.",
    "Make reportSummary sound like a professional beauty consultant: define the user's overall makeup positioning, core strategy, and one concise next action.",
    "Make makeupPlan concrete and zone-based for base, brows, eyes, cheeks, lips, contour and highlight. Use practical application advice, not generic labels.",
    "Return exactly four scenarioStrategies using scenario values work, date, camera, and daily. Each scenario must explain colors, technique, what to avoid, and how the user can validate the result in real lighting.",
    "Return exactly three practical makeup directions and exactly three recommendationReasoning entries aligned with those direction titles. Do not include product or shade guarantees.",
    options.preferredLookSlug
      ? `The user's selected style preference is "${options.preferredLookSlug}". Treat it as a preference, not a requirement.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + chunkSize),
    );
  }
  return btoa(binary);
}
