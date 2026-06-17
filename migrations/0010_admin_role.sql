-- ============================================================================
-- 管理员角色与审计日志
-- 为 auth_accounts 新增 role 列；新增管理员操作审计表。
-- ============================================================================

-- 管理员角色：默认 'user'，管理员设为 'admin'。
ALTER TABLE auth_accounts ADD COLUMN role TEXT NOT NULL DEFAULT 'user';

-- 主管理员只允许通过 Google OAuth 登录，不保留密码登录入口。
UPDATE auth_accounts
SET role = 'admin',
    password_hash = NULL,
    password_salt = NULL,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE lower(email) = 'jiankn@gmail.com';

UPDATE auth_sessions
SET revoked_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
WHERE revoked_at IS NULL
  AND user_id IN (
    SELECT user_id
    FROM auth_accounts
    WHERE lower(email) = 'jiankn@gmail.com'
  );

-- 管理员操作审计日志（登录、改动用户状态等关键操作）。
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin_id
  ON admin_audit_logs(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at
  ON admin_audit_logs(created_at);
