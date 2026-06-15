import {
  getMonthlyQuota,
  planHasFeature,
  type PlanCode,
  type PlanFeatures,
} from "./plans";
import { getQuotaSnapshot, type QuotaSnapshot } from "./quota";
import type { D1DatabaseLike } from "./runtime";
import { getEffectivePlan, type EffectivePlan } from "./subscriptions";

// 服务端权限守卫：所有「按计划开放」的能力都从这里读判定，
// 不能只靠前端隐藏。返回当前生效计划、额度快照与功能开关。
export interface EntitlementContext {
  plan: EffectivePlan;
  quota: QuotaSnapshot;
}

export async function getEntitlementContext(
  userId: string,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<EntitlementContext> {
  const plan = await getEffectivePlan(userId, DB, now);
  const quota = await getQuotaSnapshot(
    userId,
    DB,
    now,
    getMonthlyQuota(plan.planCode),
  );
  return { plan, quota };
}

export async function requireFeature(
  userId: string,
  feature: keyof PlanFeatures,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<{ allowed: boolean; planCode: PlanCode }> {
  const plan = await getEffectivePlan(userId, DB, now);
  return {
    allowed: planHasFeature(plan.planCode, feature),
    planCode: plan.planCode,
  };
}

export async function requirePlan(
  userId: string,
  minimumPlan: PlanCode,
  DB?: D1DatabaseLike,
  now = new Date(),
): Promise<{ allowed: boolean; planCode: PlanCode }> {
  const plan = await getEffectivePlan(userId, DB, now);
  return {
    allowed: planRank(plan.planCode) >= planRank(minimumPlan),
    planCode: plan.planCode,
  };
}

function planRank(code: PlanCode): number {
  return code === "premium" ? 3 : code === "pro" ? 2 : 1;
}
