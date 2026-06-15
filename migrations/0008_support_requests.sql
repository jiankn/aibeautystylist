CREATE TABLE IF NOT EXISTS support_requests (
  id TEXT PRIMARY KEY,
  ticket_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'zh-CN',
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_requests_email
  ON support_requests(email);

CREATE INDEX IF NOT EXISTS idx_support_requests_status_created
  ON support_requests(status, created_at);
