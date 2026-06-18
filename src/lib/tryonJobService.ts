import type { LookCatalogItem } from "../data/lookCatalog";
import type {
  AudienceContext,
  ResolvedLook,
} from "../data/makeup/audienceTypes";
import { getVariantById } from "../data/makeup/marketVariants";
import { getRecipeById } from "../data/makeup/recipes";
import { recordAiCall } from "./aiCallLogs";
import type { DiagnosisResult } from "./diagnosis";
import { saveDiagnosisRecord } from "./diagnosisRecords";
import { EvolinkImageError, generateEvolinkMakeupImage } from "./evolinkImage";
import {
  DiagnosisProviderError,
  generateGeminiDiagnosis,
} from "./geminiDiagnosis";
import { GeminiImageError, generateGeminiMakeupImage } from "./geminiImage";
import { createProxyFetcher } from "./proxyFetch";
import {
  createReferenceFallbackJob,
  saveStoredJob,
  transitionStoredJob,
  updateStoredJob,
  type StoredTryOnJob,
} from "./jobs";
import {
  getQuotaSnapshot,
  refundQuota,
  reserveQuota,
  type QuotaSnapshot,
} from "./quota";
import type { RuntimeBindings } from "./runtime";
import { getEffectivePlan } from "./subscriptions";
import { getMonthlyQuota } from "./plans";
import { getOwnedUpload, type StoredUploadRecord } from "./uploadRecords";

export interface CreateTryOnJobOptions {
  userId: string;
  uploadId: string;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  /** 区域化上下文（Phase 1 新增，可选） */
  audienceContext?: AudienceContext;
}

export interface CreateTryOnJobResult {
  job: StoredTryOnJob;
  quota: QuotaSnapshot;
}

export type TryOnJobServiceErrorCode =
  | "AI_UNAVAILABLE"
  | "TRYON_PROVIDER_UNSUPPORTED"
  | "UPLOAD_NOT_FOUND"
  | "UPLOAD_STORAGE_REQUIRED"
  | "JOB_ALREADY_EXISTS"
  | "QUOTA_EXHAUSTED";

export class TryOnJobServiceError extends Error {
  constructor(
    public readonly code: TryOnJobServiceErrorCode,
    message: string,
    public readonly retryable: boolean,
    public readonly status = 503,
  ) {
    super(message);
  }
}

export async function createTryOnJob(
  options: CreateTryOnJobOptions,
): Promise<CreateTryOnJobResult> {
  const {
    userId,
    uploadId,
    look,
    idempotencyKey,
    retryOfJobId,
    bindings,
    audienceContext,
  } = options;
  const provider = bindings.TRYON_PROVIDER ?? "mock";

  if (provider !== "mock" && provider !== "gemini") {
    throw new TryOnJobServiceError(
      "TRYON_PROVIDER_UNSUPPORTED",
      "当前试妆任务 Provider 暂不支持",
      true,
    );
  }

  const upload = await getOwnedUpload(userId, uploadId, bindings.DB);
  if (!upload || upload.deletedAt) {
    throw new TryOnJobServiceError(
      "UPLOAD_NOT_FOUND",
      "没有找到可用于生成的自拍，请重新上传",
      false,
      404,
    );
  }

  const plan = await getEffectivePlan(userId, bindings.DB);
  const monthlyQuota = getMonthlyQuota(plan.planCode);

  if (provider === "gemini") {
    return createGeminiDiagnosisFallbackJob({
      userId,
      upload,
      look,
      idempotencyKey,
      retryOfJobId,
      bindings,
      monthlyQuota,
      audienceContext,
    });
  }

  return createMockReferenceJob({
    userId,
    upload,
    look,
    idempotencyKey,
    retryOfJobId,
    bindings,
    monthlyQuota,
    audienceContext,
  });
}

