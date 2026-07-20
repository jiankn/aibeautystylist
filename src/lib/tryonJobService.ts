import type { LookCatalogItem } from "../data/lookCatalog";
import type {
  AudienceContext,
  ResolvedLook,
} from "../data/makeup/audienceTypes";
import { getVariantById } from "../data/makeup/marketVariants";
import { getPinterestCampaignLook } from "../data/makeup/pinterestCampaignLooks";
import { getRecipeById } from "../data/makeup/recipes";
import { recordAiCall } from "./aiCallLogs";
import {
  catalogTryOnCandidateScore,
  catalogTryOnCorrectionPrompt,
  isAcceptableCatalogTryOnFallback,
  passesCatalogTryOnQuality,
  type CatalogTryOnQuality,
} from "./catalogTryOnQuality";
import { saveDiagnosisRecord } from "./diagnosisRecords";
import { quotaPeriodForEffectivePlan } from "./entitlements";
import {
  EvolinkImageError,
  generateEvolinkMakeupImage,
  type EvolinkImageOptions,
} from "./evolinkImage";
import {
  analyzeEvolinkMakeupReference,
  evaluateEvolinkCatalogTryOnQuality,
  evaluateEvolinkMakeupTransfer,
  EvolinkVisionError,
  generateEvolinkDiagnosis,
} from "./evolinkVision";
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
  DIAGNOSIS_CREDIT_COST,
  PRIVATE_REFERENCE_TRYON_CREDIT_COST,
  STANDARD_TRYON_CREDIT_COST,
} from "./tryonCosts";
import {
  countQualityEligibleCatalogJobs,
  createReferenceFallbackJob,
  getTryOnJobPurpose,
  getStoredJobById,
  isRunningJobStatus,
  saveStoredJob,
  transitionStoredJob,
  updateStoredJob,
  type StoredTryOnJob,
  type TryOnJobPurpose,
  type TryOnQualityTier,
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
import { getMonthlyQuota, planHasFeature, type PlanCode } from "./plans";
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
  campaignLookId?: string;
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
  | "INVALID_CAMPAIGN_LOOK"
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
    campaignLookId,
  } = options;
  const provider = bindings.TRYON_PROVIDER ?? "mock";
  const campaignLook = campaignLookId
    ? getPinterestCampaignLook(campaignLookId, look.slug)
    : undefined;

  if (campaignLookId && !campaignLook) {
    throw new TryOnJobServiceError(
      "INVALID_CAMPAIGN_LOOK",
      "The selected campaign look does not match this makeup.",
      false,
      422,
    );
  }

  if (provider !== "mock" && !isRemoteTryOnProvider(provider)) {
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

  if (isRemoteTryOnProvider(provider)) {
    return createQueuedJob({
      userId,
      upload,
      look,
      idempotencyKey,
      retryOfJobId,
      bindings,
      monthlyQuota,
      planCode: plan.planCode,
      quotaPeriod,
      audienceContext,
      purpose,
      privateTemplate,
      campaignLookId: campaignLook?.id,
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
    campaignLookId: campaignLook?.id,
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
  campaignLookId?: string;
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
    creditCostForJob(options.purpose, Boolean(options.privateTemplate)),
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
    campaignLookId: options.campaignLookId,
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

async function createQueuedJob(options: {
  userId: string;
  upload: StoredUploadRecord;
  look: LookCatalogItem | ResolvedLook;
  idempotencyKey: string;
  retryOfJobId?: string;
  bindings: RuntimeBindings;
  monthlyQuota: number;
  planCode: PlanCode;
  quotaPeriod?: QuotaPeriodInput;
  audienceContext?: AudienceContext;
  purpose: TryOnJobPurpose;
  privateTemplate?: PrivateLookTemplate;
  campaignLookId?: string;
}): Promise<CreateTryOnJobResult> {
  if (!options.upload.r2Key || !options.bindings.USER_UPLOADS) {
    throw new TryOnJobServiceError(
      "UPLOAD_STORAGE_REQUIRED",
      "AI 生成需要先安全保存原始自拍，请启用 R2 上传后重试",
      true,
    );
  }

  const timestamp = new Date().toISOString();
  const qualityTier = await resolveNewTryOnQualityTier({
    userId: options.userId,
    planCode: options.planCode,
    purpose: options.purpose,
    privateTemplate: options.privateTemplate,
    DB: options.bindings.DB,
  });
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
    qualityTier,
    campaignLookId: options.campaignLookId,
  };
  const reservation = await reserveQuota(
    options.userId,
    job.id,
    options.idempotencyKey,
    options.bindings.DB,
    new Date(),
    options.monthlyQuota,
    options.quotaPeriod,
    creditCostForJob(options.purpose, Boolean(options.privateTemplate)),
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

async function resolveNewTryOnQualityTier(options: {
  userId: string;
  planCode: PlanCode;
  purpose: TryOnJobPurpose;
  privateTemplate?: PrivateLookTemplate;
  DB?: RuntimeBindings["DB"];
}): Promise<TryOnQualityTier | undefined> {
  if (options.purpose !== "tryon" || options.privateTemplate) return undefined;
  if (options.planCode === "premium") return "premium";
  if (options.planCode === "pro") return "pro";
  if (isPinterestGuestUser(options.userId)) return "acquisition";

  const committedSlots = await countQualityEligibleCatalogJobs(
    options.userId,
    options.DB,
  );
  return committedSlots < 3 ? "acquisition" : "standard";
}

async function resolveExistingTryOnQualityTier(options: {
  job: StoredTryOnJob;
  planCode: PlanCode;
  DB?: RuntimeBindings["DB"];
}): Promise<TryOnQualityTier | undefined> {
  if (
    getTryOnJobPurpose(options.job) !== "tryon" ||
    options.job.lookSource === "private-template"
  ) {
    return undefined;
  }
  if (options.job.qualityTier) return options.job.qualityTier;
  if (options.planCode === "premium") return "premium";
  if (options.planCode === "pro") return "pro";
  if (isPinterestGuestUser(options.job.userId)) return "acquisition";

  const committedSlots = await countQualityEligibleCatalogJobs(
    options.job.userId,
    options.DB,
  );
  return committedSlots <= 3 ? "acquisition" : "standard";
}

function isPinterestGuestUser(userId: string): boolean {
  return userId.startsWith("guest_pguest_");
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

  if (
    !isRemoteTryOnProvider(provider) ||
    !isRunningJobStatus(existingJob.status)
  ) {
    return {
      job: existingJob,
      quota: await quotaSnapshotFor(options.userId, options.bindings),
    };
  }

  const plan = await getEffectivePlan(options.userId, options.bindings.DB);
  const monthlyQuota = getMonthlyQuota(plan.planCode);
  const quotaPeriod = quotaPeriodForEffectivePlan(plan);
  const qualityTier = await resolveExistingTryOnQualityTier({
    job: existingJob,
    planCode: plan.planCode,
    DB: options.bindings.DB,
  });
  const jobForProcessing = qualityTier
    ? { ...existingJob, qualityTier }
    : existingJob;
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
    jobForProcessing.lookSource === "private-template" &&
    jobForProcessing.privateTemplateId
      ? await getOwnedPrivateLookTemplate(
          options.userId,
          jobForProcessing.privateTemplateId,
          options.bindings.DB,
        )
      : undefined;
  if (
    jobForProcessing.lookSource === "private-template" &&
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
    job: jobForProcessing,
    bindings: options.bindings,
    monthlyQuota,
    quotaPeriod,
    audienceContext: {
      locale: options.audienceContext?.locale ?? existingJob.locale,
    },
    privateTemplate,
  };

  return getTryOnJobPurpose(jobForProcessing) === "diagnosis"
    ? runDiagnosisJob(runOptions)
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

    if (!(error instanceof EvolinkVisionError)) {
      await recordAiCall(
        {
          userId: options.userId,
          jobId: currentJob.id,
          provider:
            (options.bindings.IMAGE_PROVIDER ??
              options.bindings.TRYON_PROVIDER) === "evolink"
              ? "evolink"
              : "gemini",
          operation: "image_generation",
          model:
            (options.bindings.IMAGE_PROVIDER ??
              options.bindings.TRYON_PROVIDER) === "evolink"
              ? options.job.lookSource === "private-template"
                ? (options.bindings.EVOLINK_PRIVATE_FALLBACK_IMAGE_MODEL ??
                  "gpt-image-2")
                : (catalogEvolinkModels(
                    options.job.qualityTier ?? "standard",
                    options.bindings,
                  ).at(-1) ?? "qwen-image-edit-plus")
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
    }
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

async function runDiagnosisJob(options: {
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
  const provider =
    options.bindings.TRYON_PROVIDER === "evolink" ? "evolink" : "gemini";
  const model =
    provider === "evolink"
      ? (options.bindings.EVOLINK_VISION_MODEL ?? "doubao-seed-2.0-lite")
      : (options.bindings.GEMINI_MODEL_FREE ??
        options.bindings.GEMINI_MODEL ??
        "gemini-2.5-flash");
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
    const proxyFetcher = options.bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
      : undefined;
    const diagnosis =
      provider === "evolink"
        ? await generateEvolinkDiagnosis({
            apiKey: options.bindings.EVOLINK_API_KEY ?? "",
            model,
            photo: {
              data: photoData,
              mimeType: options.upload.contentType,
            },
            preferredLookSlug: options.look.slug,
            locale: options.audienceContext?.locale ?? currentJob.locale,
            timeoutMs: parseTimeout(options.bindings.EVOLINK_VISION_TIMEOUT_MS),
            fetcher: proxyFetcher,
          })
        : await generateGeminiDiagnosis({
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
        provider,
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
        provider,
        operation: "diagnosis",
        model,
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
    options.bindings.IMAGE_PROVIDER ??
    options.bindings.TRYON_PROVIDER ??
    "gemini";
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
    return completePrivateImageStage({ ...options, provider: "gemini" });
  }

  const model = options.bindings.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
  try {
    const generated = await generateGeminiMakeupImage({
      apiKey,
      model,
      prompt: makeupImagePrompt(options.look, options.job.campaignLookId),
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

async function completePrivateImageStage(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  referenceData?: ArrayBuffer;
  referenceMimeType?: string;
  privateTemplate?: PrivateLookTemplate;
  bindings: RuntimeBindings;
  provider: "gemini" | "evolink";
}): Promise<StoredTryOnJob> {
  const apiKey =
    options.provider === "evolink"
      ? options.bindings.EVOLINK_API_KEY
      : options.bindings.GEMINI_API_KEY;
  const bucket = options.bindings.USER_UPLOADS;
  if (
    !apiKey ||
    !bucket ||
    !options.referenceData ||
    !options.referenceMimeType ||
    !options.privateTemplate
  ) {
    throw makeupTransferFailure(
      options.provider,
      "MAKEUP_REFERENCE_ANALYSIS_UNAVAILABLE",
      "私有参考妆容生成输入不完整",
    );
  }

  const fetcher = options.bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
    : undefined;
  const analysisModel =
    options.provider === "evolink"
      ? (options.bindings.EVOLINK_VISION_MODEL ?? "doubao-seed-2.0-lite")
      : (options.bindings.GEMINI_MODEL ??
        options.bindings.GEMINI_MODEL_FREE ??
        "gemini-2.5-flash");
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
    provider: options.provider,
    bindings: options.bindings,
    fetcher,
  });

  const candidates: Array<{
    generated:
      | Awaited<ReturnType<typeof generateGeminiMakeupImage>>
      | Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
    quality: MakeupTransferQuality;
    attempt: number;
  }> = [];
  let correction: MakeupTransferQuality | undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const imageModel =
      options.provider === "evolink"
        ? attempt === 1
          ? (options.bindings.EVOLINK_PRIVATE_IMAGE_MODEL ??
            "doubao-seedream-5.0-pro")
          : (options.bindings.EVOLINK_PRIVATE_FALLBACK_IMAGE_MODEL ??
            "gpt-image-2")
        : (options.bindings.GEMINI_PRIVATE_REFERENCE_IMAGE_MODEL ??
          options.bindings.GEMINI_IMAGE_MODEL ??
          "gemini-2.5-flash-image");
    const previousCandidate =
      candidates[candidates.length - 1]?.generated.image;
    const prompt = privateMakeupImagePrompt(
      options.look.title,
      spec,
      correction,
      Boolean(previousCandidate),
    );
    let generated:
      | Awaited<ReturnType<typeof generateGeminiMakeupImage>>
      | Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
    try {
      generated =
        options.provider === "evolink"
          ? await generateEvolinkMakeupImage({
              apiKey,
              model: imageModel,
              prompt,
              images: [
                {
                  data: options.referenceData,
                  mimeType: options.referenceMimeType,
                  filename: "makeup-reference.jpg",
                },
                {
                  data: options.photoData,
                  mimeType: options.photoMimeType,
                  filename: "user-selfie.jpg",
                },
                ...(previousCandidate
                  ? [
                      {
                        data: previousCandidate.data,
                        mimeType: previousCandidate.contentType,
                        filename: "current-candidate.jpg",
                      },
                    ]
                  : []),
              ],
              ...privateEvolinkImageOptions(imageModel),
              timeoutMs: parseTimeout(
                options.bindings.EVOLINK_IMAGE_TIMEOUT_MS,
              ),
              fetcher,
            })
          : await generateGeminiMakeupImage({
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
      const usage = "usage" in generated ? generated.usage : undefined;
      await recordAiCall(
        {
          userId: options.userId,
          jobId: options.job.id,
          provider: options.provider,
          operation: "image_generation",
          model: generated.model,
          status: "succeeded",
          durationMs: generated.durationMs,
          promptTokens: usage?.promptTokens,
          outputTokens: usage?.outputTokens,
          totalTokens: usage?.totalTokens,
          estimatedCostMicros:
            "estimatedCostMicros" in generated
              ? (generated.estimatedCostMicros ??
                creditsToMicros(generated.creditsUsed))
              : undefined,
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
          provider: options.provider,
          operation: "image_generation",
          model: imageModel,
          status: "failed",
          errorCode:
            options.provider === "evolink"
              ? evolinkErrorCode(error)
              : geminiImageErrorCode(error),
          metadata: {
            privateTemplateId: options.privateTemplate.id,
            referenceSha256,
            makeupSpecVersion: MAKEUP_REFERENCE_SPEC_VERSION,
            attempt,
          },
        },
        options.bindings.DB,
      ).catch(() => undefined);
      if (options.provider === "evolink" && attempt === 1) continue;
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
      provider: options.provider,
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
        provider: options.provider,
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
        baseCoverageContinuityScore: quality.baseCoverageContinuityScore,
        baseCoverageMissing: quality.baseCoverageMissing,
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
        generationAttempts: 2,
        overallScore: bestCandidate.quality.overallScore,
        makeupSimilarityScore: bestCandidate.quality.makeupSimilarityScore,
        identityPreservationScore:
          bestCandidate.quality.identityPreservationScore,
        baseCoverageContinuityScore:
          bestCandidate.quality.baseCoverageContinuityScore,
        baseCoverageMissing: bestCandidate.quality.baseCoverageMissing,
      }),
    );
    return storePrivateMakeupResult({
      job: options.job,
      userId: options.userId,
      templateId: options.privateTemplate.id,
      generated: bestCandidate.generated,
      quality: bestCandidate.quality,
      selectedAttempt: bestCandidate.attempt,
      generationAttempts: 2,
      spec,
      provider: options.provider,
      bindings: options.bindings,
    });
  }

  throw makeupTransferFailure(
    options.provider,
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
  provider: "gemini" | "evolink";
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
    const analyzed =
      options.provider === "evolink"
        ? await analyzeEvolinkMakeupReference({
            apiKey: options.apiKey,
            model: options.model,
            reference: {
              data: options.referenceData,
              mimeType: options.referenceMimeType,
            },
            timeoutMs: parseTimeout(options.bindings.EVOLINK_VISION_TIMEOUT_MS),
            fetcher: options.fetcher,
          })
        : await analyzeMakeupReference({
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
        provider: options.provider,
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
        provider: options.provider,
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
  provider: "gemini" | "evolink";
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
    const reviewed =
      options.provider === "evolink"
        ? await evaluateEvolinkMakeupTransfer({
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
            generated: {
              data: options.resultData,
              mimeType: options.resultMimeType,
            },
            spec: options.spec,
            timeoutMs: parseTimeout(options.bindings.EVOLINK_VISION_TIMEOUT_MS),
            fetcher: options.fetcher,
          })
        : await evaluateMakeupTransfer({
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
        provider: options.provider,
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
          baseCoverageContinuityScore:
            reviewed.result.baseCoverageContinuityScore,
          baseCoverageMissing: reviewed.result.baseCoverageMissing,
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
        provider: options.provider,
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
  generated:
    | Awaited<ReturnType<typeof generateGeminiMakeupImage>>
    | Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
  quality: MakeupTransferQuality;
  selectedAttempt: number;
  generationAttempts: number;
  spec: MakeupReferenceSpec;
  provider: "gemini" | "evolink";
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.USER_UPLOADS) {
    throw makeupTransferFailure(
      options.provider,
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
        provider: options.provider,
        model: options.generated.model,
        privateTemplateId: options.templateId,
        makeupSpecVersion: options.spec.schemaVersion,
        makeupQualityScore: String(options.quality.overallScore),
        baseCoverageContinuityScore: String(
          options.quality.baseCoverageContinuityScore,
        ),
        baseCoverageMissing: options.quality.baseCoverageMissing.join(","),
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
  referenceData?: ArrayBuffer;
  referenceMimeType?: string;
  privateTemplate?: PrivateLookTemplate;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (
    options.job.lookSource === "private-template" ||
    (options.job.qualityTier ?? "standard") === "standard"
  ) {
    return completeStandardImageStageWithEvolink(options);
  }
  return completeQualityGatedImageStageWithEvolink(options);
}

async function completeStandardImageStageWithEvolink(options: {
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
  if (options.job.lookSource === "private-template") {
    return completePrivateImageStage({ ...options, provider: "evolink" });
  }
  if (!options.bindings.EVOLINK_API_KEY || !options.bindings.USER_UPLOADS) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }

  const models = [
    options.bindings.EVOLINK_IMAGE_MODEL ?? "qwen-image-edit-plus",
    options.bindings.EVOLINK_IMAGE_FALLBACK_MODEL ?? "doubao-seedream-5.0-lite",
  ].filter((model, index, values) => values.indexOf(model) === index);
  const fetcher = options.bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
    : undefined;
  let generated:
    | Awaited<ReturnType<typeof generateEvolinkMakeupImage>>
    | undefined;
  for (const [index, model] of models.entries()) {
    try {
      generated = await generateEvolinkMakeupImage({
        apiKey: options.bindings.EVOLINK_API_KEY,
        model,
        prompt: makeupImagePrompt(options.look, options.job.campaignLookId),
        photo: {
          data: options.photoData,
          mimeType: options.photoMimeType,
        },
        ...standardEvolinkImageOptions(model, options.bindings),
        timeoutMs: parseTimeout(options.bindings.EVOLINK_IMAGE_TIMEOUT_MS),
        fetcher,
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
          metadata: { route: "standard", attempt: index + 1 },
        },
        options.bindings.DB,
      );
      break;
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
          metadata: { route: "standard", attempt: index + 1 },
        },
        options.bindings.DB,
      ).catch(() => undefined);
    }
  }
  if (!generated) {
    return completeWithReferenceFallback(
      options.job,
      options.look,
      localizedTryOnDisclaimer("referenceFallback", options.job.locale),
    );
  }

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
      model: generated.model,
      sourceUrl: generated.image.sourceUrl,
      taskId: generated.taskId,
    },
  });
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
}

async function completeQualityGatedImageStageWithEvolink(options: {
  job: StoredTryOnJob;
  userId: string;
  look: LookCatalogItem | ResolvedLook;
  photoData: ArrayBuffer;
  photoMimeType: string;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.EVOLINK_API_KEY || !options.bindings.USER_UPLOADS) {
    throw new EvolinkVisionError(
      "MAKEUP_TRANSFER_QUALITY_UNAVAILABLE",
      "高质量试妆服务暂时不可用",
    );
  }
  const qualityTier = options.job.qualityTier ?? "acquisition";
  const models = catalogEvolinkModels(qualityTier, options.bindings);
  const fetcher = options.bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(options.bindings.OUTBOUND_PROXY_URL)
    : undefined;
  const candidates: Array<{
    generated: Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
    quality: CatalogTryOnQuality;
    attempt: number;
  }> = [];
  let correction: CatalogTryOnQuality | undefined;
  let generatedAny = false;

  for (const [index, model] of models.entries()) {
    const attempt = index + 1;
    const previousCandidate =
      candidates[candidates.length - 1]?.generated.image;
    let generated: Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
    try {
      generated = await generateEvolinkMakeupImage({
        apiKey: options.bindings.EVOLINK_API_KEY,
        model,
        prompt: [
          makeupImagePrompt(options.look, options.job.campaignLookId),
          previousCandidate
            ? "Input image order: Image 1 is the ORIGINAL USER SELFIE; Image 2 is the CURRENT TRY-ON CANDIDATE. Edit the current candidate directly and do not restart the makeup from scratch."
            : "",
          correction ? catalogTryOnCorrectionPrompt(correction) : "",
        ]
          .filter(Boolean)
          .join(" "),
        ...(previousCandidate
          ? {
              images: [
                {
                  data: options.photoData,
                  mimeType: options.photoMimeType,
                  filename: "original-selfie.jpg",
                },
                {
                  data: previousCandidate.data,
                  mimeType: previousCandidate.contentType,
                  filename: "current-candidate.jpg",
                },
              ],
            }
          : {
              photo: {
                data: options.photoData,
                mimeType: options.photoMimeType,
              },
            }),
        ...qualityEvolinkImageOptions(model, qualityTier),
        timeoutMs: parseTimeout(options.bindings.EVOLINK_IMAGE_TIMEOUT_MS),
        fetcher,
      });
      generatedAny = true;
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
          metadata: {
            route: qualityTier,
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
          provider: "evolink",
          operation: "image_generation",
          model,
          status: "failed",
          errorCode: evolinkErrorCode(error),
          metadata: { route: qualityTier, attempt },
        },
        options.bindings.DB,
      ).catch(() => undefined);
      continue;
    }

    const quality = await reviewCatalogTryOnQuality({
      userId: options.userId,
      jobId: options.job.id,
      qualityTier,
      attempt,
      target: makeupQualityTarget(options.look, options.job.campaignLookId),
      photoData: options.photoData,
      photoMimeType: options.photoMimeType,
      resultData: generated.image.data,
      resultMimeType: generated.image.contentType,
      bindings: options.bindings,
      fetcher,
    });
    // The QA model is a guardrail, not a new single point of failure. If it is
    // unavailable, keep the high-quality generation and record degraded-open.
    if (!quality) {
      return storeCatalogEvolinkResult({
        ...options,
        generated,
        qualityTier,
        generationAttempts: attempt,
      });
    }
    candidates.push({ generated, quality, attempt });
    if (passesCatalogTryOnQuality(quality)) {
      return storeCatalogEvolinkResult({
        ...options,
        generated,
        quality,
        qualityTier,
        generationAttempts: attempt,
      });
    }

    correction = quality;
    console.warn(
      JSON.stringify({
        event: "catalog_tryon_quality_rejected",
        jobId: options.job.id,
        qualityTier,
        attempt,
        overallScore: quality.overallScore,
        makeupExecutionScore: quality.makeupExecutionScore,
        identityPreservationScore: quality.identityPreservationScore,
        scenePreservationScore: quality.scenePreservationScore,
        skinTexturePreservationScore: quality.skinTexturePreservationScore,
        criticalDefects: quality.criticalDefects,
      }),
    );
  }

  const bestCandidate = candidates.reduce<
    (typeof candidates)[number] | undefined
  >(
    (best, candidate) =>
      !best ||
      catalogTryOnCandidateScore(candidate.quality) >
        catalogTryOnCandidateScore(best.quality)
        ? candidate
        : best,
    undefined,
  );
  if (
    bestCandidate &&
    isAcceptableCatalogTryOnFallback(bestCandidate.quality)
  ) {
    return storeCatalogEvolinkResult({
      ...options,
      generated: bestCandidate.generated,
      quality: bestCandidate.quality,
      qualityTier,
      generationAttempts: models.length,
    });
  }

  throw new EvolinkVisionError(
    "MAKEUP_TRANSFER_QUALITY_FAILED",
    generatedAny
      ? "生成结果未通过身份、场景和皮肤纹理质量检查"
      : "高质量图像生成暂时不可用",
  );
}

async function reviewCatalogTryOnQuality(options: {
  userId: string;
  jobId: string;
  qualityTier: TryOnQualityTier;
  attempt: number;
  target: string;
  photoData: ArrayBuffer;
  photoMimeType: string;
  resultData: ArrayBuffer;
  resultMimeType: string;
  bindings: RuntimeBindings;
  fetcher?: typeof fetch;
}): Promise<CatalogTryOnQuality | undefined> {
  const model = options.bindings.EVOLINK_VISION_MODEL ?? "doubao-seed-2.0-lite";
  try {
    const reviewed = await evaluateEvolinkCatalogTryOnQuality({
      apiKey: options.bindings.EVOLINK_API_KEY ?? "",
      model,
      selfie: { data: options.photoData, mimeType: options.photoMimeType },
      generated: {
        data: options.resultData,
        mimeType: options.resultMimeType,
      },
      target: options.target,
      timeoutMs: parseTimeout(options.bindings.EVOLINK_VISION_TIMEOUT_MS),
      fetcher: options.fetcher,
    });
    const passed = passesCatalogTryOnQuality(reviewed.result);
    await recordAiCall(
      {
        userId: options.userId,
        jobId: options.jobId,
        provider: "evolink",
        operation: "makeup_transfer_quality",
        model: reviewed.model,
        status: "succeeded",
        durationMs: reviewed.durationMs,
        promptTokens: reviewed.usage.promptTokens,
        outputTokens: reviewed.usage.outputTokens,
        totalTokens: reviewed.usage.totalTokens,
        metadata: {
          route: options.qualityTier,
          attempt: options.attempt,
          passed,
          ...reviewed.result,
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
        provider: "evolink",
        operation: "makeup_transfer_quality",
        model,
        status: "failed",
        errorCode: makeupTransferErrorCode(error),
        metadata: {
          route: options.qualityTier,
          attempt: options.attempt,
          degradedOpen: true,
        },
      },
      options.bindings.DB,
    ).catch(() => undefined);
    return undefined;
  }
}

async function storeCatalogEvolinkResult(options: {
  job: StoredTryOnJob;
  userId: string;
  generated: Awaited<ReturnType<typeof generateEvolinkMakeupImage>>;
  quality?: CatalogTryOnQuality;
  qualityTier: TryOnQualityTier;
  generationAttempts: number;
  bindings: RuntimeBindings;
}): Promise<StoredTryOnJob> {
  if (!options.bindings.USER_UPLOADS) {
    throw new EvolinkVisionError(
      "MAKEUP_TRANSFER_QUALITY_UNAVAILABLE",
      "结果存储不可用",
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
        provider: "evolink",
        model: options.generated.model,
        sourceUrl: options.generated.image.sourceUrl,
        taskId: options.generated.taskId,
        qualityTier: options.qualityTier,
        generationAttempts: String(options.generationAttempts),
        ...(options.quality
          ? {
              qualityScore: String(options.quality.overallScore),
              identityPreservationScore: String(
                options.quality.identityPreservationScore,
              ),
              scenePreservationScore: String(
                options.quality.scenePreservationScore,
              ),
              skinTexturePreservationScore: String(
                options.quality.skinTexturePreservationScore,
              ),
            }
          : {}),
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
    makeupQualityScore: options.quality?.overallScore,
    makeupGenerationAttempts: options.generationAttempts,
    disclaimer: localizedTryOnDisclaimer("generated", options.job.locale),
    updatedAt: completedAt,
    completedAt,
  };
}

function catalogEvolinkModels(
  qualityTier: TryOnQualityTier,
  bindings: RuntimeBindings,
): string[] {
  const models =
    qualityTier === "standard"
      ? [
          bindings.EVOLINK_IMAGE_MODEL ?? "qwen-image-edit-plus",
          bindings.EVOLINK_IMAGE_FALLBACK_MODEL ?? "doubao-seedream-5.0-lite",
        ]
      : [
          bindings.EVOLINK_ACQUISITION_IMAGE_MODEL ??
            bindings.EVOLINK_PRIVATE_IMAGE_MODEL ??
            "doubao-seedream-5.0-pro",
          bindings.EVOLINK_ACQUISITION_FALLBACK_IMAGE_MODEL ??
            bindings.EVOLINK_PRIVATE_FALLBACK_IMAGE_MODEL ??
            "gpt-image-2",
        ];
  return models.filter(
    (model, index, values) => values.indexOf(model) === index,
  );
}

function qualityEvolinkImageOptions(
  model: string,
  qualityTier: TryOnQualityTier,
): Pick<EvolinkImageOptions, "size" | "quality" | "resolution"> {
  const premium = qualityTier === "premium";
  return model === "gpt-image-2"
    ? {
        size: "2:3",
        quality: premium ? "high" : "medium",
        resolution: premium ? "2K" : "1K",
      }
    : { size: "2:3", quality: premium ? "2K" : "1K" };
}

function makeupQualityTarget(
  look: LookCatalogItem | ResolvedLook,
  campaignLookId?: string,
): string {
  const recipe = isResolvedLook(look)
    ? getRecipeById(look.recipeId)
    : undefined;
  const campaignLook = getPinterestCampaignLook(campaignLookId, look.slug);
  return [
    `${look.title}: ${look.intent}`,
    `finish=${look.finish.join(", ")}`,
    recipe
      ? `palette=${recipe.palette.join(", ")}; coverage=${recipe.coverage}; contrast=${recipe.contrast}`
      : "",
    isMatureSkinLook(look)
      ? "sheer hydrating satin base with real mature skin texture, softly lifted taupe eyes, outer-cheek cream rose blush, and textured rosewood satin lips"
      : "",
    isCommuteLook(look)
      ? "sheer breathable complexion with localized medium-coverage correction of visible red or brown post-blemish discoloration, especially on the forehead; substantially reduce color contrast while preserving pores, skin grain, moles and freckles; keep forehead-to-hairline coverage continuous without smoothing or an opaque mask"
      : "",
    campaignLook ? `campaign fidelity=${campaignLook.qualityTarget}` : "",
  ]
    .filter(Boolean)
    .join("; ");
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
    duplicate ? "已有相同任务正在处理" : "当前生成额度不足，可分享或升级后重试",
    false,
    409,
  );
}

function isRemoteTryOnProvider(provider?: string): boolean {
  return provider === "gemini" || provider === "evolink";
}

function creditCostForJob(
  purpose: TryOnJobPurpose,
  hasPrivateTemplate: boolean,
): number {
  if (purpose === "diagnosis") return DIAGNOSIS_CREDIT_COST;
  return hasPrivateTemplate
    ? PRIVATE_REFERENCE_TRYON_CREDIT_COST
    : STANDARD_TRYON_CREDIT_COST;
}

function providerErrorCode(error: unknown): string {
  if (error instanceof DiagnosisProviderError) return error.code;
  if (error instanceof EvolinkVisionError) return error.code;
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
  if (error instanceof EvolinkVisionError) return error.code;
  return error instanceof Error ? error.name : "MAKEUP_TRANSFER_UNAVAILABLE";
}

function makeupTransferFailure(
  provider: "gemini" | "evolink",
  code: GeminiMakeupTransferError["code"],
  message: string,
): GeminiMakeupTransferError | EvolinkVisionError {
  return provider === "evolink"
    ? new EvolinkVisionError(code, message)
    : new GeminiMakeupTransferError(code, message);
}

// 部分 EvoLink 图像模型返回 credits_used（积分计费）而非 estimated_cost（美元）。
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

function standardEvolinkImageOptions(
  model: string,
  bindings: RuntimeBindings,
): Pick<EvolinkImageOptions, "size" | "quality"> {
  if (model === "doubao-seedream-5.0-lite") {
    return { size: "2:3", quality: "2K" };
  }
  return {
    size: bindings.EVOLINK_IMAGE_SIZE,
    quality:
      bindings.EVOLINK_IMAGE_QUALITY === "medium" ||
      bindings.EVOLINK_IMAGE_QUALITY === "high"
        ? bindings.EVOLINK_IMAGE_QUALITY
        : undefined,
  };
}

function privateEvolinkImageOptions(
  model: string,
): Pick<EvolinkImageOptions, "size" | "quality" | "resolution"> {
  return model === "gpt-image-2"
    ? { size: "2:3", quality: "medium", resolution: "1K" }
    : { size: "2:3", quality: "1K" };
}

function makeupImagePrompt(
  look: LookCatalogItem | ResolvedLook,
  campaignLookId?: string,
): string {
  const recipe = isResolvedLook(look)
    ? getRecipeById(look.recipeId)
    : undefined;
  const variant = isResolvedLook(look)
    ? getVariantById(look.marketVariantId)
    : undefined;
  const campaignLook = getPinterestCampaignLook(campaignLookId, look.slug);
  return [
    "Use the input selfie as the only person reference and create a realistic makeup try-on preview.",
    "Preserve the exact identity, facial proportions, eye size and shape, nose width, natural lip shape, jawline, chin, expression, head angle, pose, camera perspective, crop, framing, hairstyle, clothing, jewelry, background, and lighting from the input photo.",
    "Do not remove, add, move, or redraw hands, arms, ears, hair strands, jewelry, clothing, seats, windows, or any other non-makeup object. Keep the scene and body position unchanged.",
    "Critically preserve the original skin texture: keep visible pores, fine lines, natural skin grain, moles, freckles and real surface detail from the input photo.",
    "Do NOT beautify, de-age, smooth, retouch, airbrush, blur, symmetrize, enlarge the eyes, narrow the nose, reshape the lips, slim the face, or apply any beauty-filter effect. The skin must look like the same real unfiltered photo with makeup added.",
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
    campaignLook?.generationDirection ?? "",
    isMatureSkinLook(look)
      ? "Highest-priority mature-skin no-caking direction: use a sheer hydrating satin base only where visibly needed; never replace the face with an opaque, uniformly porcelain complexion. Keep every visible pore, fine line, under-eye texture, natural skin-grain variation, mole, freckle, and lip line recognizable. Use softly lifted taupe eye makeup, fine natural brow definition, cream rose blush placed high on the outer cheeks with subtle diffused edges, and a hydrating rosewood satin lip that retains natural lip texture. Keep the T-zone softly luminous but controlled: no white stripe or blown highlight on the nose or forehead, and no broad pink blush across the under-eye area or center face. Do not make the person look younger; show flattering makeup on the same real skin."
      : "",
    isCommuteLook(look)
      ? "Highest-priority sheer commute complexion direction: keep the base sheer and breathable across the whole face, then use localized medium-coverage pinpoint concealing only on visible red or brown post-blemish discoloration, especially on the forehead. Substantially reduce the color contrast of these marks without blurring, healing, erasing, or flattening skin. Preserve pores, fine lines, skin grain, and surface contours at their exact locations. Preserve stable moles and natural freckles; when uncertain, soften a mark instead of removing it. Keep the forehead, temples, and hairline naturally continuous with the rest of the complexion, with no opaque mask, bright forehead patch, or unfinished forehead while the center face is corrected."
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function isMatureSkinLook(look: LookCatalogItem | ResolvedLook): boolean {
  return (
    look.slug === "mature-skin-radiance" ||
    (isResolvedLook(look) && look.recipeId === "mature-skin-radiance")
  );
}

function isCommuteLook(look: LookCatalogItem | ResolvedLook): boolean {
  return (
    look.slug === "commute" ||
    (isResolvedLook(look) && look.recipeId === "commute")
  );
}

function privateMakeupImagePrompt(
  title: string,
  spec: MakeupReferenceSpec,
  correction?: MakeupTransferQuality,
  editsPreviousCandidate = false,
): string {
  return [
    editsPreviousCandidate
      ? "Input image order: Image 1 = MAKEUP REFERENCE; Image 2 = USER SELFIE; Image 3 = CURRENT TRY-ON CANDIDATE."
      : "Input image order: Image 1 = MAKEUP REFERENCE; Image 2 = USER SELFIE.",
    editsPreviousCandidate
      ? "Edit the CURRENT TRY-ON CANDIDATE directly. Retain its successful makeup and correct the listed fidelity issues."
      : "Edit the USER SELFIE by applying the cosmetic design from the MAKEUP REFERENCE.",
    editsPreviousCandidate
      ? "Do not restart from or revert to the USER SELFIE; it is provided only to verify identity, structure, scene, and skin texture."
      : "The output must visibly change the selfie's makeup; an unchanged selfie or generic peach/nude look is a failure.",
    makeupReferenceSpecPrompt(spec),
    correction ? makeupTransferCorrectionPrompt(correction) : "",
    "Match the focal makeup's color, placement, finish, reflectivity, texture, and intensity, adapted naturally to the selfie's proportions.",
    spec.baseCoverage.expectedContinuity === "full-face"
      ? "Apply the reference base continuously from the hairline across the forehead and temples, then through the nose, both cheeks, chin, and visible jaw. Do not leave the forehead untreated while the center face is covered."
      : spec.baseCoverage.expectedContinuity === "localized"
        ? "Keep base coverage localized exactly as mapped in the reference; do not invent a full-face foundation mask."
        : "Do not invent foundation where the reference has no visible base coverage.",
    "Foundation coverage means matching the reference tone, opacity, and finish across each required zone while retaining real pores, moles, freckles, fine lines, and skin grain. Texture preservation is not permission to leave a required zone bare.",
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
