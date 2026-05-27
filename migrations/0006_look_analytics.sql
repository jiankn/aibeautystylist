-- ============================================================
-- Migration 0006: 妆容转化自动评分埋点
--
-- 记录首页 / try-on / 会员链路中的 look 级事件，用于自动计算：
-- 点击率、上传率、教程继续率、注册/会员率、分享收藏率，以及 both 准入。
-- ============================================================

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
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_look_analytics_lookup
  ON look_analytics_events (look_slug, source, event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_look_analytics_session
  ON look_analytics_events (session_id, event_name, created_at);

CREATE INDEX IF NOT EXISTS idx_look_analytics_created
  ON look_analytics_events (created_at);
