CREATE TABLE IF NOT EXISTS credit_pack_orders (
  stripe_checkout_session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pack_code TEXT NOT NULL,
  credits INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'paid',
  purchased_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_credit_pack_orders_user_id
  ON credit_pack_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_credit_pack_orders_purchased_at
  ON credit_pack_orders(purchased_at);
