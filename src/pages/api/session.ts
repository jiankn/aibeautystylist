import type { APIRoute } from "astro";

import { getAccountByUserId } from "../../lib/accounts";
import { resolveCurrentUser } from "../../lib/currentUser";
import { getEntitlementContext } from "../../lib/entitlements";
import { apiSuccess } from "../../lib/http";
import { planHasFeature } from "../../lib/plans";
import { getRuntimeBindings } from "../../lib/runtime";

export const GET: APIRoute = async ({ cookies }) => {
  const { DB } = getRuntimeBindings();
  const user = await resolveCurrentUser(cookies, DB);
  const { plan, quota } = await getEntitlementContext(user.id, DB);
  const account =
    user.authenticated && DB
      ? await getAccountByUserId(user.id, DB)
      : undefined;

  return apiSuccess({
    user: {
      id: user.id,
      kind: user.authenticated ? "account" : "anonymous",
      email: account?.email,
      avatarUrl:
        account?.avatarR2Key && account.avatarUpdatedAt
          ? `/api/profile/avatar?v=${encodeURIComponent(account.avatarUpdatedAt)}`
          : undefined,
    },
    plan: plan.planCode,
    subscription:
      plan.source === "subscription"
        ? {
            status: plan.status,
            currentPeriodStart: plan.currentPeriodStart,
            currentPeriodEnd: plan.currentPeriodEnd,
          }
        : null,
    quota: {
      ...quota,
      shareRewardAvailableToday: planHasFeature(plan.planCode, "shareReward"),
    },
  });
};
