import type { D1DatabaseLike } from "./runtime";

export interface AiCallLog {
  id?: string;
  userId: string;
  jobId?: string;
  provider: "gemini" | "evolink";
  operation:
    | "diagnosis"
    | "image_generation"
    | "makeup_reference_analysis"
    | "makeup_transfer_quality";
  model?: string;
  status: "succeeded" | "failed";
  durationMs?: number;
  promptTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCostMicros?: number;
  errorCode?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
}

const mockAiCallLogs: Required<AiCallLog>[] = [];

export async function recordAiCall(
  log: AiCallLog,
  DB?: D1DatabaseLike,
): Promise<void> {
  const record = normalizeLog(log);

  if (DB) {
    await DB.prepare(
      "INSERT INTO ai_call_logs (id, user_id, job_id, provider, operation, model, status, duration_ms, prompt_tokens, output_tokens, total_tokens, estimated_cost_micros, error_code, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
      .bind(
        record.id,
        record.userId,
        record.jobId || null,
        record.provider,
        record.operation,
        record.model || null,
        record.status,
        nullableNumber(record.durationMs),
        nullableNumber(record.promptTokens),
        nullableNumber(record.outputTokens),
        nullableNumber(record.totalTokens),
        nullableNumber(record.estimatedCostMicros),
        record.errorCode || null,
        Object.keys(record.metadata).length
          ? JSON.stringify(record.metadata)
          : null,
        record.createdAt,
      )
      .run();
    return;
  }

  mockAiCallLogs.push(record);
}

export function getMockAiCallLogs(): Required<AiCallLog>[] {
  return [...mockAiCallLogs];
}

export function resetMockAiCallLogs(): void {
  mockAiCallLogs.length = 0;
}

function normalizeLog(log: AiCallLog): Required<AiCallLog> {
  return {
    id: log.id ?? crypto.randomUUID(),
    userId: log.userId,
    jobId: log.jobId ?? "",
    provider: log.provider,
    operation: log.operation,
    model: log.model ?? "",
    status: log.status,
    durationMs: log.durationMs ?? 0,
    promptTokens: log.promptTokens ?? 0,
    outputTokens: log.outputTokens ?? 0,
    totalTokens: log.totalTokens ?? 0,
    estimatedCostMicros: log.estimatedCostMicros ?? 0,
    errorCode: log.errorCode ?? "",
    metadata: log.metadata ?? {},
    createdAt: log.createdAt ?? new Date().toISOString(),
  };
}

function nullableNumber(value: number): number | null {
  return value === 0 ? null : value;
}
