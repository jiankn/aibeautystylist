CREATE TABLE IF NOT EXISTS pinterest_guest_passes (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  guest_user_id TEXT NOT NULL UNIQUE,
  source TEXT,
  utm_content TEXT,
  client_key_hash TEXT,
  user_agent_hash TEXT,
  upload_id TEXT,
  job_id TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_token
  ON pinterest_guest_passes(token_hash);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_guest_user
  ON pinterest_guest_passes(guest_user_id);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_job
  ON pinterest_guest_passes(job_id);

CREATE INDEX IF NOT EXISTS idx_pinterest_guest_passes_expires
  ON pinterest_guest_passes(expires_at);