async function createMockReferenceJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  audienceContext?: AudienceContext;
}): Promise<CreateTryOnJobResult> {
  const job = createReferenceFallbackJob(options.look);
  const reservation = await reserveQuota(
    options.userId,
    job.id,
    options.idempotencyKey,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
  );
  if (!reservation.reserved) {
    throw quotaError(reservation.duplicate);
  }

  const storedJob: StoredTryOnJob = {
    ...job,
    userId: options.userId,
    uploadId: options.upload.id,
    idempotencyKey: options.idempotencyKey,
    retryOfJobId: options.retryOfJobId,
    ...lookSnapshot(options.look),
    locale: options.audienceContext?.locale,
    marketProfile: options.audienceContext?.marketProfile,
  };

  try {
    await saveStoredJob(storedJob, options.bindings.DB);
  } catch {
    await refundQuota(options.userId, job.id, options.bindings.DB);
    throw new TryOnJobServiceError(
      "AI_UNAVAILABLE",
      "任务创建失败，额度已自动返还",
      true,
    );
  }

  return { job: storedJob, quota: reservation.snapshot };
}

async function createGeminiDiagnosisFallbackJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  audienceContext?: AudienceContext;
}): Promise<CreateTryOnJobResult> {
  if (!options.upload.r2Key || !options.bindings.USER_UPLOADS) {
    throw new TryOnJobServiceError(
      "UPLOAD_STORAGE_REQUIRED",
      "AI 妆容诊断需要先安全保存原始自拍，请启用 R2 上传后重试",
      true,
    );
  }

  const timestamp = new Date().toISOString();
  const job: StoredTryOnJob = {
    id: crypto.randomUUID(),
    userId: options.userId,
    uploadId: options.upload.id,
    idempotencyKey: options.idempotencyKey,
    retryOfJobId: options.retryOfJobId,
    status: "created",
    lookSlug: options.look.slug,
    lookTitle: options.look.title,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...lookSnapshot(options.look),
    locale: options.audienceContext?.locale,
    marketProfile: options.audienceContext?.marketProfile,
  };
  const reservation = await reserveQuota(
    options.userId,
    job.id,
    options.idempotencyKey,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
  );
  if (!reservation.reserved) {
    throw quotaError(reservation.duplicate);
  }

  let currentJob = job;
  try {
    await saveStoredJob(currentJob, options.bindings.DB);
  } catch {
    await refundQuota(options.userId, job.id, options.bindings.DB);
    throw new TryOnJobServiceError(
      "AI_UNAVAILABLE",
      "任务创建失败，额度已自动返还",
      true,
    );
  }

  try {
    currentJob = await transitionStoredJob(
      currentJob,
      "diagnosis_running",
      options.bindings.DB,
    );

    const object = await options.bindings.USER_UPLOADS.get(
      options.upload.r2Key,
    );
    if (!object) throw new Error("UPLOAD_OBJECT_NOT_FOUND");

    const photoData = await r2BodyToArrayBuffer(object.body);
    const model =
      options.bindings.GEMINI_MODEL_FREE ??
      options.bindings.GEMINI_MODEL ??
      "gemini-2.5-flash";
    const proxyFetcher = options.bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
      : undefined;
    const diagnosis = await generateGeminiDiagnosis({
      apiKey: options.bindings.GEMINI_API_KEY ?? "",
      model,
      photo: {
        data: photoData,
        mimeType: options.upload.contentType,
      },
      preferredLookSlug: options.look.slug,
      locale: options.audienceContext?.locale,
      timeoutMs: parseTimeout(options.bindings.GEMINI_TIMEOUT_MS),
      fetcher: proxyFetcher,
    });

    await recordAiCall(
      {
        userId: options.userId,
        jobId: currentJob.id,
        provider: "gemini",
        operation: "diagnosis",
        model: diagnosis.model,
        status: "succeeded",
        durationMs: diagnosis.durationMs,
        promptTokens: diagnosis.usage.promptTokens,
        outputTokens: diagnosis.usage.outputTokens,
        totalTokens: diagnosis.usage.totalTokens,
      },
      options.bindings.DB,
    );
    await saveDiagnosisRecord(
      {
        id: crypto.randomUUID(),
        jobId: currentJob.id,
        result: diagnosis.result,
        createdAt: new Date().toISOString(),
      },
      options.bindings.DB,
    );

    currentJob = await transitionStoredJob(
      currentJob,
      "image_running",
      options.bindings.DB,
    );

    const completed = await completeImageStage({
      job: currentJob,
      userId: options.userId,
      look: options.look,
      diagnosis: diagnosis.result,
      photoData,
      photoMimeType: options.upload.contentType,
      bindings: options.bindings,
    });
    await updateStoredJob(completed, options.bindings.DB);

    return {
      job: completed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
      ),
    };
  } catch (error) {
    const errorCode = providerErrorCode(error);
    await recordAiCall(
      {
        userId: options.userId,
        jobId: currentJob.id,
        provider: "gemini",
        operation: "diagnosis",
        model:
          options.bindings.GEMINI_MODEL_FREE ??
          options.bindings.GEMINI_MODEL ??
          "gemini-2.5-flash",
        status: "failed",
        durationMs: Date.now() - new Date(currentJob.updatedAt).getTime(),
        errorCode,
      },
      options.bindings.DB,
    ).catch(() => undefined);
    const failed = await transitionStoredJob(
      currentJob,
      "failed",
      options.bindings.DB,
      { errorCode },
    );
    await refundQuota(
      options.userId,
      failed.id,
      options.bindings.DB,
      new Date(),
      options.monthlyQuota,
    );
    return {
      job: failed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
      ),
    };
  }
}

