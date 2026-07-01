import type { LookCatalogItem } from "../data/lookCatalog";
import type {
  AudienceContext,
  ResolvedLook,
} from "../data/makeup/audienceTypes";
import { getVariantById } from "../data/makeup/marketVariants";
import { getRecipeById } from "../data/makeup/recipes";
import { recordAiCall } from "./aiCallLogs";
import { saveDiagnosisRecord } from "./diagnosisRecords";
import { quotaPeriodForEffectivePlan } from "./entitlements";
import { EvolinkImageError, generateEvolinkMakeupImage } from "./evolinkImage";
import {
  DiagnosisProviderError,
  generateGeminiDiagnosis,
} from "./geminiDiagnosis";
import { GeminiImageError, generateGeminiMakeupImage } from "./geminiImage";
import {
  analyzeMakeupReference,
  evaluateMakeupTransfer,
  GeminiMakeupTransferError,
} from "./geminiMakeupTransfer";
import {
  isAcceptableMakeupTransferFallback,
  MAKEUP_REFERENCE_SPEC_VERSION,
  makeupReferenceSpecPrompt,
  makeupTransferCandidateScore,
  makeupTransferCorrectionPrompt,
  passesMakeupTransferQuality,
  type MakeupReferenceSpec,
  type MakeupTransferQuality,
} from "./makeupTransfer";
import { createProxyFetcher } from "./proxyFetch";
import { saveRejectedTryOnCandidate } from "./rejectedTryOnCandidates";
import { localizedTryOnDisclaimer } from "./tryonDisclaimers";
import {
  createReferenceFallbackJob,
  getTryOnJobPurpose,
  getStoredJobById,
  isRunningJobStatus,
  saveStoredJob,
  transitionStoredJob,
  updateStoredJob,
  type StoredTryOnJob,
  type TryOnJobPurpose,
} from "./jobs";
import {
  getQuotaSnapshot,
  refundQuota,
  reserveQuota,
  type QuotaPeriodInput,
  type QuotaSnapshot,
} from "./quota";
import type { RuntimeBindings } from "./runtime";
import { getEffectivePlan } from "./subscriptions";
import { getMonthlyQuota, planHasFeature } from "./plans";
import { getOwnedUpload, type StoredUploadRecord } from "./uploadRecords";
import {
  getOwnedPrivateLookTemplate,
  updatePrivateLookTemplateMakeupSpec,
  type PrivateLookTemplate,
} from "./privateLookTemplates";

export interface CreateTryOnJobOptions {
  userId: string;
  uploadId: string;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  /** 区域化上下文（Phase 1 新增，可选） */
  audienceContext?: AudienceContext;
  purpose?: TryOnJobPurpose;
  privateTemplate?: PrivateLookTemplate;
}

interface ProcessingAudienceContext {
  locale?: string;
}

export interface ProcessTryOnJobOptions {
  userId: string;
  jobId: string;
  look: LookCatalogItem | ResolvedLook;
  bindings: RuntimeBindings;
  audienceContext?: ProcessingAudienceContext;
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
  | "FEATURE_UNAVAILABLE"
  | "PRIVATE_TEMPLATE_NOT_FOUND"
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
    purpose = "tryon",
    privateTemplate,
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
  if (privateTemplate && privateTemplate.userId !== userId) {
    throw new TryOnJobServiceError(
      "PRIVATE_TEMPLATE_NOT_FOUND",
      "没有找到该私有参考妆容",
      false,
      404,
    );
  }
  if (
    privateTemplate &&
    !planHasFeature(plan.planCode, "privateReferenceTryOn")
  ) {
    throw new TryOnJobServiceError(
      "FEATURE_UNAVAILABLE",
      "上传参考妆容是 Premium 专属功能",
      false,
      403,
    );
  }
  const monthlyQuota = getMonthlyQuota(plan.planCode);
  const quotaPeriod = quotaPeriodForEffectivePlan(plan);

