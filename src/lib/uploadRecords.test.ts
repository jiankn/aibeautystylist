import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  cleanupExpiredUploads,
  deleteOwnedUpload,
  getOwnedUpload,
  resetMockUploads,
  saveUploadRecord,
  type StoredUploadRecord,
} from "./uploadRecords";
import type { D1DatabaseLike, D1StatementLike } from "./runtime";

describe("upload records", () => {
  beforeEach(() => resetMockUploads());

  it("keeps upload records isolated by owner", async () => {
    const upload = uploadRecord();
    await saveUploadRecord(upload);

    await expect(getOwnedUpload(upload.userId, upload.id)).resolves.toEqual(
      upload,
    );
    await expect(getOwnedUpload("visitor_other", upload.id)).resolves.toBe(
      undefined,
    );
  });

  it("deletes the private object once and soft-deletes the record", async () => {
    const upload = uploadRecord();
    const bucket = { delete: vi.fn().mockResolvedValue(undefined) };
    await saveUploadRecord(upload);

    const first = await deleteOwnedUpload(
      upload.userId,
      upload.id,
      undefined,
      bucket as never,
      new Date("2026-06-07T02:00:00.000Z"),
    );
    const second = await deleteOwnedUpload(
      upload.userId,
      upload.id,
      undefined,
      bucket as never,
    );

    expect(first).toMatchObject({
      alreadyDeleted: false,
      upload: {
        status: "deleted",
        deletedAt: "2026-06-07T02:00:00.000Z",
      },
    });
    expect(second).toMatchObject({ alreadyDeleted: true });
    expect(bucket.delete).toHaveBeenCalledOnce();
  });

  it("does not soft-delete an R2 upload when the bucket binding is missing", async () => {
    const upload = uploadRecord();
    await saveUploadRecord(upload);

    await expect(deleteOwnedUpload(upload.userId, upload.id)).rejects.toThrow(
      "R2_BINDING_UNAVAILABLE",
    );
    await expect(getOwnedUpload(upload.userId, upload.id)).resolves.toEqual(
      upload,
    );
  });

  it("cleans expired uploads and records success and failure audits", async () => {
    const DB = new CleanupDatabase([
      uploadRow("upload_success"),
      uploadRow("upload_failure"),
    ]);
    const bucket = {
      delete: vi.fn(async (key: string) => {
        if (key.includes("upload_failure")) throw new Error("R2_UNAVAILABLE");
      }),
    };

    await expect(
      cleanupExpiredUploads(
        DB,
        bucket as never,
        new Date("2026-07-08T00:00:00.000Z"),
      ),
    ).resolves.toEqual({ processed: 2, deleted: 1, failed: 1 });
    expect(DB.deletedIds).toEqual(["upload_success"]);
    expect(DB.auditStatuses).toEqual(["succeeded", "failed"]);
  });
});

function uploadRecord(): StoredUploadRecord {
  return {
    id: "upload_1",
    userId: "visitor_1",
    r2Key: "originals/visitor_1/upload_1/original.jpg",
    status: "stored",
    contentType: "image/jpeg",
    sizeBytes: 1024,
    width: 512,
    height: 512,
    orientation: 1,
    deleteAfter: "2026-07-07T00:00:00.000Z",
    createdAt: "2026-06-07T00:00:00.000Z",
  };
}

function uploadRow(id: string) {
  return {
    id,
    user_id: "visitor_1",
    r2_key: `originals/visitor_1/${id}/original.jpg`,
    status: "stored",
    content_type: "image/jpeg",
    size_bytes: 1024,
    width: 512,
    height: 512,
    orientation: 1,
    delete_after: "2026-07-07T00:00:00.000Z",
    created_at: "2026-06-07T00:00:00.000Z",
    deleted_at: null,
  };
}

class CleanupDatabase implements D1DatabaseLike {
  deletedIds: string[] = [];
  auditStatuses: string[] = [];

  constructor(private rows: ReturnType<typeof uploadRow>[]) {}

  prepare(query: string): D1StatementLike {
    let values: unknown[] = [];
    return {
      bind: (...nextValues: unknown[]) => {
        values = nextValues;
        return this.prepareWithValues(query, values);
      },
      first: async <T>() => null as T | null,
      all: async <T>() => ({ results: this.rows as T[] }),
      run: async () => undefined,
    };
  }

  private prepareWithValues(query: string, values: unknown[]): D1StatementLike {
    return {
      bind: () => this.prepareWithValues(query, values),
      first: async <T>() => null as T | null,
      all: async <T>() => ({ results: this.rows as T[] }),
      run: async () => {
        if (query.startsWith("UPDATE uploads")) {
          this.deletedIds.push(String(values[1]));
        }
        if (query.startsWith("INSERT INTO deletion_audit_records")) {
          this.auditStatuses.push(String(values[5]));
        }
      },
    };
  }
}