async function completeImageStage(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  diagnosis: DiagnosisResult;
  photoData: ArrayBuffer;
  photoMimeType: string;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      "已完成 AI 妆容诊断；当前妆效图先展示现有妆容参考图，结果存储尚未配置。",
    );
  }

  const provider = options.bindings.IMAGE_PROVIDER ?? "gemini";
  if (provider === "evolink") {
    return completeImageStageWithEvolink(options);
  }
  return completeImageStageWithGemini(options);
}

async function completeImageStageWithGemini(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  diagnosis: DiagnosisResult;
  photoData: ArrayBuffer;
  photoMimeType: string;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  const apiKey = options.bindings.GEMINI_API_KEY;
  if (!apiKey || !options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      "已完成 AI 妆容诊断；当前妆效图先展示现有妆容参考图，Gemini 图像服务尚未配置。",
    );
  }

  const model = options.bindings.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
  try {
    const generated = await generateGeminiMakeupImage({
      apiKey,
      model,
      prompt: makeupImagePrompt(options.look, options.diagnosis),
      photo: {
        data: options.photoData,
        mimeType: options.photoMimeType,
      },
      timeoutMs: parseTimeout(options.bindings.GEMINI_IMAGE_TIMEOUT_MS),
      fetcher: options.bindings.OUTBOUND_PROXY_URL
        ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
        : undefined,
    });
    const resultR2Key = resultObjectKey(
      options.userId,
      options.job.id,
      generated.image.contentType,
    );
    await options.bindings.USER_UPLOADS.put(resultR2Key, generated.image.data, {
      httpMetadata: { contentType: generated.image.contentType },
      customMetadata: {
        userId: options.userId,
        jobId: options.job.id,
        provider: "gemini",
        model: generated.model,
      },
    });
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.job.id,
        provider: "gemini",
        operation: "image_generation",
        model: generated.model,
        status: "succeeded",
        durationMs: generated.durationMs,
        promptTokens: generated.usage.promptTokens,
        outputTokens: generated.usage.outputTokens,
        totalTokens: generated.usage.totalTokens,
      },
      options.bindings.DB,
    );

    const completedAt = new Date().toISOString();
    return {
      ...options.job,
      status: "succeeded",
      resultImage: `/api/tryon-jobs/${options.job.id}/result`,
      resultKind: "ai-generated",
      resultR2Key,
      disclaimer:
        "Gemini 已基于你的自拍生成妆效预览。结果仅供美妆参考，实际效果因光线、设备和个人条件而异。",
      updatedAt: completedAt,
      completedAt,
    };
  } catch (error) {
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.job.id,
        provider: "gemini",
        operation: "image_generation",
        model,
        status: "failed",
        errorCode: geminiImageErrorCode(error),
      },
      options.bindings.DB,
    ).catch(() => undefined);
    return completeWithReferenceFallback(
      options.job,
      options.look,
      "已完成 AI 妆容诊断；Gemini 妆效图生成失败，当前先展示现有妆容参考图，实际效果因个人条件而异。",
    );
  }
}

