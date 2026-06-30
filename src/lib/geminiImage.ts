export type GeminiImageErrorCode =
  | "GEMINI_IMAGE_UNAVAILABLE"
  | "GEMINI_IMAGE_TIMEOUT"
  | "GEMINI_IMAGE_BLOCKED"
  | "GEMINI_IMAGE_INVALID_RESPONSE";

export class GeminiImageError extends Error {
  constructor(
    public readonly code: GeminiImageErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface GeminiImageOptions {
  apiKey: string;
  model: string;
  prompt: string;
  photo?: {
    data: ArrayBuffer;
    mimeType: string;
  };
  images?: Array<{
    data: ArrayBuffer;
    mimeType: string;
  }>;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export interface GeminiImageResponse {
  image: {
    data: ArrayBuffer;
    contentType: string;
  };
  model: string;
  durationMs: number;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

interface GeminiImagePayload {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: { mimeType?: string; data?: string };
        inline_data?: { mime_type?: string; data?: string };
      }>;
    };
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

export async function generateGeminiMakeupImage(
  options: GeminiImageOptions,
): Promise<GeminiImageResponse> {
  if (!options.apiKey || !options.model) {
    throw new GeminiImageError(
      "GEMINI_IMAGE_UNAVAILABLE",
      "Gemini 图像配置不完整",
    );
  }
  const images = options.images?.length
    ? options.images
    : options.photo
      ? [options.photo]
      : [];
  if (images.length === 0) {
    throw new GeminiImageError(
      "GEMINI_IMAGE_INVALID_RESPONSE",
      "Gemini 图像请求缺少输入图片",
    );
  }

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? 75_000,
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
                { text: options.prompt },
                ...images.map((image) => ({
                  inlineData: {
                    mimeType: image.mimeType,
                    data: arrayBufferToBase64(image.data),
                  },
                })),
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
        signal: controller.signal,
      },
    );
  } catch (error) {
    throw new GeminiImageError(
      error instanceof DOMException && error.name === "AbortError"
        ? "GEMINI_IMAGE_TIMEOUT"
        : "GEMINI_IMAGE_UNAVAILABLE",
      error instanceof Error ? error.message : "Gemini 图像请求失败",
    );
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response
    .json()
    .catch(() => null)) as GeminiImagePayload | null;
  if (!response.ok || !payload) {
    throw new GeminiImageError(
      "GEMINI_IMAGE_UNAVAILABLE",
      payload?.error?.message ?? `Gemini 图像返回 HTTP ${response.status}`,
    );
  }
  if (payload.promptFeedback?.blockReason) {
    throw new GeminiImageError(
      "GEMINI_IMAGE_BLOCKED",
      payload.promptFeedback.blockReason,
    );
  }

  const parts = payload.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(
    (part) => part.inlineData?.data || part.inline_data?.data,
  );
  const base64 =
    imagePart?.inlineData?.data ?? imagePart?.inline_data?.data ?? "";
  if (!base64) {
    throw new GeminiImageError(
      "GEMINI_IMAGE_INVALID_RESPONSE",
      "Gemini 未返回妆效图",
    );
  }
  const mimeType =
    imagePart?.inlineData?.mimeType ??
    imagePart?.inline_data?.mime_type ??
    inferImageType(base64);

  return {
    image: {
      data: base64ToArrayBuffer(base64),
      contentType: mimeType,
    },
    model: options.model,
    durationMs: Date.now() - startedAt,
    usage: {
      promptTokens: payload.usageMetadata?.promptTokenCount,
      outputTokens: payload.usageMetadata?.candidatesTokenCount,
      totalTokens: payload.usageMetadata?.totalTokenCount,
    },
  };
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

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

function inferImageType(base64: string): string {
  if (base64.startsWith("iVBOR")) return "image/png";
  if (base64.startsWith("/9j/")) return "image/jpeg";
  return "image/png";
}
