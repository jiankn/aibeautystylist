CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_usage_records_ip_action_created
  ON usage_records (ip_address, action_type, created_at);

CREATE TABLE IF NOT EXISTS tryon_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  scenario TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  source_provider TEXT NOT NULL,
  upload_provider TEXT NOT NULL,
  photo_r2_key TEXT,
  diagnosis_json TEXT NOT NULL,
  looks_json TEXT NOT NULL,
  share_card_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_tryon_jobs_created_at
  ON tryon_jobs (created_at);

CREATE INDEX IF NOT EXISTS idx_tryon_jobs_user_created
  ON tryon_jobs (user_id, created_at);
