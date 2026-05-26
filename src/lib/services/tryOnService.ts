import type { Locale, TryOnLook, TryOnPlan } from '../mockTryOn';
import { mockTryOnProvider } from '../providers/tryOn/mockTryOnProvider';
import { createGeminiProvider } from '../providers/tryOn/geminiProvider';
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';
import { getLookBySlug, type LookCatalogItem } from '../../data/lookCatalog';

export interface GenerateTryOnPlanInput {
  scenario?: string;
  experience?: string;
  hasPhoto?: boolean;
  /** 前端压缩后的 Base64 自拍照数据 */
  photoBase64?: string;
  /** 用户从灵感墙或 All Looks 抽屉选择的妆容 slug */
  lookSlug?: string;
  /** P0.1: locale-aware copy. Defaults to 'en'. */
  locale?: Locale;
  /** 用户 tier，决定使用的 Gemini 模型（成本控制）：
   *  - free: GEMINI_MODEL_FREE 或 gemini-2.5-flash-lite（便宜 70%）
   *  - pro/premium: GEMINI_MODEL（标配 flash） */
  tier?: 'free' | 'pro' | 'premium';
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
    selectedLook?: {
      slug: string;
      title: string;
      tone: string;
      category: string;
    };
  };
}

/**
 * 根据环境变量 AI_PROVIDER 选择 Provider
 * tier 决定用哪个 Gemini 模型（成本控制）：
 * - free: GEMINI_MODEL_FREE（默认 gemini-2.5-flash-lite，输入 $0.10/M、输出 $0.40/M，便宜 70%）
 * - pro/premium: GEMINI_MODEL（默认 gemini-2.5-flash）
 */
function getTryOnProvider(runtimeEnv?: RuntimeEnv, tier?: 'free' | 'pro' | 'premium') {
  const providerName = getRuntimeValue(runtimeEnv, 'AI_PROVIDER') ?? import.meta.env.AI_PROVIDER ?? 'mock';
  const apiKey = getRuntimeValue(runtimeEnv, 'GEMINI_API_KEY') ?? import.meta.env.GEMINI_API_KEY;
  const timeoutValue = getRuntimeValue(runtimeEnv, 'GEMINI_TIMEOUT_MS') ?? import.meta.env.GEMINI_TIMEOUT_MS;

  // ─── 按 tier 选择模型 ───
  const standardModel = getRuntimeValue(runtimeEnv, 'GEMINI_MODEL') ?? import.meta.env.GEMINI_MODEL;
  const liteModel =
    getRuntimeValue(runtimeEnv, 'GEMINI_MODEL_FREE' as keyof RuntimeEnv) ??
    'gemini-2.5-flash-lite';
  const selectedModel = tier === 'free' ? liteModel : standardModel;

  switch (providerName) {
    case 'gemini':
      if (!apiKey) {
        console.warn('[tryOnService] AI_PROVIDER=gemini 但 GEMINI_API_KEY 未配置，降级到 mock');
        return mockTryOnProvider;
      }
      return createGeminiProvider(apiKey, {
        model: selectedModel,
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

function getSelectedLookMeta(look?: LookCatalogItem) {
  if (!look) return undefined;
  return {
    slug: look.slug,
    title: look.title,
    tone: look.tone,
    category: look.category,
  };
}

function buildScenarioPrompt(scenario: string, selectedLook?: LookCatalogItem) {
  if (!selectedLook) return scenario;
  return `${scenario}; selected inspiration look: ${selectedLook.title} (${selectedLook.tone}). Intent: ${selectedLook.intent}. Adapt it to the user's real undertone, face shape, eye shape, and experience level.`;
}

function pinSelectedLook(plan: TryOnPlan, selectedLook?: LookCatalogItem): TryOnPlan {
  if (!selectedLook || !plan.looks.length) return plan;

  const base = plan.looks[0];
  const pinnedLook: TryOnLook = {
    ...base,
    id: selectedLook.slug,
    name: selectedLook.title,
    reason: `You selected ${selectedLook.title}. Start with this ${selectedLook.tone.toLowerCase()} direction, then adjust shade intensity to your undertone and features.`,
    scenario: selectedLook.title,
    focus: selectedLook.tone,
    finish: selectedLook.intent,
    tutorialHeadline: `Make ${selectedLook.title} wearable on your own face.`,
  };

  const remainingLooks = plan.looks.filter((look) => look.id !== selectedLook.slug).slice(0, 2);
  return {
    ...plan,
    looks: [pinnedLook, ...remainingLooks].slice(0, plan.looks.length),
    shareCard: {
      ...plan.shareCard,
      title: `${selectedLook.title} plan ready`,
      subtitle: `A ${selectedLook.tone.toLowerCase()} makeup direction adapted from your selected inspiration.`,
    },
  };
}

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
  const tier = input.tier ?? 'free';
  const selectedLook = getLookBySlug(input.lookSlug);
  const selectedLookMeta = getSelectedLookMeta(selectedLook);
  const scenarioPrompt = buildScenarioPrompt(scenario, selectedLook);

  const provider = getTryOnProvider(runtimeEnv, tier);

  // 有照片 + Gemini Provider → 尝试真实 AI 诊断
  if (hasPhoto && photoBase64 && 'getPlanWithPhoto' in provider) {
    try {
      const aiPlan = await (provider as ReturnType<typeof createGeminiProvider>).getPlanWithPhoto(
        scenarioPrompt,
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
          selectedLook: selectedLookMeta,
        },
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      console.error(`[tryOnService] Gemini 调用失败，降级到 mock: ${reason}`);

      const fallbackPlan = pinSelectedLook(await mockTryOnProvider.getPlan(scenario, locale), selectedLook);
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
          selectedLook: selectedLookMeta,
        },
      };
    }
  }

  // 无照片或非 AI Provider → 直接使用 mock
  const plan = pinSelectedLook(await provider.getPlan(scenario, locale), selectedLook);
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
      selectedLook: selectedLookMeta,
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
