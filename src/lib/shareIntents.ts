import type { D1DatabaseLike } from "./runtime";

export const SHARE_CLAIM_TTL_MS = 15 * 60 * 1000;

export const SHARE_INTENT_METHODS = ["web_share", "copy_link"] as const;

export type ShareIntentMethod = (typeof SHARE_INTENT_METHODS)[number];

export interface ShareClaimIntent {
  claimToken: string;
  expiresAt: string;
}

export interface ShareClaimValidation {
  ok: boolean;
  reason?: "missing" | "expired" | "claimed";
}

interface ShareIntentRow {
  id: string;
  expires_at: string;
  claimed_at: string | null;
}

interface MockShareIntent {
  id: string;
  userId: string;
  jobId: string;
  method: ShareIntentMethod;
  claimToken: string;
  createdAt: string;
  expiresAt: string;
  claimedAt?: string;
}

const mockShareIntents = new Map<string, MockShareIntent>();

export function isShareIntentMethod(
  value: unknown,
): value is ShareIntentMethod {
  return SHARE_INTENT_METHODS.includes(value as ShareIntentMethod);
}

export async function createShareClaimIntent(input: {
  userId: string;
  jobId: string;
  method: ShareIntentMethod;
  DB?: D1DatabaseLike;
  now?: Date;
  ttlMs?: number;
}): Promise<ShareClaimIntent> {
  const now = input.now ?? new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(
    now.getTime() + (input.ttlMs ?? SHARE_CLAIM_TTL_MS),
  ).toISOString();
  const claimToken = crypto.randomUUID();
  const id = crypto.randomUUID();

  if (input.DB) {
    await input.DB.prepare(
      "INSERT INTO share_intents (id, user_id, job_id, method, claim_token, created_at, expires_at, claimed_at) VALUES (?, ?, ?, ?, ?, ?, ?, NULL)",
    )
      .bind(
        id,
        input.userId,
        input.jobId,
        input.method,
        claimToken,
        createdAt,
        expiresAt,
      )
      .run();
  } else {
    mockShareIntents.set(claimToken, {
      id,
      userId: input.userId,
      jobId: input.jobId,
      method: input.method,
      claimToken,
      createdAt,
      expiresAt,
    });
  }

  return { claimToken, expiresAt };
}

export async function consumeShareClaimIntent(input: {
  userId: string;
  jobId: string;
  claimToken: string;
  DB?: D1DatabaseLike;
  now?: Date;
}): Promise<ShareClaimValidation> {
  const now = input.now ?? new Date();
  const nowIso = now.toISOString();

  if (input.DB) {
    const row = await input.DB.prepare(
      "SELECT id, expires_at, claimed_at FROM share_intents WHERE user_id = ? AND job_id = ? AND claim_token = ?",
    )
      .bind(input.userId, input.jobId, input.claimToken)
      .first<ShareIntentRow>();

    if (!row) return { ok: false, reason: "missing" };
    if (row.claimed_at) return { ok: false, reason: "claimed" };
    if (row.expires_at <= nowIso) return { ok: false, reason: "expired" };

    const result = (await input.DB.prepare(
      "UPDATE share_intents SET claimed_at = ? WHERE id = ? AND claimed_at IS NULL",
    )
      .bind(nowIso, row.id)
      .run()) as { meta?: { changes?: number } } | undefined;

    if (result?.meta?.changes === 0) {
      return { ok: false, reason: "claimed" };
    }
    return { ok: true };
  }

  const record = mockShareIntents.get(input.claimToken);
  if (
    !record ||
    record.userId !== input.userId ||
    record.jobId !== input.jobId
  ) {
    return { ok: false, reason: "missing" };
  }
  if (record.claimedAt) return { ok: false, reason: "claimed" };
  if (record.expiresAt <= nowIso) return { ok: false, reason: "expired" };
  record.claimedAt = nowIso;
  return { ok: true };
}

export function resetMockShareIntents() {
  mockShareIntents.clear();
}
