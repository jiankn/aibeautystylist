import type { LookCatalogItem } from "../data/lookCatalog";
import type { ResolvedLook } from "../data/makeup/audienceTypes";
import type { D1DatabaseLike, R2BucketLike } from "./runtime";

export const jobStatuses = [
  "created",
  "upload_validating",
  "diagnosis_running",
  "image_running",
  "succeeded",
  "failed",
  "cancelled",
  "timed_out",
] as const;

export const runningJobStatuses = [
  "created",
  "upload_validating",
  "diagnosis_running",
  "image_running",
] as const satisfies readonly JobStatus[];

export const retryableJobStatuses = [
  "failed",
  "cancelled",
  "timed_out",
] as const satisfies readonly JobStatus[];

export const TRYON_JOB_TIMEOUT_MS = 90_000;

export type JobStatus = (typeof jobStatuses)[number];

export interface TryOnJobResult {
  id: string;
  status: JobStatus;
  lookSlug: string;
  lookTitle: string;
  resultImage?: string;
  resultKind?: "reference-fallback" | "ai-generated";
  disclaimer?: string;
  errorCode?: string;
  retryOfJobId?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface StoredTryOnJob extends TryOnJobResult {
  userId: string;
  uploadId: string;
  idempotencyKey: string;
  resultR2Key?: string;
  deletedAt?: string;
  /** 区域化上下文字段（Phase 1 新增，旧任务为 undefined） */
  lookRecipeId?: string;
  lookRecipeVersion?: string;
  marketVariantId?: string;
  referenceAssetId?: string;
  locale?: string;
  marketProfile?: string;
}

export interface JobTimeoutResult {
  job: StoredTryOnJob;
  timedOut: boolean;
}

export interface DeleteJobResult {
  id: string;
  deletedAt: string;
  alreadyDeleted: boolean;
  deletedDiagnosis: boolean;
}

const mockJobsById = new Map<string, StoredTryOnJob>();
const mockJobsByIdempotency = new Map<string, StoredTryOnJob>();

interface StoredJobRow {
  result_json: string | null;
}

interface DeletionJobRow extends StoredJobRow {
  id: string;
  user_id: string;
  result_r2_key: string | null;
  deleted_at: string | null;
}

interface DiagnosisRow {
  id: string;
}

interface ShareCardRow {
  id: string;
  r2_key: string | null;
}

export function createReferenceFallbackJob(
  look: LookCatalogItem | ResolvedLook,
  now = new Date(),
): TryOnJobResult {
  const timestamp = now.toISOString();
  return {
    id: crypto.randomUUID(),
    status: "succeeded",
    lookSlug: look.slug,
    lookTitle: look.title,
    resultImage: look.image,
    resultKind: "reference-fallback",
    disclaimer:
      "当前显示现有妆容参考图，并非你的真实上脸效果。实际效果因个人条件而异。",
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: timestamp,
  };
}

export function isRunningJobStatus(status: JobStatus): boolean {
  return runningJobStatuses.includes(
    status as (typeof runningJobStatuses)[number],
  );
}

export function isRetryableJobStatus(status: JobStatus): boolean {
  return retryableJobStatuses.includes(
    status as (typeof retryableJobStatuses)[number],
  );
}

export function toJobResponse(job: StoredTryOnJob): TryOnJobResult {
  const {
    userId: _userId,
    uploadId: _uploadId,
    idempotencyKey: _idempotencyKey,
    resultR2Key: _resultR2Key,
    deletedAt: _deletedAt,
    ...response
  } = job;
  return response;
}

export async function getStoredJobByIdempotencyKey(
  userId: string,
  idempotencyKey: string,
  DB?: D1DatabaseLike,
): Promise<StoredTryOnJob | undefined> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT result_json FROM tryon_jobs WHERE user_id = ? AND idempotency_key = ? AND deleted_at IS NULL",
    )
      .bind(userId, idempotencyKey)
      .first<StoredJobRow>();
    return parseStoredJob(row);
  }

  const job = mockJobsByIdempotency.get(`${userId}:${idempotencyKey}`);
  return job?.deletedAt ? undefined : job;
}

