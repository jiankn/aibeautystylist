import { z } from 'zod';

// ─── 唇色色号 Schema ───
// MVP 阶段仅提取唇色，腮红/眼影留到下一阶段
export const lipColorSchema = z.object({
  /** 唇色十六进制色号，如 "#c45a65" */
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, '唇色必须是合法的 6 位 HEX 色号'),
  /** 透明度 0-1，建议 0.3-0.6 之间以确保自然效果 */
  opacity: z.number().min(0.1).max(0.8).default(0.4),
  /** Canvas 混合模式 */
  blendMode: z.enum(['multiply', 'soft-light', 'overlay']).default('multiply'),
});

// ─── 单个 SKU 商品推荐 Schema ───
export const productSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  shade: z.string(),
  price: z.string(),
  why: z.string(),
});

// ─── 教程步骤 Schema ───
export const tutorialStepSchema = z.object({
  title: z.string(),
  detail: z.string(),
  avoid: z.string(),
  selfCheck: z.string(),
});

// ─── 单套妆容方案 Schema ───
export const lookSchema = z.object({
  id: z.string(),
  name: z.string(),
  reason: z.string(),
  scenario: z.string(),
  difficulty: z.string(),
  minutes: z.string(),
  focus: z.string(),
  finish: z.string(),
  /** MVP 阶段的核心新增字段：唇色参数，供前端 Canvas 着色 */
  lipColor: lipColorSchema,
  tutorialHeadline: z.string(),
  tutorialSteps: z.array(tutorialStepSchema).min(3).max(8),
  commonMistakes: z.array(z.string()),
  selfChecks: z.array(z.string()),
  kit: z.object({
    mustHave: z.array(productSchema),
    optional: z.array(productSchema),
    upgrade: z.array(productSchema),
  }),
});

// ─── 完整诊断返回 Schema ───
export const diagnosisResponseSchema = z.object({
  diagnosis: z.object({
    title: z.string(),
    summary: z.string(),
    faceNotes: z.array(z.string()).min(2).max(5),
  }),
  looks: z.array(lookSchema).length(3),
  shareCard: z.object({
    title: z.string(),
    subtitle: z.string(),
    badge: z.string(),
    hashtags: z.array(z.string()),
    cta: z.string(),
  }),
});

// ─── 导出类型 ───
export type LipColor = z.infer<typeof lipColorSchema>;
export type DiagnosisResponse = z.infer<typeof diagnosisResponseSchema>;
export type AiLook = z.infer<typeof lookSchema>;
