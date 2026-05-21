import type { APIRoute } from 'astro';
import { generateTryOnPlan } from '../../lib/services/tryOnService';

export const POST: APIRoute = async ({ request }) => {
  const payload = await request.json().catch(() => ({}));
  const result = await generateTryOnPlan({
    scenario: typeof payload.scenario === 'string' ? payload.scenario : 'office',
    experience: typeof payload.experience === 'string' ? payload.experience : 'beginner',
    hasPhoto: Boolean(payload.hasPhoto),
  });

  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};
