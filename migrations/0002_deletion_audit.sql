CREATE TABLE IF NOT EXISTS deletion_audit_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  r2_key TEXT,
  actor TEXT NOT NULL,
  status TEXT NOT NULL,
  error_code TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_user_id
  ON deletion_audit_records(user_id);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_resource
  ON deletion_audit_records(resource_type, resource_id);
