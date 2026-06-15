import type { D1DatabaseLike } from "./runtime";

export interface AuthAccount {
  userId: string;
  email: string;
  emailVerifiedAt?: string;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthAccountRow {
  user_id: string;
  email: string;
  email_verified_at: string | null;
  password_hash: string | null;
  password_salt: string | null;
  created_at: string;
  updated_at: string;
}

export type TokenPurpose = "email_verify" | "password_reset";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getAccountByEmail(
  email: string,
  DB: D1DatabaseLike,
): Promise<AuthAccount | undefined> {
  const row = await DB.prepare(
    "SELECT user_id, email, email_verified_at, password_hash, password_salt, created_at, updated_at FROM auth_accounts WHERE email = ?",
  )
    .bind(normalizeEmail(email))
    .first<AuthAccountRow>();
  return row ? fromRow(row) : undefined;
}

export async function getAccountByUserId(
  userId: string,
  DB: D1DatabaseLike,
): Promise<AuthAccount | undefined> {
  const row = await DB.prepare(
    "SELECT user_id, email, email_verified_at, password_hash, password_salt, created_at, updated_at FROM auth_accounts WHERE user_id = ?",
  )
    .bind(userId)
    .first<AuthAccountRow>();
  return row ? fromRow(row) : undefined;
}

export async function createAccount(
  input: {
    userId: string;
    email: string;
    passwordHash?: string;
    passwordSalt?: string;
    emailVerifiedAt?: string;
  },
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<AuthAccount> {
  const timestamp = now.toISOString();
  const email = normalizeEmail(input.email);
  await DB.prepare("INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)")
    .bind(input.userId, timestamp)
    .run();
  await DB.prepare(
    "UPDATE users SET email = ? WHERE id = ? AND (email IS NULL OR email = ?)",
  )
    .bind(email, input.userId, email)
    .run();
  await DB.prepare(
    "INSERT INTO auth_accounts (user_id, email, email_verified_at, password_hash, password_salt, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      input.userId,
      email,
      input.emailVerifiedAt ?? null,
      input.passwordHash ?? null,
      input.passwordSalt ?? null,
      timestamp,
      timestamp,
    )
    .run();
  return {
    userId: input.userId,
    email,
    emailVerifiedAt: input.emailVerifiedAt,
    passwordHash: input.passwordHash,
    passwordSalt: input.passwordSalt,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function setAccountPassword(
  userId: string,
  passwordHash: string,
  passwordSalt: string,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  await DB.prepare(
    "UPDATE auth_accounts SET password_hash = ?, password_salt = ?, updated_at = ? WHERE user_id = ?",
  )
    .bind(passwordHash, passwordSalt, now.toISOString(), userId)
    .run();
}

export async function markEmailVerified(
  userId: string,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  const timestamp = now.toISOString();
  await DB.prepare(
    "UPDATE auth_accounts SET email_verified_at = ?, updated_at = ? WHERE user_id = ? AND email_verified_at IS NULL",
  )
    .bind(timestamp, timestamp, userId)
    .run();
}

export interface OAuthIdentity {
  userId: string;
  provider: string;
  providerUserId: string;
  email?: string;
}

export async function getOAuthIdentity(
  provider: string,
  providerUserId: string,
  DB: D1DatabaseLike,
): Promise<OAuthIdentity | undefined> {
  const row = await DB.prepare(
    "SELECT user_id, provider, provider_user_id, email FROM auth_oauth_identities WHERE provider = ? AND provider_user_id = ?",
  )
    .bind(provider, providerUserId)
    .first<{
      user_id: string;
      provider: string;
      provider_user_id: string;
      email: string | null;
    }>();
  return row
    ? {
        userId: row.user_id,
        provider: row.provider,
        providerUserId: row.provider_user_id,
        email: row.email ?? undefined,
      }
    : undefined;
}

export async function linkOAuthIdentity(
  input: OAuthIdentity,
  DB: D1DatabaseLike,
  now = new Date(),
): Promise<void> {
  await DB.prepare(
    "INSERT OR IGNORE INTO auth_oauth_identities (id, user_id, provider, provider_user_id, email, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(
      crypto.randomUUID(),
      input.userId,
      input.provider,
      input.providerUserId,
      input.email ?? null,
      now.toISOString(),
    )
    .run();
}

function fromRow(row: AuthAccountRow): AuthAccount {
  return {
    userId: row.user_id,
    email: row.email,
    emailVerifiedAt: row.email_verified_at ?? undefined,
    passwordHash: row.password_hash ?? undefined,
    passwordSalt: row.password_salt ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