  if (provider === "gemini") {
    return createGeminiQueuedJob({
      userId,
      upload,
      look,
      idempotencyKey,
      retryOfJobId,
      bindings,
      monthlyQuota,
      quotaPeriod,
      audienceContext,
      purpose,
      privateTemplate,
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
    quotaPeriod,
    audienceContext,
    purpose,
    privateTemplate,
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
  quotaPeriod?: QuotaPeriodInput;
  audienceContext?: AudienceContext;
  purpose: TryOnJobPurpose;
  privateTemplate?: PrivateLookTemplate;
}): Promise<CreateTryOnJobResult> {
  const job = createReferenceFallbackJob(options.look);
  const reservation = await reserveQuota(
    options.userId,
    job.id,
    options.idempotencyKey,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
    options.quotaPeriod,
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
    purpose: options.purpose,
    ...lookSnapshot(options.look),
    locale: options.audienceContext?.locale,
    marketProfile: options.audienceContext?.marketProfile,
    lookSource: options.privateTemplate ? "private-template" : "catalog",
    privateTemplateId: options.privateTemplate?.id,
  };

  try {
    await saveStoredJob(storedJob, options.bindings.DB);
  } catch {
    await refundQuota(
      options.userId,
      job.id,
      options.bindings.DB,
      new Date(),
      options.monthlyQuota,
      options.quotaPeriod,
    );
    throw new TryOnJobServiceError(
      "AI_UNAVAILABLE",
      "任务创建失败，额度已自动返还",
      true,
    );
  }

  return { job: storedJob, quota: reservation.snapshot };
}

async function createGeminiQueuedJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  quotaPeriod?: QuotaPeriodInput;
  audienceContext?: AudienceContext;
  purpose: TryOnJobPurpose;
  privateTemplate?: PrivateLookTemplate;
}): Promise<CreateTryOnJobResult> {
  if (!options.upload.r2Key || !options.bindings.USER_UPLOADS) {
    throw new TryOnJobServiceError(
      "UPLOAD_STORAGE_REQUIRED",
      "AI 生成需要先安全保存原始自拍，请启用 R2 上传后重试",
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
    purpose: options.purpose,
    lookSlug: options.look.slug,
    lookTitle: options.look.title,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...lookSnapshot(options.look),
    locale: options.audienceContext?.locale,
    marketProfile: options.audienceContext?.marketProfile,
    lookSource: options.privateTemplate ? "private-template" : "catalog",
    privateTemplateId: options.privateTemplate?.id,
  };
  const reservation = await reserveQuota(
    options.userId,
    job.id,
    options.idempotencyKey,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
    options.quotaPeriod,
  );
  if (!reservation.reserved) {
    throw quotaError(reservation.duplicate);
  }

  try {
    await saveStoredJob(job, options.bindings.DB);
  } catch {
    await refundQuota(
      options.userId,
      job.id,
      options.bindings.DB,
      new Date(),
      options.monthlyQuota,
      options.quotaPeriod,
    );
    throw new TryOnJobServiceError(
      "AI_UNAVAILABLE",
      "任务创建失败，额度已自动返还",
      true,
    );
  }

  return { job, quota: reservation.snapshot };
}

export async function processTryOnJob(
  options: ProcessTryOnJobOptions,
): Promise<CreateTryOnJobResult | undefined> {
  const provider = options.bindings.TRYON_PROVIDER ?? "mock";
  const existingJob = await getStoredJobById(
    options.userId,
    options.jobId,
    options.bindings.DB,
  );
  if (!existingJob) return undefined;

  if (provider !== "gemini" || !isRunningJobStatus(existingJob.status)) {
    return {
      job: existingJob,
      quota: await quotaSnapshotFor(options.userId, options.bindings),
    };
  }

  const plan = await getEffectivePlan(options.userId, options.bindings.DB);
  const monthlyQuota = getMonthlyQuota(plan.planCode);
  const quotaPeriod = quotaPeriodForEffectivePlan(plan);
  const upload = await getOwnedUpload(
    options.userId,
    existingJob.uploadId,
    options.bindings.DB,
  );
  if (!upload || upload.deletedAt) {
    return failRunningJob(existingJob, {
      userId: options.userId,
      errorCode: "UPLOAD_NOT_FOUND",
      bindings: options.bindings,
      monthlyQuota,
      quotaPeriod,
    });
  }
  if (!upload.r2Key || !options.bindings.USER_UPLOADS) {
    return failRunningJob(existingJob, {
      userId: options.userId,
      errorCode: "UPLOAD_STORAGE_REQUIRED",
      bindings: options.bindings,
      monthlyQuota,
      quotaPeriod,
    });
  }
  const privateTemplate =
    existingJob.lookSource === "private-template" &&
    existingJob.privateTemplateId
      ? await getOwnedPrivateLookTemplate(
          options.userId,
          existingJob.privateTemplateId,
          options.bindings.DB,
        )
      : undefined;
  if (
    existingJob.lookSource === "private-template" &&
    (!privateTemplate || !privateTemplate.r2Key)
  ) {
    return failRunningJob(existingJob, {
      userId: options.userId,
      errorCode: "PRIVATE_TEMPLATE_NOT_FOUND",
      bindings: options.bindings,
      monthlyQuota,
      quotaPeriod,
    });
  }

  const runOptions = {
    userId: options.userId,
    upload,
    look: options.look,
    job: existingJob,
    bindings: options.bindings,
    monthlyQuota,
    quotaPeriod,
    audienceContext: {
      locale: options.audienceContext?.locale ?? existingJob.locale,
    },
    privateTemplate,
  };

  return getTryOnJobPurpose(existingJob) === "diagnosis"
    ? runGeminiDiagnosisJob(runOptions)
    : runGeminiImageTryOnJob(runOptions);
}

async function runGeminiImageTryOnJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  job: StoredTryOnJob;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  quotaPeriod?: QuotaPeriodInput;
  audienceContext?: ProcessingAudienceContext;
  privateTemplate?: PrivateLookTemplate;
}): Promise<CreateTryOnJobResult> {
  let currentJob = options.job;
  if (!options.upload.r2Key || !options.bindings.USER_UPLOADS) {
    return failRunningJob(currentJob, {
      userId: options.userId,
      errorCode: "UPLOAD_STORAGE_REQUIRED",
      bindings: options.bindings,
      monthlyQuota: options.monthlyQuota,
      quotaPeriod: options.quotaPeriod,
    });
  }

  try {
    const imageJob = await transitionIfRunning(
      currentJob,
      "image_running",
      options.bindings.DB,
    );
    if (!imageJob) return unchangedJobResult(currentJob, options);
    currentJob = imageJob;

    const object = await options.bindings.USER_UPLOADS.get(
      options.upload.r2Key,
    );
    if (!object) throw new Error("UPLOAD_OBJECT_NOT_FOUND");

    const photoData = await r2BodyToArrayBuffer(object.body);
    let referenceData: ArrayBuffer | undefined;
    let referenceMimeType: string | undefined;
    if (options.privateTemplate) {
      const referenceObject = await options.bindings.USER_UPLOADS.get(
        options.privateTemplate.r2Key,
      );
      if (!referenceObject)
        throw new Error("PRIVATE_TEMPLATE_OBJECT_NOT_FOUND");
      referenceData = await r2BodyToArrayBuffer(referenceObject.body);
      referenceMimeType =
        referenceObject.httpMetadata?.contentType ??
        options.privateTemplate.contentType;
    }
    const completed = await completeImageStage({
      job: currentJob,
      userId: options.userId,
      look: options.look,
      photoData,
      photoMimeType: options.upload.contentType,
      referenceData,
      referenceMimeType,
      privateTemplate: options.privateTemplate,
      bindings: options.bindings,
    });

    const imageStillRunning = await getRunningJob(
      currentJob,
      options.bindings.DB,
    );
    if (!imageStillRunning) {
      return unchangedJobResult(currentJob, options);
    }
    await updateStoredJob(completed, options.bindings.DB);

    return {
      job: completed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
        options.quotaPeriod,
      ),
    };
  } catch (error) {
    const errorCode = providerErrorCode(error);
    const latestRunningJob = await getRunningJob(
      currentJob,
      options.bindings.DB,
    );
    if (!latestRunningJob) {
      return unchangedJobResult(currentJob, options);
    }
    currentJob = latestRunningJob;

    await recordAiCall(
      {
        userId: options.userId,
        jobId: currentJob.id,
        provider:
          options.bindings.IMAGE_PROVIDER === "evolink" ? "evolink" : "gemini",
        operation: "image_generation",
        model:
          options.bindings.IMAGE_PROVIDER === "evolink"
            ? (options.bindings.EVOLINK_IMAGE_MODEL ?? "wan2.5-image-to-image")
            : options.job.lookSource === "private-template"
              ? (options.bindings.GEMINI_PRIVATE_REFERENCE_IMAGE_MODEL ??
                options.bindings.GEMINI_IMAGE_MODEL ??
                "gemini-2.5-flash-image")
              : (options.bindings.GEMINI_IMAGE_MODEL ??
                "gemini-2.5-flash-image"),
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
      options.quotaPeriod,
    );
    return {
      job: failed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
        options.quotaPeriod,
      ),
    };
  }
}

