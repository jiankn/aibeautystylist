import type { PlanCode } from "./plans";
import type { RuntimeBindings } from "./runtime";

export type CreditPackCode = "boost_20" | "boost_60";

export interface CreditPackDefinition {
  code: CreditPackCode;
  credits: number;
  priceUsdCents: number;
  priceEnvKey: "STRIPE_PRICE_CREDITS_20" | "STRIPE_PRICE_CREDITS_60";
  eligiblePlans: readonly PlanCode[];
  featured: boolean;
}

export const CREDIT_PACKS: Record<CreditPackCode, CreditPackDefinition> = {
  boost_20: {
    code: "boost_20",
    credits: 20,
    priceUsdCents: 799,
    priceEnvKey: "STRIPE_PRICE_CREDITS_20",
    eligiblePlans: ["pro", "premium"],
    featured: false,
  },
  boost_60: {
    code: "boost_60",
    credits: 60,
    priceUsdCents: 1899,
    priceEnvKey: "STRIPE_PRICE_CREDITS_60",
    eligiblePlans: ["pro", "premium"],
    featured: true,
  },
};

export const CREDIT_PACK_CODES = Object.keys(CREDIT_PACKS) as CreditPackCode[];

export function isCreditPackCode(value: unknown): value is CreditPackCode {
  return value === "boost_20" || value === "boost_60";
}

export function getCreditPackPriceId(
  code: CreditPackCode,
  bindings: RuntimeBindings,
): string | undefined {
  const value = bindings[CREDIT_PACKS[code].priceEnvKey];
  return typeof value === "string" && value ? value : undefined;
}

export function getCreditPackByPriceId(
  priceId: string,
  bindings: RuntimeBindings,
): CreditPackDefinition | undefined {
  return CREDIT_PACK_CODES.map((code) => CREDIT_PACKS[code]).find(
    (pack) => getCreditPackPriceId(pack.code, bindings) === priceId,
  );
}

export function canPlanBuyCreditPacks(planCode: PlanCode): boolean {
  return planCode === "pro" || planCode === "premium";
}
