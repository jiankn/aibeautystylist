import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteOwnedJob,
  getStoredJobById,
  getStoredJobByIdempotencyKey,
  isRetryableJobStatus,
  resetMockJobs,
  saveStoredJob,
  timeoutStoredJobIfExpired,
  toLocalizedJobResponse,
  toJobResponse,
  transitionStoredJob,
  TRYON_JOB_TIMEOUT_MS,
  type StoredTryOnJob,
} from "./jobs";
import {
  getQuotaSnapshot,
  refundQuota,
  reserveQuota,
  resetMockQuota,
} from "./quota";
import type { D1DatabaseLike, D1StatementLike } from "./runtime";

const now = new Date("2026-06-07T00:02:00.000Z");

describe("try-on job lifecycle", () => {
  beforeEach(() => {
    resetMockJobs();
    resetMockQuota();
  });

  it("loads jobs only for their owner and hides storage fields", async () => {
    const job = runningJob();
    await saveStoredJob(job);

    await expect(getStoredJobById(job.userId, job.id)).resolves.toEqual(job);
    await expect(getStoredJobById("visitor_other", job.id)).resolves.toBe(
      undefined,
    );
    expect(toJobResponse(job)).not.toHaveProperty("userId");
    expect(toJobResponse(job)).not.toHaveProperty("uploadId");
    expect(toJobResponse(job)).not.toHaveProperty("idempotencyKey");
  });

  it("localizes stored look titles for the current audience locale", () => {
    const job = {
      ...runningJob(),
      status: "succeeded" as const,
      lookSlug: "commute",
      lookTitle: "蜜桃气色妆",
      resultKind: "reference-fallback" as const,
      disclaimer:
        "当前显示现有妆容参考图，并非你的真实上脸效果。实际效果因个人条件而异。",
      lookRecipeId: "commute",
      marketVariantId: "commute--global-diverse",
      locale: "zh-CN",
    };

    const response = toLocalizedJobResponse(job, {
      locale: "en",
      marketProfile: "global-diverse",
      beautyPreferences: [],
      representationPreference: ["diverse"],
      source: "locale",
    });

    expect(response.lookTitle).toBe("Peach Glow Commute");
    expect(response.disclaimer).toContain(
      "showing the current makeup reference image",
    );
  });

  it("cancels a running job and marks it retryable", async () => {
    const job = runningJob();
    await saveStoredJob(job);

    const cancelled = await transitionStoredJob(job, "cancelled", undefined, {
      now,
    });

    expect(cancelled).toMatchObject({
      status: "cancelled",
      completedAt: now.toISOString(),
    });
    expect(isRetryableJobStatus(cancelled.status)).toBe(true);
  });

  it("times out an expired job and refunds its quota once", async () => {
    const job = runningJob();
    await reserveQuota(job.userId, job.id, job.idempotencyKey);
    await saveStoredJob(job);

    const timeout = await timeoutStoredJobIfExpired(job, undefined, now);
    expect(timeout).toMatchObject({
      timedOut: true,
      job: {
        status: "timed_out",
        errorCode: "AI_TIMEOUT",
        completedAt: now.toISOString(),
      },
    });

    await refundQuota(job.userId, job.id);
    await refundQuota(job.userId, job.id);
    await expect(getQuotaSnapshot(job.userId)).resolves.toMatchObject({
      remaining: 3,
    });
  });

  it("does not time out a recently updated or completed job", async () => {
    const recent = runningJob(
      new Date(now.getTime() - TRYON_JOB_TIMEOUT_MS + 1),
    );
    const completed = { ...runningJob(), status: "succeeded" as const };

    await expect(
      timeoutStoredJobIfExpired(recent, undefined, now),
    ).resolves.toMatchObject({ timedOut: false, job: recent });
    await expect(
      timeoutStoredJobIfExpired(completed, undefined, now),
    ).resolves.toMatchObject({ timedOut: false, job: completed });
  });

  it("deletes an owned private result once and hides the deleted task", async () => {
    const job = {
      ...runningJob(),
      resultR2Key: "results/visitor_1/job_1/result.webp",
    };
    const bucket = { delete: vi.fn().mockResolvedValue(undefined) };
    await saveStoredJob(job);

    const first = await deleteOwnedJob(
      job.userId,
      job.id,
      undefined,
      bucket as never,
      now,
    );
    const second = await deleteOwnedJob(
      job.userId,
      job.id,
      undefined,
      bucket as never,
    );

    expect(first).toMatchObject({
      id: job.id,
      deletedAt: now.toISOString(),
      alreadyDeleted: false,
    });
    expect(second).toMatchObject({ alreadyDeleted: true });
    expect(bucket.delete).toHaveBeenCalledOnce();
    await expect(getStoredJobById(job.userId, job.id)).resolves.toBeUndefined();
    await expect(
      getStoredJobByIdempotencyKey(job.userId, job.idempotencyKey),
    ).resolves.toBeUndefined();
  });

  it("does not delete public reference images or another owner's task", async () => {
    const job = {
      ...runningJob(),
      resultImage: "/images/look-commute.webp",
      resultKind: "reference-fallback" as const,
    };
    const bucket = { delete: vi.fn().mockResolvedValue(undefined) };
    await saveStoredJob(job);

    await expect(
      deleteOwnedJob("visitor_other", job.id, undefined, bucket as never),
    ).resolves.toBeUndefined();
    await expect(
      deleteOwnedJob(job.userId, job.id, undefined, bucket as never),
    ).resolves.toMatchObject({ alreadyDeleted: false });
    expect(bucket.delete).not.toHaveBeenCalled();
  });

  it("deletes D1 diagnosis and derived records with private result objects", async () => {
    const DB = new JobDeletionDatabase();
    const bucket = { delete: vi.fn().mockResolvedValue(undefined) };

    const first = await deleteOwnedJob(
      "visitor_1",
      "job_1",
      DB,
      bucket as never,
      now,
    );
    const second = await deleteOwnedJob(
      "visitor_1",
      "job_1",
      DB,
      bucket as never,
    );

    expect(first).toMatchObject({
      alreadyDeleted: false,
      deletedDiagnosis: true,
    });
    expect(second).toMatchObject({ alreadyDeleted: true });
    expect(bucket.delete.mock.calls.flat()).toEqual([
      "results/visitor_1/job_1/result.webp",
      "share-cards/visitor_1/share_1.webp",
    ]);
    expect(DB.deletedDerivedRecords).toEqual([
      "diagnoses",
      "tutorials",
      "recommended_kits",
      "saved_looks",
      "share_cards",
    ]);
    expect(DB.auditResourceTypes).toEqual(["tryon_job", "diagnosis"]);
  });
});

