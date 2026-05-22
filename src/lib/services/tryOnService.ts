import type { Locale, TryOnLook, TryOnPlan } from '../mockTryOn';
import { mockTryOnProvider } from '../providers/tryOn/mockTryOnProvider';
import { createGeminiProvider } from '../providers/tryOn/geminiProvider';
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';

export interface GenerateTryOnPlanInput {
  scenario?: string;
  experience?: string;
  hasPhoto?: boolean;
  /** 前端压缩后的 Base64 自拍照数据 */
  photoBase64?: string;
  /** P0.1: locale-aware copy. Defaults to 'en'. */
  locale?: Locale;
}

export interface GeneratedTryOnPlan extends TryOnPlan {
  /** AI 返回的唇色参数，供前端 Canvas 着色使用（仅 AI 模式下有值） */
  _lipColors?: Record<string, { hex: string; opacity: number; blendMode: string }>;
  meta: {
    experience: string;
    hasPhoto: boolean;
    generatedAt: string;
    provider: string;
    fallback: boolean;
    fallbackReason?: string;
    locale: Locale;
  };
}

/**
 * 根据环境变量 AI_PROVIDER 选择 Provider
 */
function getTryOnProvider(runtimeEnv?: RuntimeEnv) {
  const providerName = getRuntimeValue(runtimeEnv, 'AI_PROVIDER') ?? import.meta.env.AI_PROVIDER ?? 'mock';
  const apiKey = getRuntimeValue(runtimeEnv, 'GEMINI_API_KEY') ?? import.meta.env.GEMINI_API_KEY;
  const timeoutValue = getRuntimeValue(runtimeEnv, 'GEMINI_TIMEOUT_MS') ?? import.meta.env.GEMINI_TIMEOUT_MS;

  switch (providerName) {
    case 'gemini':
      if (!apiKey) {
        console.warn('[tryOnService] AI_PROVIDER=gemini 但 GEMINI_API_KEY 未配置，降级到 mock');
        return mockTryOnProvider;
      }
      return createGeminiProvider(apiKey, {
        model: getRuntimeValue(runtimeEnv, 'GEMINI_MODEL') ?? import.meta.env.GEMINI_MODEL,
        apiBase: getRuntimeValue(runtimeEnv, 'GEMINI_API_BASE') ?? import.meta.env.GEMINI_API_BASE,
        timeoutMs: timeoutValue ? Number(timeoutValue) : undefined,
        thinkingLevel: getRuntimeValue(runtimeEnv, 'GEMINI_THINKING_LEVEL') ?? import.meta.env.GEMINI_THINKING_LEVEL,
      });
    default:
      return mockTryOnProvider;
  }
}

export function getTryOnProviderName(runtimeEnv?: RuntimeEnv) {
  return (getRuntimeValue(runtimeEnv, 'AI_PROVIDER') ?? import.meta.env.AI_PROVIDER ?? 'mock') as string;
}

const normaliseLocale = (raw?: string): Locale => (raw === 'zh' ? 'zh' : 'en');

/**
 * 生成试妆方案 —— 核心入口
 */
export async function generateTryOnPlan(
  input: GenerateTryOnPlanInput = {},
  runtimeEnv?: RuntimeEnv,
): Promise<GeneratedTryOnPlan> {
  const scenario = input.scenario ?? 'office';
  const experience = input.experience ?? 'beginner';
  const hasPhoto = Boolean(input.hasPhoto);
  const photoBase64 = input.photoBase64;
  const locale = normaliseLocale(input.locale);

  const provider = getTryOnProvider(runtimeEnv);

  // 有照片 + Gemini Provider → 尝试真实 AI 诊断
  if (hasPhoto && photoBase64 && 'getPlanWithPhoto' in provider) {
    try {
      const aiPlan = await (provider as ReturnType<typeof createGeminiProvider>).getPlanWithPhoto(
        scenario,
        experience,
        photoBase64,
        locale,
      );
      return {
        ...aiPlan,
        meta: {
          experience,
          hasPhoto: true,
          generatedAt: new Date().toISOString(),
          provider: provider.name,
          fallback: false,
          locale,
        },
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[tryOnService] Gemini 调用失败，降级到 mock: ${reason}`);

      const fallbackPlan = await mockTryOnProvider.getPlan(scenario, locale);
      return {
        ...fallbackPlan,
        meta: {
          experience,
          hasPhoto: true,
          generatedAt: new Date().toISOString(),
          provider: 'mock',
          fallback: true,
          fallbackReason: reason,
          locale,
        },
      };
    }
  }

  // 无照片或非 AI Provider → 直接使用 mock
  const plan = await provider.getPlan(scenario, locale);
  const configuredProvider = getTryOnProviderName(runtimeEnv);
  return {
    ...plan,
    meta: {
      experience,
      hasPhoto,
      generatedAt: new Date().toISOString(),
      provider: provider.name,
      fallback: provider.name === 'mock' && configuredProvider !== 'mock',
      locale,
    },
  };
}

export async function getTryOnLookById(
  id?: string | null,
  locale: Locale = 'en',
  runtimeEnv?: RuntimeEnv,
): Promise<TryOnLook | undefined> {
  return getTryOnProvider(runtimeEnv).getLookById(id, locale);
}

export async function listTryOnLooks(locale: Locale = 'en', runtimeEnv?: RuntimeEnv): Promise<TryOnLook[]> {
  return getTryOnProvider(runtimeEnv).listLooks(locale);
}
