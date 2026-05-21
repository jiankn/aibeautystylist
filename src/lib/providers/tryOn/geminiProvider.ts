/**
 * Gemini 3.5 Flash 多模态诊断 Provider
 *
 * 通过 HTTPS fetch 直接调用 Google Generative AI REST API，
 * 不引入 SDK 以保持 Cloudflare Worker 兼容性和最小 bundle 体积。
 */
import { diagnosisResponseSchema, type DiagnosisResponse } from '../../schemas/diagnosisSchema';
import type { TryOnPlan, TryOnLook } from '../../mockTryOn';
import type { TryOnProvider } from './mockTryOnProvider';
import { buildTryOnPlan, findLookById, getAllLooks } from '../../mockTryOn';

// ─── Gemini API 配置 ───
const GEMINI_MODEL = 'gemini-3.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 15_000;

// ─── 系统提示词：约束 AI 返回精确的美妆诊断 JSON ───
const SYSTEM_PROMPT = `你是一位专业的 AI 美妆顾问。用户会上传一张素颜自拍照。

你的任务：
1. 分析用户的肤色冷暖调（undertone）、脸型、五官特征
2. 基于分析结果，为用户量身推荐 3 套不同场景的妆容方案
3. 每套方案必须包含精确的唇色 HEX 色号（基于用户肤色推荐最适合的颜色）

你必须严格按照以下 JSON Schema 返回结果，不要在 JSON 外添加任何文字：

{
  "diagnosis": {
    "title": "简洁的肤色/脸型诊断标题（英文）",
    "summary": "对用户五官和肤色特征的中文概括（2-3 句话）",
    "faceNotes": ["3-4 条针对性的中文美妆建议"]
  },
  "looks": [
    {
      "id": "方案英文 slug（如 office-glow）",
      "name": "方案英文名",
      "reason": "为什么这个方案适合用户（中文）",
      "scenario": "适用场景（中文）",
      "difficulty": "Beginner 或 Intermediate",
      "minutes": "预计耗时（如 8 min）",
      "focus": "重点提升区域（中文）",
      "finish": "妆面质感描述（中文）",
      "lipColor": {
        "hex": "#xxxxxx（适合用户肤色的唇色 HEX 色号）",
        "opacity": 0.35,
        "blendMode": "multiply"
      },
      "tutorialHeadline": "教程标题（中文）",
      "tutorialSteps": [
        {
          "title": "步骤标题（中文）",
          "detail": "详细操作说明（中文）",
          "avoid": "常见错误提醒（中文）",
          "selfCheck": "自检方法（中文）"
        }
      ],
      "commonMistakes": ["常见错误（中文）"],
      "selfChecks": ["整体自检点（中文）"],
      "kit": {
        "mustHave": [
          {
            "sku": "商品编码",
            "name": "商品名（英文）",
            "category": "品类（中文）",
            "shade": "色号名",
            "price": "参考价格（$）",
            "why": "推荐理由（中文）"
          }
        ],
        "optional": [],
        "upgrade": []
      }
    }
  ],
  "shareCard": {
    "title": "分享卡标题（英文）",
    "subtitle": "分享卡副标题（英文）",
    "badge": "场景标签（英文）",
    "hashtags": ["#标签1", "#标签2"],
    "cta": "引导用户分享或进入教程的中文文案"
  }
}

关键要求：
- 3 套方案必须覆盖不同场景（如通勤、约会、拍照）
- 唇色 hex 必须是适合用户肤色的真实可用色号，不能随意编造
- 暖调肤色推荐暖色系唇色（偏橘/珊瑚/暖玫瑰），冷调推荐冷色系（偏莓/玫瑰/裸粉）
- lipColor.opacity 建议 0.3-0.5 之间，blendMode 使用 "multiply"
- tutorialSteps 每套方案 4-6 步
- kit.mustHave 每套方案 3 个商品，optional 1-2 个，upgrade 1-2 个
- 返回纯 JSON，不要 markdown 代码块标记`;

/**
 * 将自拍图片的 Base64 数据和场景信息发送给 Gemini，获取美妆诊断
 */
async function callGeminiApi(
  apiKey: string,
  photoBase64: string,
  scenario: string,
  experience: string,
): Promise<DiagnosisResponse> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  // 构建请求体：图片 + 文字
  const userPrompt = `请分析这张素颜自拍照，用户希望获得适合"${scenario}"场景的妆容建议。用户化妆经验水平：${experience}。`;

  // 移除可能的 data:image/xxx;base64, 前缀
  const cleanBase64 = photoBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

  const requestBody = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  // 带超时的请求
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

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
export function createGeminiProvider(apiKey: string): TryOnProvider & {
  getPlanWithPhoto: (scenario: string, experience: string, photoBase64: string) => Promise<TryOnPlan & { _lipColors: Record<string, { hex: string; opacity: number; blendMode: string }> }>;
} {
  return {
    name: 'gemini',

    // 不带照片时降级到 mock（兼容现有调用方式）
    async getPlan(scenario = 'office') {
      return buildTryOnPlan(scenario);
    },

    async getLookById(id) {
      return findLookById(id);
    },

    async listLooks() {
      return getAllLooks();
    },

    // 核心新能力：带照片的 AI 诊断
    async getPlanWithPhoto(scenario: string, experience: string, photoBase64: string) {
      return toTryOnPlan(
        await callGeminiApi(apiKey, photoBase64, scenario, experience),
      );
    },
  };
}
