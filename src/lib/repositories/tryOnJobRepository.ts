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