async function runGeminiDiagnosisJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  job: StoredTryOnJob;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  quotaPeriod?: QuotaPeriodInput;
  audienceContext?: ProcessingAudienceContext;
}): Promise<CreateTryOnJobResult> {
  let currentJob = options.job;
  if (!options.upload.r2Key || !options.bindings.USER_UPLOADS) {
    return failRunningJob(currentJob, {
      userId: options.userId,
      errorCode: "UPLOAD_STORAGE_REQUIRED",
      bindings: options.bindings,
      monthlyQuota: options.monthlyQuota,
      quotaPeriod: options.quotaPeriod,
    });
  }

  try {
    const diagnosisJob = await transitionIfRunning(
      currentJob,
      "diagnosis_running",
      options.bindings.DB,
    );
    if (!diagnosisJob) return unchangedJobResult(currentJob, options);
    currentJob = diagnosisJob;

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
      locale: options.audienceContext?.locale ?? currentJob.locale,
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

    const diagnosisStillRunning = await getRunningJob(
      currentJob,
      options.bindings.DB,
    );
    if (!diagnosisStillRunning) {
      return unchangedJobResult(currentJob, options);
    }
    currentJob = diagnosisStillRunning;

    await saveDiagnosisRecord(
      {
        id: crypto.randomUUID(),
        jobId: currentJob.id,
        result: diagnosis.result,
        createdAt: new Date().toISOString(),
      },
      options.bindings.DB,
    );

    const completed = await transitionIfRunning(
      currentJob,
      "succeeded",
      options.bindings.DB,
    );
    if (!completed) return unchangedJobResult(currentJob, options);

    return {
      job: completed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
        options.quotaPeriod,
      ),
    };
  } catch (error) {
    const errorCode = providerErrorCode(error);
    const latestRunningJob = await getRunningJob(
      currentJob,
      options.bindings.DB,
    );
    if (!latestRunningJob) {
      return unchangedJobResult(currentJob, options);
    }
    currentJob = latestRunningJob;

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
      options.quotaPeriod,
    );
    return {
      job: failed,
      quota: await getQuotaSnapshot(
        options.userId,
        options.bindings.DB,
        new Date(),
        options.monthlyQuota,
        options.quotaPeriod,
      ),
    };
  }
}

