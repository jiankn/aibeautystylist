export type EvolinkImageErrorCode =
  | "EVOLINK_UNAVAILABLE"
  | "EVOLINK_TIMEOUT"
  | "EVOLINK_TASK_FAILED"
  | "EVOLINK_INVALID_RESPONSE"
  | "EVOLINK_RESULT_DOWNLOAD_FAILED";

export class EvolinkImageError extends Error {
  constructor(
    public readonly code: EvolinkImageErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface EvolinkImageOptions {
  apiKey: string;
  model?: string;
  prompt: string;
  photo: {
    data: ArrayBuffer;
    mimeType: string;
  };
  size?: string;
  quality?: "low" | "medium" | "high";
  timeoutMs?: number;
  pollIntervalMs?: number;
  fetcher?: typeof fetch;
}

export interface EvolinkImageResponse {
  image: {
    data: ArrayBuffer;
    contentType: string;
    sourceUrl: string;
  };
  taskId: string;
  model: string;
  durationMs: number;
  estimatedCostMicros?: number;
  creditsUsed?: number;
}

interface EvolinkUploadPayload {
  success?: boolean;
  data?: {
    file_url?: string;
  };
  msg?: string;
}

interface EvolinkTaskPayload {
  id?: string;
  model?: string;
  status?: "pending" | "processing" | "completed" | "failed" | string;
  progress?: number;
  results?: string[];
  usage?: {
    estimated_cost?: number;
    credits_used?: number;
    image_count?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

const EVOLINK_API_BASE = "https://api.evolink.ai";
const EVOLINK_FILE_API_BASE = "https://files-api.evolink.ai";
const DEFAULT_EVOLINK_IMAGE_MODEL = "wan2.5-image-to-image";
const DEFAULT_WAN_IMAGE_SIZE = "1280x1280";

export async function generateEvolinkMakeupImage(
  options: EvolinkImageOptions,
): Promise<EvolinkImageResponse> {
  if (!options.apiKey) {
    throw new EvolinkImageError("EVOLINK_UNAVAILABLE", "Evolink 配置不完整");
  }

  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 75_000;
  const fetcher = options.fetcher ?? fetch;
  const uploaded = await uploadSourceImage(options, fetcher, timeoutMs);
  const task = await createImageTask(
    options,
    uploaded.fileUrl,
    fetcher,
    timeoutMs,
    startedAt,
  );
  const completed = await waitForTask(
    options.apiKey,
    task.id,
    fetcher,
    timeoutMs,
    options.pollIntervalMs ?? 2_500,
    startedAt,
  );
  const resultUrl = completed.results?.[0];
  if (!resultUrl) {
    throw new EvolinkImageError(
      "EVOLINK_INVALID_RESPONSE",
      "Evolink 未返回生成结果链接",
    );
  }

  const image = await downloadResultImage(
    resultUrl,
    fetcher,
    timeoutMs,
    startedAt,
  );
  return {
    image,
    taskId: task.id,
    model:
      completed.model ??
      task.model ??
      options.model ??
      DEFAULT_EVOLINK_IMAGE_MODEL,
    durationMs: Date.now() - startedAt,
    estimatedCostMicros: estimatedCostMicros(
      completed.usage?.estimated_cost ?? task.usage?.estimated_cost,
    ),
    creditsUsed: completed.usage?.credits_used ?? task.usage?.credits_used,
  };
}

async function uploadSourceImage(
  options: EvolinkImageOptions,
  fetcher: typeof fetch,
  timeoutMs: number,
): Promise<{ fileUrl: string }> {
  const form = new FormData();
  const extension = extensionForMimeType(options.photo.mimeType);
  form.append(
    "file",
    new Blob([options.photo.data], { type: options.photo.mimeType }),
    `selfie.${extension}`,
  );
  form.append("upload_path", "aibeautystylist");

  const response = await fetchWithTimeout(
    fetcher,
    `${EVOLINK_FILE_API_BASE}/api/v1/files/upload/stream`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${options.apiKey}` },
      body: form,
    },
    timeoutMs,
  );
  const payload = (await response
    .json()
    .catch(() => null)) as EvolinkUploadPayload | null;
  if (!response.ok || !payload?.success || !payload.data?.file_url) {
    throw new EvolinkImageError(
      "EVOLINK_UNAVAILABLE",
      payload?.msg ?? `Evolink 文件上传失败：HTTP ${response.status}`,
    );
  }

  return { fileUrl: payload.data.file_url };
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/heic") return "heic";
  if (mimeType === "image/heif") return "heif";
  return "jpg";
}

async function createImageTask(
  options: EvolinkImageOptions,
  sourceImageUrl: string,
  fetcher: typeof fetch,
  timeoutMs: number,
  startedAt: number,
): Promise<Required<Pick<EvolinkTaskPayload, "id">> & EvolinkTaskPayload> {
  const model = options.model ?? DEFAULT_EVOLINK_IMAGE_MODEL;
  const response = await fetchWithTimeout(
    fetcher,
    `${EVOLINK_API_BASE}/v1/images/generations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(imageTaskBody(model, options, sourceImageUrl)),
    },
    remainingTimeout(timeoutMs, startedAt),
  );
  const payload = (await response
    .json()
    .catch(() => null)) as EvolinkTaskPayload | null;
  if (!response.ok || !payload?.id) {
    throw new EvolinkImageError(
      "EVOLINK_UNAVAILABLE",
      payload?.error?.message ??
        `Evolink 图像任务创建失败：HTTP ${response.status}`,
    );
  }

  return { ...payload, id: payload.id };
}

function imageTaskBody(
  model: string,
  options: EvolinkImageOptions,
  sourceImageUrl: string,
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model,
    prompt: options.prompt,
    image_urls: [sourceImageUrl],
    size: options.size ?? defaultSizeForModel(model),
    n: 1,
  };
  if (!isWanImageModel(model)) body.quality = options.quality ?? "low";
  return body;
}

async function waitForTask(
  apiKey: string,
  taskId: string,
  fetcher: typeof fetch,
  timeoutMs: number,
  pollIntervalMs: number,
  startedAt: number,
): Promise<EvolinkTaskPayload> {
  while (Date.now() - startedAt < timeoutMs) {
    const response = await fetchWithTimeout(
      fetcher,
      `${EVOLINK_API_BASE}/v1/tasks/${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      },
      Math.min(30_000, remainingTimeout(timeoutMs, startedAt)),
    );
    const payload = (await response
      .json()
      .catch(() => null)) as EvolinkTaskPayload | null;
    if (!response.ok || !payload?.status) {
      throw new EvolinkImageError(
        "EVOLINK_INVALID_RESPONSE",
        payload?.error?.message ??
          `Evolink 任务查询失败：HTTP ${response.status}`,
      );
    }
    if (payload.status === "completed") return payload;
    if (payload.status === "failed") {
      throw new EvolinkImageError(
        "EVOLINK_TASK_FAILED",
        payload.error?.message ?? payload.error?.code ?? "Evolink 图像任务失败",
      );
    }

    await sleep(
      Math.min(pollIntervalMs, remainingTimeout(timeoutMs, startedAt)),
    );
  }

  throw new EvolinkImageError("EVOLINK_TIMEOUT", "Evolink 图像任务超时");
}

async function downloadResultImage(
  resultUrl: string,
  fetcher: typeof fetch,
  timeoutMs: number,
  startedAt: number,
): Promise<EvolinkImageResponse["image"]> {
  const response = await fetchWithTimeout(
    fetcher,
    resultUrl,
    {},
    Math.min(30_000, remainingTimeout(timeoutMs, startedAt)),
  );
  if (!response.ok) {
    throw new EvolinkImageError(
      "EVOLINK_RESULT_DOWNLOAD_FAILED",
      `Evolink 结果图下载失败：HTTP ${response.status}`,
    );
  }

  return {
    data: await response.arrayBuffer(),
    contentType:
      response.headers.get("content-type") ?? inferContentType(resultUrl),
    sourceUrl: resultUrl,
  };
}

async function fetchWithTimeout(
  fetcher: typeof fetch,
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  if (timeoutMs <= 0) {
    throw new EvolinkImageError("EVOLINK_TIMEOUT", "Evolink 图像任务超时");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetcher(input, { ...init, signal: controller.signal });
  } catch (error) {
    throw new EvolinkImageError(
      error instanceof DOMException && error.name === "AbortError"
        ? "EVOLINK_TIMEOUT"
        : "EVOLINK_UNAVAILABLE",
      error instanceof Error ? error.message : "Evolink 请求失败",
    );
  } finally {
    clearTimeout(timeout);
  }
}

function remainingTimeout(timeoutMs: number, startedAt: number): number {
  return timeoutMs - (Date.now() - startedAt);
}

function estimatedCostMicros(value?: number): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value * 1_000_000)
    : undefined;
}

function defaultSizeForModel(model: string): string {
  return isWanImageModel(model) ? DEFAULT_WAN_IMAGE_SIZE : "2:3";
}

function isWanImageModel(model: string): boolean {
  return model.startsWith("wan2.5-");
}

function inferContentType(url: string): string {
  if (/\.webp(?:\?|$)/i.test(url)) return "image/webp";
  if (/\.jpe?g(?:\?|$)/i.test(url)) return "image/jpeg";
  return "image/png";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}
