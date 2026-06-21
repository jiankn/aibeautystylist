CREATE TABLE IF NOT EXISTS share_intents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  method TEXT NOT NULL,
  claim_token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  claimed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES tryon_jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_share_intents_user_job
  ON share_intents(user_id, job_id);

CREATE INDEX IF NOT EXISTS idx_share_intents_expires_at
  ON share_intents(expires_at);
