PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  locale TEXT NOT NULL DEFAULT 'zh-CN',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tryon_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  scenario TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  source_provider TEXT NOT NULL DEFAULT 'mock',
  upload_provider TEXT NOT NULL DEFAULT 'mock',
  photo_r2_key TEXT,
  diagnosis_json TEXT NOT NULL,
  looks_json TEXT NOT NULL,
  share_card_json TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS saved_looks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tryon_job_id TEXT,
  look_id TEXT NOT NULL,
  look_name TEXT NOT NULL,
  finish TEXT NOT NULL,
  scenario TEXT NOT NULL,
  notes TEXT,
  saved_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tryon_job_id) REFERENCES tryon_jobs(id) ON DELETE SET NULL,
  UNIQUE (user_id, look_id, tryon_job_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tryon_jobs_user_id_created_at ON tryon_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_looks_user_id_saved_at ON saved_looks(user_id, saved_at DESC);

-- 使用频次记录表（用于免费版 IP 限流：每 IP 每天 3 次 AI 诊断）
CREATE TABLE IF NOT EXISTS usage_records (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ip_address TEXT NOT NULL,
  action_type TEXT NOT NULL DEFAULT 'tryon_diagnosis',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_usage_records_ip_date ON usage_records(ip_address, created_at);

CREATE TABLE IF NOT EXISTS look_analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  anonymous_id TEXT,
  session_id TEXT NOT NULL,
  user_id TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  look_slug TEXT,
  style_slug TEXT,
  position INTEGER,
  route TEXT,
  referrer TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_look_analytics_lookup
  ON look_analytics_events (look_slug, source, event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_look_analytics_session
  ON look_analytics_events (session_id, event_name, created_at);
CREATE INDEX IF NOT EXISTS idx_look_analytics_created
  ON look_analytics_events (created_at);
