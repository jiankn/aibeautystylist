import type { RuntimeEnv } from '../cloudflare/runtime';
import type { GeneratedTryOnPlan } from '../services/tryOnService';
import { deleteTryOnPhoto, type StoredUploadRef } from '../services/uploadService';

interface SaveTryOnJobInput {
  env?: RuntimeEnv;
  result: GeneratedTryOnPlan;
  scenario: string;
  experience: string;
  upload: StoredUploadRef;
  userId?: string | null;
  now?: Date;
}

export interface TryOnJobRecord {
  id: string;
  user_id: string | null;
  scenario: string;
  experience_level: string;
  source_provider: string | null;
  upload_provider: string | null;
  photo_r2_key: string | null;
  diagnosis_json: string;
  looks_json: string;
  share_card_json: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface TryOnJobSummary {
  id: string;
  scenario: string;
  experience: string;
  status: string;
  createdAt: string;
  /** 首个 look 的标题（从 looks_json 解析），用于列表卡片显示 */
  primaryLookTitle: string | null;
  /** 首个 look 的封面图（如 reference image），用于列表预览 */
  primaryLookImage: string | null;
}

export async function saveTryOnJob(input: SaveTryOnJobInput): Promise<string | null> {
  const db = input.env?.DB;
  if (!db) return null;

  const id = crypto.randomUUID();
  const now = input.now ?? new Date();
  const storedPhotoKey = input.result.meta.fallback ? null : input.upload.key ?? null;

  await db
    .prepare(
      `INSERT INTO tryon_jobs (
        id,
        user_id,
        scenario,
        experience_level,
        source_provider,
        upload_provider,
        photo_r2_key,
        diagnosis_json,
        looks_json,
        share_card_json,
        status,
        created_at,
        completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId ?? null,
      input.scenario,
      input.experience,
      input.result.meta.provider,
      input.upload.provider,
      storedPhotoKey,
      JSON.stringify(input.result.diagnosis),
      JSON.stringify(input.result.looks),
      JSON.stringify(input.result.shareCard),
      input.result.meta.fallback ? 'fallback' : 'completed',
      now.toISOString(),
      now.toISOString(),
    )
    .run();

  return id;
}

// ─── 查询：用户的试妆历史 ──────────────────────────────────────
function parseFirstLook(looksJson: string): { title: string | null; image: string | null } {
  try {
    const looks = JSON.parse(looksJson) as Array<{ title?: string; referenceImage?: string; image?: string }>;
    const first = Array.isArray(looks) ? looks[0] : undefined;
    return {
      title: first?.title ?? null,
      image: first?.referenceImage ?? first?.image ?? null,
    };
  } catch {
    return { title: null, image: null };
  }
}

export async function listJobsByUserId(
  env: RuntimeEnv | undefined,
  userId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<TryOnJobSummary[]> {
  const db = env?.DB;
  if (!db) return [];

  const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const result = await db
    .prepare(
      `SELECT id, scenario, experience_level, status, created_at, looks_json
       FROM tryon_jobs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(userId, limit, offset)
    .all<{
      id: string;
      scenario: string;
      experience_level: string;
      status: string;
      created_at: string;
      looks_json: string;
    }>();

  const rows = result.results ?? [];
  return rows.map((row) => {
    const { title, image } = parseFirstLook(row.looks_json);
    return {
      id: row.id,
      scenario: row.scenario,
      experience: row.experience_level,
      status: row.status,
      createdAt: row.created_at,
      primaryLookTitle: title,
      primaryLookImage: image,
    };
  });
}

export async function countJobsByUserId(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<number> {
  const db = env?.DB;
  if (!db) return 0;

  const row = await db
    .prepare('SELECT COUNT(*) AS count FROM tryon_jobs WHERE user_id = ?')
    .bind(userId)
    .first<{ count: number }>();

  return Number(row?.count ?? 0);
}

export async function deleteJobsByUserId(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<{ deletedPhotoKeys: string[] }> {
  const db = env?.DB;
  if (!db) return { deletedPhotoKeys: [] };

  const photoKeys = await listPhotoKeysByUserId(env, userId);
  if (photoKeys.length > 0 && !env?.USER_UPLOADS) {
    throw new Error('USER_UPLOADS binding is required before deleting stored try-on photos.');
  }

  const deletedPhotoKeys: string[] = [];
  for (const key of photoKeys) {
    const deleted = await deleteTryOnPhoto(env, key);
    if (!deleted) {
      throw new Error(`Could not delete stored try-on photo: ${key}`);
    }
    deletedPhotoKeys.push(key);
  }

  await db
    .prepare('DELETE FROM tryon_jobs WHERE user_id = ?')
    .bind(userId)
    .run();

  return { deletedPhotoKeys };
}

export async function listPhotoKeysByUserId(
  env: RuntimeEnv | undefined,
  userId: string,
): Promise<string[]> {
  const db = env?.DB;
  if (!db) return [];

  const result = await db
    .prepare(
      `SELECT photo_r2_key
       FROM tryon_jobs
       WHERE user_id = ?
         AND photo_r2_key IS NOT NULL
         AND photo_r2_key != ''`,
    )
    .bind(userId)
    .all<{ photo_r2_key: string }>();

  return Array.from(new Set(
    (result.results ?? [])
      .map((row) => row.photo_r2_key)
      .filter((key) => typeof key === 'string' && key.startsWith('tryon/')),
  ));
}

export async function cleanupStoredPhotosOlderThan(
  env: RuntimeEnv | undefined,
  options: { olderThanHours?: number; limit?: number; dryRun?: boolean } = {},
): Promise<{ cutoff: string; keys: string[]; deletedPhotoKeys: string[]; dryRun: boolean }> {
  const db = env?.DB;
  const olderThanHours = Math.max(options.olderThanHours ?? 24, 1);
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 500);
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();
  const dryRun = options.dryRun === true;
  if (!db) return { cutoff, keys: [], deletedPhotoKeys: [], dryRun };

  const result = await db
    .prepare(
      `SELECT photo_r2_key
       FROM tryon_jobs
       WHERE photo_r2_key IS NOT NULL
         AND photo_r2_key != ''
         AND created_at <= ?
       ORDER BY created_at ASC
       LIMIT ?`,
    )
    .bind(cutoff, limit)
    .all<{ photo_r2_key: string }>();

  const keys = Array.from(new Set(
    (result.results ?? [])
      .map((row) => row.photo_r2_key)
      .filter((key) => typeof key === 'string' && key.startsWith('tryon/')),
  ));

  if (dryRun || keys.length === 0) {
    return { cutoff, keys, deletedPhotoKeys: [], dryRun };
  }

  if (!env?.USER_UPLOADS) {
    throw new Error('USER_UPLOADS binding is required before deleting stored try-on photos.');
  }

  const deletedPhotoKeys: string[] = [];
  for (const key of keys) {
    const deleted = await deleteTryOnPhoto(env, key);
    if (!deleted) {
      throw new Error(`Could not delete stored try-on photo: ${key}`);
    }
    await db.prepare('UPDATE tryon_jobs SET photo_r2_key = NULL WHERE photo_r2_key = ?').bind(key).run();
    deletedPhotoKeys.push(key);
  }

  return { cutoff, keys, deletedPhotoKeys, dryRun };
}
