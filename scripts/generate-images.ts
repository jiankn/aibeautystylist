/**
 * ── 首页图片批量生成脚本 ──
 *
 * 使用 Evolink Z-Image-Turbo API 生成首页所需的 9 张美妆图片。
 *
 * 用法: npx tsx scripts/generate-images.ts
 *
 * 需要: .env 中设置 EVOLINK_API_KEY
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │ 图片规划（化妆大师 × 产品经理 × 全球化品牌视角）                  │
 * ├──────────────────────────────────────────────────────────────────┤
 * │ 目标市场: 欧美高消费为主 + 亚洲发达经济体兼顾                     │
 * │ 对标品牌: Fenty Beauty / Charlotte Tilbury / MAC 级全球美妆      │
 * │                                                                │
 * │ 肤色分布策略:                                                    │
 * │   欧美白皮  3张 (Hero1 + 通勤 + 新手)                            │
 * │   深肤色    2张 (Hero2 + 上镜)                                   │
 * │   东亚      2张 (Hero3 + 约会)                                   │
 * │   拉丁/混血 1张 (轻熟精致)                                       │
 * │   南亚      1张 (高级晚宴)                                       │
 * │                                                                │
 * │ Hero 区 × 3 张 (3:4 竖构图，负空间给标题叠加):                    │
 * │   hero-1: 欧美白皮 — 精致高级妆，Charlotte Tilbury 调性           │
 * │   hero-2: 深肤色/黑人女性 — Fenty 效应，品牌 inclusive 信号       │
 * │   hero-3: 东亚面孔 — 日韩审美方向，锁定亚洲高消费用户             │
 * │                                                                │
 * │ 灵感卡 × 6 张 (1:1 正方形):                                      │
 * │   look-1: 通勤提气色 — 欧美白皮，office culture 共鸣              │
 * │   look-2: 温柔约会   — 东亚面孔，柔莓色系最佳载体                 │
 * │   look-3: 轻熟精致   — 拉丁/混血，天然骨骼结构+精致妆             │
 * │   look-4: 上镜拍照   — 深肤色/黑人女性，高对比最惊艳              │
 * │   look-5: 新手日常   — 欧美白皮(年轻/雀斑)，全球共鸣             │
 * │   look-6: 高级晚宴   — 南亚/印度裔，浓郁+晚宴天然匹配            │
 * └──────────────────────────────────────────────────────────────────┘
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── 配置 ───
const API_KEY = process.env.EVOLINK_API_KEY || '';
const API_BASE = process.env.EVOLINK_API_BASE || 'https://api.evolink.ai/v1';
const MODEL = process.env.EVOLINK_IMAGE_MODEL || 'z-image-turbo';

if (!API_KEY || API_KEY === '你的_EVOLINK_API_KEY_填在这里') {
  console.error('❌ 请先在 .env 中设置 EVOLINK_API_KEY');
  process.exit(1);
}

// ─── 品牌级母提示词（所有图片共用）───
const BRAND_BASE = `premium beauty editorial, feminine but modern, soft luxury, aspirational yet relatable, realistic makeup detail, inclusive beauty, elegant clean background, warm refined color palette, high-end beauty campaign aesthetic, soft diffused lighting, hyper-realistic skin texture with visible pores and natural micro-imperfections, completely avoiding AI plastic or heavily airbrushed look, polished but natural, premium cosmetic brand photography`;

const NEGATIVE = `no exaggerated retouching, no plastic skin, no cartoon style, no low-resolution artifacts, no cluttered background, no text, no watermark, no extra fingers, no distorted facial features, no heavy surreal fashion makeup, no blocked face, no harsh flash look`;

// ─── 图片提示词定义 ───
interface ImageSpec {
  id: string;
  filename: string;
  /** 图片在首页的位置用途 */
  purpose: string;
  /** 化妆大师设计的完整提示词 */
  prompt: string;
  /** 宽高比 */
  size: string;
}

