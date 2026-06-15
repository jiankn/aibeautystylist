import {
  diagnosisJsonSchema,
  parseDiagnosisResult,
  type DiagnosisResult,
} from "./diagnosis";

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
                { text: diagnosisPrompt(options.preferredLookSlug) },
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

function diagnosisPrompt(preferredLookSlug?: string): string {
  return [
    "Analyze only visible, non-medical beauty styling characteristics in this photo.",
    "Do not identify the person, infer health, ethnicity, age, or other sensitive traits.",
    "Be cautious about lighting and camera uncertainty. Use 'uncertain' when evidence is weak.",
    "Return exactly three practical makeup directions and no product or shade guarantees.",
    preferredLookSlug
      ? `The user's selected style preference is "${preferredLookSlug}". Treat it as a preference, not a requirement.`
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
