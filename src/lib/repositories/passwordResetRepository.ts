/**
 * Password Reset Repository — D1 CRUD
 */
import type { RuntimeEnv, D1DatabaseLike } from '../cloudflare/runtime';

export interface PasswordResetTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
  ip_address: string | null;
}

function getDb(env?: RuntimeEnv): D1DatabaseLike | null {
  return env?.DB ?? null;
}

export async function createPasswordResetToken(
  env: RuntimeEnv | undefined,
  input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress?: string;
  },
): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;

  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, ip_address)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId,
      input.tokenHash,
      input.expiresAt.toISOString(),
      input.ipAddress ?? null,
    )
    .run();

  return id;
}

export async function findValidPasswordResetToken(
  env: RuntimeEnv | undefined,
  tokenHash: string,
): Promise<PasswordResetTokenRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  const row = await db
    .prepare(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(tokenHash, new Date().toISOString())
    .first<PasswordResetTokenRecord>();

  return row ?? null;
}

export async function markPasswordResetTokenUsed(
  env: RuntimeEnv | undefined,
  tokenId: string,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), tokenId)
    .run();
}

export async function deleteExpiredPasswordResetTokens(
  env: RuntimeEnv | undefined,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('DELETE FROM password_reset_tokens WHERE expires_at <= ? OR used_at IS NOT NULL')
    .bind(new Date().toISOString())
    .run();
}