const images: ImageSpec[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Hero 区 × 3 (3:4 竖构图)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: 'hero-1',
    filename: 'hero-polished-elegant.webp',
    purpose: 'Hero 主视觉 — 欧美白皮·精致高级妆 (Charlotte Tilbury 调性)',
    size: '3:4',
    prompt: `27-year-old Northern European woman, fair porcelain skin with natural rosy undertone, balanced oval face with refined bone structure, honey-blonde hair styled in loose effortless waves, sophisticated and warm expression with a subtle confident smile, polished elevated everyday makeup, luminous dewy skin with realistic texture and visible pores, softly groomed arched brows with natural hair strokes, champagne-gold shimmer wash on eyelids blended into soft taupe at crease, thin brown eyeliner along upper lash line, voluminous but natural lashes, soft rosy-peach blush placed high on cheekbones, satin rose-nude lips with natural lip texture, close-up portrait from chest up, elegant clean warm ivory background with soft gradient, hero banner composition with generous negative space on the left for headline text overlay, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'hero-2',
    filename: 'hero-inclusive-glow.webp',
    purpose: 'Hero 副视觉 — 深肤色/黑人女性·光泽妆 (Fenty 效应·inclusive 品牌信号)',
    size: '3:4',
    prompt: `28-year-old Black woman, deep rich mahogany-brown skin with warm undertone, beautiful high cheekbones and strong jawline, natural coily hair styled in a sleek updo showing elegant neck, radiant and empowered expression, luminous glowing makeup that celebrates deep skin, strategically highlighted skin on cheekbones and nose bridge and cupid's bow creating a stunning glow, well-defined bold arched brows, warm bronze and copper eyeshadow with golden shimmer on center lid, precise brown-black eyeliner, sculpted cheekbones with deep berry-bronze blush, rich berry-plum satin lips with glossy finish, close-up portrait from chest up, elegant clean warm mocha-toned background with soft gradient, hero banner composition with generous negative space on the right for headline text overlay, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'hero-3',
    filename: 'hero-asian-refined.webp',
    purpose: 'Hero 副视觉 — 东亚面孔·清透精致妆 (日韩审美·锁定亚洲高消费市场)',
    size: '3:4',
    prompt: `26-year-old East Asian woman, soft oval face with delicate features, fair-neutral skin tone with warm undertone, silky straight dark hair with subtle movement and healthy shine, elegant and approachable expression with gentle confidence, refined clean beauty makeup with Japanese-Korean aesthetic, luminous glass-skin finish with subtle dewiness showing natural skin texture, softly defined straight natural brows with feathered strokes, muted rose-taupe eyeshadow blended softly at crease, thin brown eyeliner along upper lash line with slight uptick, soft muted rose blush placed high on cheekbones blending toward temples, sheer satin rose-pink lips with natural gradient, close-up portrait from chest up, elegant clean warm cream background with soft gradient, hero banner composition with generous negative space on the left for headline text overlay, ${BRAND_BASE}, ${NEGATIVE}`,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 灵感卡 × 6 (1:1 正方形)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: 'look-1',
    filename: 'look-commute.webp',
    purpose: '灵感卡 — 通勤提气色: 欧美白皮·Office culture 共鸣',
    size: '1:1',
    prompt: `30-year-old European woman with light-medium warm skin tone, natural freckles visible across nose and cheeks, auburn hair in a neat low bun, fresh and professional morning expression, minimal effortless commute makeup for work, very light coverage showing natural freckles, clean groomed natural brows, single swipe of warm taupe eyeshadow, thin eyeliner on upper lash line only, peachy-coral blush for instant freshness, sheer nude-pink lip tint, natural morning window light from side, wearing a tailored neutral blazer collar visible, clean minimal warm-toned background, square crop portrait from collarbone up, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'look-2',
    filename: 'look-date.webp',
    purpose: '灵感卡 — 温柔约会: 东亚面孔·柔莓色系最佳载体',
    size: '1:1',
    prompt: `24-year-old East Asian woman with soft delicate features, fair-neutral skin with natural warmth, loose dark hair framing face with gentle movement, gentle romantic mood and soft shy smile, soft date night makeup, translucent dewy skin with visible natural pores, softly straight natural brows with feathered texture, rosy beige eyeshadow with subtle shimmer at inner corner, thin brown eyeliner with slight uptick, soft pink-mauve blush placed naturally on apple of cheeks, blurred muted berry-rose lips with gradient effect, warm soft golden-hour style lighting creating intimate atmosphere, clean pale blush-pink background, square format close-up portrait, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'look-3',
    filename: 'look-refined.webp',
    purpose: '灵感卡 — 轻熟精致: 拉丁/混血·天然骨骼结构+精致妆容',
    size: '1:1',
    prompt: `29-year-old Latina woman with medium olive-tan skin, defined high cheekbones and balanced facial structure, dark wavy hair pulled back in a sleek low chignon showing bone structure, sophisticated self-assured expression, polished elevated makeup, luminous semi-matte skin with realistic pores and natural warmth, precisely shaped arched brows with clean edges, warm champagne-bronze eyeshadow with subtle contour at crease, fine espresso-brown eyeliner with slight wing, sculpted cheekbones with warm terracotta-rose contour blush, satin mauve-nude lips with defined lip line, clean architectural lighting with soft directional shadows, neutral warm-sand background, square format portrait, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'look-4',
    filename: 'look-photogenic.webp',
    purpose: '灵感卡 — 上镜拍照: 深肤色/黑人女性·高对比妆容最惊艳',
    size: '1:1',
    prompt: `26-year-old Black woman with deep brown skin and warm golden undertone, beautiful bone structure with prominent cheekbones, natural textured hair styled in defined curls with volume, confident camera-ready expression, enhanced photogenic makeup optimized for camera, luminous highlighted skin on high points creating dimensional glow, defined bold arched brows with natural hair texture, warm copper and bronze smoky eyeshadow gradient with gold shimmer on center lid, precise dark brown eyeliner with wing, contoured cheekbones with deep plum-bronze blush, vivid berry-wine lip color with satin finish, professional studio lighting with key light creating flattering dimension, clean neutral warm background, square format portrait, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'look-5',
    filename: 'look-beginner.webp',
    purpose: '灵感卡 — 新手日常: 欧美白皮(年轻/雀斑感)·全球低门槛共鸣',
    size: '1:1',
    prompt: `21-year-old young European woman with fair skin and natural scattered freckles, round friendly face, light brown tousled casual hair, genuine warm open smile showing confidence from simplicity, absolute beginner-friendly natural makeup, almost bare-faced but polished look, lightly tinted moisturizer as base letting freckles show through, very simple filled-in brows with light brow pencil, single neutral eyeshadow wash in soft peach, mascara only on upper lashes, clear lip gloss with hint of pink, natural healthy flush on cheeks, bright natural daylight, wearing a casual crew-neck sweater, friendly approachable expression, clean white-cream background, square format portrait, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'look-6',
    filename: 'look-evening.webp',
    purpose: '灵感卡 — 高级晚宴: 南亚/印度裔·浓郁色彩+晚宴天然匹配',
    size: '1:1',
    prompt: `30-year-old South Asian Indian woman with medium-deep warm brown skin and golden undertone, striking defined features with expressive dark eyes, thick dark hair in an elegant updo showing statement gold earrings, commanding glamorous presence, dramatic sophisticated evening gala makeup, flawless luminous skin with strategic warm highlighting on cheekbones and nose bridge, strong defined arched brows, deep burgundy-bronze smoky eye with gold shimmer on inner corner and center lid, precise black-brown eyeliner with extended wing, sculpted contour with warm deep bronze tones, deep plum-berry matte lips with precise line, moody warm studio lighting with dramatic but flattering shadows, rich dark warm background suggesting evening ambiance, square format portrait, ${BRAND_BASE}, ${NEGATIVE}`,
  },
];

// ─── 输出目录 ───
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'images', 'hero');

// ─── API 调用 ───
async function generateImage(spec: ImageSpec): Promise<string | null> {
  console.log(`\n🎨 [${spec.id}] ${spec.purpose}`);
  console.log(`   尺寸: ${spec.size} → ${spec.filename}`);

  try {
    // 步骤 1: 提交生成任务
    const createRes = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        prompt: spec.prompt,
        size: spec.size,
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error(`   ❌ 生成请求失败 (${createRes.status}): ${errText}`);
      return null;
    }

    const createData = await createRes.json() as any;

    // 如果直接返回了图片 URL
    if (createData.data?.[0]?.url) {
      const url = createData.data[0].url;
      console.log(`   ✅ 直接获得图片 URL`);
      return url;
    }

    // 如果返回了 task_id（异步模式）
    const taskId = createData.task_id || createData.id;
    if (!taskId) {
      console.error(`   ❌ 未获得 task_id 或图片 URL`, JSON.stringify(createData).slice(0, 200));
      return null;
    }

    console.log(`   ⏳ 任务已提交: ${taskId}，开始轮询...`);

    // 步骤 2: 轮询任务状态
    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 3000)); // 每 3 秒轮询

      const pollRes = await fetch(`${API_BASE}/tasks/${taskId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` },
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json() as any;
      const status = pollData.status || pollData.state;

      if (status === 'completed' || status === 'succeeded' || status === 'success') {
        const url = pollData.output?.image_url
          || pollData.data?.[0]?.url
          || pollData.result?.url
          || pollData.output?.url;
        if (url) {
          console.log(`   ✅ 生成完成!`);
          return url;
        }
      }

      if (status === 'failed' || status === 'error') {
        console.error(`   ❌ 任务失败: ${pollData.error || '未知错误'}`);
        return null;
      }

      process.stdout.write('.');
    }

    console.error(`   ❌ 轮询超时`);
    return null;
  } catch (err) {
    console.error(`   ❌ 异常:`, err);
    return null;
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
    console.log(`   💾 已保存: ${filepath}`);
    return true;
  } catch (err) {
    console.error(`   ❌ 下载失败:`, err);
    return false;
  }
}

// ─── 主流程 ───
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AI Beauty Stylist 首页图片生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`模型: ${MODEL}`);
  console.log(`输出: ${OUTPUT_DIR}`);
  console.log(`共 ${images.length} 张图片待生成\n`);

  // 创建输出目录
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const spec of images) {
    const filepath = path.join(OUTPUT_DIR, spec.filename);

    // 如果已存在则跳过
    if (fs.existsSync(filepath)) {
      console.log(`\n⏭️  [${spec.id}] 已存在，跳过: ${spec.filename}`);
      success++;
      continue;
    }

    const url = await generateImage(spec);
    if (url) {
      const ok = await downloadImage(url, filepath);
      if (ok) success++;
      else failed++;
    } else {
      failed++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 成功: ${success} / ${images.length}`);
  if (failed > 0) console.log(`❌ 失败: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main();
