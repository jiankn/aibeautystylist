-- ============================================================
-- Migration 0005: 邮箱+密码登录支持
--
-- 1. users 表新增 password_hash 字段（OAuth 用户为空）
-- 2. users 表新增 email_verified_at 字段（为未来邮箱验证留位）
-- 3. 新建 password_reset_tokens 表
-- ============================================================

-- ─── 1. users 加 password_hash / email_verified_at ───────────
-- SQLite 不支持 IF NOT EXISTS 列，这里用 try/catch 友好方式：
-- 通过 wrangler d1 execute 执行时，若列已存在会报错忽略
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;

-- ─── 2. 密码重置 Token 表 ────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,                          -- UUID（用作 URL 中的 token）
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,                     -- token 的 SHA-256 哈希（避免 DB 泄漏后直接被使用）
  expires_at TEXT NOT NULL,                     -- ISO 8601 过期时间（建议 1 小时）
  used_at TEXT,                                 -- 已使用时间（NULL = 未使用）
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT                               -- 申请重置的来源 IP（审计用）
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_hash
  ON password_reset_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
  ON password_reset_tokens (expires_at);
