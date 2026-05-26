/**
 * ── 扩展图片批量生成脚本 ──
 *
 * 生成 PRD §10/§12 要求的剩余图片：
 * - 场景入口图 ×6（补缺的场景页 Hero）
 * - 信任/多样性图 ×12（4 肤色 × 3 脸型，用于首页信任区）
 *
 * 用法: npx tsx scripts/generate-images-extended.ts
 * 需要: .env 中设置 EVOLINK_API_KEY
 */

import * as fs from 'fs';
import * as path from 'path';

const API_KEY = process.env.EVOLINK_API_KEY || '';
const API_BASE = process.env.EVOLINK_API_BASE || 'https://api.evolink.ai/v1';
const MODEL = process.env.EVOLINK_IMAGE_MODEL || 'z-image-turbo';

if (!API_KEY) {
  console.error('❌ 请先在 .env 中设置 EVOLINK_API_KEY');
  process.exit(1);
}

const BRAND_BASE = `premium beauty editorial, feminine but modern, soft luxury, aspirational yet relatable, realistic makeup detail, inclusive beauty, elegant clean background, warm refined color palette, high-end beauty campaign aesthetic, soft diffused lighting, hyper-realistic skin texture with visible pores and natural micro-imperfections, polished but natural, premium cosmetic brand photography`;
const NEGATIVE = `no exaggerated retouching, no plastic skin, no cartoon style, no low-resolution artifacts, no cluttered background, no text, no watermark, no extra fingers, no distorted facial features, no heavy surreal fashion makeup`;

interface ImageSpec {
  id: string;
  filename: string;
  purpose: string;
  prompt: string;
  size: string;
  outputDir: string;
}

