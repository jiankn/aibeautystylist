/**
 * 妆容名字的简体中文翻译层
 *
 * key = look slug / style slug，value = 中文名字。
 * 通过 resolver 在 zh-CN 下覆盖英文 title/tone/label，
 * 缺失时回退到英文，保证不会破坏页面。
 */

// look 卡片：title + tone（用于 InspirationGrid / discover / try-on 抽屉）
export const lookNameZhCN: Record<string, { title: string; tone: string }> = {
  'office-glow': { title: '通勤光感', tone: '精致日常' },
  'clean-girl': { title: '清纯素颜感', tone: '玻璃光肌' },
  'fresh-minimal': { title: '清透极简', tone: '新手友好' },
  'no-makeup': { title: '伪素颜', tone: '隐形精修' },
  'glass-skin': { title: '玻璃肌', tone: '水光妆感' },
  'quiet-taupe': { title: '高级灰棕', tone: '精致中性' },
  'soft-glam': { title: '柔美光感', tone: '浪漫气色' },
  'berry-date': { title: '莓果约会', tone: '近距离耐看' },
  'romantic-pink': { title: '浪漫粉调', tone: '暖调气色' },
  'photo-ready': { title: '上镜妆', tone: '镜头平衡' },
  'zoom-polish': { title: '视频会议妆', tone: '镜头清晰' },
  'radiant-glow': { title: '光泽气色', tone: '通透深度' },
  'wedding-guest': { title: '婚礼宾客', tone: '玫瑰木精致' },
  'evening-gala': { title: '晚宴妆', tone: '深色派对感' },
  'soft-editorial': { title: '柔和大片感', tone: '焦点眼妆' },
  'interview-ready': { title: '面试妆', tone: '沉稳结构' },
  'asian-refined': { title: '亚洲精致妆', tone: '干净轮廓' },
  'weekend-glow': { title: '周末气色', tone: '轻松鲜活' },
  'soft-matte-everyday': { title: '柔雾日常', tone: '自然柔焦' },
  'warm-nude-daily': { title: '暖裸日常', tone: '柔和暖调' },
  'peach-morning-glow': { title: '蜜桃晨光', tone: '清新蜜桃' },
  'client-meeting-nude': { title: '商务裸妆', tone: '沉稳气场' },
  'executive-rose': { title: '精英玫瑰', tone: '结构玫瑰' },
  'passport-photo-clean': { title: '证件照妆', tone: '证件友好' },
  'flash-proof-satin': { title: '防反光缎面', tone: '无反光' },
  'creator-camera-glow': { title: '博主镜头光', tone: '出镜友好' },
  'candlelight-mauve': { title: '烛光豆沙', tone: '弱光柔和' },
  'rose-milk-date': { title: '玫瑰奶茶约会', tone: '奶玫瑰调' },
  'peach-beige-date': { title: '蜜桃米约会', tone: '暖调近景' },
  'bronze-evening': { title: '古铜晚妆', tone: '暖调修容' },
  'burgundy-velvet': { title: '酒红丝绒', tone: '深色丝绒' },
  'champagne-gala': { title: '香槟晚宴', tone: '柔和闪粉' },
  'five-minute-beginner': { title: '五分钟新手妆', tone: '快速流程' },
  'olive-undertone-rose': { title: '橄榄皮玫瑰', tone: '平衡玫瑰' },
  'hooded-eyes-lift': { title: '肿眼泡提拉', tone: '可见提拉' },
  'mature-skin-radiance': { title: '成熟肌光彩', tone: '柔和光泽' },
  'sunburn-satin-glow': { title: '晒伤腮红光', tone: '暖调提拉' },
  'watercolor-blush': { title: '水彩腮红', tone: '晕染色彩' },
  'jelly-lip-tint': { title: '果冻唇釉', tone: '透明多汁唇' },
  'reflective-lid-glow': { title: '反光眼皮光', tone: '抓光眼妆' },
  'vacation-bronze': { title: '度假古铜', tone: '阳光修容' },
  'summer-wedding-guest': { title: '夏日婚礼宾客', tone: '耐热精致' },
  'soft-berry-stain': { title: '柔莓染唇', tone: '晕染莓果' },
  'cloud-skin-matte': { title: '云朵雾面肌', tone: '柔焦底妆' },
  'korean-dewy-glow': { title: '韩系水光', tone: '清透光肌' },
  'french-natural-chic': { title: '法式自然', tone: '随性精致' },
  'douyin-soft-focus': { title: '抖音柔焦', tone: '镜头甜感' },
  'latina-bronze-glam': { title: '拉丁古铜妆', tone: '立体暖调' },
};

