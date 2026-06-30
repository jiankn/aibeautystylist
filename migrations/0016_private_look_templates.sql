-- Premium 私有参考妆容。参考图保存在私有 R2，只有所属用户可读取。
CREATE TABLE IF NOT EXISTS private_look_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_private_look_templates_user_created
  ON private_look_templates(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_private_look_templates_user_status
  ON private_look_templates(user_id, status);

ALTER TABLE tryon_jobs ADD COLUMN private_template_id TEXT;

CREATE INDEX IF NOT EXISTS idx_tryon_jobs_private_template
  ON tryon_jobs(private_template_id);
