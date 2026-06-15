-- Stripe Webhook 幂等去重表：每个 event id 只处理一次。
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  received_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_received_at
  ON stripe_events(received_at);

-- 用户 ↔ Stripe customer 映射：用于 Billing Portal 与复购时复用 customer。
CREATE TABLE IF NOT EXISTS stripe_customers (
  user_id TEXT PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 订阅查询按用户维度的索引（subscriptions 表已在 0001 建立）。
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);