interface ProcessingContext {
  userId: string;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  quotaPeriod?: QuotaPeriodInput;
}

async function transitionIfRunning(
  job: StoredTryOnJob,
  status: StoredTryOnJob["status"],
  DB?: RuntimeBindings["DB"],
): Promise<StoredTryOnJob | undefined> {
  const latest = await getRunningJob(job, DB);
  return latest ? transitionStoredJob(latest, status, DB) : undefined;
}

async function getRunningJob(
  job: StoredTryOnJob,
  DB?: RuntimeBindings["DB"],
): Promise<StoredTryOnJob | undefined> {
  const latest = await getStoredJobById(job.userId, job.id, DB);
  return latest && isRunningJobStatus(latest.status) ? latest : undefined;
}

async function failRunningJob(
  job: StoredTryOnJob,
  options: ProcessingContext & { errorCode: string },
): Promise<CreateTryOnJobResult> {
  const latest = await getRunningJob(job, options.bindings.DB);
  if (!latest) return unchangedJobResult(job, options);

  const failed = await transitionStoredJob(
    latest,
    "failed",
    options.bindings.DB,
    { errorCode: options.errorCode },
  );
  await refundQuota(
    options.userId,
    failed.id,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
    options.quotaPeriod,
  );
  return {
    job: failed,
    quota: await getQuotaSnapshot(
      options.userId,
      options.bindings.DB,
      new Date(),
      options.monthlyQuota,
      options.quotaPeriod,
    ),
  };
}

async function unchangedJobResult(
  job: StoredTryOnJob,
  options: ProcessingContext,
): Promise<CreateTryOnJobResult> {
  const latest =
    (await getStoredJobById(job.userId, job.id, options.bindings.DB)) ?? job;
  return {
    job: latest,
    quota: await getQuotaSnapshot(
      options.userId,
      options.bindings.DB,
      new Date(),
      options.monthlyQuota,
      options.quotaPeriod,
    ),
  };
}

async function quotaSnapshotFor(
  userId: string,
  bindings: RuntimeBindings,
): Promise<QuotaSnapshot> {
  const plan = await getEffectivePlan(userId, bindings.DB);
  return getQuotaSnapshot(
    userId,
    bindings.DB,
    new Date(),
    getMonthlyQuota(plan.planCode),
    quotaPeriodForEffectivePlan(plan),
  );
}

async function completeImageStage(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  referenceData?: ArrayBuffer;
  referenceMimeType?: string;
  privateTemplate?: PrivateLookTemplate;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }

  const provider =
    options.job.lookSource === "private-template"
      ? "gemini"
      : (options.bindings.IMAGE_PROVIDER ?? "gemini");
  if (provider === "evolink") {
    return completeImageStageWithEvolink(options);
  }
  return completeImageStageWithGemini(options);
}

