/**
 * 用户 Repository — D1 CRUD 操作
 */
import type { RuntimeEnv, D1DatabaseLike } from '../cloudflare/runtime';

// ─── 类型定义 ───────────────────────────────────────────────
export interface UserRecord {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  auth_provider_id: string | null;
  locale: string;
  tier: 'free' | 'pro' | 'premium';
  stripe_customer_id: string | null;
  password_hash: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  email?: string;
  name?: string;
  avatarUrl?: string;
  authProvider: string;
  authProviderId?: string;
  locale?: string;
}

export interface CreateLocalUserInput {
  email: string;
  passwordHash: string;
  name?: string;
  locale?: string;
}

// ─── 辅助方法 ───────────────────────────────────────────────
function getDb(env?: RuntimeEnv): D1DatabaseLike | null {
  return env?.DB ?? null;
}

// ─── 创建用户 ───────────────────────────────────────────────
export async function createUser(
  env: RuntimeEnv | undefined,
  input: CreateUserInput,
): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO users (id, email, name, avatar_url, auth_provider, auth_provider_id, locale, tier, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'free', ?, ?)`,
    )
    .bind(
      id,
      input.email ?? null,
      input.name ?? null,
      input.avatarUrl ?? null,
      input.authProvider,
      input.authProviderId ?? null,
      input.locale ?? 'en',
      now,
      now,
    )
    .run();

  return id;
}

export async function createLocalUser(
  env: RuntimeEnv | undefined,
  input: CreateLocalUserInput,
): Promise<string | null> {
  const db = getDb(env);
  if (!db) return null;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO users (
        id,
        email,
        name,
        avatar_url,
        auth_provider,
        auth_provider_id,
        locale,
        tier,
        password_hash,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, NULL, 'email', NULL, ?, 'free', ?, ?, ?)`,
    )
    .bind(
      id,
      input.email,
      input.name ?? null,
      input.locale ?? 'en',
      input.passwordHash,
      now,
      now,
    )
    .run();

  return id;
}

// ─── 查询方法 ───────────────────────────────────────────────
export async function findUserById(
  env: RuntimeEnv | undefined,
  id: string,
): Promise<UserRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  return db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first<UserRecord>();
}

export async function findUserByEmail(
  env: RuntimeEnv | undefined,
  email: string,
): Promise<UserRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  return db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first<UserRecord>();
}

export async function findUserByAuthProvider(
  env: RuntimeEnv | undefined,
  provider: string,
  providerId: string,
): Promise<UserRecord | null> {
  const db = getDb(env);
  if (!db) return null;

  return db
    .prepare('SELECT * FROM users WHERE auth_provider = ? AND auth_provider_id = ?')
    .bind(provider, providerId)
    .first<UserRecord>();
}

// ─── 更新用户 ───────────────────────────────────────────────
export async function updateUserTier(
  env: RuntimeEnv | undefined,
  userId: string,
  tier: 'free' | 'pro' | 'premium',
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('UPDATE users SET tier = ?, updated_at = ? WHERE id = ?')
    .bind(tier, new Date().toISOString(), userId)
    .run();
}

export async function updateUserStripeCustomer(
  env: RuntimeEnv | undefined,
  userId: string,
  stripeCustomerId: string,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('UPDATE users SET stripe_customer_id = ?, updated_at = ? WHERE id = ?')
    .bind(stripeCustomerId, new Date().toISOString(), userId)
    .run();
}

export async function updateUserProfile(
  env: RuntimeEnv | undefined,
  userId: string,
  updates: { name?: string; avatarUrl?: string; locale?: string },
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  const sets: string[] = [];
  const values: (string | null)[] = [];

  if (updates.name !== undefined) { sets.push('name = ?'); values.push(updates.name); }
  if (updates.avatarUrl !== undefined) { sets.push('avatar_url = ?'); values.push(updates.avatarUrl); }
  if (updates.locale !== undefined) { sets.push('locale = ?'); values.push(updates.locale); }

  if (sets.length === 0) return;

  sets.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(userId);

  await db
    .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();
}

export async function updateUserPassword(
  env: RuntimeEnv | undefined,
  userId: string,
  passwordHash: string,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  await db
    .prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .bind(passwordHash, new Date().toISOString(), userId)
    .run();
}

// ─── 删除用户（级联清理）───────────────────────────────────
/**
 * 硬删除：清理用户在 D1 内的所有可识别数据。
 * PRD §15.2 要求提供「彻底删除」入口。
 *
 * 顺序很重要：先删依赖（FK 软关联），再删主表，避免孤儿数据。
 * 注意：Stripe 远端的 customer/subscription 取消逻辑在 service 层处理。
 */
export async function deleteUser(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<void> {
  const db = getDb(env);
  if (!db) return;

  // 1. usage_records
  await db.prepare('DELETE FROM usage_records WHERE user_id = ?').bind(userId).run();
  // 2. tryon_jobs
  await db.prepare('DELETE FROM tryon_jobs WHERE user_id = ?').bind(userId).run();
  // 3. saved_looks (若表不存在则忽略错误)
  try {
    await db.prepare('DELETE FROM saved_looks WHERE user_id = ?').bind(userId).run();
  } catch { /* table 不存在时静默 */ }
  // 4. subscriptions
  await db.prepare('DELETE FROM subscriptions WHERE user_id = ?').bind(userId).run();
  // 5. auth_sessions
  await db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').bind(userId).run();
  // 6. users
  await db.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
}

// ─── 查找或创建（OAuth 登录用）───────────────────────────────
export async function findOrCreateUser(
  env: RuntimeEnv | undefined,
  input: CreateUserInput,
): Promise<UserRecord | null> {
  if (!input.authProviderId) return null;

  // 先查找已有用户
  const existing = await findUserByAuthProvider(env, input.authProvider, input.authProviderId);
  if (existing) {
    // 更新头像和名称（OAuth 可能变化）
    if (input.name || input.avatarUrl) {
      await updateUserProfile(env, existing.id, {
        name: input.name,
        avatarUrl: input.avatarUrl,
      });
    }
    return existing;
  }

  // 创建新用户
  const id = await createUser(env, input);
  if (!id) return null;

  return findUserById(env, id);
}
