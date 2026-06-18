import type { APIRoute } from "astro";

import { resolveBySnapshot } from "../../../../data/makeup/resolveCatalog";
import { isValidMarketProfile } from "../../../../data/makeup/audienceTypes";
import { requireAuthenticatedUser } from "../../../../lib/authGuard";
import { getEntitlementContext } from "../../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../../lib/http";
import {
  getStoredJobById,
  getStoredJobByIdempotencyKey,
  getTryOnJobPurpose,
  isRetryableJobStatus,
  timeoutStoredJobIfExpired,
  toJobResponse,
  type StoredTryOnJob,
} from "../../../../lib/jobs";
import { refundQuota } from "../../../../lib/quota";
import { getRuntimeBindings } from "../../../../lib/runtime";
import { enqueueTryOnJob } from "../../../../lib/tryonQueue";
import {
  createTryOnJob,
  processTryOnJob,
  type ProcessTryOnJobOptions,
  TryOnJobServiceError,
} from "../../../../lib/tryonJobService";

interface RetryJobBody {
  idempotencyKey?: string;
}

export const POST: APIRoute = async ({ cookies, locals, params, request }) => {
  const body = (await request.json().catch(() => null)) as RetryJobBody | null;
  if (!body?.idempotencyKey) {
    return apiError(
      {
        code: "INVALID_JOB_REQUEST",
        message: "重试请求缺少幂等键",
        retryable: false,
      },
      422,
    );
  }

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const originalJob = params.id
    ? await getStoredJobById(userId, params.id, bindings.DB)
    : undefined;

  if (!originalJob) {
    return apiError(
      {
        code: "JOB_NOT_FOUND",
        message: "没有找到该任务",
        retryable: false,
      },
      404,
    );
  }

  const timeoutResult = await timeoutStoredJobIfExpired(
    originalJob,
    bindings.DB,
  );
  if (timeoutResult.timedOut) {
    await refundQuota(userId, originalJob.id, bindings.DB);
  }

  if (!isRetryableJobStatus(timeoutResult.job.status)) {
    return apiError(
      {
        code: "JOB_NOT_RETRYABLE",
        message: "仅失败、取消或超时任务可以重试",
        retryable: false,
      },
      409,
    );
  }

  const audienceContext = {
    ...locals.audienceContext,
    locale: originalJob.locale ?? locals.audienceContext.locale,
    marketProfile:
      originalJob.marketProfile &&
      isValidMarketProfile(originalJob.marketProfile)
        ? originalJob.marketProfile
        : locals.audienceContext.marketProfile,
  };
  const retryIdempotencyKey = `retry:${originalJob.id}:${body.idempotencyKey}`;
  const existingRetry = await getStoredJobByIdempotencyKey(
    userId,
    retryIdempotencyKey,
    bindings.DB,
  );
  if (existingRetry) {
    const retryLook = resolveBySnapshot(existingRetry, audienceContext);
    if (retryLook) {
      await scheduleTryOnJobProcessing(locals, existingRetry, {
        userId,
        jobId: existingRetry.id,
        look: retryLook,
        bindings,
        audienceContext: { locale: audienceContext.locale },
      });
    }
    const { quota } = await getEntitlementContext(userId, bindings.DB);
    return apiSuccess({
      ...toJobResponse(existingRetry),
      idempotentReplay: true,
      quota,
    });
  }

  const look = resolveBySnapshot(timeoutResult.job, audienceContext);
  if (!look) {
    return apiError(
      {
        code: "LOOK_NOT_FOUND",
        message: "原任务所选妆容已不存在",
        retryable: false,
      },
      404,
    );
  }

  try {
    const result = await createTryOnJob({
      userId,
      uploadId: originalJob.uploadId,
      look,
      idempotencyKey: retryIdempotencyKey,
      retryOfJobId: originalJob.id,
      bindings,
      audienceContext,
      purpose: getTryOnJobPurpose(originalJob),
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
        ...toJobResponse(result.job),
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
        message: "重试任务创建失败，额度已自动返还",
        retryable: true,
      },
      503,
    );
  }
};

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
  if (
    (options.bindings.TRYON_PROVIDER ?? "mock") !== "gemini" ||
    job.status !== "created"
  ) {
    return;
  }

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
    console.error("TRYON_RETRY_QUEUE_SEND_FAILED", error);
  }

  const task = processTryOnJob(options).catch((error) => {
    console.error("TRYON_RETRY_WAITUNTIL_FALLBACK_FAILED", error);
  });
  if (locals.cfContext) {
    locals.cfContext.waitUntil(task);
    return;
  }
  void task;
}