async function completeImageStageWithEvolink(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  diagnosis: DiagnosisResult;
  photoData: ArrayBuffer;
  photoMimeType: string;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.EVOLINK_API_KEY || !options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      "已完成 AI 妆容诊断；当前妆效图先展示现有妆容参考图，Evolink 生成服务尚未配置。",
    );
  }

  const model = options.bindings.EVOLINK_IMAGE_MODEL ?? "wan2.5-image-to-image";
  try {
    const generated = await generateEvolinkMakeupImage({
      apiKey: options.bindings.EVOLINK_API_KEY,
      model,
      prompt: makeupImagePrompt(options.look, options.diagnosis),
      photo: {
        data: options.photoData,
        mimeType: options.photoMimeType,
      },
      size: options.bindings.EVOLINK_IMAGE_SIZE ?? "1280x1280",
      quality: evolinkQuality(options.bindings.EVOLINK_IMAGE_QUALITY),
      timeoutMs: parseTimeout(
        options.bindings.EVOLINK_IMAGE_TIMEOUT_MS ??
          options.bindings.GEMINI_IMAGE_TIMEOUT_MS,
      ),
      fetcher: options.bindings.OUTBOUND_PROXY_URL
        ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
        : undefined,
    });
    const resultR2Key = resultObjectKey(
      options.userId,
      options.job.id,
      generated.image.contentType,
    );
    await options.bindings.USER_UPLOADS.put(resultR2Key, generated.image.data, {
      httpMetadata: { contentType: generated.image.contentType },
      customMetadata: {
        userId: options.userId,
        jobId: options.job.id,
        provider: "evolink",
        sourceUrl: generated.image.sourceUrl,
        taskId: generated.taskId,
      },
    });
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.job.id,
        provider: "evolink",
        operation: "image_generation",
        model: generated.model,
        status: "succeeded",
        durationMs: generated.durationMs,
        estimatedCostMicros:
          generated.estimatedCostMicros ??
          creditsToMicros(generated.creditsUsed),
      },
      options.bindings.DB,
    );

    const completedAt = new Date().toISOString();
    return {
      ...options.job,
      status: "succeeded",
      resultImage: `/api/tryon-jobs/${options.job.id}/result`,
      resultKind: "ai-generated",
      resultR2Key,
      disclaimer:
        "Evolink 已基于你的自拍生成妆效预览。结果仅供美妆参考，实际效果因光线、设备和个人条件而异。",
      updatedAt: completedAt,
      completedAt,
    };
  } catch (error) {
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.job.id,
        provider: "evolink",
        operation: "image_generation",
        model,
        status: "failed",
        errorCode: evolinkErrorCode(error),
      },
      options.bindings.DB,
    ).catch(() => undefined);
    return completeWithReferenceFallback(
      options.job,
      options.look,
      "已完成 AI 妆容诊断；Evolink 妆效图生成失败，当前先展示现有妆容参考图，实际效果因个人条件而异。",
    );
  }
}

function completeWithReferenceFallback(
  job: StoredTryOnJob,
  look: LookCatalogItem | ResolvedLook,
  disclaimer: string,
): StoredTryOnJob {
  const completedAt = new Date().toISOString();
  return {
    ...job,
    status: "succeeded",
    resultImage: look.image,
    resultKind: "reference-fallback",
    disclaimer,
    updatedAt: completedAt,
    completedAt,
  };
}

function quotaError(duplicate: boolean): TryOnJobServiceError {
  return new TryOnJobServiceError(
    duplicate ? "JOB_ALREADY_EXISTS" : "QUOTA_EXHAUSTED",
    duplicate ? "已有相同任务正在处理" : "本月生成额度已用完，可分享或升级",
    false,
    409,
  );
}

function providerErrorCode(error: unknown): string {
  if (error instanceof DiagnosisProviderError) return error.code;
  return error instanceof Error && error.message === "UPLOAD_OBJECT_NOT_FOUND"
    ? "UPLOAD_NOT_FOUND"
    : "AI_UNAVAILABLE";
}

function evolinkErrorCode(error: unknown): string {
  if (error instanceof EvolinkImageError) return error.code;
  return "EVOLINK_UNAVAILABLE";
}

function geminiImageErrorCode(error: unknown): string {
  if (error instanceof GeminiImageError) return error.code;
  return "GEMINI_IMAGE_UNAVAILABLE";
}

