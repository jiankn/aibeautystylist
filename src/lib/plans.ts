// 计划元数据：单一事实源，与 migrations/0001_initial.sql 的 plans seed 对齐。
// 额度（monthlyQuota）、功能开关用于前端展示、权限守卫和额度计算。

export type PlanCode = "free" | "pro" | "premium";

export type BillingInterval = "monthly" | "yearly";

export interface PlanFeatures {
  shareReward: boolean;
  tutorials: boolean;
  hdDownload: boolean;
  priorityQueue: boolean;
  longTermHistory: boolean;
  fullLookLibrary: boolean;
}

export interface PlanDefinition {
  code: PlanCode;
  title: string;
  monthlyQuota: number;
  features: PlanFeatures;
  // Stripe Price 环境变量键名（运行时从 bindings 读取真实 price id）。
  priceEnvKeys: Record<BillingInterval, string | null>;
}

const NO_FEATURES: PlanFeatures = {
  shareReward: false,
  tutorials: false,
  hdDownload: false,
  priorityQueue: false,
  longTermHistory: false,
  fullLookLibrary: false,
};

export const PLAN_DEFINITIONS: Record<PlanCode, PlanDefinition> = {
  free: {
    code: "free",
    title: "Free",
    monthlyQuota: 3,
    features: { ...NO_FEATURES, shareReward: true },
    priceEnvKeys: { monthly: null, yearly: null },
  },
  pro: {
    code: "pro",
    title: "Pro",
    monthlyQuota: 70,
    features: {
      ...NO_FEATURES,
      tutorials: true,
      hdDownload: true,
    },
    priceEnvKeys: {
      monthly: "STRIPE_PRICE_PRO_MONTHLY",
      yearly: "STRIPE_PRICE_PRO_YEARLY",
    },
  },
  premium: {
    code: "premium",
    title: "Premium",
    monthlyQuota: 150,
    features: {
      ...NO_FEATURES,
      tutorials: true,
      hdDownload: true,
      priorityQueue: true,
      longTermHistory: true,
      fullLookLibrary: true,
    },
    priceEnvKeys: {
      monthly: "STRIPE_PRICE_PREMIUM_MONTHLY",
      yearly: "STRIPE_PRICE_PREMIUM_YEARLY",
    },
  },
};

export const PLAN_CODES: PlanCode[] = ["free", "pro", "premium"];

export function isPlanCode(value: unknown): value is PlanCode {
  return value === "free" || value === "pro" || value === "premium";
}

export function getPlanDefinition(code: PlanCode): PlanDefinition {
  return PLAN_DEFINITIONS[code];
}

export function getMonthlyQuota(code: PlanCode): number {
  return PLAN_DEFINITIONS[code].monthlyQuota;
}

export function planHasFeature(
  code: PlanCode,
  feature: keyof PlanFeatures,
): boolean {
  return PLAN_DEFINITIONS[code].features[feature];
}
