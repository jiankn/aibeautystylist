/**
 * 教程视觉增强：根据步骤标题自动匹配面部区域和工具图标
 *
 * 用于 tutorials/[slug].astro 的步骤卡视觉指示
 */

export type FaceZone = 'eyes' | 'lips' | 'cheeks' | 'brows' | 'base' | 'contour' | 'lashes';
export type ToolType = 'brush' | 'sponge' | 'pencil' | 'finger' | 'powder' | 'mascara' | 'lipstick' | 'palette';

export interface StepVisual {
  zone: FaceZone;
  zoneLabel: string;
  tool: ToolType;
  toolLabel: string;
}

const ZONE_KEYWORDS: Record<FaceZone, string[]> = {
  eyes: ['eye', 'lid', 'socket', 'crease', 'shadow', 'outer corner', 'inner corner', 'smoky'],
  lips: ['lip', 'mouth', 'gloss', 'lipstick', 'berry', 'nude lip', 'gradient lip'],
  cheeks: ['blush', 'cheek', 'apple', 'flush', 'rouge'],
  brows: ['brow', 'eyebrow', 'feather'],
  base: ['base', 'foundation', 'conceal', 'primer', 'skin', 'tone', 'coverage', 'spot'],
  contour: ['contour', 'sculpt', 'bronze', 'highlight', 'dimension', 'structure', 'bone'],
  lashes: ['lash', 'mascara', 'curl', 'liner', 'line'],
};

const TOOL_KEYWORDS: Record<ToolType, string[]> = {
  brush: ['brush', 'sweep', 'buff', 'blend'],
  sponge: ['sponge', 'damp', 'bounce', 'pat', 'press'],
  pencil: ['pencil', 'line', 'draw', 'stroke', 'define'],
  finger: ['finger', 'dab', 'tap', 'press', 'warmth'],
  powder: ['powder', 'set', 'dust', 'translucent'],
  mascara: ['mascara', 'lash', 'curl', 'coat', 'wand'],
  lipstick: ['lipstick', 'lip', 'gloss', 'balm', 'tint'],
  palette: ['palette', 'shadow', 'shade', 'pigment'],
};

export function inferStepVisual(title: string, detail: string): StepVisual {
  const text = `${title} ${detail}`.toLowerCase();

  let zone: FaceZone = 'base';
  let maxZoneScore = 0;
  for (const [z, keywords] of Object.entries(ZONE_KEYWORDS) as [FaceZone, string[]][]) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > maxZoneScore) {
      maxZoneScore = score;
      zone = z;
    }
  }

  let tool: ToolType = 'brush';
  let maxToolScore = 0;
  for (const [t, keywords] of Object.entries(TOOL_KEYWORDS) as [ToolType, string[]][]) {
    const score = keywords.filter((k) => text.includes(k)).length;
    if (score > maxToolScore) {
      maxToolScore = score;
      tool = t;
    }
  }

  return {
    zone,
    zoneLabel: ZONE_LABELS[zone],
    tool,
    toolLabel: TOOL_LABELS[tool],
  };
}

const ZONE_LABELS: Record<FaceZone, string> = {
  eyes: 'Eyes',
  lips: 'Lips',
  cheeks: 'Cheeks',
  brows: 'Brows',
  base: 'Base',
  contour: 'Contour',
  lashes: 'Lashes',
};

const TOOL_LABELS: Record<ToolType, string> = {
  brush: 'Brush',
  sponge: 'Sponge',
  pencil: 'Pencil',
  finger: 'Fingertip',
  powder: 'Powder',
  mascara: 'Mascara Wand',
  lipstick: 'Lipstick',
  palette: 'Palette',
};

/** SVG path data for face zone icons (20×20 viewBox) */
export const ZONE_ICONS: Record<FaceZone, string> = {
  eyes: '<path d="M2 10s3.5-5 8-5 8 5 8 5-3.5 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2.5"/>',
  lips: '<path d="M4 11c0 0 2 4 6 4s6-4 6-4"/><path d="M4 11c0 0 2-3 6-3s6 3 6 3"/>',
  cheeks: '<circle cx="6" cy="12" r="3" opacity="0.6"/><circle cx="14" cy="12" r="3" opacity="0.6"/>',
  brows: '<path d="M3 8c2-3 5-3 7-2"/><path d="M17 8c-2-3-5-3-7-2"/>',
  base: '<circle cx="10" cy="10" r="7"/><path d="M7 7.5a3 3 0 0 1 6 0" opacity="0.4"/>',
  contour: '<path d="M6 5c-2 3-2 7 0 10"/><path d="M14 5c2 3 2 7 0 10"/>',
  lashes: '<path d="M3 12c1.5-4 5-5 7-5s5.5 1 7 5"/><path d="M6 10l-1-3M8 9l0-3M10 8.5l0-3M12 9l0-3M14 10l1-3"/>',
};

/** SVG path data for tool icons (20×20 viewBox) */
export const TOOL_ICONS: Record<ToolType, string> = {
  brush: '<path d="M4 16l5-5"/><path d="M9 11c1-2 3-4 5-5s4-1 4 1-2 3-4 4l-5 0Z"/>',
  sponge: '<ellipse cx="10" cy="11" rx="6" ry="7" transform="rotate(-15 10 11)"/>',
  pencil: '<path d="M4 16l1-4L14 3l2 2L7 14Z"/><path d="M14 3l2 2"/>',
  finger: '<path d="M10 4v8M7 7c0-2 1.5-3 3-3s3 1 3 3v5c0 2-1.5 4-3 4s-3-2-3-4Z"/>',
  powder: '<circle cx="10" cy="12" r="5"/><path d="M7 7l6 0" stroke-dasharray="1 1.5"/>',
  mascara: '<path d="M10 3v14"/><path d="M7 5h6M7 8h6M7 11h6M7 14h6"/>',
  lipstick: '<rect x="7" y="8" width="6" height="8" rx="1"/><path d="M7 8l3-5l3 5"/>',
  palette: '<circle cx="10" cy="10" r="7"/><circle cx="7" cy="8" r="1.5"/><circle cx="12" cy="7" r="1"/><circle cx="13" cy="11" r="1.5"/><circle cx="8" cy="13" r="1"/>',
};
