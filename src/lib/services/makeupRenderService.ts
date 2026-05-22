import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';

const DEFAULT_GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
const DEFAULT_GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_IMAGE_TIMEOUT_MS = 75_000;

export interface MakeupRenderLookInput {
  id?: string;
  name?: string;
  reason?: string;
  scenario?: string;
  focus?: string;
  finish?: string;
  tutorialHeadline?: string;
}

export interface MakeupRenderResult {
  provider: 'gemini-image' | 'none';
  model?: string;
  fallback: boolean;
  fallbackReason?: string;
  generatedAt: string;
  image?: {
    mimeType: string;
    dataUrl: string;
  };
}

function parseBase64Image(photoBase64: string): { mimeType: string; data: string } {
  const match = photoBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  return {
    mimeType: match?.[1] ?? 'image/jpeg',
    data: match?.[2] ?? photoBase64,
  };
}

function buildMakeupRenderPrompt(look: MakeupRenderLookInput, locale = 'en') {
  const name = look.name || 'personalized makeup look';
  const scenario = look.scenario || 'daily beauty';
  const focus = look.focus || 'skin, brows, eyes, cheeks, and lips';
  const finish = look.finish || 'natural polished finish';
  const reason = look.reason || look.tutorialHeadline || 'a flattering, wearable makeup look';

  if (locale === 'zh') {
    return `请基于用户上传的素颜自拍，生成一张真实自然的完整妆后预览图。

妆容名称：${name}
适用场景：${scenario}
重点区域：${focus}
妆面质感：${finish}
适合原因：${reason}

严格要求：
- 保留同一个人的身份、脸型、五官比例、发型、表情、年龄感、肤色、相机角度、背景和光线。
- 只添加真实可执行的妆容：轻薄底妆、自然遮瑕、眉眼结构、腮红、高光阴影和唇色。
- 皮肤必须保留真实纹理、毛孔和自然瑕疵，不要磨皮成塑料质感。
- 不要改变人种、年龄、脸型、发量、服装、姿势或背景。
- 不要输出文字、水印、边框或对比拼图，只输出单张妆后图。`;
  }

  return `Using the uploaded bare-face selfie as the exact source image, create one realistic full-face makeup preview.

Look name: ${name}
Scenario: ${scenario}
Focus areas: ${focus}
Finish: ${finish}
Why it fits: ${reason}

Strict requirements:
- Preserve the same person's identity, face shape, facial proportions, hairstyle, expression, apparent age, skin tone, camera angle, background, and lighting.
- Only apply realistic wearable makeup: breathable complexion, targeted concealer, brow and eye definition, blush placement, subtle highlight/contour, and lip color.
- Keep natural skin texture, pores, freckles, and micro-imperfections. Do not create plastic skin or heavy beauty-filter retouching.
- Do not change ethnicity, age, face shape, hair volume, clothing, pose, background, or camera framing.
- Return a single finished after-makeup image only. No text, watermark, border, collage, or before/after split.`;
}

export async function renderMakeupPreview(
  input: {
    photoBase64?: string;
    look?: MakeupRenderLookInput;
    locale?: string;
  },
  runtimeEnv?: RuntimeEnv,
): Promise<MakeupRenderResult> {
  const apiKey = getRuntimeValue(runtimeEnv, 'GEMINI_API_KEY') ?? import.meta.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      provider: 'none',
      fallback: true,
      fallbackReason: 'GEMINI_API_KEY is not configured.',
      generatedAt: new Date().toISOString(),
    };
  }

  if (!input.photoBase64) {
    return {
      provider: 'none',
      fallback: true,
      fallbackReason: 'Missing source photo.',
      generatedAt: new Date().toISOString(),
    };
  }

  const model =
    getRuntimeValue(runtimeEnv, 'GEMINI_IMAGE_MODEL') ??
    import.meta.env.GEMINI_IMAGE_MODEL ??
    DEFAULT_GEMINI_IMAGE_MODEL;
  const apiBase =
    getRuntimeValue(runtimeEnv, 'GEMINI_IMAGE_API_BASE') ??
    import.meta.env.GEMINI_IMAGE_API_BASE ??
    getRuntimeValue(runtimeEnv, 'GEMINI_API_BASE') ??
    import.meta.env.GEMINI_API_BASE ??
    DEFAULT_GEMINI_API_BASE;
  const timeoutValue =
    getRuntimeValue(runtimeEnv, 'GEMINI_IMAGE_TIMEOUT_MS') ??
    import.meta.env.GEMINI_IMAGE_TIMEOUT_MS;
  const timeoutMs = timeoutValue ? Number(timeoutValue) : DEFAULT_IMAGE_TIMEOUT_MS;
  const url = `${apiBase}/${model}:generateContent`;
  const sourceImage = parseBase64Image(input.photoBase64);

  const requestBody = {
    contents: [
      {
        parts: [
          { text: buildMakeupRenderPrompt(input.look ?? {}, input.locale) },
          {
            inline_data: {
              mime_type: sourceImage.mimeType,
              data: sourceImage.data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : DEFAULT_IMAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown');
      throw new Error(`Gemini image API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    const textPart = parts.find((part: Record<string, unknown>) => typeof part.text === 'string')?.text as string | undefined;
    const imagePart = parts.find((part: Record<string, unknown>) => {
      const inlineData = part.inlineData ?? part.inline_data;
      return Boolean(inlineData && typeof inlineData === 'object' && 'data' in inlineData);
    }) as Record<string, unknown> | undefined;

    const inlineData = (imagePart?.inlineData ?? imagePart?.inline_data) as
      | { mimeType?: string; mime_type?: string; data?: string }
      | undefined;

    if (!inlineData?.data) {
      throw new Error(textPart ? `Gemini did not return image data: ${textPart}` : 'Gemini did not return image data.');
    }

    const mimeType = inlineData.mimeType ?? inlineData.mime_type ?? 'image/png';
    return {
      provider: 'gemini-image',
      model,
      fallback: false,
      generatedAt: new Date().toISOString(),
      image: {
        mimeType,
        dataUrl: `data:${mimeType};base64,${inlineData.data}`,
      },
    };
  } catch (error) {
    return {
      provider: 'gemini-image',
      model,
      fallback: true,
      fallbackReason: error instanceof Error ? error.message : String(error),
      generatedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
