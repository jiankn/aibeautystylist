/**
 * 社交分享卡生成器
 *
 * 使用 Canvas 纯前端生成精美分享图（类似小红书结果卡）
 * 无 API 开销，即时生成，支持一键下载
 *
 * 卡片内容：
 * - 品牌 logo + 标题
 * - 诊断结果（肤色类型）
 * - 推荐唇色色板
 * - 推荐方案名称
 * - 品牌水印 + CTA
 */

export interface ShareCardData {
  /** 诊断标题（如 "Warm-neutral undertone · Soft definition fit"） */
  diagnosisTitle: string;
  /** 选中的方案名称 */
  lookName: string;
  /** 方案描述（finish） */
  lookFinish: string;
  /** 场景 */
  scenario: string;
  /** 推荐唇色 HEX */
  lipColorHex?: string;
  /** 用户上传的自拍（dataUrl，可选——不放上去更安全） */
  selfieUrl?: string;
  /** AI 妆效图（dataUrl，用于 Before/After 对比） */
  makeupResultUrl?: string;
  /** Hashtags */
  hashtags?: string[];
}

const CARD_W = 1080;
const CARD_H = 1350; // 4:5 社交媒体比例
const PADDING = 72;
const BRAND_NAME = 'AI Beauty Stylist';
const BRAND_URL = 'aibeautystylist.com';

/**
 * 生成分享卡并返回 dataUrl (PNG)
 */
export async function generateShareCard(data: ShareCardData): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  // ─── 背景渐变 ───
  const bgGrad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bgGrad.addColorStop(0, '#fdf6f3');
  bgGrad.addColorStop(0.4, '#f8ece8');
  bgGrad.addColorStop(0.7, '#f2e5e1');
  bgGrad.addColorStop(1, '#ede0dc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // ─── 装饰元素：顶部渐变弧 ───
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(CARD_W / 2, -120, 700, 320, 0, 0, Math.PI);
  const arcGrad = ctx.createRadialGradient(CARD_W / 2, 0, 0, CARD_W / 2, 0, 600);
  arcGrad.addColorStop(0, 'rgba(176,127,134,0.15)');
  arcGrad.addColorStop(1, 'rgba(176,127,134,0)');
  ctx.fillStyle = arcGrad;
  ctx.fill();
  ctx.restore();

  // ─── 装饰：底部渐变弧 ───
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(CARD_W / 2, CARD_H + 100, 650, 280, 0, Math.PI, Math.PI * 2);
  const arcGrad2 = ctx.createRadialGradient(CARD_W / 2, CARD_H, 0, CARD_W / 2, CARD_H, 500);
  arcGrad2.addColorStop(0, 'rgba(176,127,134,0.12)');
  arcGrad2.addColorStop(1, 'rgba(176,127,134,0)');
  ctx.fillStyle = arcGrad2;
  ctx.fill();
  ctx.restore();

  let y = PADDING;

  // ─── Before/After 对比区（如果有两张图） ───
  if (data.selfieUrl && data.makeupResultUrl) {
    y = await drawBeforeAfter(ctx, data.selfieUrl, data.makeupResultUrl, y);
  }

  // ─── 品牌标题 ───
  ctx.textAlign = 'center';
  ctx.fillStyle = '#b07f86';
  ctx.font = '600 18px "Inter", "Segoe UI", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(BRAND_NAME.toUpperCase(), CARD_W / 2, y + 20);
  y += 50;

  // ─── 分隔线 ───
  drawDivider(ctx, y);
  y += 40;

  // ─── 副标题 ───
  ctx.fillStyle = '#5a3d3d';
  ctx.font = '400 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('Your Personalized AI Beauty Plan', CARD_W / 2, y);
  y += 55;

  // ─── 诊断卡片 ───
  drawRoundedRect(ctx, PADDING, y, CARD_W - PADDING * 2, 180, 24, 'rgba(255,255,255,0.85)');
  // 卡片内部
  ctx.fillStyle = '#b07f86';
  ctx.font = '600 15px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('SKIN ANALYSIS', CARD_W / 2, y + 36);

  ctx.fillStyle = '#3e2727';
  ctx.font = '700 28px "Playfair Display", Georgia, serif';
  const diagLines = wrapText(ctx, data.diagnosisTitle, CARD_W - PADDING * 2 - 48, 28);
  let diagY = y + 75;
  for (const line of diagLines) {
    ctx.fillText(line, CARD_W / 2, diagY);
    diagY += 36;
  }

  y += 210;

  // ─── 推荐唇色 ───
  if (data.lipColorHex) {
    y += 10;
    const lipLabel = 'Recommended Lip Color';
    ctx.fillStyle = '#b07f86';
    ctx.font = '600 15px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(lipLabel, CARD_W / 2, y);
    y += 30;

    // 色块大圆
    const circleX = CARD_W / 2;
    const circleR = 42;

    // 外环渐变
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleX, y + circleR, circleR + 6, 0, Math.PI * 2);
    const ringGrad = ctx.createConicGradient(0, circleX, y + circleR);
    ringGrad.addColorStop(0, data.lipColorHex);
    ringGrad.addColorStop(0.33, 'rgba(176,127,134,0.3)');
    ringGrad.addColorStop(0.66, data.lipColorHex);
    ringGrad.addColorStop(1, 'rgba(176,127,134,0.3)');
    ctx.fillStyle = ringGrad;
    ctx.fill();
    ctx.restore();

    // 内圆
    ctx.beginPath();
    ctx.arc(circleX, y + circleR, circleR, 0, Math.PI * 2);
    ctx.fillStyle = data.lipColorHex;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // HEX 标签
    ctx.fillStyle = '#5a3d3d';
    ctx.font = '500 17px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(data.lipColorHex.toUpperCase(), CARD_W / 2, y + circleR * 2 + 28);
    y += circleR * 2 + 55;
  }

  // ─── 推荐方案卡片 ───
  y += 10;
  drawRoundedRect(ctx, PADDING, y, CARD_W - PADDING * 2, 210, 24, 'rgba(255,255,255,0.85)');

  ctx.fillStyle = '#b07f86';
  ctx.font = '600 15px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('RECOMMENDED LOOK', CARD_W / 2, y + 36);

  ctx.fillStyle = '#3e2727';
  ctx.font = '700 36px "Playfair Display", Georgia, serif';
  ctx.fillText(data.lookName, CARD_W / 2, y + 85);

  ctx.fillStyle = '#5a3d3d';
  ctx.font = '400 20px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(data.lookFinish, CARD_W / 2, y + 125);

  // 场景标签
  drawPill(ctx, CARD_W / 2, y + 170, data.scenario);
  y += 240;

  // ─── Hashtags ───
  if (data.hashtags?.length) {
    y += 10;
    ctx.fillStyle = '#b07f86';
    ctx.font = '400 17px "Inter", "Segoe UI", sans-serif';
    const tagText = data.hashtags.slice(0, 4).join('  ');
    ctx.fillText(tagText, CARD_W / 2, y);
    y += 40;
  }

  // ─── 底部分隔线 ───
  drawDivider(ctx, CARD_H - 120);

  // ─── CTA + 品牌 ───
  ctx.fillStyle = '#5a3d3d';
  ctx.font = '500 19px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('Discover your perfect look at', CARD_W / 2, CARD_H - 78);

  ctx.fillStyle = '#b07f86';
  ctx.font = '700 22px "Inter", "Segoe UI", sans-serif';
  ctx.fillText(BRAND_URL, CARD_W / 2, CARD_H - 46);

  return canvas.toDataURL('image/png', 1.0);
}