// style 导航卡片：label（用于 StylePicker / discover 风格区 / try-on 风格抽屉）
export const styleLabelZhCN: Record<string, string> = {
  'clean-girl-makeup': '清纯素颜',
  'soft-glam-makeup': '柔美光感',
  'glass-skin-makeup': '玻璃肌',
  'no-makeup-makeup': '伪素颜',
  'office-polished-makeup': '通勤精致',
  'romantic-date-makeup': '浪漫约会',
  'latte-makeup': '拿铁妆',
  'peach-glow-makeup': '蜜桃气色',
  'rose-milk-makeup': '玫瑰奶茶',
  'quiet-luxury-makeup': '静奢风',
  'camera-ready-makeup': '上镜妆',
  'flash-proof-makeup': '防反光',
  'wedding-guest-makeup': '婚礼宾客',
  'champagne-glow-makeup': '香槟气色',
  'bronze-glam-makeup': '古铜妆',
  'burgundy-velvet-makeup': '酒红丝绒',
  'mature-radiance-makeup': '成熟光彩',
  'hooded-eye-lift-makeup': '肿眼泡提拉',
  'korean-dewy-glow-makeup': '韩系水光',
  'french-natural-chic-makeup': '法式自然',
  'douyin-soft-focus-makeup': '抖音柔焦',
  'latina-bronze-glam-makeup': '拉丁古铜',
  'monochrome-rose-makeup': '同色玫瑰',
  'olive-rose-balance-makeup': '橄榄玫瑰平衡',
  'sunburn-blush-makeup': '晒伤腮红',
  'watercolor-blush-makeup': '水彩腮红',
  'jelly-lip-makeup': '果冻唇',
  'reflective-lid-makeup': '反光眼皮',
  'vacation-bronze-makeup': '度假古铜',
  'cloud-skin-makeup': '云朵雾面肌',
  'interview-ready-makeup': '面试妆',
  'passport-photo-makeup': '证件照妆',
  'creator-glow-makeup': '博主气色',
  'five-minute-makeup': '五分钟妆',
  'asian-soft-definition-makeup': '亚洲柔和定义',
  'soft-berry-stain-makeup': '柔莓染唇',
  'monolid-makeup': '单眼皮妆容',
  'olive-skin-makeup': '橄榄皮妆容',
  'deep-skin-makeup': '深肤色妆容',
  'korean-dewy-makeup': '韩系水光妆',
};

// persona 标签的中文（StylePicker 卡片副标题）
export const personaTagZhCN: Record<string, string> = {
  'Soft definition': '柔和定义',
  'Monolid friendly': '单眼皮友好',
  'Olive undertone': '橄榄底色',
  'Deep skin glow': '深肤色气色',
  '5-min routine': '5 分钟流程',
  'Studio friendly': '出镜友好',
  'Blurred berry': '晕染莓果',
};

// 妆容分组标签（InspirationGrid 的 groupLabel）
export const groupLabelZhCN: Record<string, string> = {
  'Trending Daily': '日常热门',
  'Date & Romantic': '约会与浪漫',
  'Photo & Event': '拍照与活动',
  'By Feature': '按特征',
  'Beginner Friendly': '新手友好',
  Daily: '日常',
  Date: '约会',
  Photo: '拍照',
  Event: '活动',
  Beginner: '新手',
  Feature: '特征',
};

type LocaleLike = string | undefined;

const isZh = (locale: LocaleLike) => locale === 'zh-CN';

/** 解析 look 的中文 title，缺失则回退英文 */
export function resolveLookTitle(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? lookNameZhCN[slug]?.title ?? fallback : fallback;
}

/** 解析 look 的中文 tone，缺失则回退英文 */
export function resolveLookTone(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? lookNameZhCN[slug]?.tone ?? fallback : fallback;
}

/** 解析 style 的中文 label，缺失则回退英文 */
export function resolveStyleLabel(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? styleLabelZhCN[slug] ?? fallback : fallback;
}

/** 解析 persona 标签的中文，缺失则回退英文 */
export function resolvePersonaTag(tag: string | undefined, locale: LocaleLike): string | undefined {
  if (!tag) return tag;
  return isZh(locale) ? personaTagZhCN[tag] ?? tag : tag;
}

/** 解析分组标签的中文，缺失则回退英文 */
export function resolveGroupLabel(label: string, locale: LocaleLike): string {
  return isZh(locale) ? groupLabelZhCN[label] ?? label : label;
}
