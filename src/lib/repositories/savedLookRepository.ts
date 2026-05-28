import type { RuntimeEnv } from '../cloudflare/runtime';
import { getLookBySlug } from '../../data/lookCatalog';

export interface SavedLookSummary {
  id: string;
  lookSlug: string;
  lookName: string;
  scenario: string | null;
  image: string | null;
  imageAlt: string | null;
  createdAt: string;
}

interface UpsertSavedLookInput {
  env?: RuntimeEnv;
  userId: string;
  lookSlug: string;
  now?: Date;
}

function cleanSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(trimmed) ? trimmed : null;
}

export async function listSavedLooksByUserId(
  env: RuntimeEnv | undefined,
  userId: string,
  options: { limit?: number } = {},
): Promise<SavedLookSummary[]> {
  const db = env?.DB;
  if (!db) return [];

  const limit = Math.min(Math.max(options.limit ?? 12, 1), 100);
  const result = await db
    .prepare(
      `SELECT id, look_id, look_name, scenario, look_json, created_at
       FROM saved_looks
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(userId, limit)
    .all<{
      id: string;
      look_id: string;
      look_name: string;
      scenario: string | null;
      look_json: string;
      created_at: string;
    }>()
    .catch((error) => {
      console.warn('[savedLookRepository] list failed:', error);
      return { results: [] };
    });

  return (result.results ?? []).map((row) => {
    const catalogLook = getLookBySlug(row.look_id);
    return {
      id: row.id,
      lookSlug: row.look_id,
      lookName: row.look_name,
      scenario: row.scenario,
      image: catalogLook?.image ?? readJsonString(row.look_json, 'image'),
      imageAlt: catalogLook?.imageAlt ?? readJsonString(row.look_json, 'imageAlt'),
      createdAt: row.created_at,
    };
  });
}

export async function syncSavedLooksForUser(input: {
  env?: RuntimeEnv;
  userId: string;
  lookSlugs: string[];
  now?: Date;
}): Promise<SavedLookSummary[]> {
  const uniqueSlugs = Array.from(new Set(input.lookSlugs.map(cleanSlug).filter((slug): slug is string => Boolean(slug))));
  for (const lookSlug of uniqueSlugs) {
    await upsertSavedLook({ ...input, lookSlug });
  }
  return listSavedLooksByUserId(input.env, input.userId, { limit: 24 });
}

export async function upsertSavedLook(input: UpsertSavedLookInput): Promise<boolean> {
  const db = input.env?.DB;
  const lookSlug = cleanSlug(input.lookSlug);
  if (!db || !lookSlug) return false;

  const look = getLookBySlug(lookSlug);
  const id = `${input.userId}:${lookSlug}`;
  const now = (input.now ?? new Date()).toISOString();
  const lookName = look?.title ?? lookSlug;
  const scenario = look?.scenario ?? null;
  const snapshot = JSON.stringify({
    slug: lookSlug,
    title: lookName,
    image: look?.image ?? null,
    imageAlt: look?.imageAlt ?? null,
    tone: look?.tone ?? null,
    scenario,
  });

  await db
    .prepare(
      `INSERT INTO saved_looks (id, user_id, job_id, look_id, look_name, scenario, look_json, created_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         look_name = excluded.look_name,
         scenario = excluded.scenario,
         look_json = excluded.look_json`,
    )
    .bind(id, input.userId, lookSlug, lookName, scenario, snapshot, now)
    .run()
    .catch((error) => {
      console.warn('[savedLookRepository] upsert failed:', error);
      return { success: false };
    });

  return true;
}

export async function deleteSavedLook(env: RuntimeEnv | undefined, userId: string, lookSlug: string): Promise<boolean> {
  const db = env?.DB;
  const cleaned = cleanSlug(lookSlug);
  if (!db || !cleaned) return false;

  await db
    .prepare('DELETE FROM saved_looks WHERE user_id = ? AND look_id = ?')
    .bind(userId, cleaned)
    .run()
    .catch((error) => {
      console.warn('[savedLookRepository] delete failed:', error);
      return { success: false };
    });

  return true;
}

function readJsonString(raw: string, key: string): string | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const value = parsed[key];
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
}
