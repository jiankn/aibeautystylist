// 教程步骤 schema：PRD 要求 6-8 步，含区域、工具、动作、错误提醒、自检点。

export interface TutorialStep {
  order: number;
  title: string;
  /** 面部区域 */
  region: "base" | "eyes" | "brows" | "cheeks" | "lips" | "contour";
  /** 使用的工具/产品类型 */
  tool: string;
  /** 具体动作说明 */
  action: string;
  /** 常见错误提醒 */
  errorWarning?: string;
  /** 自检点 */
  selfCheck?: string;
  /** 是否为 Pro+ 专属步骤（Free 用户仅能看前 3 步） */
  premiumOnly?: boolean;
}

export interface Tutorial {
  id: string;
  lookSlug: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: TutorialStep[];
}

// Mock 教程数据。
export const mockTutorials: Tutorial[] = [
  {
    id: "tut-commute",
    lookSlug: "commute",
    title: "通勤妆容教程",
    description: "5 分钟打造清爽自然的通勤妆",
    difficulty: "beginner",
    estimatedMinutes: 5,
    steps: [
      {
        order: 1,
        region: "base",
        title: "底妆",
        tool: "气垫 / 轻薄粉底液",
        action: "薄涂全脸，指腹轻拍至贴肤",
        errorWarning: "避免涂太厚导致脱妆",
        selfCheck: "远看是否有明显妆感？不应该有",
      },
      {
        order: 2,
        region: "brows",
        title: "眉毛",
        tool: "眉笔 / 眉粉",
        action: "顺着毛流轻描眉形，填补空隙",
        errorWarning: "避免眉头过重或边界太硬",
        selfCheck: "两边眉毛是否对称？",
      },
      {
        order: 3,
        region: "eyes",
        title: "眼影",
        tool: "大地色 / 奶茶色眼影",
        action: "单色铺满眼窝，指腹晕染边缘",
        errorWarning: "避免选择闪片太大的颜色",
        selfCheck: "睁眼是否还能看到颜色？",
      },
      {
        order: 4,
        region: "cheeks",
        title: "腮红",
        tool: "蜜桃色 / 奶茶色腮红",
        action: "笑肌最高点轻扫，向太阳穴方向晕开",
        premiumOnly: true,
        errorWarning: "用量宜少不宜多",
        selfCheck: "是否像自然的好气色？",
      },
      {
        order: 5,
        region: "lips",
        title: "唇妆",
        tool: "唇釉 / 润唇膏",
        action: "涂抹中心后用指腹向外晕开",
        premiumOnly: true,
        errorWarning: "通勤妆不建议用深色唇膏",
        selfCheck: "颜色是否衬肤色？",
      },
      {
        order: 6,
        region: "base",
        title: "定妆",
        tool: "散粉 / 定妆喷雾",
        action: "T 区轻扑散粉，全脸喷定妆喷雾",
        premiumOnly: true,
        selfCheck: "妆面是否清爽不油腻？",
      },
    ],
  },
  {
    id: "tut-no-makeup",
    lookSlug: "no-makeup",
    title: "伪素颜教程",
    description: "打造看不出化了妆的自然好皮肤",
    difficulty: "beginner",
    estimatedMinutes: 8,
    steps: [
      {
        order: 1,
        region: "base",
        title: "妆前保湿",
        tool: "保湿面霜 / 妆前乳",
        action: "全脸薄涂保湿，等待 2 分钟吸收",
        selfCheck: "皮肤是否有光泽但不油？",
      },
      {
        order: 2,
        region: "base",
        title: "底妆",
        tool: "素颜霜 / 轻薄粉底液",
        action: "少量多次，海绵蛋轻拍推开",
        errorWarning: "素颜妆最忌讳底妆太厚",
        selfCheck: "能否看到自己的毛孔？应该若隐若现",
      },
      {
        order: 3,
        region: "brows",
        title: "野生眉",
        tool: "眉粉 / 透明眉膏",
        action: "只填补空隙，用眉刷梳理毛流",
        selfCheck: "是否看起来像天生好眉形？",
      },
      {
        order: 4,
        region: "cheeks",
        title: "奶油腮红",
        tool: "膏状腮红",
        action: "指腹取少量点在笑肌，拍开晕染",
        premiumOnly: true,
        selfCheck: "像不像刚运动完的自然红？",
      },
      {
        order: 5,
        region: "lips",
        title: "润唇",
        tool: "有色润唇膏",
        action: "直接涂抹，打造自然唇色",
        premiumOnly: true,
      },
      {
        order: 6,
        region: "eyes",
        title: "卷翘睫毛",
        tool: "睫毛夹 + 透明睫毛膏",
        action: "夹翘后刷一层透明睫毛膏固定",
        premiumOnly: true,
        selfCheck: "睁大眼睛是否更有神？",
      },
    ],
  },
];

// 根据 lookSlug 获取教程。
export function getTutorialByLookSlug(lookSlug: string): Tutorial | undefined {
  return mockTutorials.find((t) => t.lookSlug === lookSlug);
}
