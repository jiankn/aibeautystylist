/**
 * 面部色彩着色引擎
 *
 * 功能：
 * 1. 使用 MediaPipe Face Landmarker 检测 478 个面部关键点
 * 2. 从关键点中提取唇部轮廓多边形蒙版
 * 3. 在 Canvas 上使用 globalCompositeOperation 进行精准唇部着色
 *
 * MVP 阶段仅实现唇部着色。腮红/眼影留到下一迭代。
 */

// ─── 唇部关键点索引（基于 MediaPipe Face Mesh 478 点模型） ───
// 外唇轮廓（按顺时针排列）
const OUTER_LIP_INDICES = [
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
  291, 409, 270, 269, 267, 0, 37, 39, 40, 185, 
  80, 81, 82, 13, 312, 311, 310, 415, 308, 324,
  318, 402, 317, 14, 87, 178, 88, 95, 78,
];

/** 唇色参数 */
export interface LipColorParams {
  hex: string;
  opacity: number;
  blendMode: 'multiply' | 'soft-light' | 'overlay';
}

/** 面部关键点（归一化坐标 0-1） */
interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
}

/**
 * 将 HEX 颜色转换为 RGBA 字符串
 */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * 在 Canvas 上绘制唇部着色
 *
 * @param canvas - 目标 Canvas 元素
 * @param sourceImage - 原始自拍图片
 * @param landmarks - MediaPipe 返回的 478 个归一化关键点
 * @param lipColor - 唇色参数
 */
export function applyLipColor(
  canvas: HTMLCanvasElement,
  sourceImage: HTMLImageElement,
  landmarks: NormalizedLandmark[],
  lipColor: LipColorParams,
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = sourceImage.naturalWidth;
  const h = sourceImage.naturalHeight;
  canvas.width = w;
  canvas.height = h;

  // 1. 先绘制原图
  ctx.drawImage(sourceImage, 0, 0, w, h);

  // 2. 构建唇部蒙版路径
  ctx.save();
  ctx.beginPath();

  const firstPoint = landmarks[OUTER_LIP_INDICES[0]];
  ctx.moveTo(firstPoint.x * w, firstPoint.y * h);

  for (let i = 1; i < OUTER_LIP_INDICES.length; i++) {
    const pt = landmarks[OUTER_LIP_INDICES[i]];
    ctx.lineTo(pt.x * w, pt.y * h);
  }
  ctx.closePath();
  ctx.clip();

  // 3. 在蒙版区域内叠加颜色
  ctx.globalCompositeOperation = lipColor.blendMode as GlobalCompositeOperation;
  ctx.fillStyle = hexToRgba(lipColor.hex, lipColor.opacity);
  ctx.fillRect(0, 0, w, h);

  // 4. 恢复上下文
  ctx.restore();
}

/**
 * 初始化 MediaPipe FaceLandmarker
 *
 * 懒加载：首次调用时动态 import MediaPipe 模块并下载 WASM 模型
 * 返回一个 detect 函数，供后续重复调用
 */
export async function initFaceLandmarker(): Promise<{
  detect: (image: HTMLImageElement) => NormalizedLandmark[] | null;
}> {
  // 动态导入 MediaPipe（避免 SSR 阶段报错）
  const vision = await import('@mediapipe/tasks-vision');
  const { FaceLandmarker, FilesetResolver } = vision;

  // 从 CDN 加载 WASM 运行时
  const wasmFileset = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
  );

  // 创建 FaceLandmarker 实例
  const faceLandmarker = await FaceLandmarker.createFromOptions(wasmFileset, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });

  return {
    detect(image: HTMLImageElement): NormalizedLandmark[] | null {
      try {
        const result = faceLandmarker.detect(image);
        if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
          console.warn('[faceColorEngine] 未检测到人脸');
          return null;
        }
        return result.faceLandmarks[0] as NormalizedLandmark[];
      } catch (error) {
        console.error('[faceColorEngine] 关键点检测失败:', error);
        return null;
      }
    },
  };
}

/**
 * 在不使用 MediaPipe 时的降级方案：
 * 显示精美色号预览卡而非 Canvas 着色
 */
export function renderColorSwatch(
  container: HTMLElement,
  lipColor: LipColorParams,
): void {
  const colorName = getColorName(lipColor.hex);
  container.innerHTML = `
    <div class="lip-swatch-card">
      <div class="lip-swatch-ring" style="--swatch-color: ${lipColor.hex};">
        <div class="lip-swatch-dot" style="background: ${lipColor.hex};"></div>
      </div>
      <div class="lip-swatch-info">
        <span class="lip-swatch-label">Recommended Lip</span>
        <strong class="lip-swatch-name">${colorName}</strong>
        <code class="lip-swatch-hex">${lipColor.hex}</code>
      </div>
    </div>
  `;
}

/**
 * 在 Look 卡片内嵌迷你唇色色块
 * 支持 CSS transition 过渡
 */
export function renderInlineSwatch(
  container: HTMLElement,
  lipColor: LipColorParams,
): void {
  const colorName = getColorName(lipColor.hex);
  container.innerHTML = `
    <div class="lip-inline-swatch" style="--swatch-color: ${lipColor.hex};">
      <span class="lip-inline-dot" style="background: ${lipColor.hex};"></span>
      <span class="lip-inline-label">${colorName}</span>
    </div>
  `;
}

/**
 * 根据 HEX 推算近似颜色名称
 * 基于 HSL 色相分区的简化映射
 */
function getColorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  if (d < 0.05) return l > 0.7 ? 'Nude Pink' : 'Dusty Mauve';

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;

  const s = d / (1 - Math.abs(2 * l - 1));

  // 色相 → 唇色名称映射
  if (h < 15 || h >= 345) return s > 0.6 ? 'Classic Red' : 'Dusty Rose';
  if (h < 30) return l > 0.5 ? 'Coral Peach' : 'Terracotta';
  if (h < 45) return 'Warm Nude';
  if (h < 60) return 'Honey Nude';
  if (h < 160) return 'Unexpected Hue';
  if (h < 200) return 'Cool Mauve';
  if (h < 280) return l < 0.35 ? 'Deep Plum' : 'Berry Violet';
  if (h < 320) return s > 0.5 ? 'Magenta Berry' : 'Muted Mauve';
  return l > 0.5 ? 'Rose Pink' : 'Wine Berry';
}
