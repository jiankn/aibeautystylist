import type { APIRoute } from "astro";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getEntitlementContext } from "../../../lib/entitlements";
import { apiError, apiSuccess } from "../../../lib/http";
import { getSavedLookLimit } from "../../../lib/plans";
import { getRuntimeBindings } from "../../../lib/runtime";
import { getStoredJobById } from "../../../lib/jobs";

interface SavedLookRow {
  id: string;
  job_id: string;
  look_slug: string;
  created_at: string;
  result_json: string | null;
}

// 获取当前用户的收藏列表
export const GET: APIRoute = async ({ cookies }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;

  const rows = await DB.prepare(
    `SELECT s.id, s.job_id, s.look_slug, s.created_at, j.result_json
     FROM saved_looks s
     INNER JOIN tryon_jobs j ON s.job_id = j.id
     WHERE s.user_id = ? AND j.deleted_at IS NULL
     ORDER BY s.created_at DESC
     LIMIT 100`,
  )
    .bind(userId)
    .all<SavedLookRow>();

  const items = (rows.results ?? []).map((row) => {
    const job = row.result_json ? JSON.parse(row.result_json) : null;
    return {
      id: row.id,
      jobId: row.job_id,
      lookSlug: row.look_slug,
      createdAt: row.created_at,
      jobDetails: job,
    };
  });

  return apiSuccess({ items });
};

interface SaveLookBody {
  jobId?: string;
  lookSlug?: string;
}

// 收藏某个试妆结果
export const POST: APIRoute = async ({ cookies, request }) => {
  const { DB } = getRuntimeBindings();
  if (!DB) {
    return apiError(
      { code: "DB_UNAVAILABLE", message: "数据库不可用", retryable: true },
      503,
    );
  }
  const auth = await requireAuthenticatedUser(cookies, DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;

  const body = (await request.json().catch(() => null)) as SaveLookBody | null;
  if (!body?.jobId || !body.lookSlug) {
    return apiError(
      {
        code: "INVALID_REQUEST",
        message: "缺少任务ID或妆容标识",
        retryable: false,
      },
      422,
    );
  }

  // 验证 job 是否存在且属于该用户
  const job = await getStoredJobById(userId, body.jobId, DB);
  if (!job) {
    return apiError(
      {
        code: "JOB_NOT_FOUND",
        message: "未找到该试妆任务或该任务不属于您",
        retryable: false,
      },
      404,
    );
  }

  if (job.status !== "succeeded") {
    return apiError(
      {
        code: "JOB_NOT_SUCCEEDED",
        message: "只能收藏已成功生成的试妆结果",
        retryable: false,
      },
      400,
    );
  }

  // 检查是否已经收藏
  const existing = await DB.prepare(
    "SELECT id FROM saved_looks WHERE user_id = ? AND job_id = ?",
  )
    .bind(userId, body.jobId)
    .first<{ id: string }>();

  if (existing) {
    return apiSuccess({
      id: existing.id,
      alreadySaved: true,
      message: "已经收藏过该妆容",
    });
  }

  const { plan } = await getEntitlementContext(userId, DB);
  const savedLimit = getSavedLookLimit(plan.planCode);
  const savedCount = await DB.prepare(
    `SELECT COUNT(*) as count
     FROM saved_looks s
     INNER JOIN tryon_jobs j ON s.job_id = j.id
     WHERE s.user_id = ? AND j.deleted_at IS NULL`,
  )
    .bind(userId)
    .first<{ count: number }>();
  const currentCount = Number(savedCount?.count ?? 0);
  if (currentCount >= savedLimit) {
    return apiError(
      {
        code: "SAVED_LOOK_LIMIT_REACHED",
        message: `当前计划最多可收藏 ${savedLimit} 个妆容结果。`,
        retryable: false,
      },
      403,
    );
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await DB.prepare(
    "INSERT INTO saved_looks (id, user_id, job_id, look_slug, created_at) VALUES (?, ?, ?, ?, ?)",
  )
    .bind(id, userId, body.jobId, body.lookSlug, createdAt)
    .run();

  return apiSuccess(
    {
      id,
      jobId: body.jobId,
      lookSlug: body.lookSlug,
      createdAt,
      message: "成功收藏该妆容",
    },
    { status: 201 },
  );
};
