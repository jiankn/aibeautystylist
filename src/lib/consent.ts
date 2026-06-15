import type { D1DatabaseLike } from "./runtime";

interface ConsentRow {
  id: string;
}

const mockConsents = new Set<string>();

export interface RecordedPhotoConsent {
  id: string;
  version: string;
  acceptedAt: string;
  persisted: boolean;
}

export async function recordPhotoConsent(
  userId: string,
  version: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<RecordedPhotoConsent> {
  const id = crypto.randomUUID();
  const acceptedAt = now.toISOString();

  if (DB) {
    await DB.prepare(
      "INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)",
    )
      .bind(userId, acceptedAt)
      .run();
    await DB.prepare(
      "INSERT INTO photo_consents (id, user_id, version, accepted_at) VALUES (?, ?, ?, ?)",
    )
      .bind(id, userId, version, acceptedAt)
      .run();
  } else {
    mockConsents.add(consentKey(userId, version));
  }

  return { id, version, acceptedAt, persisted: Boolean(DB) };
}

export async function hasValidPhotoConsent(
  userId: string,
  version: string,
  DB?: D1DatabaseLike,
): Promise<boolean> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT id FROM photo_consents WHERE user_id = ? AND version = ? AND revoked_at IS NULL ORDER BY accepted_at DESC LIMIT 1",
    )
      .bind(userId, version)
      .first<ConsentRow>();
    return Boolean(row);
  }

  return mockConsents.has(consentKey(userId, version));
}

export function resetMockConsents(): void {
  mockConsents.clear();
}

function consentKey(userId: string, version: string): string {
  return `${userId}:${version}`;
}
