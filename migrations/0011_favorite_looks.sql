CREATE TABLE IF NOT EXISTS favorite_looks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  look_slug TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, look_slug)
);

CREATE INDEX IF NOT EXISTS idx_favorite_looks_user_id
  ON favorite_looks(user_id);