// ─── Before/After 对比绘制 ─────────────────────────────────

async function drawBeforeAfter(
  ctx: CanvasRenderingContext2D,
  beforeUrl: string,
  afterUrl: string,
  startY: number,
): Promise<number> {
  const CIRCLE_R = 110;
  const GAP = 60;
  const centerY = startY + CIRCLE_R + 10;
  const leftX = CARD_W / 2 - GAP - CIRCLE_R;
  const rightX = CARD_W / 2 + GAP + CIRCLE_R;

  // 加载图片
  const [beforeImg, afterImg] = await Promise.all([
    loadImage(beforeUrl),
    loadImage(afterUrl),
  ]);

  // 绘制 Before 圆
  drawCircleImage(ctx, beforeImg, leftX, centerY, CIRCLE_R);
  // 绘制 After 圆
  drawCircleImage(ctx, afterImg, rightX, centerY, CIRCLE_R);

  // 标签
  const labelY = centerY + CIRCLE_R + 28;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#5a3d3d';
  ctx.font = '500 16px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('Before', leftX, labelY);
  ctx.fillText('After', rightX, labelY);

  // 中间箭头
  ctx.fillStyle = '#b07f86';
  ctx.font = '700 28px "Inter", "Segoe UI", sans-serif';
  ctx.fillText('→', CARD_W / 2, centerY + 4);

  return labelY + 30;
}

function drawCircleImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.save();
  // 外环
  ctx.beginPath();
  ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(176, 127, 134, 0.3)';
  ctx.lineWidth = 3;
  ctx.stroke();
  // 裁剪圆形
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  // 绘制图片（居中裁剪）
  const size = r * 2;
  const scale = Math.max(size / img.width, size / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// ─── 辅助函数 ─────────────────────────────────────────────

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  // 微妙边框
  ctx.strokeStyle = 'rgba(176,127,134,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number) {
  const grad = ctx.createLinearGradient(PADDING * 2, y, CARD_W - PADDING * 2, y);
  grad.addColorStop(0, 'rgba(176,127,134,0)');
  grad.addColorStop(0.3, 'rgba(176,127,134,0.25)');
  grad.addColorStop(0.7, 'rgba(176,127,134,0.25)');
  grad.addColorStop(1, 'rgba(176,127,134,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(PADDING * 2, y, CARD_W - PADDING * 4, 1.5);
}

function drawPill(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string) {
  ctx.save();
  ctx.font = '500 15px "Inter", "Segoe UI", sans-serif';
  const metrics = ctx.measureText(text);
  const pw = metrics.width + 32;
  const ph = 32;
  ctx.beginPath();
  ctx.roundRect(cx - pw / 2, cy - ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = 'rgba(176,127,134,0.12)';
  ctx.fill();
  ctx.fillStyle = '#5a3d3d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, _fontSize: number): string[] {
  const words = text.split(/(\s+·\s+|\s+)/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());
  return lines.length ? lines : [text];
}

/**
 * 触发下载分享卡
 */
export function downloadShareCard(dataUrl: string, lookName: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `beauty-plan-${lookName.toLowerCase().replace(/\s+/g, '-')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
