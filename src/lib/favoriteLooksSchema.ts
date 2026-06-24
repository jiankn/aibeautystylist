import type { D1DatabaseLike } from "./runtime";

let favoriteLooksSchemaReady: Promise<void> | undefined;

export function ensureFavoriteLooksSchema(DB: D1DatabaseLike): Promise<void> {
  favoriteLooksSchemaReady ??= (async () => {
    await DB.prepare(
      `CREATE TABLE IF NOT EXISTS favorite_looks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        look_slug TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, look_slug)
      )`,
    ).run();
    await DB.prepare(
      `CREATE INDEX IF NOT EXISTS idx_favorite_looks_user_id
        ON favorite_looks(user_id)`,
    ).run();
  })().catch((error) => {
    favoriteLooksSchemaReady = undefined;
    throw error;
  });
  return favoriteLooksSchemaReady;
}