// Evolink wan2.5 任务返回 credits_used（积分计费）而非 estimated_cost（美元）。
// 沿用 estimated_cost_micros 列做可审计成本记录：1 credit = 1_000_000 micro-credits。
function creditsToMicros(credits?: number): number | undefined {
  return typeof credits === "number" && Number.isFinite(credits)
    ? Math.round(credits * 1_000_000)
    : undefined;
}

function parseTimeout(value?: string): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

async function r2BodyToArrayBuffer(
  body: ReadableStream | ArrayBuffer,
): Promise<ArrayBuffer> {
  if (body instanceof ArrayBuffer) return body;
  return new Response(body).arrayBuffer();
}

function resultObjectKey(
  userId: string,
  jobId: string,
  contentType: string,
): string {
  return `results/${userId}/${jobId}/result.${extensionForContentType(contentType)}`;
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "png";
}

function evolinkQuality(value?: string): "low" | "medium" | "high" {
  return value === "medium" || value === "high" ? value : "low";
}

function makeupImagePrompt(
  look: LookCatalogItem | ResolvedLook,
  diagnosis: DiagnosisResult,
): string {
  const recipe = isResolvedLook(look)
    ? getRecipeById(look.recipeId)
    : undefined;
  const variant = isResolvedLook(look)
    ? getVariantById(look.marketVariantId)
    : undefined;
  return [
    "Use the input selfie as the only person reference and create a realistic makeup try-on preview.",
    "Preserve the person's facial structure, expression, hairstyle, clothing, background, and lighting.",
    "Critically preserve the original skin texture: keep visible pores, fine lines, natural skin grain, moles, freckles and real surface detail from the input photo.",
    "Do NOT beautify, smooth, retouch, airbrush, blur, or apply any skin-smoothing / face-slimming / 'beauty filter' effect. The skin must look like a real unfiltered photo, only with makeup added.",
    "Only change makeup: base finish, blush placement, eye makeup, brows, lip color, and subtle highlight/contour. Keep the base finish thin and natural so underlying skin texture stays visible.",
    "Do not change age, identity, face shape, body shape, hair color, clothing, background, or add extra people.",
    "No text, no watermark, no product packaging, no medical or cosmetic surgery effect.",
    `Selected makeup look: ${look.title}.`,
    `Look intent: ${look.intent}`,
    `Finish keywords: ${look.finish.join(", ")}.`,
    recipe
      ? `Recipe palette: ${recipe.palette.join(", ")}. Coverage: ${recipe.coverage}. Contrast: ${recipe.contrast}.`
      : "",
    recipe
      ? `Placement instructions: ${Object.entries(recipe.placement)
          .filter(([, instructions]) => instructions.length > 0)
          .map(([area, instructions]) => `${area}: ${instructions.join(", ")}`)
          .join("; ")}.`
      : "",
    variant?.promptAdditions.length
      ? `Market styling context: ${variant.promptAdditions.join(", ")}.`
      : "",
    `Beauty diagnosis context: skin depth ${diagnosis.skinTone.depth}, undertone ${diagnosis.skinTone.undertone}, face shape ${diagnosis.faceShape.primary}, eye shape ${diagnosis.eyeShape.primary}, color season ${diagnosis.colorSeason.season}.`,
    `Preferred palette direction: ${diagnosis.makeupDirections
      .flatMap((direction) => direction.palette)
      .slice(0, 6)
      .join(", ")}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function isResolvedLook(
  look: LookCatalogItem | ResolvedLook,
): look is ResolvedLook {
  return "marketVariantId" in look && "recipeId" in look;
}

function lookSnapshot(
  look: LookCatalogItem | ResolvedLook,
): Pick<
  StoredTryOnJob,
  "lookRecipeId" | "lookRecipeVersion" | "marketVariantId" | "referenceAssetId"
> {
  return isResolvedLook(look)
    ? {
        lookRecipeId: look.recipeId,
        lookRecipeVersion: look.recipeVersion,
        marketVariantId: look.marketVariantId,
        referenceAssetId: look.assetId,
      }
    : {
        lookRecipeId: look.slug,
        lookRecipeVersion: "1.0.0",
      };
}