function runningJob(
  updatedAt = new Date(now.getTime() - TRYON_JOB_TIMEOUT_MS),
): StoredTryOnJob {
  return {
    id: "job_1",
    userId: "visitor_1",
    uploadId: "upload_1",
    idempotencyKey: "request_1",
    status: "image_running",
    lookSlug: "commute",
    lookTitle: "通勤清透妆",
    createdAt: "2026-06-07T00:00:00.000Z",
    updatedAt: updatedAt.toISOString(),
  };
}

class JobDeletionDatabase implements D1DatabaseLike {
  deletedAt: string | null = null;
  diagnosisDeleted = false;
  deletedDerivedRecords: string[] = [];
  auditResourceTypes: string[] = [];

  prepare(query: string): D1StatementLike {
    return this.statement(query, []);
  }

  private statement(query: string, values: unknown[]): D1StatementLike {
    return {
      bind: (...nextValues: unknown[]) => this.statement(query, nextValues),
      first: async <T>() => {
        if (query.startsWith("SELECT id, user_id, result_json")) {
          return {
            id: "job_1",
            user_id: "visitor_1",
            result_json: JSON.stringify(runningJob()),
            result_r2_key: "results/visitor_1/job_1/result.webp",
            deleted_at: this.deletedAt,
          } as T;
        }
        if (
          query.startsWith("SELECT id FROM diagnoses") &&
          !this.diagnosisDeleted
        ) {
          return { id: "diagnosis_1" } as T;
        }
        return null;
      },
      all: async <T>() => ({
        results: [
          {
            id: "share_1",
            r2_key: "share-cards/visitor_1/share_1.webp",
          },
        ] as T[],
      }),
      run: async () => {
        const derivedDelete = query.match(
          /^DELETE FROM (diagnoses|tutorials|recommended_kits|saved_looks)/,
        )?.[1];
        if (derivedDelete) {
          this.deletedDerivedRecords.push(derivedDelete);
          if (derivedDelete === "diagnoses") this.diagnosisDeleted = true;
        }
        if (query.startsWith("UPDATE share_cards")) {
          this.deletedDerivedRecords.push("share_cards");
        }
        if (query.startsWith("UPDATE tryon_jobs")) {
          this.deletedAt = String(values[0]);
        }
        if (query.startsWith("INSERT INTO deletion_audit_records")) {
          this.auditResourceTypes.push(String(values[2]));
        }
      },
    };
  }
}
