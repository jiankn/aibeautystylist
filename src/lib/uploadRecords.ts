import type { D1DatabaseLike, R2BucketLike } from "./runtime";

export interface StoredUploadRecord {
  id: string;
  userId: string;
  r2Key?: string;
  status: "validated" | "stored" | "deleted";
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  orientation: number;
  deleteAfter: string;
  createdAt: string;
  deletedAt?: string;
}

export interface DeleteUploadResult {
  upload: StoredUploadRecord;
  alreadyDeleted: boolean;
}

export interface CleanupUploadsResult {
  processed: number;
  deleted: number;
  failed: number;
}

type DeleteActor = "user" | "system_retention";

interface StoredUploadRow {
  id: string;
  user_id: string;
  r2_key: string | null;
  status: StoredUploadRecord["status"];
  content_type: string;
  size_bytes: number;
  width: number;
  height: number;
  orientation: number;
  delete_after: string;
  created_at: string;
  deleted_at: string | null;
}

const mockUploads = new Map<string, StoredUploadRecord>();

export async function saveUploadRecord(
  upload: StoredUploadRecord,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (DB) {
    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(upload.userId, upload.createdAt)
      .run();
    await DB.prepare(
      "INSERT INTO uploads (id, user_id, r2_key, status, content_type, size_bytes, width, height, orientation, delete_after, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        upload.id,
        upload.userId,
        upload.r2Key ?? null,
        upload.status,
        upload.contentType,
        upload.sizeBytes,
        upload.width,
        upload.height,
        upload.orientation,
        upload.deleteAfter,
        upload.createdAt,
      )
      .run();
    return;
  }

  mockUploads.set(upload.id, upload);
}

export async function getOwnedUpload(
  userId: string,
  uploadId: string,
  DB?: D1DatabaseLike,
): Promise<StoredUploadRecord | undefined> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT id, user_id, r2_key, status, content_type, size_bytes, width, height, orientation, delete_after, created_at, deleted_at FROM uploads WHERE id = ? AND user_id = ?",
    )
      .bind(uploadId, userId)
      .first<StoredUploadRow>();
    return row ? fromRow(row) : undefined;
  }

  const upload = mockUploads.get(uploadId);
  return upload?.userId === userId ? upload : undefined;
}

export async function deleteOwnedUpload(
  userId: string,
  uploadId: string,
  DB?: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
): Promise<DeleteUploadResult | undefined> {
  const upload = await getOwnedUpload(userId, uploadId, DB);
  if (!upload) return undefined;
  if (upload.deletedAt) return { upload, alreadyDeleted: true };

  const deleted = await deleteUpload(upload, "user", DB, bucket, now);
  return { upload: deleted, alreadyDeleted: false };
}

export async function cleanupExpiredUploads(
  DB: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
  limit = 100,
): Promise<CleanupUploadsResult> {
  const rows = await DB.prepare(
    "SELECT id, user_id, r2_key, status, content_type, size_bytes, width, height, orientation, delete_after, created_at, deleted_at FROM uploads WHERE deleted_at IS NULL AND delete_after <= ? ORDER BY delete_after ASC LIMIT ?",
  )
    .bind(now.toISOString(), limit)
    .all<StoredUploadRow>();
  const uploads = (rows.results ?? []).map(fromRow);
  let deleted = 0;
  let failed = 0;

  for (const upload of uploads) {
    try {
      await deleteUpload(upload, "system_retention", DB, bucket, now);
      deleted += 1;
    } catch {
      failed += 1;
    }
  }

  return { processed: uploads.length, deleted, failed };
}

export function resetMockUploads(): void {
  mockUploads.clear();
}

async function deleteUpload(
  upload: StoredUploadRecord,
  actor: DeleteActor,
  DB?: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
): Promise<StoredUploadRecord> {
  const deletedAt = now.toISOString();

  try {
    if (upload.r2Key && !bucket) throw new Error("R2_BINDING_UNAVAILABLE");
    if (upload.r2Key) await bucket?.delete(upload.r2Key);

    if (DB) {
      await DB.prepare(
        "UPDATE uploads SET status = 'deleted', r2_key = NULL, deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
      )
        .bind(deletedAt, upload.id)
        .run();
      await writeAudit(DB, upload, actor, "succeeded", deletedAt);
    }
  } catch (error) {
    if (DB) {
      await writeAudit(
        DB,
        upload,
        actor,
        "failed",
        deletedAt,
        error instanceof Error ? error.message : "DELETE_FAILED",
      ).catch(() => undefined);
    }
    throw error;
  }

  const deleted = {
    ...upload,
    r2Key: undefined,
    status: "deleted" as const,
    deletedAt,
  };
  if (!DB) mockUploads.set(upload.id, deleted);
  return deleted;
}

async function writeAudit(
  DB: D1DatabaseLike,
  upload: StoredUploadRecord,
  actor: DeleteActor,
  status: "succeeded" | "failed",
  createdAt: string,
  errorCode?: string,
): Promise<void> {
  await DB.prepare(
    "INSERT INTO deletion_audit_records (id, user_id, resource_type, resource_id, r2_key, actor, status, error_code, created_at) VALUES (?, ?, 'upload', ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      crypto.randomUUID(),
      upload.userId,
      upload.id,
      upload.r2Key ?? null,
      actor,
      status,
      errorCode ?? null,
      createdAt,
    )
    .run();
}

function fromRow(row: StoredUploadRow): StoredUploadRecord {
  return {
    id: row.id,
    userId: row.user_id,
    r2Key: row.r2_key ?? undefined,
    status: row.status,
    contentType: row.content_type,
    sizeBytes: Number(row.size_bytes),
    width: Number(row.width),
    height: Number(row.height),
    orientation: Number(row.orientation),
    deleteAfter: row.delete_after,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}
