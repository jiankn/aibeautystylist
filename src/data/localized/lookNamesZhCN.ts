/**
 * 妆容名字的简体中文翻译层
 *
 * 原则：用中文美妆圈真实的表达方式，不做英文直译。
 * key = look slug / style slug，缺失时 resolver 自动回退英文。
 */

// look 卡片：title + tone（用于 InspirationGrid / discover / try-on 抽屉）
export const lookNameZhCN: Record<string, { title: string; tone: string }> = {
  'office-glow':          { title: '通勤精致妆',      tone: '日常显气色' },
  'clean-girl':           { title: '清透素颜感',      tone: '玻璃光肌' },
  'fresh-minimal':        { title: '清爽裸妆',        tone: '新手也能画' },
  'no-makeup':            { title: '伪素颜妆',        tone: '越看越好看' },
  'glass-skin':           { title: '玻璃肌妆',        tone: '水光透亮' },
  'quiet-taupe':          { title: '高级灰棕妆',      tone: '低调精致' },
  'soft-glam':            { title: '柔光微醺妆',      tone: '约会首选' },
  'berry-date':           { title: '莓果约会妆',      tone: '近距离耐看' },
  'romantic-pink':        { title: '粉嫩恋爱妆',      tone: '暖调气色' },
  'photo-ready':          { title: '上镜妆',          tone: '拍什么都好看' },
  'zoom-polish':          { title: '视频会议妆',      tone: '镜头前清晰' },
  'radiant-glow':         { title: '满分气色妆',      tone: '通透有光泽' },
  'wedding-guest':        { title: '婚礼宾客妆',      tone: '得体又好看' },
  'evening-gala':         { title: '晚宴派对妆',      tone: '深色高级感' },
  'soft-editorial':       { title: '大片感妆容',      tone: '眼妆是主角' },
  'interview-ready':      { title: '面试妆',          tone: '沉稳有气场' },
  'asian-refined':        { title: '亚洲精致妆',      tone: '干净有轮廓' },
  'weekend-glow':         { title: '周末出门妆',      tone: '随意又好看' },
  'soft-matte-everyday':  { title: '日常雾面妆',      tone: '自然不假' },
  'warm-nude-daily':      { title: '暖调裸妆',        tone: '显白不显脏' },
  'peach-morning-glow':   { title: '蜜桃早安妆',      tone: '清新有气色' },
  'client-meeting-nude':  { title: '商务裸妆',        tone: '专业有气场' },
  'executive-rose':       { title: '职场玫瑰妆',      tone: '精英感' },
  'passport-photo-clean': { title: '证件照妆',        tone: '自然不出戏' },
  'flash-proof-satin':    { title: '防闪光灯妆',      tone: '拍照不反光' },
  'creator-camera-glow':  { title: '博主出镜妆',      tone: '镜头前发光' },
  'candlelight-mauve':    { title: '烛光豆沙妆',      tone: '暗光也好看' },
  'rose-milk-date':       { title: '玫瑰奶茶妆',      tone: '奶甜感' },
  'peach-beige-date':     { title: '蜜桃米色约会妆',  tone: '近景超耐看' },
  'bronze-evening':       { title: '古铜晚妆',        tone: '立体有轮廓' },
  'burgundy-velvet':      { title: '酒红丝绒妆',      tone: '深色高级感' },
  'champagne-gala':       { title: '香槟晚宴妆',      tone: '微闪精致' },
  'five-minute-beginner': { title: '五分钟快手妆',    tone: '新手也能搞定' },
  'olive-undertone-rose': { title: '橄榄皮玫瑰妆',    tone: '不显脏的玫瑰' },
  'hooded-eyes-lift':     { title: '肿眼泡提拉妆',    tone: '睁眼也有轮廓' },
  'mature-skin-radiance': { title: '成熟肌光彩妆',    tone: '越画越年轻' },
  'sunburn-satin-glow':   { title: '晒伤腮红妆',      tone: '夏日感满满' },
  'watercolor-blush':     { title: '水彩腮红妆',      tone: '晕染感超美' },
  'jelly-lip-tint':       { title: '果冻唇妆',        tone: '水嫩多汁' },
  'reflective-lid-glow':  { title: '反光眼皮妆',      tone: '眼睛会发光' },
  'vacation-bronze':      { title: '度假古铜妆',      tone: '阳光感' },
  'summer-wedding-guest': { title: '夏日婚礼宾客妆',  tone: '耐热不脱妆' },
  'soft-berry-stain':     { title: '柔莓染唇妆',      tone: '晕染感唇色' },
  'cloud-skin-matte':     { title: '云朵雾面妆',      tone: '柔焦磨皮感' },
  'korean-dewy-glow':     { title: '韩系水光妆',      tone: '清透发光' },
  'french-natural-chic':  { title: '法式慵懒妆',      tone: '随性又精致' },
  'douyin-soft-focus':    { title: '抖音滤镜感妆',    tone: '镜头前甜甜的' },
  'latina-bronze-glam':   { title: '拉丁古铜妆',      tone: '立体暖调' },
};

