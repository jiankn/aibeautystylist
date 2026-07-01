import {
  makeupReferenceSpecJsonSchema,
  makeupReferenceSpecPrompt,
  makeupTransferQualityJsonSchema,
  parseMakeupReferenceSpec,
  parseMakeupTransferQuality,
  type MakeupReferenceSpec,
  type MakeupTransferQuality,
} from "./makeupTransfer";

export type GeminiMakeupTransferErrorCode =
  | "MAKEUP_REFERENCE_ANALYSIS_UNAVAILABLE"
  | "MAKEUP_REFERENCE_ANALYSIS_TIMEOUT"
  | "MAKEUP_REFERENCE_ANALYSIS_BLOCKED"
  | "MAKEUP_REFERENCE_ANALYSIS_INVALID"
  | "MAKEUP_TRANSFER_QUALITY_UNAVAILABLE"
  | "MAKEUP_TRANSFER_QUALITY_TIMEOUT"
  | "MAKEUP_TRANSFER_QUALITY_BLOCKED"
  | "MAKEUP_TRANSFER_QUALITY_INVALID"
  | "MAKEUP_TRANSFER_QUALITY_FAILED";

export class GeminiMakeupTransferError extends Error {
  constructor(
    public readonly code: GeminiMakeupTransferErrorCode,
    message: string,
  ) {
    super(message);
  }
}

interface ImageInput {
  data: ArrayBuffer;
  mimeType: string;
}

interface GeminiMakeupTransferBaseOptions {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export interface AnalyzeMakeupReferenceOptions extends GeminiMakeupTransferBaseOptions {
  reference: ImageInput;
}

export interface EvaluateMakeupTransferOptions extends GeminiMakeupTransferBaseOptions {
  reference: ImageInput;
  selfie: ImageInput;
  result: ImageInput;
  spec: MakeupReferenceSpec;
}

export interface GeminiStructuredResponse<T> {
  result: T;
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

export async function analyzeMakeupReference(
  options: AnalyzeMakeupReferenceOptions,
): Promise<GeminiStructuredResponse<MakeupReferenceSpec>> {
  return structuredGeminiRequest({
    ...options,
    operation: "analysis",
    parts: [
      { text: referenceAnalysisPrompt() },
      { text: "MAKEUP REFERENCE IMAGE — analyze this image only:" },
      { image: options.reference },
    ],
    schema: makeupReferenceSpecJsonSchema,
    parse: parseMakeupReferenceSpec,
  });
}

export async function evaluateMakeupTransfer(
  options: EvaluateMakeupTransferOptions,
): Promise<GeminiStructuredResponse<MakeupTransferQuality>> {
  return structuredGeminiRequest({
    ...options,
    operation: "quality",
    parts: [
      { text: qualityReviewPrompt(options.spec) },
      { text: "MAKEUP REFERENCE IMAGE:" },
      { image: options.reference },
      { text: "IDENTITY SELFIE BEFORE MAKEUP TRANSFER:" },
      { image: options.selfie },
      { text: "GENERATED TRY-ON RESULT TO REVIEW:" },
      { image: options.result },
    ],
    schema: makeupTransferQualityJsonSchema,
    parse: parseMakeupTransferQuality,
  });
}

async function structuredGeminiRequest<T>(options: {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
  operation: "analysis" | "quality";
  parts: Array<{ text: string } | { image: ImageInput }>;
  schema: unknown;
  parse(value: unknown): T;
}): Promise<GeminiStructuredResponse<T>> {
  if (!options.apiKey || !options.model) {
    throw providerError(options.operation, "unavailable", "Gemini 配置不完整");
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
              parts: options.parts.map((part) =>
                "text" in part
                  ? { text: part.text }
                  : {
                      inlineData: {
                        mimeType: part.image.mimeType,
                        data: arrayBufferToBase64(part.image.data),
                      },
                    },
              ),
            },
          ],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
            responseJsonSchema: options.schema,
          },
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    throw providerError(
      options.operation,
      error instanceof DOMException && error.name === "AbortError"
        ? "timeout"
        : "unavailable",
      error instanceof Error ? error.message : "Gemini 请求失败",
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as GeminiPayload | null;
  if (!response.ok || !payload) {
    throw providerError(
      options.operation,
      "unavailable",
      payload?.error?.message ?? `Gemini 返回 HTTP ${response.status}`,
    );
  }
  if (payload.promptFeedback?.blockReason) {
    throw providerError(
      options.operation,
      "blocked",
      payload.promptFeedback.blockReason,
    );
  }

  const text = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) {
    throw providerError(
      options.operation,
      "invalid",
      "Gemini 未返回结构化结果",
    );
  }

  let result: T;
  try {
    result = options.parse(JSON.parse(text));
  } catch (error) {
    throw providerError(
      options.operation,
      "invalid",
      error instanceof Error ? error.message : "Gemini 返回格式无效",
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

function referenceAnalysisPrompt(): string {
  return [
    "Analyze only the visible cosmetic design in the reference portrait.",
    "Do not identify the person or infer age, ethnicity, health, or other sensitive traits.",
    "Describe makeup colors, exact placement, finish, texture, reflectivity, and intensity separately for base, eyes, brows, cheeks, lips, contour, and highlight.",
    "Distinguish glossy, wet-look, shimmer, metallic, satin, and matte finishes precisely.",
    "Make focalAreas and mustMatch concrete enough to prevent a generic beauty look from replacing the reference.",
    "Use mustAvoid to name visually conflicting substitutions, including incorrect warm/cool direction, matte versus glossy finish, excessive blush, or a different lip texture.",
    "Do not describe identity, hair, clothing, jewelry, pose, camera, or background.",
    "Return concise English phrases in the required JSON schema.",
  ].join(" ");
}

function qualityReviewPrompt(spec: MakeupReferenceSpec): string {
  return [
    "Act as a strict quality gate for a private makeup transfer.",
    "Compare the generated result against the reference makeup and the structured specification, while using the selfie only to verify identity preservation.",
    "Score makeup similarity based on color family, placement, finish, reflectivity, texture, and intensity across every facial zone.",
    "A generic flattering makeup look is a failure when it omits or contradicts the reference focal makeup.",
    "List every missing non-negotiable feature under criticalMissing.",
    "List incorrect substitutions such as warm peach instead of cool silver, matte instead of glossy, or strong blush instead of minimal blush under conflicts.",
    "Correction instructions must be concrete image-editing directions for a second generation attempt.",
    "Do not penalize natural adaptation to the selfie person's facial proportions or skin depth.",
    makeupReferenceSpecPrompt(spec),
  ].join(" ");
}

function providerError(
  operation: "analysis" | "quality",
  kind: "unavailable" | "timeout" | "blocked" | "invalid",
  message: string,
): GeminiMakeupTransferError {
  const prefix =
    operation === "analysis"
      ? "MAKEUP_REFERENCE_ANALYSIS"
      : "MAKEUP_TRANSFER_QUALITY";
  return new GeminiMakeupTransferError(
    `${prefix}_${kind.toUpperCase()}` as GeminiMakeupTransferErrorCode,
    message,
  );
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
