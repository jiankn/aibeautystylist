/**
 * Gemini Flash 多模态诊断 Provider
 *
 * 通过 HTTPS fetch 直接调用 Google Generative AI REST API，
 * 不引入 SDK 以保持 Cloudflare Worker 兼容性和最小 bundle 体积。
 */
import { diagnosisResponseSchema, type DiagnosisResponse } from '../../schemas/diagnosisSchema';
import type { Locale, TryOnPlan } from '../../mockTryOn';
import type { TryOnProvider } from './mockTryOnProvider';
import { buildTryOnPlan, findLookById, getAllLooks } from '../../mockTryOn';

// ─── Gemini API 配置 ───
const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
const DEFAULT_GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_REQUEST_TIMEOUT_MS = 45_000;

interface GeminiProviderOptions {
  model?: string;
  apiBase?: string;
  timeoutMs?: number;
  thinkingLevel?: string;
}

// ─── 系统提示词工厂：按 locale 强制语言一致 ───
function buildSystemPrompt(locale: Locale): string {
  if (locale === 'zh') {
    return `你是一位专业的 AI 美妆顾问。用户会上传一张素颜自拍照。

你的任务：
1. 分析用户的肤色冷暖调（undertone）、脸型、五官特征
2. 基于分析结果，为用户量身推荐 3 套不同场景的妆容方案
3. 每套方案必须包含精确的唇色 HEX 色号（基于用户肤色推荐最适合的颜色）

返回结构同英文 schema，但所有面向用户的字段（diagnosis.summary、faceNotes、reason、scenario、focus、finish、tutorialSteps、commonMistakes、selfChecks、product.category/shade/why、shareCard.cta）必须使用简体中文；id/difficulty/sku/price 等机器字段保持英文。返回纯 JSON，不要 markdown 代码块标记。`;
  }
  // English (default)
  return `You are a professional AI beauty consultant. The user uploads a bare-face selfie.

Your job:
1. Analyse undertone, face shape and key features.
2. Recommend 3 scenario-specific looks based on that analysis.
3. Each look must include an accurate lip-color HEX value chosen for the user's complexion.

Return STRICT JSON following this schema (no markdown fences, no extra prose):

{
  "diagnosis": {
    "title": "concise diagnosis title (English)",
    "summary": "2-3 sentence English summary of features and undertone",
    "faceNotes": ["3-4 actionable English notes"]
  },
  "looks": [
    {
      "id": "english-slug",
      "name": "English look name",
      "reason": "Why this look fits the user (English)",
      "scenario": "Target scenario (English)",
      "difficulty": "Beginner | Intermediate",
      "minutes": "e.g. 8 min",
      "focus": "Key focus area (English)",
      "finish": "Finish description (English)",
      "lipColor": { "hex": "#xxxxxx", "opacity": 0.35, "blendMode": "multiply" },
      "tutorialHeadline": "English tagline",
      "tutorialSteps": [
        { "title": "English step", "detail": "English detail", "avoid": "English mistake to avoid", "selfCheck": "English self-check" }
      ],
      "commonMistakes": ["English mistakes"],
      "selfChecks": ["English self-checks"],
      "kit": {
        "mustHave": [ { "sku": "code", "name": "English product name", "category": "English category", "shade": "shade name", "price": "$xx", "why": "English reason" } ],
        "optional": [],
        "upgrade": []
      }
    }
  ],
  "shareCard": {
    "title": "English share title",
    "subtitle": "English subtitle",
    "badge": "English badge",
    "hashtags": ["#English"],
    "cta": "English share CTA"
  }
}

Rules:
- 3 looks must cover distinct scenarios (e.g. commute, date, photo).
- lipColor.hex must be a real shade flattering the user's undertone (warm undertone → warm-leaning, cool undertone → cool-leaning).
- lipColor.opacity in 0.3-0.5; blendMode is "multiply".
- 4-6 tutorialSteps per look. mustHave 3 items, optional 1-2, upgrade 1-2.
- ALL user-facing copy must be English. Do not mix Chinese.
- Return JSON only. No markdown.`;
}

/**
 * 将自拍图片的 Base64 数据和场景信息发送给 Gemini，获取美妆诊断
 */
