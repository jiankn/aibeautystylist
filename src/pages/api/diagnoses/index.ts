import type { APIRoute } from "astro";

import { requireAuthenticatedUser } from "../../../lib/authGuard";
import { getDiagnosisRecordByJobId } from "../../../lib/diagnosisRecords";
import { apiError, apiSuccess } from "../../../lib/http";
import { getRuntimeBindings } from "../../../lib/runtime";
import { getOwnedUpload } from "../../../lib/uploadRecords";

interface DiagnosisJobRow {
  id: string;
  look_slug: string;
  status: string;
  upload_id: string;
  created_at: string;
  completed_at: string | null;
}

// 列出当前用户的诊断历史（从 tryon_jobs 中筛选有关联 diagnoses 的记录）。
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

  // 查询有诊断记录的任务。
  const rows = await DB.prepare(
    `SELECT j.id, j.look_slug, j.status, j.upload_id, j.created_at, j.completed_at
     FROM tryon_jobs j
     INNER JOIN diagnoses d ON d.job_id = j.id
     WHERE j.user_id = ? AND j.deleted_at IS NULL
     ORDER BY j.created_at DESC
     LIMIT 50`,
  )
    .bind(userId)
    .all<DiagnosisJobRow>();

  const items = await Promise.all(
    (rows.results ?? []).map(async (row) => {
      const [record, upload] = await Promise.all([
        getDiagnosisRecordByJobId(row.id, DB),
        getOwnedUpload(userId, row.upload_id, DB),
      ]);
      const originalImage =
        upload?.r2Key && !upload.deletedAt
          ? `/api/tryon-jobs/${row.id}/original`
          : undefined;
      return {
        jobId: row.id,
        lookSlug: row.look_slug,
        status: row.status,
        originalImage,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        diagnosis: record?.result ?? null,
      };
    }),
  );

  return apiSuccess({ items });
};
