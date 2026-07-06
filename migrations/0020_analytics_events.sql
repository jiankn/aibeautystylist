CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  day TEXT NOT NULL,
  visitor_key TEXT,
  path TEXT,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  content TEXT,
  term TEXT,
  referrer_host TEXT,
  properties_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_day_source
  ON analytics_events(day, source);

CREATE INDEX IF NOT EXISTS idx_analytics_events_content_day
  ON analytics_events(content, day);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_day
  ON analytics_events(event_name, day);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_day
  ON analytics_events(visitor_key, day);