async function callGeminiApi(
  apiKey: string,
  photoBase64: string,
  scenario: string,
  experience: string,
  locale: Locale = 'en',
  options: GeminiProviderOptions = {},
): Promise<DiagnosisResponse> {
  const model = options.model?.trim() || DEFAULT_GEMINI_MODEL;
  const apiBase = options.apiBase?.trim() || DEFAULT_GEMINI_API_BASE;
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? Number(options.timeoutMs)
    : DEFAULT_REQUEST_TIMEOUT_MS;
  const url = `${apiBase}/${model}:generateContent`;

  // 构建请求体：图片 + 文字
  const userPrompt = locale === 'zh'
    ? `请分析这张素颜自拍照，用户希望获得适合"${scenario}"场景的妆容建议。用户化妆经验：${experience}。`
    : `Please analyse this bare-face selfie. The user wants makeup guidance for the "${scenario}" scenario. Their experience level is "${experience}".`;

  const imageMatch = photoBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  const mimeType = imageMatch?.[1] ?? 'image/jpeg';
  const cleanBase64 = imageMatch?.[2] ?? photoBase64;

  const requestBody = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(locale) }],
    },
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: cleanBase64,
            },
          },
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      ...(options.thinkingLevel && options.thinkingLevel.toLowerCase() !== 'none'
        ? {
            thinkingConfig: {
              thinkingLevel: options.thinkingLevel.toUpperCase(),
            },
          }
        : {}),
    },
  };

  // 带超时的请求
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const bodyStr = JSON.stringify(requestBody);

    // 开发环境：workerd 沙盒的 outbound HTTPS fetch 在 Windows 上会挂起。
    // 通过 Vite server proxy（/dev-proxy/gemini）转发请求，代理在 Node.js 中运行。
    let fetchUrl = url;
    if (import.meta.env.DEV) {
      // workerd fetch 要求绝对 URL，用 Vite 开发服务器的 localhost 地址
      const devOrigin = 'http://localhost:4322';
      fetchUrl = url.replace(
        'https://generativelanguage.googleapis.com',
        `${devOrigin}/dev-proxy/gemini`,
      );
    }
    console.log(`[GeminiProvider] Sending ${(bodyStr.length / 1024).toFixed(0)}KB to ${fetchUrl} (timeout: ${timeoutMs}ms)`);

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: bodyStr,
      signal: controller.signal,
    });

    console.log(`[GeminiProvider] Response received: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      throw new Error(`Gemini API 返回 ${response.status}: ${errorText}`);
    }

    const geminiResponse = await response.json();

    // 从 Gemini 响应中提取生成的文本
    const generatedText =
      geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('Gemini 返回结构异常：找不到 candidates[0].content.parts[0].text');
    }

    // 解析 JSON 并用 Zod 校验
    const parsed = JSON.parse(generatedText);
    const validated = diagnosisResponseSchema.safeParse(parsed);

    if (!validated.success) {
      console.error('[GeminiProvider] Zod 校验失败:', validated.error.issues);
      throw new Error(`Gemini 返回的 JSON 不符合 Schema: ${validated.error.issues.map(i => i.message).join(', ')}`);
    }

    return validated.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 将 Gemini DiagnosisResponse 转换为兼容现有前端的 TryOnPlan 格式
 * 核心变化：每个 look 多了 lipColor 字段
 */
function toTryOnPlan(response: DiagnosisResponse): TryOnPlan & { _lipColors: Record<string, { hex: string; opacity: number; blendMode: string }> } {
  const lipColors: Record<string, { hex: string; opacity: number; blendMode: string }> = {};

  const looks = response.looks.map((look) => {
    // 保存唇色数据供前端 Canvas 使用
    lipColors[look.id] = {
      hex: look.lipColor.hex,
      opacity: look.lipColor.opacity,
      blendMode: look.lipColor.blendMode,
    };

    return {
      id: look.id,
      name: look.name,
      reason: look.reason,
      scenario: look.scenario,
      difficulty: look.difficulty,
      minutes: look.minutes,
      focus: look.focus,
      finish: look.finish,
      tutorialHeadline: look.tutorialHeadline,
      tutorialSteps: look.tutorialSteps,
      commonMistakes: look.commonMistakes,
      selfChecks: look.selfChecks,
      kit: look.kit,
    };
  });

  return {
    diagnosis: response.diagnosis,
    looks,
    shareCard: response.shareCard,
    _lipColors: lipColors,
  };
}

/**
 * Gemini TryOnProvider —— 实现 TryOnProvider 接口
 * 当 AI_PROVIDER=gemini 时，由 tryOnService 路由到此 Provider
 */
export function createGeminiProvider(
  apiKey: string,
  options: GeminiProviderOptions = {},
): TryOnProvider & {
  getPlanWithPhoto: (scenario: string, experience: string, photoBase64: string, locale?: Locale) => Promise<TryOnPlan & { _lipColors: Record<string, { hex: string; opacity: number; blendMode: string }> }>;
} {
  return {
    name: 'gemini',

    // 不带照片时降级到 mock（兼容现有调用方式）
    async getPlan(scenario = 'office', locale: Locale = 'en') {
      return buildTryOnPlan(scenario, locale);
    },

    async getLookById(id, locale: Locale = 'en') {
      return findLookById(id, locale);
    },

    async listLooks(locale: Locale = 'en') {
      return getAllLooks(locale);
    },

    // 核心新能力：带照片的 AI 诊断
    async getPlanWithPhoto(scenario: string, experience: string, photoBase64: string, locale: Locale = 'en') {
      return toTryOnPlan(
        await callGeminiApi(apiKey, photoBase64, scenario, experience, locale, options),
      );
    },
  };
}
