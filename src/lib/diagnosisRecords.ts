import type { DiagnosisResult } from "./diagnosis";
import type { D1DatabaseLike } from "./runtime";

export interface StoredDiagnosisRecord {
  id: string;
  jobId: string;
  result: DiagnosisResult;
  createdAt: string;
}

const mockDiagnosisRecords = new Map<string, StoredDiagnosisRecord>();

export async function saveDiagnosisRecord(
  record: StoredDiagnosisRecord,
  DB?: D1DatabaseLike,
): Promise<void> {
  if (DB) {
    await DB.prepare(
      "INSERT OR REPLACE INTO diagnoses (id, job_id, result_json, created_at) VALUES (?, ?, ?, ?)",
    )
      .bind(
        record.id,
        record.jobId,
        JSON.stringify(record.result),
        record.createdAt,
      )
      .run();
    return;
  }

  mockDiagnosisRecords.set(record.jobId, record);
}

export async function getDiagnosisRecordByJobId(
  jobId: string,
  DB?: D1DatabaseLike,
): Promise<StoredDiagnosisRecord | undefined> {
  if (DB) {
    const row = await DB.prepare(
      "SELECT id, job_id, result_json, created_at FROM diagnoses WHERE job_id = ?",
    )
      .bind(jobId)
      .first<{
        id: string;
        job_id: string;
        result_json: string;
        created_at: string;
      }>();
    return row
      ? {
          id: row.id,
          jobId: row.job_id,
          result: JSON.parse(row.result_json) as DiagnosisResult,
          createdAt: row.created_at,
        }
      : undefined;
  }

  return mockDiagnosisRecords.get(jobId);
}

export function resetMockDiagnosisRecords(): void {
  mockDiagnosisRecords.clear();
}