async function completeImageStageWithGemini(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  referenceData?: ArrayBuffer;
  referenceMimeType?: string;
  privateTemplate?: PrivateLookTemplate;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  const apiKey = options.bindings.GEMINI_API_KEY;
  if (!apiKey || !options.bindings.USER_UPLOADS) {
    if (options.job.lookSource === "private-template") {
      throw new GeminiImageError(
        "GEMINI_IMAGE_UNAVAILABLE",
        "私有参考妆容生成服务暂不可用",
      );
    }
    return completeWithReferenceFallback(
      options.job,
      options.look,
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }

  if (options.job.lookSource === "private-template") {
    return completePrivateImageStageWithGemini(options);
  }

  const model = options.bindings.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
  try {
    const generated = await generateGeminiMakeupImage({
      apiKey,
      model,
      prompt: makeupImagePrompt(options.look),
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
      disclaimer: localizedTryOnDisclaimer("generated", options.job.locale),
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
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }
}

async function completePrivateImageStageWithGemini(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  referenceData?: ArrayBuffer;
  referenceMimeType?: string;
  privateTemplate?: PrivateLookTemplate;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  const apiKey = options.bindings.GEMINI_API_KEY;
  const bucket = options.bindings.USER_UPLOADS;
  if (
    !apiKey ||
    !bucket ||
    !options.referenceData ||
    !options.referenceMimeType ||
    !options.privateTemplate
  ) {
    throw new GeminiMakeupTransferError(
      "MAKEUP_REFERENCE_ANALYSIS_UNAVAILABLE",
      "私有参考妆容生成输入不完整",
    );
  }

  const fetcher = options.bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
    : undefined;
  const analysisModel =
    options.bindings.GEMINI_MODEL ??
    options.bindings.GEMINI_MODEL_FREE ??
    "gemini-2.5-flash";
  const imageModel =
    options.bindings.GEMINI_PRIVATE_REFERENCE_IMAGE_MODEL ??
    options.bindings.GEMINI_IMAGE_MODEL ??
    "gemini-2.5-flash-image";
  const referenceSha256 =
    options.privateTemplate.referenceSha256 ??
    (await sha256Hex(options.referenceData));
  const spec = await resolvePrivateMakeupSpec({
    userId: options.userId,
    jobId: options.job.id,
    template: options.privateTemplate,
    referenceData: options.referenceData,
    referenceMimeType: options.referenceMimeType,
    referenceSha256,
    apiKey,
    model: analysisModel,
    bindings: options.bindings,
    fetcher,
  });

  const candidates: Array<{
    generated: Awaited<ReturnType<typeof generateGeminiMakeupImage>>;
    quality: MakeupTransferQuality;
    attempt: number;
  }> = [];
  let correction: MakeupTransferQuality | undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const previousCandidate =
      candidates[candidates.length - 1]?.generated.image;
    const prompt = privateMakeupImagePrompt(
      options.look.title,
      spec,
      correction,
      Boolean(previousCandidate),
    );
    let generated: Awaited<ReturnType<typeof generateGeminiMakeupImage>>;
    try {
      generated = await generateGeminiMakeupImage({
        apiKey,
        model: imageModel,
        prompt,
        labeledImages: [
          {
            label:
              "MAKEUP REFERENCE IMAGE — use only its cosmetic colors, placement, finish, texture, and intensity:",
            data: options.referenceData,
            mimeType: options.referenceMimeType,
          },
          {
            label:
              "USER SELFIE — the only identity, facial structure, hair, clothing, pose, framing, background, and scene source:",
            data: options.photoData,
            mimeType: options.photoMimeType,
          },
          ...(previousCandidate
            ? [
                {
                  label:
                    "CURRENT TRY-ON CANDIDATE — edit this image directly, retaining successful makeup and correcting only the listed fidelity issues:",
                  data: previousCandidate.data,
                  mimeType: previousCandidate.contentType,
                },
              ]
            : []),
        ],
        timeoutMs: parseTimeout(options.bindings.GEMINI_IMAGE_TIMEOUT_MS),
        fetcher,
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
          metadata: {
            privateTemplateId: options.privateTemplate.id,
            referenceSha256,
            makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
            attempt,
            editsPreviousCandidate: Boolean(previousCandidate),
          },
        },
        options.bindings.DB,
      );
    } catch (error) {
      await recordAiCall(
        {
          userId: options.userId,
          jobId: options.job.id,
          provider: "gemini",
          operation: "image_generation",
          model: imageModel,
          status: "failed",
          errorCode: geminiImageErrorCode(error),
          metadata: {
            privateTemplateId: options.privateTemplate.id,
            referenceSha256,
            makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
            attempt,
          },
        },
        options.bindings.DB,
      ).catch(() => undefined);
      throw error;
    }

    const quality = await reviewPrivateMakeupTransfer({
      userId: options.userId,
      jobId: options.job.id,
      templateId: options.privateTemplate.id,
      referenceSha256,
      attempt,
      apiKey,
      model: analysisModel,
      spec,
      referenceData: options.referenceData,
      referenceMimeType: options.referenceMimeType,
      photoData: options.photoData,
      photoMimeType: options.photoMimeType,
      resultData: generated.image.data,
      resultMimeType: generated.image.contentType,
      bindings: options.bindings,
      fetcher,
    });
    candidates.push({ generated, quality, attempt });
    if (passesMakeupTransferQuality(quality)) {
      return storePrivateMakeupResult({
        job: options.job,
        userId: options.userId,
        templateId: options.privateTemplate.id,
        generated,
        quality,
        selectedAttempt: attempt,
        generationAttempts: attempt,
        spec,
        bindings: options.bindings,
      });
    }
    const rejectedCandidate = await saveRejectedTryOnCandidate({
      userId: options.userId,
      jobId: options.job.id,
      attempt,
      imageData: generated.image.data,
      contentType: generated.image.contentType,
      quality,
      DB: options.bindings.DB,
      bucket: options.bindings.USER_UPLOADS,
    }).catch((error) => {
      console.warn(
        JSON.stringify({
          event: "rejected_tryon_candidate_store_failed",
          jobId: options.job.id,
          attempt,
          error: error instanceof Error ? error.message : "STORE_FAILED",
        }),
      );
      return undefined;
    });
    console.warn(
      JSON.stringify({
        event: "makeup_transfer_rejected",
        jobId: options.job.id,
        privateTemplateId: options.privateTemplate.id,
        attempt,
        overallScore: quality.overallScore,
        makeupSimilarityScore: quality.makeupSimilarityScore,
        identityPreservationScore: quality.identityPreservationScore,
        candidateR2Key: rejectedCandidate?.r2Key,
      }),
    );
    correction = quality;
  }

  const bestCandidate = candidates.reduce<
    (typeof candidates)[number] | undefined
  >(
    (best, candidate) =>
      !best ||
      makeupTransferCandidateScore(candidate.quality) >
        makeupTransferCandidateScore(best.quality)
        ? candidate
        : best,
    undefined,
  );
  if (
    bestCandidate &&
    isAcceptableMakeupTransferFallback(bestCandidate.quality)
  ) {
    console.log(
      JSON.stringify({
        event: "makeup_transfer_best_candidate_accepted",
        jobId: options.job.id,
        privateTemplateId: options.privateTemplate.id,
        selectedAttempt: bestCandidate.attempt,
        generationAttempts: candidates.length,
        overallScore: bestCandidate.quality.overallScore,
        makeupSimilarityScore: bestCandidate.quality.makeupSimilarityScore,
        identityPreservationScore:
          bestCandidate.quality.identityPreservationScore,
      }),
    );
    return storePrivateMakeupResult({
      job: options.job,
      userId: options.userId,
      templateId: options.privateTemplate.id,
      generated: bestCandidate.generated,
      quality: bestCandidate.quality,
      selectedAttempt: bestCandidate.attempt,
      generationAttempts: candidates.length,
      spec,
      bindings: options.bindings,
    });
  }

  throw new GeminiMakeupTransferError(
    "MAKEUP_TRANSFER_QUALITY_FAILED",
    [
      "生成结果未通过参考妆容一致性检查",
      ...(correction?.criticalMissing ?? []),
      ...(correction?.conflicts ?? []),
    ].join("；"),
  );
}

async function resolvePrivateMakeupSpec(options: {
  userId: string;
  jobId: string;
  template: PrivateLookTemplate;
  referenceData: ArrayBuffer;
  referenceMimeType: string;
  referenceSha256: string;
  apiKey: string;
  model: string;
  bindings: RuntimeBindings;
  fetcher?: typeof fetch;
}): Promise<MakeupReferenceSpec> {
  if (
    options.template.makeupSpecStatus === "ready" &&
    options.template.makeupSpecVersion === MAKEUP_REFERENCE_SPEC_VERSION &&
    options.template.makeupSpec
  ) {
    return options.template.makeupSpec;
  }

  try {
    const analyzed = await analyzeMakeupReference({
      apiKey: options.apiKey,
      model: options.model,
      reference: {
        data: options.referenceData,
        mimeType: options.referenceMimeType,
      },
      timeoutMs: parseTimeout(options.bindings.GEMINI_TIMEOUT_MS),
      fetcher: options.fetcher,
    });
    await updatePrivateLookTemplateMakeupSpec(
      options.userId,
      options.template.id,
      {
        status: "ready",
        referenceSha256: options.referenceSha256,
        spec: analyzed.result,
      },
      options.bindings.DB,
    );
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.jobId,
        provider: "gemini",
        operation: "makeup_reference_analysis",
        model: analyzed.model,
        status: "succeeded",
        durationMs: analyzed.durationMs,
        promptTokens: analyzed.usage.promptTokens,
        outputTokens: analyzed.usage.outputTokens,
        totalTokens: analyzed.usage.totalTokens,
        metadata: {
          privateTemplateId: options.template.id,
          referenceSha256: options.referenceSha256,
          makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
          focalAreas: analyzed.result.focalAreas,
        },
      },
      options.bindings.DB,
    );
    return analyzed.result;
  } catch (error) {
    await updatePrivateLookTemplateMakeupSpec(
      options.userId,
      options.template.id,
      {
        status: "failed",
        referenceSha256: options.referenceSha256,
      },
      options.bindings.DB,
    ).catch(() => undefined);
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.jobId,
        provider: "gemini",
        operation: "makeup_reference_analysis",
        model: options.model,
        status: "failed",
        errorCode: makeupTransferErrorCode(error),
        metadata: {
          privateTemplateId: options.template.id,
          referenceSha256: options.referenceSha256,
          makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
        },
      },
      options.bindings.DB,
    ).catch(() => undefined);
    throw error;
  }
}

