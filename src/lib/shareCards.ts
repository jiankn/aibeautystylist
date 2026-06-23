import type { D1DatabaseLike } from "./runtime";

export interface PublicShareCard {
  id: string;
  userId: string;
  jobId: string;
  sourceCode: string;
  r2Key?: string;
  createdAt: string;
  deletedAt?: string;
}

interface ShareCardRow {
  id: string;
  user_id: string;
  job_id: string;
  source_code: string;
  r2_key: string | null;
  created_at: string;
  deleted_at: string | null;
}

const mockShareCardsByCode = new Map<string, PublicShareCard>();
const mockShareCardsByUserJob = new Map<string, PublicShareCard>();

function createSourceCode() {
  return crypto.randomUUID().replaceAll("-", "").slice(0, 24);
}

function rowToShareCard(row: ShareCardRow | null): PublicShareCard | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id,
    sourceCode: row.source_code,
    r2Key: row.r2_key ?? undefined,
    createdAt: row.created_at,
    deletedAt: row.deleted_at ?? undefined,
  };
}

export async function createOrGetPublicShareCard(input: {
  userId: string;
  jobId: string;
  DB?: D1DatabaseLike;
  now?: Date;
}): Promise<PublicShareCard> {
  const key = `${input.userId}:${input.jobId}`;

  if (!input.DB) {
    const existing = mockShareCardsByUserJob.get(key);
    if (existing && !existing.deletedAt) return existing;
    const createdAt = (input.now ?? new Date()).toISOString();
    const shareCard: PublicShareCard = {
      id: crypto.randomUUID(),
      userId: input.userId,
      jobId: input.jobId,
      sourceCode: createSourceCode(),
      createdAt,
    };
    mockShareCardsByCode.set(shareCard.sourceCode, shareCard);
    mockShareCardsByUserJob.set(key, shareCard);
    return shareCard;
  }

  const existing = await input.DB.prepare(
    "SELECT id, user_id, job_id, source_code, r2_key, created_at, deleted_at FROM share_cards WHERE user_id = ? AND job_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 1",
  )
    .bind(input.userId, input.jobId)
    .first<ShareCardRow>();
  const existingCard = rowToShareCard(existing);
  if (existingCard) return existingCard;

  const createdAt = (input.now ?? new Date()).toISOString();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareCard: PublicShareCard = {
      id: crypto.randomUUID(),
      userId: input.userId,
      jobId: input.jobId,
      sourceCode: createSourceCode(),
      createdAt,
    };
    try {
      await input.DB.prepare(
        "INSERT INTO share_cards (id, user_id, job_id, r2_key, source_code, created_at, deleted_at) VALUES (?, ?, ?, NULL, ?, ?, NULL)",
      )
        .bind(
          shareCard.id,
          shareCard.userId,
          shareCard.jobId,
          shareCard.sourceCode,
          shareCard.createdAt,
        )
        .run();
      return shareCard;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }

  throw new Error("SHARE_CARD_CREATE_FAILED");
}

export async function getPublicShareCardByCode(
  sourceCode: string,
  DB?: D1DatabaseLike,
): Promise<PublicShareCard | undefined> {
  if (!sourceCode) return undefined;
  if (!DB) {
    const card = mockShareCardsByCode.get(sourceCode);
    return card?.deletedAt ? undefined : card;
  }

  const row = await DB.prepare(
    "SELECT id, user_id, job_id, source_code, r2_key, created_at, deleted_at FROM share_cards WHERE source_code = ? AND deleted_at IS NULL",
  )
    .bind(sourceCode)
    .first<ShareCardRow>();
  return rowToShareCard(row);
}

export function resetMockShareCards() {
  mockShareCardsByCode.clear();
  mockShareCardsByUserJob.clear();
}
