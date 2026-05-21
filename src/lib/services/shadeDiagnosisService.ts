import type { ShadeDiagnosisResult } from '../providers/shadeDiagnosis/mockShadeDiagnosisProvider';
import { mockShadeDiagnosisProvider } from '../providers/shadeDiagnosis/mockShadeDiagnosisProvider';

function getShadeDiagnosisProvider() {
  const providerName = import.meta.env.AI_PROVIDER ?? 'mock';

  switch (providerName) {
    case 'cloudflare-ai':
    case 'external':
      return mockShadeDiagnosisProvider;
    default:
      return mockShadeDiagnosisProvider;
  }
}

export async function getShadeDiagnosis(undertone?: string): Promise<ShadeDiagnosisResult> {
  return getShadeDiagnosisProvider().getDiagnosis(undertone);
}
