-- Keep failed private try-on candidates briefly for fidelity debugging, then purge from R2.
CREATE TABLE IF NOT EXISTS rejected_tryon_candidates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  attempt INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  overall_score REAL NOT NULL,
  makeup_similarity_score REAL NOT NULL,
  identity_preservation_score REAL NOT NULL,
  critical_missing_json TEXT NOT NULL,
  conflicts_json TEXT NOT NULL,
  delete_after TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE(job_id, attempt)
);

CREATE INDEX IF NOT EXISTS idx_rejected_tryon_candidates_expiry
  ON rejected_tryon_candidates(deleted_at, delete_after);

CREATE INDEX IF NOT EXISTS idx_rejected_tryon_candidates_job
  ON rejected_tryon_candidates(job_id, attempt);
