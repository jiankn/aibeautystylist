export interface TryOnProduct {
  sku: string;
  name: string;
  category: string;
  shade: string;
  price: string;
  why: string;
}

export interface TryOnStep {
  title: string;
  detail: string;
  avoid: string;
  selfCheck: string;
}

export interface TryOnLook {
  id: string;
  name: string;
  reason: string;
  scenario: string;
  difficulty: string;
  minutes: string;
  focus: string;
  finish: string;
  tutorialHeadline: string;
  tutorialSteps: TryOnStep[];
  commonMistakes: string[];
  selfChecks: string[];
  kit: {
    mustHave: TryOnProduct[];
    optional: TryOnProduct[];
    upgrade: TryOnProduct[];
  };
}

export interface TryOnPlan {
  diagnosis: {
    title: string;
    summary: string;
    faceNotes: string[];
  };
  looks: TryOnLook[];
  shareCard: {
    title: string;
    subtitle: string;
    badge: string;
    hashtags: string[];
    cta: string;
  };
}

const product = (
  sku: string,
  name: string,
  category: string,
  shade: string,
  price: string,
  why: string,
): TryOnProduct => ({
  sku,
  name,
  category,
  shade,
  price,
  why,
});

const step = (title: string, detail: string, avoid: string, selfCheck: string): TryOnStep => ({
  title,
  detail,
  avoid,
  selfCheck,
});