async function reviewPrivateMakeupTransfer(options: {
  userId: string;
  jobId: string;
  templateId: string;
  referenceSha256: string;
  attempt: number;
  apiKey: string;
  model: string;
  spec: MakeupReferenceSpec;
  referenceData: ArrayBuffer;
  referenceMimeType: string;
  photoData: ArrayBuffer;
  photoMimeType: string;
  resultData: ArrayBuffer;
  resultMimeType: string;
  bindings: RuntimeBindings;
  fetcher?: typeof fetch;
}): Promise<MakeupTransferQuality> {
  try {
    const reviewed = await evaluateMakeupTransfer({
      apiKey: options.apiKey,
      model: options.model,
      reference: {
        data: options.referenceData,
        mimeType: options.referenceMimeType,
      },
      selfie: {
        data: options.photoData,
        mimeType: options.photoMimeType,
      },
      result: {
        data: options.resultData,
        mimeType: options.resultMimeType,
      },
      spec: options.spec,
      timeoutMs: parseTimeout(options.bindings.GEMINI_TIMEOUT_MS),
      fetcher: options.fetcher,
    });
    const passed = passesMakeupTransferQuality(reviewed.result);
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.jobId,
        provider: "gemini",
        operation: "makeup_transfer_quality",
        model: reviewed.model,
        status: "succeeded",
        durationMs: reviewed.durationMs,
        promptTokens: reviewed.usage.promptTokens,
        outputTokens: reviewed.usage.outputTokens,
        totalTokens: reviewed.usage.totalTokens,
        metadata: {
          privateTemplateId: options.templateId,
          referenceSha256: options.referenceSha256,
          makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
          attempt: options.attempt,
          passed,
          overallScore: reviewed.result.overallScore,
          makeupSimilarityScore: reviewed.result.makeupSimilarityScore,
          identityPreservationScore: reviewed.result.identityPreservationScore,
          criticalMissing: reviewed.result.criticalMissing,
          conflicts: reviewed.result.conflicts,
        },
      },
      options.bindings.DB,
    );
    return reviewed.result;
  } catch (error) {
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.jobId,
        provider: "gemini",
        operation: "makeup_transfer_quality",
        model: options.model,
        status: "failed",
        errorCode: makeupTransferErrorCode(error),
        metadata: {
          privateTemplateId: options.templateId,
          referenceSha256: options.referenceSha256,
          makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
          attempt: options.attempt,
        },
      },
      options.bindings.DB,
    ).catch(() => undefined);
    throw error;
  }
}

