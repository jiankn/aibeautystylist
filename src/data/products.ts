// 产品推荐 schema：预留联盟营销字段。

export interface ProductSku {
  id: string;
  name: string;
  brand: string;
  category: "base" | "eyes" | "brows" | "cheeks" | "lips" | "tools";
  tier: "budget" | "standard" | "premium";
  priceRange: string;
  /** 联盟链接（预留） */
  affiliateUrl?: string;
  /** 联盟网络（预留） */
  affiliateNetwork?: string;
  /** 佣金等级（预留） */
  commissionTier?: number;
  /** 绑定的教程步骤 order */
  tutorialStepOrder?: number;
  /** 是否"不建议买" */
  notRecommended?: boolean;
  notRecommendedReason?: string;
}

export interface ProductKit {
  id: string;
  lookSlug: string;
  tier: "budget" | "standard" | "premium";
  title: string;
  totalPriceRange: string;
  products: ProductSku[];
}

// Mock 产品数据。
export const mockProductKits: ProductKit[] = [
  {
    id: "kit-commute-budget",
    lookSlug: "commute",
    tier: "budget",
    title: "通勤妆平价工具包",
    totalPriceRange: "¥80-150",
    products: [
      {
        id: "p1",
        name: "轻薄气垫",
        brand: "CARSLAN/卡姿兰",
        category: "base",
        tier: "budget",
        priceRange: "¥40-60",
        tutorialStepOrder: 1,
      },
      {
        id: "p2",
        name: "眉笔",
        brand: "FLORTTE/花洛莉亚",
        category: "brows",
        tier: "budget",
        priceRange: "¥15-25",
        tutorialStepOrder: 2,
      },
      {
        id: "p3",
        name: "四色眼影盘",
        brand: "PERFECT DIARY/完美日记",
        category: "eyes",
        tier: "budget",
        priceRange: "¥30-50",
        tutorialStepOrder: 3,
      },
    ],
  },
  {
    id: "kit-commute-standard",
    lookSlug: "commute",
    tier: "standard",
    title: "通勤妆标准工具包",
    totalPriceRange: "¥200-400",
    products: [
      {
        id: "p4",
        name: "持妆粉底液",
        brand: "MAC",
        category: "base",
        tier: "standard",
        priceRange: "¥200-280",
        tutorialStepOrder: 1,
      },
      {
        id: "p5",
        name: "精细眉笔",
        brand: "Benefit",
        category: "brows",
        tier: "standard",
        priceRange: "¥100-150",
        tutorialStepOrder: 2,
      },
      {
        id: "p6",
        name: "哑光眼影盘",
        brand: "Charlotte Tilbury",
        category: "eyes",
        tier: "standard",
        priceRange: "¥300-400",
        tutorialStepOrder: 3,
      },
    ],
  },
];

// "不建议买什么"示例。
export const notRecommendedProducts: ProductSku[] = [
  {
    id: "nr1",
    name: "超高遮瑕粉底",
    brand: "—",
    category: "base",
    tier: "premium",
    priceRange: "—",
    notRecommended: true,
    notRecommendedReason: "通勤妆追求轻薄透气，高遮瑕会显厚重且容易脱妆",
  },
  {
    id: "nr2",
    name: "大亮片眼影",
    brand: "—",
    category: "eyes",
    tier: "budget",
    priceRange: "—",
    notRecommended: true,
    notRecommendedReason: "日常通勤场合不适合大面积亮片，容易显得不专业",
  },
];

export function getProductKitsByLookSlug(lookSlug: string): ProductKit[] {
  return mockProductKits.filter((k) => k.lookSlug === lookSlug);
}
