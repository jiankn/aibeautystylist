import type { APIRoute } from 'astro';
import { getShadeDiagnosis } from '../../lib/services/shadeDiagnosisService';

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json().catch(() => ({}));
  const undertone = typeof payload.undertone === 'string' ? payload.undertone : 'cool';
  const result = await getShadeDiagnosis(undertone);

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
