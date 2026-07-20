import type { APIRoute } from "astro";

import {
  resolveBySlug,
  resolveBySnapshot,
} from "../../../data/makeup/resolveCatalog";
import { isValidMarketProfile } from "../../../data/makeup/audienceTypes";
import { getPinterestCampaignLook } from "../../../data/makeup/pinterestCampaignLooks";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  getEntitlementContext,
  requireFeature,
  requirePlan,
} from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  getStoredJobByIdempotencyKey,
  getTryOnJobPurpose,
  jobStatuses,
  matchesTryOnJobRequest,
  toLocalizedJobResponse,
  type StoredTryOnJob,
  type TryOnJobPurpose,
} from "../../../lib/jobs";
import { isPlanCode, type PlanCode } from "../../../lib/plans";
import {
  attachPinterestGuestJob,
  getPinterestGuestGenerationLimits,
  pinterestGuestPassState,
  releasePinterestGuestGeneration,
  reservePinterestGuestGeneration,
  resolvePinterestGuestPass,
} from "../../../lib/pinterestGuestPass";
import {
  getOwnedPrivateLookTemplate,
  privateTemplateToLook,
} from "../../../lib/privateLookTemplates";
import {
  getRuntimeBindings,
  isRemoteTryOnProvider,
} from "../../../lib/runtime";
import { enqueueTryOnJob } from "../../../lib/tryonQueue";
import {
  createTryOnJob,
  processTryOnJob,
  type ProcessTryOnJobOptions,
  TryOnJobServiceError,
} from "../../../lib/tryonJobService";

interface CreateJobBody {
  uploadId?: string;
  lookSlug?: string;
  marketProfile?: string;
  campaignLookId?: string;
  privateTemplateId?: string;
  idempotencyKey?: string;
  requiredPlan?: string;
  purpose?: string;
}