export async function getStoredJobById(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
): Promise<StoredTryOnJob | undefined> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT result_json FROM tryon_jobs WHERE user_id = ? AND id = ? AND deleted_at IS NULL",
    )
      .bind(userId, jobId)
      .first<StoredJobRow>();
    return parseStoredJob(row);
  }

  const job = mockJobsById.get(jobId);
  return job?.userId === userId && !job.deletedAt ? job : undefined;
}

export async function saveStoredJob(
  job: StoredTryOnJob,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (DB) {
    await DB.prepare(
      "INSERT INTO tryon_jobs (id, user_id, upload_id, look_slug, status, idempotency_key, retry_of_job_id, result_json, result_r2_key, error_code, created_at, updated_at, completed_at, deleted_at, look_recipe_id, look_recipe_version, market_variant_id, reference_asset_id, locale, market_profile) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        job.id,
        job.userId,
        job.uploadId,
        job.lookSlug,
        job.status,
        job.idempotencyKey,
        job.retryOfJobId ?? null,
        JSON.stringify(job),
        job.resultR2Key ?? null,
        job.errorCode ?? null,
        job.createdAt,
        job.updatedAt,
        job.completedAt ?? null,
        job.deletedAt ?? null,
        job.lookRecipeId ?? null,
        job.lookRecipeVersion ?? null,
        job.marketVariantId ?? null,
        job.referenceAssetId ?? null,
        job.locale ?? null,
        job.marketProfile ?? null,
      )
      .run();
    return;
  }

  storeMockJob(job);
}

export async function updateStoredJob(
  job: StoredTryOnJob,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (DB) {
    await DB.prepare(
      "UPDATE tryon_jobs SET status = ?, retry_of_job_id = ?, result_json = ?, result_r2_key = ?, error_code = ?, updated_at = ?, completed_at = ?, deleted_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
    )
      .bind(
        job.status,
        job.retryOfJobId ?? null,
        JSON.stringify(job),
        job.resultR2Key ?? null,
        job.errorCode ?? null,
        job.updatedAt,
        job.completedAt ?? null,
        job.deletedAt ?? null,
        job.id,
        job.userId,
      )
      .run();
    return;
  }

  storeMockJob(job);
}

export async function transitionStoredJob(
  job: StoredTryOnJob,
  status: JobStatus,
  DB?: D1DatabaseLike,
  options: { errorCode?: string; now?: Date } = {},
): Promise<StoredTryOnJob> {
  const updatedAt = (options.now ?? new Date()).toISOString();
  const updated: StoredTryOnJob = {
    ...job,
    status,
    updatedAt,
    completedAt: isRunningJobStatus(status) ? undefined : updatedAt,
    errorCode: options.errorCode,
  };
  await updateStoredJob(updated, DB);
  return updated;
}