const images: ImageSpec[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 场景入口图 × 6 (4:3 横构图)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  {
    id: 'scenario-interview',
    filename: 'scenario-interview.webp',
    purpose: '场景入口 — 面试妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `28-year-old professional woman with medium skin tone, composed confident expression, structured interview-appropriate makeup, clean defined brows, subtle taupe eye, matte rose-nude lip, wearing a navy blazer, corporate office lobby with soft natural light in background blurred, portrait from shoulders up, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'scenario-wedding-guest',
    filename: 'scenario-wedding-guest.webp',
    purpose: '场景入口 — 婚礼嘉宾妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `27-year-old woman with warm medium skin, elegant wedding guest makeup, soft champagne shimmer eye, rosy flush on cheeks, satin berry-rose lip, hair styled in loose romantic waves, wearing a pastel floral dress with delicate jewelry, outdoor garden party atmosphere with soft bokeh greenery, portrait from chest up, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'scenario-everyday',
    filename: 'scenario-everyday.webp',
    purpose: '场景入口 — 日常自然妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `25-year-old approachable woman with fair skin and natural freckles, effortless fresh-faced everyday makeup, barely-there base showing freckles, groomed natural brows, single swipe of soft peach eyeshadow, clear lip gloss, casual cozy sweater, bright morning kitchen light with warm tones, relaxed genuine smile, portrait from shoulders up, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'scenario-zoom',
    filename: 'scenario-zoom.webp',
    purpose: '场景入口 — Zoom 会议妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `31-year-old professional woman with light-medium skin, video-call optimized makeup, slightly enhanced brows and lash definition for camera clarity, subtle contour for flat screen dimension, matte rose-nude lip, natural but camera-ready skin finish, sitting at a clean desk with laptop glow on face, modern home office background softly blurred, looking slightly to camera, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'scenario-mature',
    filename: 'scenario-mature.webp',
    purpose: '场景入口 — 成熟减龄妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `48-year-old elegant woman with fair-medium skin and graceful aging features, refined age-appropriate makeup, luminous skin with strategic highlighting avoiding texture emphasis, soft filled brows, matte taupe eye with subtle cream shimmer on center lid, cream blush for youthful lift, satin rose-mauve lip, silver-grey hair styled elegantly, warm soft natural light, confident warm expression, portrait from shoulders up, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'scenario-hooded-eyes',
    filename: 'scenario-hooded-eyes.webp',
    purpose: '场景入口 — 内双/单眼皮妆',
    outputDir: 'scenarios',
    size: '4:3',
    prompt: `26-year-old East Asian woman with monolid/hooded eyes, demonstrating eye-opening makeup technique, gradient eyeshadow placed above the natural crease line to show color when eyes open, thin precise eyeliner, curled lashes creating lift, soft dewy skin, natural pink lip, close-up emphasis on eye area to show technique, clean warm background, ${BRAND_BASE}, ${NEGATIVE}`,
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 信任/多样性图 × 12 (1:1, 用于首页信任区)
  // 4 肤色 × 3 脸型
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Fair skin
  {
    id: 'trust-fair-oval',
    filename: 'trust-fair-oval.webp',
    purpose: '信任区 — 白皮·椭圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `24-year-old woman with fair cool-toned skin and oval face shape, natural minimal makeup showing AI recommendation result, soft nude-pink lip and light brown mascara, clean simple headshot, genuine warm smile, neutral cream background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-fair-round',
    filename: 'trust-fair-round.webp',
    purpose: '信任区 — 白皮·圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `22-year-old woman with fair warm-toned skin and round soft face shape, natural fresh makeup showing AI recommendation result, peachy blush and glossy lip, clean simple headshot, happy genuine expression, neutral cream background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-fair-angular',
    filename: 'trust-fair-angular.webp',
    purpose: '信任区 — 白皮·方脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `27-year-old woman with fair neutral skin and angular square jaw face shape, polished makeup with soft contour showing AI recommendation, matte rose lip and defined brows, clean simple headshot, confident expression, neutral cream background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },

  // Medium skin
  {
    id: 'trust-medium-oval',
    filename: 'trust-medium-oval.webp',
    purpose: '信任区 — 中等肤色·椭圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `26-year-old Latina woman with medium olive skin and oval face, natural warm makeup with terracotta blush and nude-mauve lip showing AI recommendation, clean simple headshot, warm genuine smile, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-medium-round',
    filename: 'trust-medium-round.webp',
    purpose: '信任区 — 中等肤色·圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `25-year-old East Asian woman with medium warm skin and round soft face, fresh dewy makeup with pink blush and berry tint lip showing AI recommendation, clean simple headshot, gentle smile, neutral cream background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-medium-angular',
    filename: 'trust-medium-angular.webp',
    purpose: '信任区 — 中等肤色·方脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `29-year-old Middle Eastern woman with medium warm skin and angular defined jaw, elegant makeup with warm bronze eye and rose-brown lip showing AI recommendation, clean simple headshot, poised expression, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },

  // Tan skin
  {
    id: 'trust-tan-oval',
    filename: 'trust-tan-oval.webp',
    purpose: '信任区 — 小麦肤色·椭圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `27-year-old South Asian woman with tan warm skin and oval face, warm glowing makeup with gold-bronze eye and berry-rose lip showing AI recommendation, clean simple headshot, bright warm smile, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-tan-round',
    filename: 'trust-tan-round.webp',
    purpose: '信任区 — 小麦肤色·圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `24-year-old Southeast Asian woman with tan golden skin and soft round face, fresh natural makeup with peach blush and coral lip showing AI recommendation, clean simple headshot, cheerful expression, neutral cream background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-tan-angular',
    filename: 'trust-tan-angular.webp',
    purpose: '信任区 — 小麦肤色·方脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `30-year-old Latina woman with tan olive skin and angular face with strong cheekbones, sophisticated makeup with warm bronze contour and mauve lip showing AI recommendation, clean simple headshot, confident expression, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },

  // Deep skin
  {
    id: 'trust-deep-oval',
    filename: 'trust-deep-oval.webp',
    purpose: '信任区 — 深肤色·椭圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `26-year-old Black woman with deep rich brown skin and oval face, luminous glowing makeup with warm bronze highlight and deep berry lip showing AI recommendation, clean simple headshot, radiant warm smile, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-deep-round',
    filename: 'trust-deep-round.webp',
    purpose: '信任区 — 深肤色·圆脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `23-year-old Black woman with deep chocolate skin and soft round face, fresh natural makeup with warm plum blush and glossy berry lip showing AI recommendation, clean simple headshot, joyful genuine expression, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
  {
    id: 'trust-deep-angular',
    filename: 'trust-deep-angular.webp',
    purpose: '信任区 — 深肤色·方脸',
    outputDir: 'trust',
    size: '1:1',
    prompt: `28-year-old Black woman with deep ebony skin and angular defined jaw and high cheekbones, striking sculpted makeup with rich bronze highlight and deep wine lip showing AI recommendation, clean simple headshot, powerful confident expression, neutral warm background, portrait crop, ${BRAND_BASE}, ${NEGATIVE}`,
  },
];

// ─── API 调用复用逻辑 ───
async function generateImage(spec: ImageSpec): Promise<string | null> {
  console.log(`\n🎨 [${spec.id}] ${spec.purpose}`);
  console.log(`   尺寸: ${spec.size} → ${spec.outputDir}/${spec.filename}`);

  try {
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

    if (createData.data?.[0]?.url) {
      console.log(`   ✅ 直接获得图片 URL`);
      return createData.data[0].url;
    }

    const taskId = createData.task_id || createData.id;
    if (!taskId) {
      console.error(`   ❌ 未获得 task_id 或图片 URL`, JSON.stringify(createData).slice(0, 200));
      return null;
    }

    console.log(`   ⏳ 任务已提交: ${taskId}，开始轮询...`);

    for (let attempt = 0; attempt < 60; attempt++) {
      await new Promise(r => setTimeout(r, 3000));

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

async function main() {
  const baseDir = path.resolve(__dirname, '..', 'public', 'images');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AI Beauty Stylist 扩展图片生成器');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`模型: ${MODEL}`);
  console.log(`基础目录: ${baseDir}`);
  console.log(`共 ${images.length} 张图片待生成\n`);

  // 创建所有输出子目录
  const dirs = [...new Set(images.map(i => i.outputDir))];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(baseDir, dir), { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const spec of images) {
    const filepath = path.join(baseDir, spec.outputDir, spec.filename);

    if (fs.existsSync(filepath)) {
      console.log(`\n⏭️  [${spec.id}] 已存在，跳过`);
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

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ 成功: ${success} / ${images.length}`);
  if (failed > 0) console.log(`❌ 失败: ${failed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main();