const planMap: Record<string, TryOnPlan> = {
  office: {
    diagnosis: {
      title: 'Warm-neutral undertone · Soft definition fit',
      summary: '你的五官更适合“低浓度但有结构”的妆容路线，重点不是堆颜色，而是提气色和清晰度。',
      faceNotes: ['底妆适合轻薄提亮', '眉眼结构比大面积色彩更关键', '唇颊同色能让整体更干净高级'],
    },
    looks: [
      {
        id: 'office-glow',
        name: 'Office Glow',
        reason: '最快提升精神感，适合通勤和视频会议。',
        scenario: '通勤 / 会议',
        difficulty: 'Beginner',
        minutes: '8 min',
        focus: '气色、眉眼清晰度',
        finish: '柔雾裸粉',
        tutorialHeadline: '8 分钟把精神感提起来的通勤妆路线。',
        tutorialSteps: [
          step('轻薄打底，只修需要被提亮的地方', '先铺一层薄底，再把遮瑕集中在眼下、鼻翼和嘴角，避免整脸盖厚。', '不要为了“均匀”把整张脸刷成同一块颜色。', '站远一点看，肤色是否更整齐但还能看到自然纹理。'),
          step('眉峰和睫毛根部决定精神感', '用细眉笔把眉头到眉峰的线条修顺，再用深棕色沿睫毛根部轻压一层存在感。', '不要把眉尾拉太长，也不要整圈画黑眼线。', '闭眼时看线条是否只在根部，睁眼后眉眼是否更清晰。'),
          step('用低面积提亮处理眼下和鼻梁', '提亮只放在眼下三角和鼻梁中段，范围小但位置准，会更高级。', '不要额头、苹果肌、下巴全部一起发亮。', '正面看脸中央有立体感，但侧面没有明显珠光块。'),
          step('裸粉豆沙唇收尾，让气色统一', '先薄涂唇色，再轻拍到颊侧做一点点呼应，形成自然情绪色。', '不要口红太饱和，也不要腮红面积过大。', '嘴唇和面中颜色能呼应，但整体仍然像日常妆。'),
        ],
        commonMistakes: ['底妆铺太厚导致脸平', '眉尾拉太长显凶', '提亮范围太大会像出油'],
        selfChecks: ['视频会议镜头下五官是否更清楚', '近看皮肤仍有真实感', '唇色是否比原唇更有气色但不过分抢戏'],
        kit: {
          mustHave: [
            product('sku-office-base', 'Skin Veil Tint', '轻薄粉底', 'Neutral Linen', '$18', '通勤场景更需要轻薄匀净，而不是高遮瑕假面。'),
            product('sku-office-brow', 'Precision Brow Pencil', '眉笔', 'Soft Brown', '$12', '快速把眉形理顺，几秒钟就能提升精神感。'),
            product('sku-office-lip', 'Rosy Nude Lip Cream', '口红', 'Dusty Rose', '$16', '豆沙裸粉最适合提升气色且不挑场景。'),
          ],
          optional: [
            product('sku-office-shadow', 'Taupe Wash Mono', '单色眼影', 'Warm Taupe', '$11', '需要更利落时，少量铺在眼窝就够。'),
            product('sku-office-blush', 'Soft Flush Balm', '膏状腮红', 'Muted Petal', '$14', '可以把唇颊色做轻微统一。'),
          ],
          upgrade: [
            product('sku-office-corrector', 'Under-eye Corrector Duo', '遮瑕盘', 'Peach + Neutral', '$24', '适合经常熬夜、眼下偏灰的人。'),
            product('sku-office-glow', 'Micro Glow Stick', '高光膏', 'Champagne', '$22', '用于局部点亮，镜头里更显精神。'),
          ],
        },
      },
      {
        id: 'quiet-luxury',
        name: 'Quiet Luxury Taupe',
        reason: '更适合想显得干练、精致但不过分浓妆的用户。',
        scenario: '面试 / 会客',
        difficulty: 'Intermediate',
        minutes: '12 min',
        focus: '轮廓、眼部层次',
        finish: '香槟灰棕',
        tutorialHeadline: '把“干练精致”做出来，但不留下浓妆痕迹。',
        tutorialSteps: [
          step('用灰棕色把眼窝轮廓先搭好', '从眼尾向前薄薄晕开，只做轻轮廓，不做厚重烟熏。', '不要把深色压到整个上眼皮。', '眼睛张开时有立体度，但闭眼没有大面积色块。'),
          step('加强睫毛根部，让眼神更利落', '在根部叠加细线，再把睫毛刷整齐，重点是“干净锐利”。', '不要画粗上扬眼线，容易显攻击性。', '镜子里看，眼神更聚焦，但妆感没有明显加重。'),
          step('鼻梁和颧骨只做微弱提亮', '高光控制在骨相转折点，不是整个面中都发光。', '不要同时做过重修容和高光。', '侧脸能看到结构提升，正面没有闪片感。'),
          step('裸棕唇色做最后定调', '选择低饱和棕裸色，让整体显得有质感但不过分成熟。', '不要用过深咖色，会显疲惫。', '唇部边缘是否清晰，且和眼妆在同一灰棕体系。'),
        ],
        commonMistakes: ['灰棕色过深容易显脏', '修容和高光同时过重会显老', '唇色太深会破坏轻奢感'],
        selfChecks: ['面试场景下妆面是否更利落可信', '眼神是否更集中而非更凶', '整体色调是否统一在灰棕中性范围'],
        kit: {
          mustHave: [
            product('sku-quiet-shadow', 'Contour Taupe Quad', '眼影盘', 'Taupe Edit', '$28', '灰棕轮廓是这套妆容的核心骨架。'),
            product('sku-quiet-mascara', 'Root Lift Mascara', '睫毛膏', 'Espresso', '$17', '比大眼线更适合做精致存在感。'),
            product('sku-quiet-lip', 'Velvet Nude Lipstick', '口红', 'Cashmere Brown', '$19', '低饱和棕裸能稳住整体高级感。'),
          ],
          optional: [
            product('sku-quiet-contour', 'Soft Sculpt Cream', '修容膏', 'Neutral Taupe', '$20', '适合骨相本来偏平的人加强结构。'),
            product('sku-quiet-browgel', 'Feather Brow Gel', '眉胶', 'Ash Brown', '$13', '能让眉毛更有毛流感。'),
          ],
          upgrade: [
            product('sku-quiet-bright', 'Precision Brightener', '提亮笔', 'Vanilla Beige', '$23', '适合眼下容易疲惫的人做局部提亮。'),
            product('sku-quiet-setting', 'Blur Setting Mist', '定妆喷雾', 'Soft Matte', '$21', '让整体更干净、持久，适合长会议。'),
          ],
        },
      },
      {
        id: 'fresh-minimal',
        name: 'Fresh Minimal',
        reason: '适合第一次尝试化妆的新手，容错率最高。',
        scenario: '新手日常',
        difficulty: 'Beginner',
        minutes: '6 min',
        focus: '肤色均匀、唇颊呼应',
        finish: '清透自然',
        tutorialHeadline: '少步骤、低风险，但立刻更有精神。',
        tutorialSteps: [
          step('局部遮瑕替代厚底妆', '只修暗沉和瑕疵明显处，让大面积皮肤保持真实。', '不要先铺满底妆再去盖瑕疵。', '看起来像皮肤状态变好了，而不是像上了一层膜。'),
          step('淡扫腮红，把气色提起来', '从面中稍高位置轻扫，颜色要比你想象中再淡一点。', '不要涂到鼻头和面中过多区域。', '笑起来时气色更好，但脸没有“红一块”。'),
          step('润色唇膏做统一情绪色', '先涂薄一层，再把边缘拍开，显得更自然。', '不要追求边缘过于锋利。', '嘴唇看起来更健康，和腮红是同一个情绪方向。'),
          step('检查眼下、鼻翼、唇缘是否干净', '最后只做清洁边界，不要再继续叠产品。', '不要临门一脚又补很多颜色。', '镜子里第一眼感受到的是“清爽”，不是“画了很多”。'),
        ],
        commonMistakes: ['新手容易补太多步骤', '腮红下手过重会显肿', '润色唇膏叠太多会显油'],
        selfChecks: ['是否 6 分钟内可重复完成', '远看是否只觉得气色更好', '卸妆前不觉得有负担'],
        kit: {
          mustHave: [
            product('sku-fresh-concealer', 'Skin Match Concealer', '遮瑕', 'Light Neutral', '$15', '局部修饰比全脸底妆更适合新手。'),
            product('sku-fresh-blush', 'Cloud Cream Blush', '腮红', 'Nude Peach', '$14', '手指就能拍开，容错率高。'),
            product('sku-fresh-lip', 'Tinted Care Balm', '润色唇膏', 'Rose Tea', '$10', '颜色轻、补妆方便，日常压力最小。'),
          ],
          optional: [
            product('sku-fresh-brow', 'Soft Brow Mascara', '染眉膏', 'Natural Brown', '$12', '适合本身眉毛不错，只想更整齐的人。'),
          ],
          upgrade: [
            product('sku-fresh-cushion', 'Bare Cushion Compact', '气垫粉底', 'Warm Ivory', '$25', '需要更完整妆面时可替代局部遮瑕。'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My AI Office Makeup Plan',
      subtitle: 'Less effort, more polished every day.',
      badge: 'Work-ready glow',
      hashtags: ['#OfficeGlow', '#AIMakeupPlan', '#BeautyRoutine'],
      cta: '复制分享文案给朋友，或者继续进入教程细化动作。',
    },
  },
  date: {
    diagnosis: {
      title: 'Cool olive undertone · Soft glam fit',
      summary: '你更适合柔莓、藕粉和低饱和冷调路线，既显温柔也不会让肤色发灰发黄。',
      faceNotes: ['冷调柔莓比暖橘更提气色', '眼下和唇部最值得先优化', '低饱和轮廓会更显高级'],
    },
    looks: [
      {
        id: 'soft-glam',
        name: 'Soft Glam Berry',
        reason: '最适合约会的温柔精致路线。',
        scenario: '约会 / 晚餐',
        difficulty: 'Beginner',
        minutes: '10 min',
        focus: '唇颊呼应、眼下气色',
        finish: '柔莓丝绒',
        tutorialHeadline: '让人感觉精致又温柔，而不是“妆很重”。',
        tutorialSteps: [
          step('底妆维持轻透，先保留皮肤呼吸感', '约会妆的重点是近距离耐看，所以只修肤色不做厚遮瑕。', '不要为了完美而把皮肤纹理全部盖掉。', '近镜看仍像好状态皮肤，而不是舞台底妆。'),
          step('低饱和粉棕打底眼窝', '颜色铺在眼窝和眼尾，让眼神更温柔有层次。', '不要用高饱和玫红直接上眼。', '眼妆存在感柔和，不会先看到“颜色”。'),
          step('腮红横向轻扫，营造柔和氛围', '把腮红和唇色控制在同一柔莓体系，氛围感会更完整。', '不要把腮红打太靠下，容易显脸垮。', '笑起来时脸部轮廓仍然轻盈。'),
          step('柔莓唇色集中提气色', '唇中央稍深、边缘稍柔，会更有氛围感。', '不要画出过硬的唇线边界。', '嘴唇有存在感，但不会压过眼神。'),
        ],
        commonMistakes: ['莓色太深会压肤色', '腮红位置过低会显疲惫', '上眼颜色太重会失去温柔感'],
        selfChecks: ['和现实光线下相比，镜头里是否更柔和', '唇颊是否属于同一冷调柔莓体系', '近距离看边界是否足够干净'],
        kit: {
          mustHave: [
            product('sku-date-shadow', 'Petal Taupe Duo', '眼影', 'Rose Taupe', '$16', '粉棕打底是这套妆的氛围来源。'),
            product('sku-date-lip', 'Berry Blur Lip', '口红', 'Soft Berry', '$18', '能给唇部最直接的温柔存在感。'),
            product('sku-date-blush', 'Liquid Bloom Blush', '液体腮红', 'Cool Rose', '$15', '少量就能让面中活起来。'),
          ],
          optional: [
            product('sku-date-liner', 'Brown Silk Liner', '眼线', 'Mocha', '$13', '适合想让眼尾更精致的人。'),
          ],
          upgrade: [
            product('sku-date-lashes', 'Soft Cluster Lash', '假睫毛', 'Natural Lift', '$22', '晚餐或夜景场景更显精致。'),
            product('sku-date-highlight', 'Melt Glow Balm', '高光膏', 'Rose Pearl', '$20', '适合做面中小范围提亮。'),
          ],
        },
      },
      {
        id: 'clean-date',
        name: 'Clean Date Glow',
        reason: '适合喜欢更自然、干净气质的用户。',
        scenario: '白天约会 / 咖啡馆',
        difficulty: 'Beginner',
        minutes: '7 min',
        focus: '水光感、干净皮肤感',
        finish: '清透奶油肌',
        tutorialHeadline: '像自己状态很好，而不是专门盛装打扮。',
        tutorialSteps: [
          step('局部提亮和少量遮瑕', '让肤色先看起来干净，再决定要不要加更多步骤。', '不要一开始就追求无瑕疵。', '脸部最暗的地方变亮，但整体妆感仍然轻。'),
          step('只加强睫毛根部存在感', '刷整齐睫毛根部，比画明显眼线更自然。', '不要上下睫毛都刷得很厚。', '眼睛更有神，但看不出具体做了什么。'),
          step('裸粉唇颊统一', '用一支唇颊两用产品最快建立“干净约会妆”的情绪色。', '不要腮红太偏橘。', '唇颊色相接近，整体更协调。'),
          step('定点提亮鼻梁与内眼角', '只点亮最需要反光的位置，让画面更通透。', '不要整块珠光打在眼皮中央。', '转头时能看到轻微光泽，但正面不抢眼。'),
        ],
        commonMistakes: ['为了上镜补太多步骤', '高光面积太大显油', '唇颊颜色不统一会显杂乱'],
        selfChecks: ['白天自然光下是否清爽', '离近看时皮肤是否仍自然', '是否像“状态很好”的自己'],
        kit: {
          mustHave: [
            product('sku-clean-concealer', 'Bright Touch Concealer', '遮瑕', 'Neutral Peach', '$14', '快速把眼下和嘴角拉回干净状态。'),
            product('sku-clean-duo', 'Lip + Cheek Tint', '唇颊两用', 'Bare Rose', '$17', '一支完成唇颊统一，最省时间。'),
            product('sku-clean-mascara', 'Clean Lift Mascara', '睫毛膏', 'Soft Brown', '$15', '只做根部存在感更轻盈。'),
          ],
          optional: [
            product('sku-clean-highlight', 'Dew Point Highlighter', '提亮液', 'Moon Glow', '$16', '适合喜欢通透感但不想显粉感的人。'),
          ],
          upgrade: [
            product('sku-clean-shimmer', 'Fine Pearl Shadow', '细闪眼影', 'Champagne Pink', '$19', '适合白天咖啡馆或约会拍照。'),
          ],
        },
      },
      {
        id: 'night-mauve',
        name: 'Night Mauve Focus',
        reason: '适合偏夜晚或更有氛围感的场景。',
        scenario: '夜间约会 / 小聚',
        difficulty: 'Intermediate',
        minutes: '14 min',
        focus: '眼尾深度、唇部存在感',
        finish: '灰粉紫调',
        tutorialHeadline: '让五官在夜晚灯光下更有存在感，但边界仍然干净。',
        tutorialSteps: [
          step('眼尾做轻微加深', '重点放在后三分之一眼尾，制造更聚焦的轮廓。', '不要整圈围黑。', '张眼时眼神更深邃，但边界依然柔和。'),
          step('用灰粉色统一眼唇', '眼影和唇色选择同一冷调家族，氛围会更高级。', '不要眼影偏紫而口红偏橘。', '整体色调是否从眼到唇连贯。'),
          step('加强颧骨提亮，但控制面积', '只在颧骨最高点和鼻梁中段做反光。', '不要整个苹果肌都闪。', '灯光下有立体感，但不显浮粉。'),
          step('最后检查边界，避免显脏', '棉棒清理眼尾和唇角边缘，让妆面更“完成”。', '不要继续叠更多颜色。', '远看五官集中，近看边界干净。'),
        ],
        commonMistakes: ['夜晚场景容易下手过重', '冷调眼唇一旦不统一会显脏', '高光范围大时会放大毛孔'],
        selfChecks: ['夜间灯光下是否依然有层次', '唇色是否稳住整体氛围感', '边界是否足够干净利落'],
        kit: {
          mustHave: [
            product('sku-night-shadow', 'Mauve Smoke Palette', '眼影盘', 'Dusty Mauve', '$27', '夜间氛围感主要靠这盘色系。'),
            product('sku-night-liner', 'Lip Shape Pencil', '唇线笔', 'Cool Rosewood', '$12', '能让唇部更有存在感且不乱。'),
            product('sku-night-lip', 'Soft Matte Lip', '口红', 'Muted Plum', '$18', '夜间光线里更能稳住妆面重心。'),
          ],
          optional: [
            product('sku-night-contour', 'Micro Sculpt Powder', '修容', 'Soft Taupe', '$18', '适合需要加强骨相的人。'),
          ],
          upgrade: [
            product('sku-night-setting', 'No-Shift Setting Powder', '定妆粉', 'Translucent', '$23', '夜间和室内暖光下更能保持干净边界。'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My AI Date Night Beauty Plan',
      subtitle: 'Soft glam that actually fits me.',
      badge: 'Date-night mood',
      hashtags: ['#DateNightMakeup', '#SoftGlam', '#AIBeautyStylist'],
      cta: '先复制分享卡文案，再继续把动作细化到教程里。',
    },
  },
  photo: {
    diagnosis: {
      title: 'Neutral undertone · Camera-ready contrast fit',
      summary: '你适合在镜头前适度增强眉眼与唇部对比，让五官更清晰，但不能过厚。',
      faceNotes: ['镜头里需要更明确的轮廓', '眉眼和唇部都要有存在感', '底妆仍要避免面具感'],
    },
    looks: [
      {
        id: 'camera-glow',
        name: 'Camera Glow',
        reason: '适合日常拍照和头像场景。',
        scenario: '拍照 / 社媒',
        difficulty: 'Beginner',
        minutes: '9 min',
        focus: '轮廓提亮、眉眼清晰',
        finish: '清晰微光',
        tutorialHeadline: '让镜头里更立体，但现实里仍然自然。',
        tutorialSteps: [
          step('统一肤色但保留皮肤纹理', '上镜需要更均匀，但过厚会让镜头更假。', '不要盲目追求全哑光高遮瑕。', '照片里肤色整齐，但近看仍像皮肤。'),
          step('眉毛增强立体感', '重点加强眉峰和眉尾的结构，让镜头更容易识别轮廓。', '不要画成硬朗方眉。', '照片里眉眼更有框架，但不显僵。'),
          step('眼尾与唇峰做精修', '镜头最吃这些边界的清晰度，所以把轮廓修整到位。', '不要同时把所有地方都做深。', '只要眼尾和唇峰精致，五官就会更清晰。'),
          step('颧骨提亮提升上镜感', '小面积高光能增加面部层次和镜头反光。', '不要使用大颗粒闪片。', '自拍里能看到结构提升，而不是油光。'),
        ],
        commonMistakes: ['上镜妆最容易因为遮瑕过重而假', '眉形太硬会抢脸', '提亮选错质地会像出油'],
        selfChecks: ['自拍里五官是否更聚焦', '现实看妆感是否还能接受', '高光是否只提升骨相不放大毛孔'],
        kit: {
          mustHave: [
            product('sku-photo-foundation', 'Second Skin Foundation', '粉底', 'Neutral Beige', '$20', '镜头前需要更整齐的肤色基础。'),
            product('sku-photo-brow', 'Structure Brow Pencil', '眉笔', 'Neutral Brown', '$13', '照片里眉毛决定整体框架。'),
            product('sku-photo-highlight', 'Lens Lift Highlighter', '提亮产品', 'Soft Champagne', '$18', '帮助面部在镜头里更有转折。'),
          ],
          optional: [
            product('sku-photo-highlight2', 'Glow Dust Highlighter', '高光', 'Champagne', '$17', '适合自拍或内容图增加精致度。'),
          ],
          upgrade: [
            product('sku-photo-contour', 'Soft Focus Sculpt Palette', '轮廓盘', 'Neutral Sculpt', '$26', '适合拍头像或封面图时加强结构。'),
          ],
        },
      },
      {
        id: 'editorial-soft',
        name: 'Editorial Soft Focus',
        reason: '更偏品牌感和高级感的拍照路线。',
        scenario: '写真 / 内容图',
        difficulty: 'Intermediate',
        minutes: '15 min',
        focus: '轮廓、唇部质感',
        finish: '柔焦高级感',
        tutorialHeadline: '像品牌图一样的克制精致，不靠大浓妆取胜。',
        tutorialSteps: [
          step('眼窝灰棕打底，建立拍摄轮廓', '不要追求彩度，先把结构做对。', '不要让颜色盖过五官本身。', '镜头里眼窝更立体，但没有明显重色。'),
          step('鼻侧影轻塑形，注意过渡', '修容只做阴影关系，不做明显线条。', '不要把鼻影画成两条深线。', '照片里鼻梁更挺，但现实里也不突兀。'),
          step('口红边缘精修，增强完成度', '高级感常常来自边界处理，而不是颜色本身。', '不要用高饱和亮色破坏整体。', '唇部轮廓在照片里更明确。'),
          step('高光点到为止，留下柔焦空间', '只做一点反光，给镜头留出层次。', '不要全脸追光。', '成片里是柔焦感，不是闪亮感。'),
        ],
        commonMistakes: ['修容线条太硬会失去高级感', '颜色太多会像商业彩妆海报', '唇边不干净会很影响成片'],
        selfChecks: ['成片里是否有品牌感而非网感', '轮廓是否成立但不夸张', '嘴唇边缘是否足够利落'],
        kit: {
          mustHave: [
            product('sku-editorial-shadow', 'Studio Taupe Palette', '眼影', 'Neutral Taupe', '$29', '品牌感拍摄最依赖结构色。'),
            product('sku-editorial-lipliner', 'Velvet Edge Lip Pencil', '唇线笔', 'Beige Mauve', '$14', '让嘴唇在画面里更完整。'),
            product('sku-editorial-setting', 'Soft Blur Fixer', '定妆产品', 'Photo Finish', '$24', '帮助妆面更稳定、更适合拍摄。'),
          ],
          optional: [
            product('sku-editorial-contour', 'Liquid Sculpt', '液体修容', 'Stone Taupe', '$19', '适合熟练度更高时使用。'),
          ],
          upgrade: [
            product('sku-editorial-highlight', 'Pro Light Balm', '专业高光', 'Silk Pearl', '$28', '更适合内容拍摄或品牌图。'),
          ],
        },
      },
      {
        id: 'flash-proof',
        name: 'Flash-proof Fresh',
        reason: '更适合有闪光灯或强光的场景。',
        scenario: '活动 / 强光',
        difficulty: 'Intermediate',
        minutes: '11 min',
        focus: '控油、层次、边界干净',
        finish: '干净半雾面',
        tutorialHeadline: '强光下不反白、不浮粉，也不失去五官层次。',
        tutorialSteps: [
          step('先控油再轻薄上妆', '强光场景最怕底妆移位，所以顺序先稳住肤表。', '不要上来就厚铺粉底。', '底妆贴合且没有明显干裂或泛油。'),
          step('重点修饰鼻翼和眼下', '这两个区域最容易在闪光灯下暴露边界和暗沉。', '不要把遮瑕大面积外扩。', '照片里看不到明显分层或卡纹。'),
          step('避免过量珠光，保持半雾面层次', '让光线自己去塑造面部，而不是靠大面积高光。', '不要额头和面中都打亮。', '正面闪光照里脸部是干净而非发白。'),
          step('用唇色提升整体完成度', '在强光下，唇部需要一点重量来平衡五官。', '不要选过浅裸色，否则容易被吃掉。', '照片里唇部依然有存在感，且和整体风格统一。'),
        ],
        commonMistakes: ['强光场景高光太多会直接翻车', '控油不到位会显脏', '唇色过浅会让整体失焦'],
        selfChecks: ['闪光灯下是否没有明显反白', '底妆边界是否贴合', '唇部是否稳住整体完成度'],
        kit: {
          mustHave: [
            product('sku-flash-primer', 'Shine Control Primer', '控油妆前', 'Clear', '$16', '先稳住出油，才谈得上强光妆面。'),
            product('sku-flash-concealer', 'Flex Wear Concealer', '遮瑕', 'Neutral Light', '$15', '用在鼻翼和眼下最有效。'),
            product('sku-flash-lip', 'Semi Matte Lip Color', '口红', 'Warm Rosewood', '$17', '能在强光场景下保留唇部重心。'),
          ],
          optional: [
            product('sku-flash-mist', 'Lock-in Setting Mist', '定妆喷雾', 'Matte Hold', '$18', '适合活动时长更久的场景。'),
          ],
          upgrade: [
            product('sku-flash-powder', 'Soft Blur Compact', '柔焦粉饼', 'Translucent', '$24', '更适合活动现场或闪光灯连拍。'),
          ],
        },
      },
    ],
    shareCard: {
      title: 'My Camera-ready Makeup Diagnosis',
      subtitle: 'Sharper on camera, still natural in real life.',
      badge: 'Photo-ready finish',
      hashtags: ['#CameraReady', '#MakeupDiagnosis', '#BeautyCreator'],
      cta: '把这张分享卡文案带走，再继续进教程打磨动作。',
    },
  },
};

export function buildTryOnPlan(scenario: string = 'office'): TryOnPlan {
  return planMap[scenario] ?? planMap.office;
}

export function getAllLooks(): TryOnLook[] {
  return Object.values(planMap).flatMap((plan) => [...plan.looks]);
}

export function findLookById(id?: string | null): TryOnLook | undefined {
  if (!id) return undefined;
  return getAllLooks().find((look) => look.id === id);
}