// style 导航卡片：label（用于 StylePicker / discover 风格区 / try-on 风格抽屉）
export const styleLabelZhCN: Record<string, string> = {
  'clean-girl-makeup':            '清透素颜',
  'soft-glam-makeup':             '柔光微醺',
  'glass-skin-makeup':            '玻璃肌',
  'no-makeup-makeup':             '伪素颜',
  'office-polished-makeup':       '通勤精致',
  'romantic-date-makeup':         '粉嫩恋爱',
  'latte-makeup':                 '拿铁妆',
  'peach-glow-makeup':            '蜜桃气色',
  'rose-milk-makeup':             '玫瑰奶茶',
  'quiet-luxury-makeup':          '静奢风',
  'camera-ready-makeup':          '上镜妆',
  'flash-proof-makeup':           '防闪光灯',
  'wedding-guest-makeup':         '婚礼宾客',
  'champagne-glow-makeup':        '香槟气色',
  'bronze-glam-makeup':           '古铜妆',
  'burgundy-velvet-makeup':       '酒红丝绒',
  'mature-radiance-makeup':       '成熟肌光彩',
  'hooded-eye-lift-makeup':       '肿眼泡提拉',
  'korean-dewy-glow-makeup':      '韩系水光',
  'french-natural-chic-makeup':   '法式慵懒',
  'douyin-soft-focus-makeup':     '抖音滤镜感',
  'latina-bronze-glam-makeup':    '拉丁古铜',
  'monochrome-rose-makeup':       '同色玫瑰',
  'olive-rose-balance-makeup':    '橄榄皮玫瑰',
  'sunburn-blush-makeup':         '晒伤腮红',
  'watercolor-blush-makeup':      '水彩腮红',
  'jelly-lip-makeup':             '果冻唇',
  'reflective-lid-makeup':        '反光眼皮',
  'vacation-bronze-makeup':       '度假古铜',
  'cloud-skin-makeup':            '云朵雾面',
  'interview-ready-makeup':       '面试妆',
  'passport-photo-makeup':        '证件照妆',
  'creator-glow-makeup':          '博主出镜',
  'five-minute-makeup':           '五分钟快手',
  'asian-soft-definition-makeup': '亚洲柔和定义',
  'soft-berry-stain-makeup':      '柔莓染唇',
  'monolid-makeup':               '单眼皮妆容',
  'olive-skin-makeup':            '橄榄皮妆容',
  'deep-skin-makeup':             '深肤色妆容',
  'korean-dewy-makeup':           '韩系水光妆',
};

