import type { MakeupTransferQuality } from "./makeupTransfer";
import type { D1DatabaseLike, R2BucketLike } from "./runtime";

export const REJECTED_TRYON_CANDIDATE_RETENTION_MS = 24 * 60 * 60 * 1000;

export interface RejectedTryOnCandidate {
  id: string;
  userId: string;
  jobId: string;
  attempt: number;
  r2Key: string;
  contentType: string;
  overallScore: number;
  makeupSimilarityScore: number;
  identityPreservationScore: number;
  criticalMissing: string[];
  conflicts: string[];
  deleteAfter: string;
  createdAt: string;
}

export interface CleanupRejectedTryOnCandidatesResult {
  processed: number;
  deleted: number;
  failed: number;
}

interface RejectedTryOnCandidateRow {
  id: string;
  r2_key: string;
}

export async function saveRejectedTryOnCandidate(options: {
  userId: string;
  jobId: string;
  attempt: number;
  imageData: ArrayBuffer;
  contentType: string;
  quality: MakeupTransferQuality;
  DB?: D1DatabaseLike;
  bucket?: R2BucketLike;
  now?: Date;
}): Promise<RejectedTryOnCandidate | undefined> {
  if (!options.DB || !options.bucket) return undefined;

  const createdAt = (options.now ?? new Date()).toISOString();
  const deleteAfter = new Date(
    new Date(createdAt).getTime() + REJECTED_TRYON_CANDIDATE_RETENTION_MS,
  ).toISOString();
  const id = `${options.jobId}:${options.attempt}`;
  const r2Key = `rejected-results/${options.userId}/${options.jobId}/attempt-${options.attempt}.${extensionForContentType(options.contentType)}`;
  const candidate: RejectedTryOnCandidate = {
    id,
    userId: options.userId,
    jobId: options.jobId,
    attempt: options.attempt,
    r2Key,
    contentType: options.contentType,
    overallScore: options.quality.overallScore,
    makeupSimilarityScore: options.quality.makeupSimilarityScore,
    identityPreservationScore: options.quality.identityPreservationScore,
    criticalMissing: options.quality.criticalMissing,
    conflicts: options.quality.conflicts,
    deleteAfter,
    createdAt,
  };

  await options.bucket.put(r2Key, options.imageData, {
    httpMetadata: { contentType: options.contentType },
    customMetadata: {
      userId: options.userId,
      jobId: options.jobId,
      attempt: String(options.attempt),
      retention: "24h",
      purpose: "makeup-fidelity-debugging",
    },
  });

  try {
    await options.DB.prepare(
      "INSERT OR REPLACE INTO rejected_tryon_candidates (id, user_id, job_id, attempt, r2_key, content_type, overall_score, makeup_similarity_score, identity_preservation_score, critical_missing_json, conflicts_json, delete_after, created_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)",
    )
      .bind(
        candidate.id,
        candidate.userId,
        candidate.jobId,
        candidate.attempt,
        candidate.r2Key,
        candidate.contentType,
        candidate.overallScore,
        candidate.makeupSimilarityScore,
        candidate.identityPreservationScore,
        JSON.stringify(candidate.criticalMissing),
        JSON.stringify(candidate.conflicts),
        candidate.deleteAfter,
        candidate.createdAt,
      )
      .run();
  } catch (error) {
    await options.bucket.delete(r2Key).catch(() => undefined);
    throw error;
  }

  return candidate;
}

export async function cleanupExpiredRejectedTryOnCandidates(
  DB: D1DatabaseLike,
  bucket?: R2BucketLike,
  now = new Date(),
  limit = 100,
): Promise<CleanupRejectedTryOnCandidatesResult> {
  const rows = await DB.prepare(
    "SELECT id, r2_key FROM rejected_tryon_candidates WHERE deleted_at IS NULL AND delete_after <= ? ORDER BY delete_after ASC LIMIT ?",
  )
    .bind(now.toISOString(), limit)
    .all<RejectedTryOnCandidateRow>();
  const candidates = rows.results ?? [];
  let deleted = 0;
  let failed = 0;

  for (const candidate of candidates) {
    try {
      if (!bucket) throw new Error("R2_BINDING_UNAVAILABLE");
      await bucket.delete(candidate.r2_key);
      await DB.prepare(
        "UPDATE rejected_tryon_candidates SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
      )
        .bind(now.toISOString(), candidate.id)
        .run();
      deleted += 1;
    } catch {
      failed += 1;
    }
  }

  return { processed: candidates.length, deleted, failed };
}

function extensionForContentType(contentType: string): string {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  return "png";
}
