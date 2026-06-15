-- 速率限制事件表：按 IP + 动作 记录请求时间，用于滑动窗口限频。
-- 定期由 cleanup/auth 端点清除过期记录。

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key_time ON rate_limit_events(key, created_at);
