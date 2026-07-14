import {
  diagnosisJsonSchema,
  parseDiagnosisResult,
  type DiagnosisResult,
} from "./diagnosis";
import { diagnosisPrompt } from "./geminiDiagnosis";
import {
  qualityReviewPrompt,
  referenceAnalysisPrompt,
} from "./geminiMakeupTransfer";
import {
  makeupReferenceSpecJsonSchema,
  makeupTransferQualityJsonSchema,
  parseMakeupReferenceSpec,
  parseMakeupTransferQuality,
  type MakeupReferenceSpec,
  type MakeupTransferQuality,
} from "./makeupTransfer";

export type EvolinkVisionErrorCode =
  | "EVOLINK_VISION_UNAVAILABLE"
  | "EVOLINK_VISION_TIMEOUT"
  | "EVOLINK_VISION_BLOCKED"
  | "EVOLINK_VISION_INVALID_RESPONSE"
  | "MAKEUP_REFERENCE_ANALYSIS_UNAVAILABLE"
  | "MAKEUP_REFERENCE_ANALYSIS_TIMEOUT"
  | "MAKEUP_REFERENCE_ANALYSIS_BLOCKED"
  | "MAKEUP_REFERENCE_ANALYSIS_INVALID"
  | "MAKEUP_TRANSFER_QUALITY_UNAVAILABLE"
  | "MAKEUP_TRANSFER_QUALITY_TIMEOUT"
  | "MAKEUP_TRANSFER_QUALITY_BLOCKED"
  | "MAKEUP_TRANSFER_QUALITY_INVALID"
  | "MAKEUP_TRANSFER_QUALITY_FAILED";

export class EvolinkVisionError extends Error {
  constructor(
    public readonly code: EvolinkVisionErrorCode,
    message: string,
  ) {
    super(message);
  }
}

interface ImageInput {
  data: ArrayBuffer;
  mimeType: string;
}

interface EvolinkVisionBaseOptions {
  apiKey: string;
  model: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

interface EvolinkVisionResponse<T> {
  result: T;
  model: string;
  durationMs: number;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

interface EvolinkChatPayload {
  model?: string;
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: { message?: string; code?: string };
}

export async function generateEvolinkDiagnosis(
  options: EvolinkVisionBaseOptions & {
    photo: ImageInput;
    preferredLookSlug?: string;
    locale?: string;
  },
): Promise<EvolinkVisionResponse<DiagnosisResult>> {
  return requestStructuredVision({
    ...options,
    operation: "diagnosis",
    prompt: diagnosisPrompt({
      preferredLookSlug: options.preferredLookSlug,
      locale: options.locale,
    }),
    images: [options.photo],
    schemaName: "beauty_diagnosis",
    schema: diagnosisJsonSchema,
    parse: parseDiagnosisResult,
  });
}

export async function analyzeEvolinkMakeupReference(
  options: EvolinkVisionBaseOptions & { reference: ImageInput },
): Promise<EvolinkVisionResponse<MakeupReferenceSpec>> {
  return requestStructuredVision({
    ...options,
    operation: "analysis",
    prompt: referenceAnalysisPrompt(),
    images: [options.reference],
    schemaName: "makeup_reference_spec",
    schema: makeupReferenceSpecJsonSchema,
    parse: parseMakeupReferenceSpec,
  });
}

export async function evaluateEvolinkMakeupTransfer(
  options: EvolinkVisionBaseOptions & {
    reference: ImageInput;
    selfie: ImageInput;
    generated: ImageInput;
    spec: MakeupReferenceSpec;
  },
): Promise<EvolinkVisionResponse<MakeupTransferQuality>> {
  return requestStructuredVision({
    ...options,
    operation: "quality",
    prompt: [
      "Input image order: Image 1 is the MAKEUP REFERENCE; Image 2 is the USER SELFIE; Image 3 is the GENERATED TRY-ON CANDIDATE.",
      qualityReviewPrompt(options.spec),
    ].join(" "),
    images: [options.reference, options.selfie, options.generated],
    schemaName: "makeup_transfer_quality",
    schema: makeupTransferQualityJsonSchema,
    parse: parseMakeupTransferQuality,
  });
}

async function requestStructuredVision<T>(
  options: EvolinkVisionBaseOptions & {
    operation: "diagnosis" | "analysis" | "quality";
    prompt: string;
    images: ImageInput[];
    schemaName: string;
    schema: object;
    parse: (value: unknown) => T;
  },
): Promise<EvolinkVisionResponse<T>> {
  if (!options.apiKey || !options.model) {
    throw providerError(options.operation, "unavailable", "EvoLink 配置不完整");
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
      "https://api.evolink.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: options.prompt },
                ...options.images.map((image) => ({
                  type: "image_url",
                  image_url: {
                    url: `data:${image.mimeType};base64,${arrayBufferToBase64(image.data)}`,
                  },
                })),
              ],
            },
          ],
          temperature: 0.1,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: options.schemaName,
              strict: true,
              schema: options.schema,
            },
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
      error instanceof Error ? error.message : "EvoLink 请求失败",
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as EvolinkChatPayload | null;
  if (!response.ok || !payload) {
    throw providerError(
      options.operation,
      "unavailable",
      payload?.error?.message ?? `EvoLink 返回 HTTP ${response.status}`,
    );
  }
  const choice = payload.choices?.[0];
  if (choice?.finish_reason === "content_filter") {
    throw providerError(
      options.operation,
      "blocked",
      "EvoLink 内容安全策略拒绝了本次请求",
    );
  }

  const text = messageText(choice?.message?.content);
  if (!text) {
    throw providerError(
      options.operation,
      "invalid",
      "EvoLink 未返回结构化结果",
    );
  }

  let result: T;
  try {
    result = options.parse(JSON.parse(stripJsonFence(text)));
  } catch (error) {
    throw providerError(
      options.operation,
      "invalid",
      error instanceof Error ? error.message : "EvoLink 返回格式无效",
    );
  }

  return {
    result,
    model: payload.model ?? options.model,
    durationMs: Date.now() - startedAt,
    usage: {
      promptTokens: payload.usage?.prompt_tokens,
      outputTokens: payload.usage?.completion_tokens,
      totalTokens: payload.usage?.total_tokens,
    },
  };
}

function providerError(
  operation: "diagnosis" | "analysis" | "quality",
  kind: "unavailable" | "timeout" | "blocked" | "invalid",
  message: string,
): EvolinkVisionError {
  if (operation === "diagnosis") {
    const suffix = kind === "invalid" ? "INVALID_RESPONSE" : kind.toUpperCase();
    return new EvolinkVisionError(
      `EVOLINK_VISION_${suffix}` as EvolinkVisionErrorCode,
      message,
    );
  }
  const prefix =
    operation === "analysis"
      ? "MAKEUP_REFERENCE_ANALYSIS"
      : "MAKEUP_TRANSFER_QUALITY";
  return new EvolinkVisionError(
    `${prefix}_${kind.toUpperCase()}` as EvolinkVisionErrorCode,
    message,
  );
}

function messageText(
  content?: string | Array<{ type?: string; text?: string }>,
): string {
  if (typeof content === "string") return content.trim();
  return (content ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function stripJsonFence(value: string): string {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
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
