import type { LipstickShadePage } from '../lipstickShadePages';

/**
 * 简体中文 Lipstick Shade Guide 数据（P0 多语言 SEO）
 *
 * slug 保持英文稳定，内容按中文真实搜索表达重写。
 * relatedLinks 指向同语言 /zh/ 页面。
 */
export const lipstickShadePagesZhCN: LipstickShadePage[] = [
  {
    slug: 'warm-undertone-lipstick-shades',
    title: '暖皮口红色号推荐｜显白不发橘的颜色怎么选',
    description: '暖皮口红色号推荐：蜜桃玫瑰、暖砖红、焦糖裸色等带暖调的颜色，让黄调、金调肤色显气色又不发橘、不发暗。',
    eyebrow: '暖皮',
    headline: '有控制地选暖调：蜜桃、玫瑰木、柔砖红和焦糖裸色。',
    intro: '暖皮通常在带蜜桃、陶土、焦糖或暖玫瑰底色的口红上显气色。最稳的效果是暖而不荧光。',
    bestShades: [
      { name: '蜜桃玫瑰', hex: '#C9796D', why: '增加暖调又不会把脸推向橘色。' },
      { name: '柔砖红', hex: '#A85245', why: '有轮廓感，适合通勤或拍照妆。' },
      { name: '焦糖裸色', hex: '#B5725D', why: '一支不会让暖皮嘴巴消失的裸色。' },
    ],
    avoid: ['蓝调泡泡糖粉', '完全没有暖调的灰豆沙', '让嘴巴消失的浅米色'],
    testSteps: ['把颜色贴着脸颊比对，而不是只看手腕。', '在日光和手机镜头光下都看一下脸。', '如果牙齿显黄，就往玫瑰木方向移，而不是橘色。'],
    productLogic: ['膏状或缎光质地最适合日常。', '腮红用同色系，让整张脸协调。', '拍照时选比日常裸色深一号的颜色。'],
    relatedLinks: [
      { label: '韩系水光妆教程', href: '/zh/styles/korean-dewy-makeup/' },
      { label: '日常裸妆指南', href: '/zh/scenarios/everyday-natural-makeup/' },
      { label: '测试我的色号', href: '/zh/tools/shade-finder/' },
    ],
  },
  {
    slug: 'cool-undertone-lipstick-shades',
    title: '冷皮口红色号推荐｜显白显干净的玫瑰莓果色',
    description: '冷皮口红色号推荐：玫瑰粉、莓果色、冷豆沙和蓝调红等颜色，让粉调、玫瑰调肤色显白显干净，避免发黄发暗。',
    eyebrow: '冷皮',
    headline: '蓝调玫瑰、莓果、豆沙和柔蓝红通常更显干净。',
    intro: '冷皮往往在带蓝、玫瑰、莓果或豆沙底色的口红上更显干净。关键是避开会让皮肤显黄的橘色暖调。',
    bestShades: [
      { name: '蓝调玫瑰', hex: '#A94D64', why: '提亮脸色又不会太粉。' },
      { name: '柔莓果', hex: '#8F3E5C', why: '增加约会妆的存在感，同时保持精致。' },
      { name: '冷豆沙', hex: '#936071', why: '适合冷调或冷橄榄肤色的日常色。' },
    ],
    avoid: ['珊瑚橘', '黄米色裸色', '橘红太重的暖棕'],
    testSteps: ['把玫瑰和珊瑚并排放在嘴边比较。', '选让眼白显得更干净的那个。', '如果脸显灰，就加深莓果而不是加暖。'],
    productLogic: ['豆沙是最稳的日常色系。', '晚妆用莓果比珊瑚更合适。', '蓝调红通常比番茄红更显干净。'],
    relatedLinks: [
      { label: '约会妆指南', href: '/zh/scenarios/everyday-natural-makeup/' },
      { label: '冷暖皮判断', href: '/zh/tools/undertone-quiz/' },
      { label: '测试我的色号', href: '/zh/tools/shade-finder/' },
    ],
  },
  {
    slug: 'neutral-undertone-lipstick-shades',
    title: '中性皮口红色号推荐｜冷暖都能驾驭的平衡色',
    description: '中性皮口红色号推荐：平衡玫瑰、玫瑰棕、柔和红和柔莓果，适合日常和拍照妆，冷暖都能尝试。',
    eyebrow: '中性皮',
    headline: '平衡玫瑰、玫瑰棕、柔和红和柔莓果给你最大灵活度。',
    intro: '中性皮能驾驭更多色系，但最好的效果仍取决于面部对比度、唇色深浅，以及妆容会出现的灯光环境。',
    bestShades: [
      { name: '平衡玫瑰', hex: '#B45F68', why: '通勤、约会和日常都适用。' },
      { name: '玫瑰棕', hex: '#9D5D55', why: '增加轮廓感，又不会太暖或太冷。' },
      { name: '柔和红', hex: '#B13F3C', why: '一支不会盖过中性肤色的干净红。' },
    ],
    avoid: ['太浅的裸色', '荧光粉', '如果脸本来就显淡，避免很灰的豆沙'],
    testSteps: ['先在日光下试色。', '拍张手机照看唇色会不会消失。', '如果冷暖都好看，就按服装和场景来选。'],
    productLogic: ['中性皮可以用口红来决定整体色彩故事。', '腮红和唇色保持同色系。', '上镜妆加唇线让边缘更清晰。'],
    relatedLinks: [
      { label: '成熟肌妆容指南', href: '/zh/scenarios/mature-skin-makeup/' },
      { label: '中文美妆指南', href: '/zh/makeup-guides/' },
      { label: '测试我的色号', href: '/zh/tools/shade-finder/' },
    ],
  },
  {
    slug: 'olive-skin-lipstick-shades',
    title: '橄榄皮口红色号推荐｜不显脏不发绿的颜色',
    description: '橄榄皮口红色号推荐：灰调玫瑰、柔梅子、豆沙棕等低饱和颜色，尊重橄榄皮的绿灰底色，避免显脏和发绿。',
    eyebrow: '橄榄皮',
    headline: '灰调玫瑰、莓果、豆沙棕和柔梅子通常更显高级。',
    intro: '橄榄皮有绿色或灰金底色，会让简单的冷暖建议失灵。低饱和的颜色往往比亮色更好看，因为它们尊重肤色的深度。',
    bestShades: [
      { name: '灰调玫瑰', hex: '#9E5A63', why: '增加气色又不和橄榄底色打架。' },
      { name: '柔梅子', hex: '#754052', why: '给晚妆深度又不会发橘。' },
      { name: '豆沙棕', hex: '#8B5C58', why: '一支在橄榄皮上很稳的日常色。' },
    ],
    avoid: ['奶粉色', '纯橘珊瑚', '很浅的米色裸色'],
    testSteps: ['把颜色贴着下半张脸试，而不是手臂。', '如果脸显绿，就避开这个颜色。', '如果嘴巴和脸显得脱节，就降低饱和度。'],
    productLogic: ['低饱和通常比亮色更安全。', '如果底色不太紫，冷莓果适合晚妆。', '棕粉色通常比米色裸色更合适。'],
    relatedLinks: [
      { label: '橄榄皮妆容指南', href: '/zh/styles/olive-skin-makeup/' },
      { label: '肿眼泡眼妆指南', href: '/zh/scenarios/hooded-eyes-makeup/' },
      { label: '测试我的色号', href: '/zh/tools/shade-finder/' },
    ],
  },
  {
    slug: 'deep-skin-lipstick-shades',
    title: '深肤色口红色号推荐｜显色不发灰的莓果棕红',
    description: '深肤色口红色号推荐：可可玫瑰、棕红、深莓果、梅子等有足够深度的颜色，让深肤色嘴巴在镜头下依然清晰、不发灰。',
    eyebrow: '深肤色',
    headline: '浓莓果、棕红、梅子、可可玫瑰和深裸色让嘴巴保持可见。',
    intro: '深肤色能把浓郁的唇色驾驭得很美，但颜色仍需要正确的底色。最大的错误是选一个太浅或太灰的裸色。',
    bestShades: [
      { name: '可可玫瑰', hex: '#74433E', why: '一支扎实的日常色，不会发灰。' },
      { name: '棕红', hex: '#7E2F2B', why: '一个能撑住深度的精致红色系。' },
      { name: '深莓果', hex: '#5F263F', why: '增加晚妆存在感，拍照也好看。' },
    ],
    avoid: ['没有唇线的浅粉色', '灰米色裸色', '一抹就消失的稀薄薄涂色'],
    testSteps: ['看唇色在镜头光下是否依然可见。', '试裸色时用唇线笔。', '如果颜色显灰，就选更多红、莓果或棕的深度。'],
    productLogic: ['显色度和深度比亮度更重要。', '唇线能让浅一点的颜色更好穿。', '浓郁的缎光质地通常比哑光更上镜。'],
    relatedLinks: [
      { label: '深肤色妆容指南', href: '/zh/styles/deep-skin-makeup/' },
      { label: '婚礼宾客妆指南', href: '/zh/scenarios/wedding-guest-makeup/' },
      { label: '测试我的色号', href: '/zh/tools/shade-finder/' },
    ],
  },
  {
    slug: 'asian-skin-lipstick-shades',
    title: '亚洲肤色口红色号推荐｜冷暖深浅怎么一起看',
    description: '亚洲肤色口红色号推荐：玫瑰棕、柔珊瑚、柔莓果、茶玫瑰等颜色，按冷暖调和肤色深浅一起判断，比奶粉色更显气色。',
    eyebrow: '亚洲肤色',
    headline: '玫瑰棕、柔珊瑚、柔莓果和茶玫瑰通常比奶粉色更显干净。',
    intro: '亚洲肤色不是单一底色。可能是浅而冷、中等而橄榄、小麦而金调，也可能深而中性。最可靠的口红色号会同时尊重底色和对比度，而不是假设每种亚洲肤色都适合同样的蜜桃或红色。',
    bestShades: [
      { name: '茶玫瑰', hex: '#B76A68', why: '增加自然气色，又不会太粉或太橘。' },
      { name: '玫瑰棕', hex: '#8F554D', why: '在橄榄、中性和中等亚洲肤色上稳住唇色。' },
      { name: '柔莓果', hex: '#8A3D58', why: '给冷皮、浅肤色或晚妆显色，又不会太生硬。' },
    ],
    avoid: ['遮瑕感的米色裸色', '白底奶粉色', '在橄榄皮上发橘的荧光珊瑚'],
    testSteps: [
      '把颜色贴着下半张脸和原生唇线比对，而不是只看手腕。',
      '在日光和室内各拍一张照，因为亚洲底色在暖光灯下常常偏移。',
      '如果脸显灰，就选更多玫瑰或棕的深度；如果发橘，就降低珊瑚、加莓果或豆沙。',
    ],
    productLogic: [
      '浅亚洲肤色通常需要柔玫瑰、茶玫瑰或干净莓果，而不是米色裸色。',
      '中等和橄榄亚洲肤色一般比浅粉更适合玫瑰棕、柔珊瑚、豆沙棕和陶土玫瑰。',
      '小麦和深亚洲肤色需要足够的棕、红、莓果或可可深度，让嘴巴在照片里保持可见。',
    ],
    relatedLinks: [
      { label: '单眼皮妆容指南', href: '/zh/styles/monolid-makeup/' },
      { label: '韩系水光妆教程', href: '/zh/styles/korean-dewy-makeup/' },
      { label: '先判断你的冷暖皮', href: '/zh/tools/undertone-quiz/' },
    ],
  },
];
