import type { TryOnLook, TryOnPlan } from '../mockTryOn';
import { mockTryOnProvider } from '../providers/tryOn/mockTryOnProvider';

export interface GenerateTryOnPlanInput {
  scenario?: string;
  experience?: string;
  hasPhoto?: boolean;
}

export interface GeneratedTryOnPlan extends TryOnPlan {
  meta: {
    experience: string;
    hasPhoto: boolean;
    generatedAt: string;
    provider: string;
  };
}

function getTryOnProvider() {
  const providerName = import.meta.env.AI_PROVIDER ?? 'mock';

  switch (providerName) {
    case 'cloudflare-ai':
    case 'external':
      return mockTryOnProvider;
    default:
      return mockTryOnProvider;
  }
}

export function getTryOnProviderName() {
  return getTryOnProvider().name;
}

export async function generateTryOnPlan(
  input: GenerateTryOnPlanInput = {},
): Promise<GeneratedTryOnPlan> {
  const scenario = input.scenario ?? 'office';
  const experience = input.experience ?? 'beginner';
  const hasPhoto = Boolean(input.hasPhoto);
  const provider = getTryOnProvider();
  const plan = await provider.getPlan(scenario);

  return {
    ...plan,
    meta: {
      experience,
      hasPhoto,
      generatedAt: new Date().toISOString(),
      provider: provider.name,
    },
  };
}

export async function getTryOnLookById(id?: string | null): Promise<TryOnLook | undefined> {
  return getTryOnProvider().getLookById(id);
}

export async function listTryOnLooks(): Promise<TryOnLook[]> {
  return getTryOnProvider().listLooks();
}