// persona 标签的中文（StylePicker 卡片副标题）
export const personaTagZhCN: Record<string, string> = {
  '5-min friendly': '五分钟友好',
  'K-beauty': '韩系水光',
  'Invisible polish': '像没化但更精致',
  'Quiet authority': '低调有气场',
  'Warm flush': '暖调好气色',
  'Warm neutral': '暖调裸色',
  'Fresh peach': '清新蜜桃感',
  'Milky rose': '奶调玫瑰',
  'Quiet luxury': '静奢高级感',
  'Photo balanced': '上镜更均衡',
  'No flashback': '闪光灯不泛白',
  'Heat-safe polish': '耐热又得体',
  'Soft shimmer': '细腻微闪',
  'Warm sculpt': '暖调立体感',
  'Deep velvet': '深色丝绒感',
  'Mature skin': '成熟肌友好',
  'Hooded lift': '肿眼泡提拉',
  'French chic': '法式松弛感',
  'Camera sweet': '镜头甜美感',
  'Defined warmth': '暖调轮廓感',
  'Monochrome': '同色系妆感',
  'Olive balance': '橄榄皮不显脏',
  'Lifted blush': '腮红提拉感',
  'Diffused color': '柔和晕染色',
  'Sheer juicy lip': '清透果汁唇',
  'Light-catching eyes': '眼妆会抓光',
  'Sunlit sculpt': '阳光立体感',
  'Soft-focus base': '柔焦底妆',
  'Interview safe': '面试不出错',
  'ID-safe polish': '证件照友好',
  'K-beauty dewy': '韩系水光感',
  'Soft definition':  '柔和定义',
  'Monolid friendly': '单眼皮友好',
  'Olive undertone':  '橄榄底色',
  'Deep skin glow':   '深肤色气色',
  '5-min routine':    '5 分钟搞定',
  'Studio friendly':  '出镜友好',
  'Blurred berry':    '晕染莓果',
};

// 妆容分组标签（InspirationGrid 的 groupLabel）
export const groupLabelZhCN: Record<string, string> = {
  'Trending this week': '本周热门',
  "Editor's pick: Quiet office mornings": '编辑精选：通勤精致感',
  'Date night drop': '约会妆上新',
  'Camera-safe edit': '上镜不翻车',
  'Trending Daily':    '日常热门',
  'Date & Romantic':   '约会与恋爱',
  'Photo & Event':     '拍照与活动',
  'By Feature':        '按特征',
  'Beginner Friendly': '新手友好',
  Daily:    '日常',
  Date:     '约会',
  Photo:    '拍照',
  Event:    '活动',
  Beginner: '新手',
  Feature:  '特征',
};

// StylePicker 筛选标签（aestheticOptions / featureOptions 的 label）
export const filterLabelZhCN: Record<string, string> = {
  'All styles': '全部风格',
  Clean: '清透',
  Glow: '水光',
  Glam: '精致',
  Editorial: '高级感',
  Camera: '上镜',
  Event: '活动',
  '5-min': '5 分钟',
  Daily: '日常',
  'Full look': '全妆',
  Monolid: '单眼皮',
  'Hooded eyes': '肿眼泡',
  'Mature skin': '成熟肌',
  Olive: '橄榄皮',
  Deep: '深肤色',
};

type LocaleLike = string | undefined;
const isZh = (locale: LocaleLike) => locale === 'zh-CN';

/** 解析 look 的中文 title，缺失则回退英文 */
export function resolveLookTitle(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? (lookNameZhCN[slug]?.title ?? fallback) : fallback;
}

/** 解析 look 的中文 tone，缺失则回退英文 */
export function resolveLookTone(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? (lookNameZhCN[slug]?.tone ?? fallback) : fallback;
}

/** 解析 style 的中文 label，缺失则回退英文 */
export function resolveStyleLabel(slug: string, fallback: string, locale: LocaleLike): string {
  return isZh(locale) ? (styleLabelZhCN[slug] ?? fallback) : fallback;
}

/** 解析 persona 标签的中文，缺失则回退英文 */
export function resolvePersonaTag(tag: string | undefined, locale: LocaleLike): string | undefined {
  if (!tag) return tag;
  return isZh(locale) ? (personaTagZhCN[tag] ?? tag) : tag;
}

/** 解析分组标签的中文，缺失则回退英文 */
export function resolveGroupLabel(label: string, locale: LocaleLike): string {
  return isZh(locale) ? (groupLabelZhCN[label] ?? label) : label;
}

/** 解析 StylePicker 筛选标签的中文，缺失则回退英文 */
export function resolveFilterLabel(label: string, locale: LocaleLike): string {
  return isZh(locale) ? (filterLabelZhCN[label] ?? label) : label;
}
