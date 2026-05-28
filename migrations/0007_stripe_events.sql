-- 0007: Stripe webhook 幂等表
-- 用于避免 Stripe 重发 (retry/replay) 同一 event 时重复执行权益同步逻辑。
-- webhook 处理前 INSERT OR IGNORE，命中冲突即视为已处理。
CREATE TABLE IF NOT EXISTS stripe_events (
  event_id    TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at
  ON stripe_events (created_at DESC);
