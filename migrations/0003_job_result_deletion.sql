ALTER TABLE tryon_jobs ADD COLUMN result_r2_key TEXT;
ALTER TABLE tryon_jobs ADD COLUMN deleted_at TEXT;

CREATE INDEX IF NOT EXISTS idx_tryon_jobs_deleted_at
  ON tryon_jobs(deleted_at);