async function storePrivateMakeupResult(options: {
  job: StoredTryOnJob;
  userId: string;
  templateId: string;
  generated: Awaited<ReturnType<typeof generateGeminiMakeupImage>>;
  quality: MakeupTransferQuality;
  selectedAttempt: number;
  generationAttempts: number;
  spec: MakeupReferenceSpec;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.USER_UPLOADS) {
    throw new GeminiMakeupTransferError(
      "MAKEUP_TRANSFER_QUALITY_UNAVAILABLE",
      "私有结果存储不可用",
    );
  }
  const resultR2Key = resultObjectKey(
    options.userId,
    options.job.id,
    options.generated.image.contentType,
  );
  await options.bindings.USER_UPLOADS.put(
    resultR2Key,
    options.generated.image.data,
    {
      httpMetadata: { contentType: options.generated.image.contentType },
      customMetadata: {
        userId: options.userId,
        jobId: options.job.id,
        provider: "gemini",
        model: options.generated.model,
        privateTemplateId: options.templateId,
        makeupSpecVersion: options.spec.schemaVersion,
        makeupQualityScore: String(options.quality.overallScore),
        selectedGenerationAttempt: String(options.selectedAttempt),
        generationAttempts: String(options.generationAttempts),
      },
    },
  );
  const completedAt = new Date().toISOString();
  return {
    ...options.job,
    status: "succeeded",
    resultImage: `/api/tryon-jobs/${options.job.id}/result`,
    resultKind: "ai-generated",
    resultR2Key,
    makeupSpecVersion: options.spec.schemaVersion,
    makeupQualityScore: options.quality.overallScore,
    makeupGenerationAttempts: options.generationAttempts,
    disclaimer: localizedTryOnDisclaimer("generated", options.job.locale),
    updatedAt: completedAt,
    completedAt,
  };
}