export async function timeoutStoredJobIfExpired(
  job: StoredTryOnJob,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<JobTimeoutResult> {
  if (
    !isRunningJobStatus(job.status) ||
    now.getTime() - new Date(job.updatedAt).getTime() < TRYON_JOB_TIMEOUT_MS
  ) {
    return { job, timedOut: false };
  }

  return {
    job: await transitionStoredJob(job, "timed_out", DB, {
      errorCode: "AI_TIMEOUT",
      now,
    }),
    timedOut: true,
  };
}

export async function deleteOwnedJob(
  userId: string,
  jobId: string,
  DB?: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
): Promise<DeleteJobResult | undefined> {
  if (!DB) {
    const job = mockJobsById.get(jobId);
    if (!job || job.userId !== userId) return undefined;
    if (job.deletedAt) {
      return {
        id: job.id,
        deletedAt: job.deletedAt,
        alreadyDeleted: true,
        deletedDiagnosis: false,
      };
    }
    if (job.resultR2Key && !bucket) throw new Error("R2_BINDING_UNAVAILABLE");
    if (job.resultR2Key) await bucket?.delete(job.resultR2Key);

    const deletedAt = now.toISOString();
    storeMockJob({
      ...job,
      resultImage: undefined,
      resultR2Key: undefined,
      deletedAt,
      updatedAt: deletedAt,
    });
    return {
      id: job.id,
      deletedAt,
      alreadyDeleted: false,
      deletedDiagnosis: false,
    };
  }

  const row = await DB.prepare(
    "SELECT id, user_id, result_json, result_r2_key, deleted_at FROM tryon_jobs WHERE id = ? AND user_id = ?",
  )
    .bind(jobId, userId)
    .first<DeletionJobRow>();
  if (!row) return undefined;
  if (row.deleted_at) {
    return {
      id: row.id,
      deletedAt: row.deleted_at,
      alreadyDeleted: true,
      deletedDiagnosis: false,
    };
  }

  const deletedAt = now.toISOString();
  const diagnosis = await DB.prepare(
    "SELECT id FROM diagnoses WHERE job_id = ?",
  )
    .bind(jobId)
    .first<DiagnosisRow>();
  const shareRows = await DB.prepare(
    "SELECT id, r2_key FROM share_cards WHERE job_id = ? AND deleted_at IS NULL",
  )
    .bind(jobId)
    .all<ShareCardRow>();
  const r2Keys = [
    row.result_r2_key,
    ...(shareRows.results ?? []).map((share) => share.r2_key),
  ].filter((key): key is string => Boolean(key));

  try {
    if (r2Keys.length > 0 && !bucket) throw new Error("R2_BINDING_UNAVAILABLE");
    for (const key of r2Keys) await bucket?.delete(key);

    await DB.prepare("DELETE FROM diagnoses WHERE job_id = ?")
      .bind(jobId)
      .run();
    await DB.prepare("DELETE FROM tutorials WHERE job_id = ?")
      .bind(jobId)
      .run();
    await DB.prepare("DELETE FROM recommended_kits WHERE job_id = ?")
      .bind(jobId)
      .run();
    await DB.prepare("DELETE FROM saved_looks WHERE job_id = ?")
      .bind(jobId)
      .run();
    await DB.prepare(
      "UPDATE share_cards SET r2_key = NULL, deleted_at = ? WHERE job_id = ? AND deleted_at IS NULL",
    )
      .bind(deletedAt, jobId)
      .run();
    await DB.prepare(
      "UPDATE tryon_jobs SET result_json = NULL, result_r2_key = NULL, deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL",
    )
      .bind(deletedAt, deletedAt, jobId, userId)
      .run();
    await writeJobDeletionAudit(
      DB,
      userId,
      "tryon_job",
      jobId,
      row.result_r2_key,
      "succeeded",
      deletedAt,
    );
    if (diagnosis) {
      await writeJobDeletionAudit(
        DB,
        userId,
        "diagnosis",
        diagnosis.id,
        null,
        "succeeded",
        deletedAt,
      );
    }
  } catch (error) {
    await writeJobDeletionAudit(
      DB,
      userId,
      "tryon_job",
      jobId,
      row.result_r2_key,
      "failed",
      deletedAt,
      error instanceof Error ? error.message : "DELETE_FAILED",
    ).catch(() => undefined);
    throw error;
  }

  return {
    id: jobId,
    deletedAt,
    alreadyDeleted: false,
    deletedDiagnosis: Boolean(diagnosis),
  };
}

export function resetMockJobs(): void {
  mockJobsById.clear();
  mockJobsByIdempotency.clear();
}

function parseStoredJob(row: StoredJobRow | null): StoredTryOnJob | undefined {
  return row?.result_json
    ? (JSON.parse(row.result_json) as StoredTryOnJob)
    : undefined;
}

function storeMockJob(job: StoredTryOnJob): void {
  mockJobsById.set(job.id, job);
  mockJobsByIdempotency.set(`${job.userId}:${job.idempotencyKey}`, job);
}

async function writeJobDeletionAudit(
  DB: D1DatabaseLike,
  userId: string,
  resourceType: "tryon_job" | "diagnosis",
  resourceId: string,
  r2Key: string | null,
  status: "succeeded" | "failed",
  createdAt: string,
  errorCode?: string,
): Promise<void> {
  await DB.prepare(
    "INSERT INTO deletion_audit_records (id, user_id, resource_type, resource_id, r2_key, actor, status, error_code, created_at) VALUES (?, ?, ?, ?, ?, 'user', ?, ?, ?)",
  )
    .bind(
      crypto.randomUUID(),
      userId,
      resourceType,
      resourceId,
      r2Key,
      status,
      errorCode ?? null,
      createdAt,
    )
    .run();
}