export const GET: APIRoute = async ({ cookies, locals, url }) => {
  const bindings = getRuntimeBindings();
  if (!bindings.DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;

  const limit = normalizeHistoryLimit(url.searchParams.get("limit"));
  const before = normalizeHistoryCursor(url.searchParams.get("before"));
  const sourceParam = url.searchParams.get("source");
  const statusParam = url.searchParams.get("status");
  const source = normalizeHistorySource(sourceParam);
  const status = normalizeHistoryStatus(statusParam);
  if ((sourceParam && !source) || (statusParam && !status)) {
    return apiError(
      {
        code: "INVALID_HISTORY_FILTER",
        message: "历史记录筛选条件无效",
        retryable: false,
      },
      422,
    );
  }

  const filters = [
    "user_id = ?",
    "deleted_at IS NULL",
    "COALESCE(json_extract(result_json, '$.purpose'), 'tryon') = 'tryon'",
  ];
  const queryBindings: Array<string | number> = [userId];
  if (source) {
    filters.push(
      "COALESCE(json_extract(result_json, '$.lookSource'), 'catalog') = ?",
    );
    queryBindings.push(source);
  }
  if (status) {
    filters.push("json_extract(result_json, '$.status') = ?");
    queryBindings.push(status);
  }
  if (before) {
    filters.push("created_at < ?");
    queryBindings.push(before);
  }
  queryBindings.push(limit + 1);
  const query = `SELECT result_json FROM tryon_jobs
    WHERE ${filters.join(" AND ")}
    ORDER BY created_at DESC
    LIMIT ?`;
  const rows = await bindings.DB.prepare(query)
    .bind(...queryBindings)
    .all<{ result_json: string | null }>();

  const rawJobs = (rows.results ?? [])
    .map((row) => (row.result_json ? JSON.parse(row.result_json) : null))
    .filter(Boolean);
  const pageJobs = rawJobs.slice(0, limit);
  const items = pageJobs.map((job) =>
    toLocalizedJobResponse(job, locals.audienceContext),
  );
  const lastJob = pageJobs.at(-1);
  const nextCursor =
    rawJobs.length > limit
      ? lastJob?.createdAt || lastJob?.updatedAt
      : undefined;

  return apiSuccess({ items, nextCursor });
};

export const POST: APIRoute = async ({ cookies, locals, request }) => {
  const body = (await request.json().catch(() => null)) as CreateJobBody | null;
  const hasCatalogLook = Boolean(body?.lookSlug);
  const hasPrivateTemplate = Boolean(body?.privateTemplateId);
  if (
    !body?.uploadId ||
    !body.idempotencyKey ||
    hasCatalogLook === hasPrivateTemplate
  ) {
    return apiError(
      {
        code: "INVALID_JOB_REQUEST",
        message: "请选择一个妆容库妆容或一个私有参考妆容",
        retryable: false,
      },
      422,
    );
  }

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  const guestPass = auth.ok
    ? undefined
    : await resolvePinterestGuestPass(cookies, bindings.DB);
  if (!auth.ok && !guestPass) return auth.response;
  if (guestPass && hasPrivateTemplate) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Create an account to use private reference try-on.",
        retryable: false,
      },
      401,
    );
  }
  const userId = auth.ok ? auth.user.id : guestPass?.guestUserId;
  if (!userId) {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Please sign in before continuing.",
        retryable: false,
      },
      401,
    );
  }
  const requestedMarketProfile =
    typeof body.marketProfile === "string" ? body.marketProfile : undefined;
  if (requestedMarketProfile && !isValidMarketProfile(requestedMarketProfile)) {
    return apiError(
      {
        code: "INVALID_MARKET_PROFILE",
        message: "市场画像参数无效",
        retryable: false,
      },
      422,
    );
  }
  const validatedMarketProfile =
    requestedMarketProfile && isValidMarketProfile(requestedMarketProfile)
      ? requestedMarketProfile
      : undefined;
  const audienceContext = validatedMarketProfile
    ? { ...locals.audienceContext, marketProfile: validatedMarketProfile }
    : locals.audienceContext;
  const privateTemplate = body.privateTemplateId
    ? await getOwnedPrivateLookTemplate(
        userId,
        body.privateTemplateId,
        bindings.DB,
      )
    : undefined;
  if (body.privateTemplateId && !privateTemplate) {
    return apiError(
      {
        code: "PRIVATE_TEMPLATE_NOT_FOUND",
        message: "没有找到该私有参考妆容",
        retryable: false,
      },
      404,
    );
  }
  if (privateTemplate) {
    const entitlement = await requireFeature(
      userId,
      "privateReferenceTryOn",
      bindings.DB,
    );
    if (!entitlement.allowed) {
      return apiError(
        {
          code: "PREMIUM_REQUIRED",
          message: "上传参考妆容是 Premium 专属功能",
          retryable: false,
        },
        403,
      );
    }
  }
  const look = privateTemplate
    ? privateTemplateToLook(privateTemplate)
    : resolveBySlug(body.lookSlug ?? "", audienceContext);
  if (!look) {
    return apiError(
      {
        code: "LOOK_NOT_FOUND",
        message: "没有找到所选妆容",
        retryable: false,
      },
      404,
    );
  }
  const campaignLook = body.campaignLookId
    ? getPinterestCampaignLook(body.campaignLookId, look.slug)
    : undefined;
  if (body.campaignLookId && !campaignLook) {
    return apiError(
      {
        code: "INVALID_CAMPAIGN_LOOK",
        message: "The selected campaign look does not match this makeup.",
        retryable: false,
      },
      422,
    );
  }
  const requiredPlan = normalizeRequiredPlan(body.requiredPlan);
  if (!requiredPlan) {
    return apiError(
      {
        code: "INVALID_PLAN",
        message: "请求的计划等级无效",
        retryable: false,
      },
      422,
    );
  }
  const purpose = normalizeJobPurpose(body.purpose);
  if (!purpose) {
    return apiError(
      {
        code: "INVALID_JOB_PURPOSE",
        message: "请求的任务类型无效",
        retryable: false,
      },
      422,
    );
  }
  if (privateTemplate && purpose !== "tryon") {
    return apiError(
      {
        code: "INVALID_JOB_PURPOSE",
        message: "私有参考妆容仅用于试妆生成",
        retryable: false,
      },
      422,
    );
  }

  if (guestPass && requiredPlan !== "free") {
    return apiError(
      {
        code: "AUTH_REQUIRED",
        message: "Create an account to use member-only try-on features.",
        retryable: false,
      },
      401,
    );
  }

  if (guestPass && purpose !== "tryon") {
    return apiError(
      {
        code: "INVALID_JOB_PURPOSE",
        message:
          "The free Pinterest preview can only be used for makeup try-on.",
        retryable: false,
      },
      422,
    );
  }

  if (guestPass) {
    if (guestPass.jobId || guestPass.usedAt) {
      return apiError(
        {
          code: "GUEST_TRY_USED",
          message:
            "Your free Pinterest preview has already been used. Create an account to keep trying looks.",
          retryable: false,
        },
        403,
      );
    }
    if (guestPass.uploadId !== body.uploadId) {
      return apiError(
        {
          code: "GUEST_UPLOAD_REQUIRED",
          message:
            "Upload one selfie from this Pinterest preview before generating.",
          retryable: false,
        },
        409,
      );
    }
  }

  if (requiredPlan !== "free") {
    const entitlement = await requirePlan(userId, requiredPlan, bindings.DB);
    if (!entitlement.allowed) {
      return apiError(
        {
          code: "FORBIDDEN",
          message: "当前计划不支持此工作台",
          retryable: false,
        },
        403,
      );
    }
  }

  const existingJob = await getStoredJobByIdempotencyKey(
    userId,
    body.idempotencyKey,
    bindings.DB,
  );
  if (existingJob) {
    if (
      !matchesTryOnJobRequest(existingJob, {
        uploadId: body.uploadId,
        purpose,
        lookSlug: body.lookSlug,
        campaignLookId: campaignLook?.id,
        privateTemplateId: body.privateTemplateId,
      })
    ) {
      return apiError(
        {
          code: "IDEMPOTENCY_KEY_REUSED",
          message: "当前请求已更换自拍或妆容，请重新提交",
          retryable: true,
        },
        409,
      );
    }
    const replayTemplate =
      existingJob.lookSource === "private-template" &&
      existingJob.privateTemplateId
        ? await getOwnedPrivateLookTemplate(
            userId,
            existingJob.privateTemplateId,
            bindings.DB,
          )
        : undefined;
    const replayLook = replayTemplate
      ? privateTemplateToLook(replayTemplate)
      : (resolveBySnapshot(existingJob, audienceContext) ?? look);
    await scheduleTryOnJobProcessing(locals, existingJob, {
      userId,
      jobId: existingJob.id,
      look: replayLook,
      bindings,
      audienceContext: { locale: audienceContext.locale },
    });
    const { quota } = await getEntitlementContext(userId, bindings.DB);
    return apiSuccess({
      ...toLocalizedJobResponse(existingJob, audienceContext),
      idempotentReplay: true,
      quota,
    });
  }

  let guestReservation = false;
  if (guestPass) {
    guestReservation = await reservePinterestGuestGeneration(
      guestPass,
      body.uploadId,
      bindings.DB,
      {
        limits: getPinterestGuestGenerationLimits(
          bindings.PINTEREST_GUEST_IP_DAILY_LIMIT,
          bindings.PINTEREST_GUEST_DAILY_LIMIT,
        ),
      },
    );
    if (!guestReservation) {
      return apiError(
        {
          code: "GUEST_TRY_USED",
          message:
            "Your free Pinterest preview has already been used. Create an account to keep trying looks.",
          retryable: false,
        },
        403,
      );
    }
  }

  try {
    const result = await createTryOnJob({
      userId,
      uploadId: body.uploadId,
      look,
      idempotencyKey: body.idempotencyKey,
      bindings,
      audienceContext,
      purpose,
      privateTemplate,
      campaignLookId: campaignLook?.id,
    });
    if (guestPass) {
      await attachPinterestGuestJob(guestPass.id, result.job.id, bindings.DB);
    }
    await scheduleTryOnJobProcessing(locals, result.job, {
      userId,
      jobId: result.job.id,
      look,
      bindings,
      audienceContext: { locale: audienceContext.locale },
    });
    return apiSuccess(
      {
        ...toLocalizedJobResponse(result.job, audienceContext),
        quota: result.quota,
        guestTry: guestPass
          ? pinterestGuestPassState({
              ...guestPass,
              usedAt: new Date().toISOString(),
              jobId: result.job.id,
            })
          : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    if (guestReservation && guestPass) {
      await releasePinterestGuestGeneration(guestPass.id, bindings.DB).catch(
        () => undefined,
      );
    }
    if (error instanceof TryOnJobServiceError) {
      return apiError(
        {
          code: error.code,
          message: error.message,
          retryable: error.retryable,
        },
        error.status,
      );
    }
    return apiError(
      {
        code: "AI_UNAVAILABLE",
        message: "任务创建失败，额度已自动返还",
        retryable: true,
      },
      503,
    );
  }
};

function normalizeRequiredPlan(value: unknown): PlanCode | undefined {
  if (value === undefined || value === null || value === "") return "free";
  return isPlanCode(value) ? value : undefined;
}

function normalizeHistoryLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? "20", 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 100);
}

