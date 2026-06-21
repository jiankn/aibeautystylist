import type { APIRoute } from "astro";

import { resolveLookCatalog } from "../../../data/makeup/resolveCatalog";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";

const FAVORITE_LOOK_LIMIT = 200;

interface FavoriteLookRow {
  id: string;
  look_slug: string;
  created_at: string;
}

interface FavoriteLookBody {
  lookSlug?: string;
}

export const GET: APIRoute = async ({ cookies, locals }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const rows = await DB.prepare(
    `SELECT id, look_slug, created_at
     FROM favorite_looks
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
  )
    .bind(auth.user.id, FAVORITE_LOOK_LIMIT)
    .all<FavoriteLookRow>();

  const looksBySlug = new Map(
    resolveLookCatalog(locals.audienceContext).map((look) => [look.slug, look]),
  );
  const items = (rows.results ?? []).map((row) => ({
    id: row.id,
    lookSlug: row.look_slug,
    createdAt: row.created_at,
    lookDetails: looksBySlug.get(row.look_slug) ?? null,
  }));

  return apiSuccess({ items });
};

export const POST: APIRoute = async ({ cookies, locals, request }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;

  const body = (await request
    .json()
    .catch(() => null)) as FavoriteLookBody | null;
  const lookSlug = body?.lookSlug?.trim();
  if (!lookSlug) {
    return apiError(
      {
        code: "INVALID_REQUEST",
        message: "缺少妆容标识",
        retryable: false,
      },
      422,
    );
  }

  const look = resolveLookCatalog(locals.audienceContext).find(
    (item) => item.slug === lookSlug,
  );
  if (!look) {
    return apiError(
      {
        code: "LOOK_NOT_FOUND",
        message: "没有找到所选妆容",
        retryable: false,
      },
      404,
    );
  }

  const existing = await DB.prepare(
    "SELECT id, created_at FROM favorite_looks WHERE user_id = ? AND look_slug = ?",
  )
    .bind(auth.user.id, lookSlug)
    .first<{ id: string; created_at: string }>();

  if (existing) {
    return apiSuccess({
      id: existing.id,
      lookSlug,
      createdAt: existing.created_at,
      alreadyFavorited: true,
      lookDetails: look,
    });
  }

  const count = await DB.prepare(
    "SELECT COUNT(*) as count FROM favorite_looks WHERE user_id = ?",
  )
    .bind(auth.user.id)
    .first<{ count: number }>();
  if (Number(count?.count ?? 0) >= FAVORITE_LOOK_LIMIT) {
    return apiError(
      {
        code: "FAVORITE_LOOK_LIMIT_REACHED",
        message: `最多可收藏 ${FAVORITE_LOOK_LIMIT} 个妆容模板。`,
        retryable: false,
      },
      403,
    );
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await DB.prepare(
    "INSERT INTO favorite_looks (id, user_id, look_slug, created_at) VALUES (?, ?, ?, ?)",
  )
    .bind(id, auth.user.id, lookSlug, createdAt)
    .run();

  return apiSuccess(
    {
      id,
      lookSlug,
      createdAt,
      lookDetails: look,
    },
    { status: 201 },
  );
};
