import { describe, expect, it, vi } from "vitest";

import { MAKEUP_TRANSFER_QUALITY_VERSION } from "./makeupTransfer";
import {
  cleanupExpiredRejectedTryOnCandidates,
  saveRejectedTryOnCandidate,
} from "./rejectedTryOnCandidates";
import type { D1DatabaseLike, D1StatementLike } from "./runtime";

describe("rejected try-on candidates", () => {
  it("stores a rejected image with a 24-hour deletion deadline", async () => {
    const DB = new CandidateDatabase([]);
    const bucket = {
      put: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
    };

    const candidate = await saveRejectedTryOnCandidate({
      userId: "user_1",
      jobId: "job_1",
      attempt: 1,
      imageData: new Uint8Array([1, 2]).buffer,
      contentType: "image/png",
      quality: {
        schemaVersion: MAKEUP_TRANSFER_QUALITY_VERSION,
        overallScore: 20,
        makeupSimilarityScore: 0,
        identityPreservationScore: 100,
        criticalMissing: ["reflective lid"],
        conflicts: [],
        correctionInstructions: [],
      },
      DB,
      bucket: bucket as never,
      now: new Date("2026-07-01T00:00:00.000Z"),
    });

    expect(candidate).toMatchObject({
      r2Key: "rejected-results/user_1/job_1/attempt-1.png",
      deleteAfter: "2026-07-02T00:00:00.000Z",
    });
    expect(bucket.put).toHaveBeenCalledOnce();
    expect(DB.insertedIds).toEqual(["job_1:1"]);
  });

  it("deletes expired images and marks only successful rows", async () => {
    const DB = new CandidateDatabase([
      { id: "one", r2_key: "rejected-results/one.png" },
      { id: "two", r2_key: "rejected-results/two.png" },
    ]);
    const bucket = {
      delete: vi.fn(async (key: string) => {
        if (key.endsWith("two.png")) throw new Error("R2 unavailable");
      }),
    };

    await expect(
      cleanupExpiredRejectedTryOnCandidates(
        DB,
        bucket as never,
        new Date("2026-07-03T00:00:00.000Z"),
      ),
    ).resolves.toEqual({ processed: 2, deleted: 1, failed: 1 });
    expect(DB.deletedIds).toEqual(["one"]);
  });
});

class CandidateDatabase implements D1DatabaseLike {
  insertedIds: string[] = [];
  deletedIds: string[] = [];

  constructor(private rows: Array<{ id: string; r2_key: string }>) {}

  prepare(query: string): D1StatementLike {
    return this.statement(query, []);
  }

  private statement(query: string, values: unknown[]): D1StatementLike {
    return {
      bind: (...nextValues: unknown[]) => this.statement(query, nextValues),
      first: async <T>() => null as T | null,
      all: async <T>() => ({ results: this.rows as T[] }),
      run: async () => {
        if (query.startsWith("INSERT OR REPLACE")) {
          this.insertedIds.push(String(values[0]));
        }
        if (query.startsWith("UPDATE rejected_tryon_candidates")) {
          this.deletedIds.push(String(values[1]));
        }
      },
    };
  }
}