function normalizeHistoryCursor(value: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : value;
}

function normalizeHistorySource(
  value: string | null,
): "catalog" | "private-template" | undefined {
  return value === "catalog" || value === "private-template"
    ? value
    : undefined;
}

function normalizeHistoryStatus(value: string | null) {
  return jobStatuses.includes(value as (typeof jobStatuses)[number])
    ? (value as (typeof jobStatuses)[number])
    : undefined;
}

function normalizeJobPurpose(value: unknown): TryOnJobPurpose | undefined {
  if (value === undefined || value === null || value === "") return "tryon";
  return value === "tryon" || value === "diagnosis" ? value : undefined;
}

interface WaitUntilLocals {
  cfContext?: {
    waitUntil(promise: Promise<unknown>): void;
  };
}

async function scheduleTryOnJobProcessing(
  locals: WaitUntilLocals,
  job: StoredTryOnJob,
  options: ProcessTryOnJobOptions,
): Promise<void> {
  if (!shouldScheduleTryOnJob(job, options)) return;

  try {
    const queued = await enqueueTryOnJob({
      userId: options.userId,
      jobId: options.jobId,
      look: options.look,
      bindings: options.bindings,
      locale: options.audienceContext?.locale,
      purpose: getTryOnJobPurpose(job),
    });
    if (queued) return;
  } catch (error) {
    console.error("TRYON_QUEUE_SEND_FAILED", error);
  }

  const task = processTryOnJob(options).catch((error) => {
    console.error("TRYON_WAITUNTIL_FALLBACK_FAILED", error);
  });
  if (locals.cfContext) {
    locals.cfContext.waitUntil(task);
    return;
  }
  void task;
}

function shouldScheduleTryOnJob(
  job: StoredTryOnJob,
  options: ProcessTryOnJobOptions,
): boolean {
  return (
    isRemoteTryOnProvider(options.bindings.TRYON_PROVIDER ?? "mock") &&
    job.status === "created"
  );
}
