import type { ScenarioPage } from '../scenarioPages';

/**
 * 简体中文 Scenario Guide 数据（P0 多语言 SEO）
 *
 * slug 保持英文稳定，内容按中文真实搜索表达重写。
 * relatedLinks 指向同语言 /zh/ 页面。
 */
export const scenarioPagesZhCN: ScenarioPage[] = [
  {
    slug: 'hooded-eyes-makeup',
    title: '肿眼泡眼妆教程｜睁眼也有轮廓的眼影画法',
    description: '肿眼泡眼妆教程：睁眼定位眼窝、把深色集中在外眼角和睫毛根、小幅外眼角提拉，让眼妆睁眼时不消失也不显肿。',
    eyebrow: '肿眼泡眼妆',
    headline: '把轮廓画在睁眼也能看到的位置。',
    intro: '肿眼泡常常一睁眼眼影就被吃掉。解决办法不是涂更多眼影，而是把颜色放得更高、加强睫毛根部、做可控的外眼角提拉。',
    image: '/images/hero/look-hooded-eyes-lift.webp',
    tryOnScenario: 'office',
    tryOnLook: 'hooded-eyes-lift',
    steps: [
      '上深色之前先睁眼定位眼窝位置。',
      '把深色留在外侧三分之一并贴近睫毛根。',
      '用小幅外眼角上扬代替粗眼线。',
      '小心提亮内眼角，不要把珠光晕得太宽。',
    ],
    avoid: ['照搬闭眼画褶皱的教程', '占用眼皮空间的粗眼线', '褶皱上方的大块珠光'],
    bestFor: ['肿眼泡', '接近单眼皮的眼型', '柔和上扬眼妆', '眼影总是消失的人'],
    decisionGuide: [
      { label: '如果眼影消失', detail: '睁眼时把过渡色放在自然褶皱稍上方。' },
      { label: '如果眼线让眼睛变小', detail: '改用贴睫毛根的内眼线，只提拉外侧三分之一。' },
      { label: '如果珠光晕染', detail: '把珠光留在内眼角或眼皮中央，不要扫过褶皱。' },
    ],
    productPriorities: ['哑光灰棕眼影', '棕色膏状眼线', '纤长型睫毛膏', '小号细节刷', '柔玫瑰唇色'],
    timeRequired: {
      quick: '6-8 分钟：睁眼定位、睫毛根眼线、睫毛膏、腮红和唇色。',
      full: '18-25 分钟：眼部打底、眼窝定位、外眼角提拉、细节晕染和晕染检查。',
      touchUp: '1 分钟：清理晕染、补强外侧三分之一，必要时再卷睫毛。',
    },
    commonMistakes: [
      { mistake: '闭眼按褶皱位置画。', fix: '睁眼定位眼影，让结构保持可见。' },
      { mistake: '整片眼皮画粗眼线。', fix: '眼线贴睫毛根画细，只提拉外侧三分之一。' },
      { mistake: '把珠光扫过褶皱。', fix: '把珠光集中在内眼角或眼皮中央，更不易晕染。' },
    ],
    routine: [
      { label: '上眼影前', items: ['眼皮轻打底，只定容易晕染的区域。', '正视前方，标出看得见的眼窝区域。', '用小刷子让颜色更可控。'] },
      { label: '几小时后', items: ['检查褶皱上方是否晕染。', '补眼线前先清理晕开的部分。', '只在外侧睫毛补睫毛膏来提拉眼睛。'] },
    ],
    faqs: [
      { question: '肿眼泡眼影应该画在哪里？', answer: '睁眼时把过渡色和深度放在自然褶皱稍上方，再把更深的颜色留在外侧睫毛根附近。' },
      { question: '肿眼泡适合画眼线上扬吗？', answer: '小幅外眼角上扬或内眼线通常比粗上扬更合适，因为能保留看得见的眼皮空间。' },
    ],
    relatedLinks: [
      { label: '单眼皮妆容指南', href: '/zh/styles/monolid-makeup/' },
      { label: '橄榄皮口红色号', href: '/zh/lipstick-shades/olive-skin-lipstick-shades/' },
      { label: '在自己脸上试这个眼妆', href: '/try-on?locale=zh-CN&scenario=office&look=hooded-eyes-lift&from=zh_scenario_hooded' },
    ],
  },
  {
    slug: 'mature-skin-makeup',
    title: '成熟肌妆容指南｜薄层、提拉和不卡纹的画法',
    description: '成熟肌妆容指南：用薄层底妆、打高的腮红、柔和的眼线和滋润唇色，恢复气色而不显厚重、不卡纹。',
    eyebrow: '成熟肌',
    headline: '用更薄的层次、更高的位置、更柔的边缘。',
    intro: '成熟肌通常在妆容增加光泽和结构、又不卡进纹理时最好看。位置比遮盖更重要。',
    image: '/images/hero/look-mature-skin-radiance.webp',
    tryOnScenario: 'office',
    tryOnLook: 'mature-skin-radiance',
    steps: [
      '充分补水打底，用薄层底妆代替全遮盖。',
      '腮红打高一点，在视觉上提拉脸部。',
      '用柔棕定义代替生硬的黑眼线。',
      '选有气色的唇色，但避开会强调唇纹的干燥配方。',
    ],
    avoid: ['哑光全遮盖底妆', '全脸扫散粉', '深色生硬的唇线'],
    bestFor: ['成熟肌', '干燥纹理', '柔和提拉妆容', '职场日常妆'],
    decisionGuide: [
      { label: '如果底妆卡纹', detail: '减少粉底，只修正不均匀的区域。' },
      { label: '如果脸颊显得下垂', detail: '把腮红打高，边缘保持柔和。' },
      { label: '如果嘴唇显小', detail: '用奶油质地的玫瑰木或莓果棕，边缘柔化。' },
    ],
    productPriorities: ['补水妆前乳', '灵活遮瑕', '膏状腮红', '柔棕眼线', '奶油质地口红'],
    timeRequired: {
      quick: '7-10 分钟：补水、针对性遮瑕、打高腮红、柔眼线和奶油唇色。',
      full: '20-30 分钟：含护肤打底、薄层底妆、眉形修饰和小心定妆。',
      touchUp: '1-2 分钟：按压平整卡纹、补唇部滋润、在脸颊高处补腮红。',
    },
    commonMistakes: [
      { mistake: '用哑光全遮盖盖住纹理。', fix: '用灵活薄层，只修正不均匀区域，让皮肤动起来更平滑。' },
      { mistake: '全脸扫散粉。', fix: '只定容易卡纹或出油的区域，让脸颊保持柔和光泽。' },
      { mistake: '腮红打太低。', fix: '把腮红打高一点向上晕开，做出更提拉的效果。' },
    ],
    routine: [
      { label: '上妆前', items: ['给乳液时间吸收再上底妆。', '比平时少用粉底，只在需要的地方加遮瑕。', '脸颊和唇部选膏状或缎光质地。'] },
      { label: '妆中', items: ['加产品前先按压平整卡纹。', '用奶油质地补唇，而不是叠干哑光。', '只在出油显眼处用小刷子补散粉。'] },
    ],
    faqs: [
      { question: '成熟肌适合什么粉底质地？', answer: '灵活的缎光或自然质地通常比哑光或太亮的质地看起来更平滑。' },
      { question: '成熟肌应该避开珠光吗？', answer: '不必完全避开。在平滑的高点用细腻光泽，避开在纹理区域用大颗粒珠光。' },
    ],
    relatedLinks: [
      { label: '中等肤色口红色号', href: '/zh/lipstick-shades/neutral-undertone-lipstick-shades/' },
      { label: '日常裸妆指南', href: '/zh/scenarios/everyday-natural-makeup/' },
      { label: '在自己脸上试这个妆', href: '/try-on?locale=zh-CN&scenario=office&look=mature-skin-radiance&from=zh_scenario_mature' },
    ],
  },
  {
    slug: 'wedding-guest-makeup',
    title: '婚礼宾客妆指南｜上镜、耐久又不抢新娘风头',
    description: '婚礼宾客妆指南：用半哑光底妆、配合服装的唇色、柔和眼部结构和补妆策略，做出上镜耐久又得体的妆容。',
    eyebrow: '婚礼宾客妆',
    headline: '照片里得体好看，但不会被误认成伴娘。',
    intro: '婚礼宾客妆应该耐久、显气色又尊重场合。合适的妆容比日常妆更有结构，但比新娘妆更克制。',
    image: '/images/hero/look-wedding-guest.webp',
    tryOnScenario: 'photo',
    tryOnLook: 'wedding-guest',
    steps: [
      '让唇色配合服装色调，而不是和面料打架。',
      '用半哑光底妆，让照片在长时间室内灯下保持干净。',
      '先用棕色或灰棕做眼型，再加珠光。',
      '随身带一支唇部产品和一块补妆散粉。',
    ],
    avoid: ['新娘级别的白色珠光', '和服装冲突的唇色', '没做过闪光测试的粉底'],
    bestFor: ['婚礼宾客', '晚宴', '家庭合影', '长时间活动'],
    decisionGuide: [
      { label: '如果服装很亮', detail: '让唇色低调，用腮红连接脸和服装。' },
      { label: '如果服装是中性色', detail: '用玫瑰木、莓果或柔和红，避免显得没气色。' },
      { label: '如果现场有闪光灯', detail: '跳过厚重珠光，用半哑光的定调唇色。' },
    ],
    productPriorities: ['半哑光底妆', '柔修容色', '棕色眼线', '玫瑰木口红', '吸油散粉'],
    timeRequired: {
      quick: '12-15 分钟：底妆平衡、眉毛、睫毛、腮红和上镜唇色。',
      full: '30-40 分钟：持久底妆、眼型、服装配色和闪光检查。',
      touchUp: '晚餐后 2 分钟：吸油、补唇、柔化鼻翼卡纹。',
    },
    commonMistakes: [
      { mistake: '妆容太死板地照搬服装颜色。', fix: '呼应服装的冷暖，但让唇色和腮红在你肤色上依然好穿。' },
      { mistake: '用新娘级别的珠光。', fix: '选缎光或细腻高光，显得精致又不抢新娘风头。' },
      { mistake: '忘了闪光拍照。', fix: '避开高 SPF 的白调、大颗粒珠光和没测试过的散粉。' },
    ],
    routine: [
      { label: '出门前', items: ['把唇色贴着服装颜色比对。', '如果可能拍晚间照片，先用闪光给底妆拍一张。', '带上吸油散粉和当天用的同一支唇部产品。'] },
      { label: '在婚宴上', items: ['补散粉前先吸油。', '合影前补口红。', '轻轻清理眼下落粉，而不是叠遮瑕。'] },
    ],
    faqs: [
      { question: '婚礼宾客可以涂浓唇色吗？', answer: '可以，只要整体妆容保持精致，颜色衬托服装而不是变成全部焦点。' },
      { question: '婚礼宾客应该避开什么妆？', answer: '避开新娘白珠光、没测试过的底妆，以及在照片里和服装强烈冲突的唇色。' },
    ],
    relatedLinks: [
      { label: '深肤色口红色号', href: '/zh/lipstick-shades/deep-skin-lipstick-shades/' },
      { label: '深肤色妆容指南', href: '/zh/styles/deep-skin-makeup/' },
      { label: '在自己脸上试这个妆', href: '/try-on?locale=zh-CN&scenario=photo&look=wedding-guest&from=zh_scenario_wedding' },
    ],
  },
  {
    slug: 'everyday-natural-makeup',
    title: '日常裸妆指南｜清透、好上手、可重复的画法',
    description: '日常裸妆指南：用更少的产品、唇颊同色和可重复的简单步骤，做出清透自然、新手也安全的日常妆。',
    eyebrow: '日常裸妆',
    headline: '看起来就像你皮肤状态更好的那一天。',
    intro: '裸妆失败，往往是因为它变成了一套假装简单的全妆。最好的日常版本用更少的产品、更好的位置和颜色协调。',
    image: '/images/hero/look-soft-matte-everyday.webp',
    tryOnScenario: 'office',
    tryOnLook: 'soft-matte-everyday',
    steps: [
      '局部遮瑕，而不是盖满全脸。',
      '用一个唇颊同色，让整张脸显得平静。',
      '如果黑色太明显，就选棕色睫毛膏或眉胶。',
      '第一眼显得清透、而不是“画完了”时就停手。',
    ],
    avoid: ['太多琐碎步骤', '腮红拖得太低', '裸妆却用全哑光底妆'],
    bestFor: ['日常出门', '校园安全的妆感', '第一套化妆流程', '不喜欢厚底妆的人'],
    decisionGuide: [
      { label: '如果你是新手', detail: '只从遮瑕、唇颊染、眉毛和睫毛膏开始。' },
      { label: '如果腮红太明显', detail: '把位置打高，选更低饱和的颜色。' },
      { label: '如果底妆显厚', detail: '少用底妆，多做针对性修正。' },
    ],
    productPriorities: ['局部遮瑕', '膏状腮红', '染色润唇', '眉胶', '轻盈定妆喷雾'],
    timeRequired: {
      quick: '3-5 分钟：遮瑕、唇颊染、眉毛和睫毛膏。',
      full: '8-12 分钟：加护肤打底、轻定妆和精细位置。',
      touchUp: '30 秒：在唇上拍润唇或染唇、晕开腮红边缘、刷顺眉毛。',
    },
    commonMistakes: [
      { mistake: '为了裸妆用了太多产品。', fix: '把流程控制在几个高效步骤，每天重复同样的位置。' },
      { mistake: '因为一处不均匀就盖满全脸。', fix: '只局部修正需要的地方，好皮肤就留素。' },
      { mistake: '腮红拖得太低。', fix: '把颜色打高、打柔，让脸显得清透而不是厚重。' },
    ],
    routine: [
      { label: '早晨', items: ['先补水，让轻薄产品更快推开。', '用一个染色产品连接唇和颊。', '在妆看起来“画完了”之前停手；裸妆应该还能看到皮肤。'] },
      { label: '一天稍晚', items: ['补染色润唇，而不是重建底妆。', '在干燥处拍水或乳液再补遮瑕。', '加眼妆前先清理晕开的睫毛膏。'] },
    ],
    faqs: [
      { question: '日常裸妆只需要哪些产品？', answer: '大多数人可以从遮瑕、唇颊染、眉胶或眉笔、睫毛膏，以及一款轻散粉或喷雾开始。' },
      { question: '怎么让裸妆不显得暗淡？', answer: '用协调的唇颊同色，避免脸颊涂太多散粉，让脸保持立体感。' },
    ],
    relatedLinks: [
      { label: '韩系水光妆教程', href: '/zh/styles/korean-dewy-makeup/' },
      { label: '冷暖皮口红色号入口', href: '/zh/lipstick-shades/' },
      { label: '在自己脸上试这个妆', href: '/try-on?locale=zh-CN&scenario=office&look=soft-matte-everyday&from=zh_scenario_everyday' },
    ],
  },
];
