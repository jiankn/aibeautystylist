export interface ApiErrorBody {
  code: string;
  message: string;
  retryable: boolean;
}

export function apiSuccess<T>(data: T, init?: ResponseInit): Response {
  return Response.json(
    {
      ok: true,
      data,
      requestId: crypto.randomUUID(),
    },
    init,
  );
}

export function apiError(error: ApiErrorBody, status: number): Response {
  return Response.json(
    {
      ok: false,
      error,
      requestId: crypto.randomUUID(),
    },
    { status },
  );
}
