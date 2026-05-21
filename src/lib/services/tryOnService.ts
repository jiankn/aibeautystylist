import type { TryOnLook, TryOnPlan } from '../mockTryOn';
import { mockTryOnProvider } from '../providers/tryOn/mockTryOnProvider';
import { createGeminiProvider } from '../providers/tryOn/geminiProvider';

export interface GenerateTryOnPlanInput {
  scenario?: string;
  experience?: string;
  hasPhoto?: boolean;
  /** 前端压缩后的 Base64 自拍照数据 */
  photoBase64?: string;
}

export interface GeneratedTryOnPlan extends TryOnPlan {
  /** AI 返回的唇色参数，供前端 Canvas 着色使用（仅 AI 模式下有值） */
  _lipColors?: Record<string, { hex: string; opacity: number; blendMode: string }>;
  meta: {
    experience: string;
    hasPhoto: boolean;
    generatedAt: string;
    provider: string;
    /** 是否因为 AI 调用失败而降级到了 mock 数据 */
    fallback: boolean;
    /** 降级原因（仅 fallback=true 时有值） */
    fallbackReason?: string;
  };
}

/**
 * 根据环境变量 AI_PROVIDER 选择 Provider
 * 当前仅支持 gemini 和 mock，未来可扩展 claude / openai
 */
function getTryOnProvider(apiKey?: string) {
  const providerName = import.meta.env.AI_PROVIDER ?? 'mock';

  switch (providerName) {
    case 'gemini':
      if (!apiKey) {
        console.warn('[tryOnService] AI_PROVIDER=gemini 但 GEMINI_API_KEY 未配置，降级到 mock');
        return mockTryOnProvider;
      }
      return createGeminiProvider(apiKey);
    // 未来扩展：
    // case 'claude': return createClaudeProvider(apiKey);
    default:
      return mockTryOnProvider;
  }
}

export function getTryOnProviderName() {
  return (import.meta.env.AI_PROVIDER ?? 'mock') as string;
}

/**
 * 生成试妆方案 —— 核心入口
 *
 * 逻辑：
 * 1. 如果有照片 + AI Provider → 调用真实 AI 诊断
 * 2. AI 调用失败 → 优雅降级到 mock 数据，标记 meta.fallback=true
 * 3. 无照片 → 直接使用 mock 数据
 */
export async function generateTryOnPlan(
  input: GenerateTryOnPlanInput = {},
): Promise<GeneratedTryOnPlan> {
  const scenario = input.scenario ?? 'office';
  const experience = input.experience ?? 'beginner';
  const hasPhoto = Boolean(input.hasPhoto);
  const photoBase64 = input.photoBase64;

  const apiKey = import.meta.env.GEMINI_API_KEY as string | undefined;
  const provider = getTryOnProvider(apiKey);

  // 有照片 + Gemini Provider → 尝试真实 AI 诊断
  if (hasPhoto && photoBase64 && 'getPlanWithPhoto' in provider) {
    try {
      const aiPlan = await provider.getPlanWithPhoto(scenario, experience, photoBase64);
      return {
        ...aiPlan,
        meta: {
          experience,
          hasPhoto: true,
          generatedAt: new Date().toISOString(),
          provider: provider.name,
          fallback: false,
        },
      };
    } catch (error) {
      // AI 调用失败，优雅降级到 mock
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[tryOnService] Gemini 调用失败，降级到 mock: ${reason}`);

      const fallbackPlan = await mockTryOnProvider.getPlan(scenario);
      return {
        ...fallbackPlan,
        meta: {
          experience,
          hasPhoto: true,
          generatedAt: new Date().toISOString(),
          provider: 'mock',
          fallback: true,
          fallbackReason: reason,
        },
      };
    }
  }

  // 无照片或非 AI Provider → 直接使用 mock
  const plan = await provider.getPlan(scenario);
  return {
    ...plan,
    meta: {
      experience,
      hasPhoto,
      generatedAt: new Date().toISOString(),
      provider: provider.name,
      fallback: provider.name === 'mock' && (import.meta.env.AI_PROVIDER ?? 'mock') !== 'mock',
    },
  };
}

export async function getTryOnLookById(id?: string | null): Promise<TryOnLook | undefined> {
  const apiKey = import.meta.env.GEMINI_API_KEY as string | undefined;
  return getTryOnProvider(apiKey).getLookById(id);
}

export async function listTryOnLooks(): Promise<TryOnLook[]> {
  const apiKey = import.meta.env.GEMINI_API_KEY as string | undefined;
  return getTryOnProvider(apiKey).listLooks();
}
