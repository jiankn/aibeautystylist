CREATE TABLE IF NOT EXISTS ai_call_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_id TEXT,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  model TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  prompt_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  estimated_cost_micros INTEGER,
  error_code TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (job_id) REFERENCES tryon_jobs(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_call_logs_user_id
  ON ai_call_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_call_logs_job_id
  ON ai_call_logs(job_id);

CREATE INDEX IF NOT EXISTS idx_ai_call_logs_created_at
  ON ai_call_logs(created_at);
