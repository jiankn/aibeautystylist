import type { RuntimeEnv } from '../cloudflare/runtime';
import type { GeneratedTryOnPlan } from '../services/tryOnService';
import type { StoredUploadRef } from '../services/uploadService';

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
      input.upload.key ?? null,
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
): Promise<void> {
  const db = env?.DB;
  if (!db) return;

  await db
    .prepare('DELETE FROM tryon_jobs WHERE user_id = ?')
    .bind(userId)
    .run();
}