async function completeImageStageWithEvolink(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.EVOLINK_API_KEY || !options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }

  const model = options.bindings.EVOLINK_IMAGE_MODEL ?? "wan2.5-image-to-image";
  try {
    const generated = await generateEvolinkMakeupImage({
      apiKey: options.bindings.EVOLINK_API_KEY,
      model,
      prompt: makeupImagePrompt(options.look),
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
      disclaimer: localizedTryOnDisclaimer("generated", options.job.locale),
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
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
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
  if (error instanceof GeminiImageError) return error.code;
  if (error instanceof GeminiMakeupTransferError) return error.code;
  if (
    error instanceof Error &&
    error.message === "PRIVATE_TEMPLATE_OBJECT_NOT_FOUND"
  ) {
    return "PRIVATE_TEMPLATE_NOT_FOUND";
  }
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

function makeupTransferErrorCode(error: unknown): string {
  if (error instanceof GeminiMakeupTransferError) return error.code;
  return error instanceof Error ? error.name : "MAKEUP_TRANSFER_UNAVAILABLE";
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

function makeupImagePrompt(look: LookCatalogItem | ResolvedLook): string {
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
    "Silently use visible cues from the input selfie to adapt the makeup placement and palette: apparent skin depth, undertone cues from lighting, face proportions, eye shape, brow shape, natural lip color, and contrast level.",
    "Do not output, draw, or embed any diagnosis, labels, face-shape terms, skin-tone terms, color-season terms, captions, or analysis text in the image.",
    "Do not infer sensitive attributes. Use only visible makeup-relevant appearance cues needed for a natural try-on.",
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
  ]
    .filter(Boolean)
    .join(" ");
}

function privateMakeupImagePrompt(
  title: string,
  spec: MakeupReferenceSpec,
  correction?: MakeupTransferQuality,
  editsPreviousCandidate = false,
): string {
  return [
    editsPreviousCandidate
      ? "Edit the CURRENT TRY-ON CANDIDATE directly. Retain its successful makeup and correct the listed fidelity issues."
      : "Edit the USER SELFIE by applying the cosmetic design from the MAKEUP REFERENCE.",
    editsPreviousCandidate
      ? "Do not restart from or revert to the USER SELFIE; it is provided only to verify identity, structure, scene, and skin texture."
      : "The output must visibly change the selfie's makeup; an unchanged selfie or generic peach/nude look is a failure.",
    makeupReferenceSpecPrompt(spec),
    correction ? makeupTransferCorrectionPrompt(correction) : "",
    "Match the focal makeup's color, placement, finish, reflectivity, texture, and intensity, adapted naturally to the selfie's proportions.",
    "Keep the USER SELFIE as the only source of identity, facial structure, hair, clothing, pose, framing, lighting, and background.",
    "Preserve natural skin texture and keep the edit photorealistic. Do not reshape, smooth, retouch, add text, or add people.",
    `Reference name: ${title}. Output only the edited selfie image.`,
  ]
    .filter(Boolean)
    .join(" ");
}

async function sha256Hex(value: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", value);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
