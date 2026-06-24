import type { APIRoute } from "astro";

import {
  resolveBySlug,
  resolveBySnapshot,
} from "../../../data/makeup/resolveCatalog";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext, requirePlan } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  getStoredJobByIdempotencyKey,
  getTryOnJobPurpose,
  toLocalizedJobResponse,
  type StoredTryOnJob,
  type TryOnJobPurpose,
} from "../../../lib/jobs";
import { isPlanCode, type PlanCode } from "../../../lib/plans";
import { getRuntimeBindings } from "../../../lib/runtime";
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

  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
  const rows = await bindings.DB.prepare(
    `SELECT result_json FROM tryon_jobs 
     WHERE user_id = ? AND deleted_at IS NULL 
     ORDER BY created_at DESC 
     LIMIT ?`,
  )
    .bind(userId, limit)
    .all<{ result_json: string | null }>();

  const items = (rows.results ?? [])
    .map((row) => (row.result_json ? JSON.parse(row.result_json) : null))
    .filter(Boolean)
    .filter((job) => getTryOnJobPurpose(job) === "tryon")
    .map((job) => toLocalizedJobResponse(job, locals.audienceContext));

  return apiSuccess({ items });
};

export const POST: APIRoute = async ({ cookies, locals, request }) => {
  const body = (await request.json().catch(() => null)) as CreateJobBody | null;
  if (!body?.uploadId || !body.lookSlug || !body.idempotencyKey) {
    return apiError(
      {
        code: "INVALID_JOB_REQUEST",
        message: "缺少上传记录、妆容或幂等键",
        retryable: false,
      },
      422,
    );
  }

  const audienceContext = locals.audienceContext;
  const look = resolveBySlug(body.lookSlug, audienceContext);
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

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
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
    const replayLook = resolveBySnapshot(existingJob, audienceContext) ?? look;
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

  try {
    const result = await createTryOnJob({
      userId,
      uploadId: body.uploadId,
      look,
      idempotencyKey: body.idempotencyKey,
      bindings,
      audienceContext,
      purpose,
    });
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
      },
      { status: 201 },
    );
  } catch (error) {
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
    (options.bindings.TRYON_PROVIDER ?? "mock") === "gemini" &&
    job.status === "created"
  );
}
