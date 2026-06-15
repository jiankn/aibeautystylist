import type { APIRoute } from "astro";

import { getAccountByUserId } from "../../lib/accounts";
import { resolveCurrentUser } from "../../lib/currentUser";
import { getEntitlementContext } from "../../lib/entitlements";
import { apiSuccess } from "../../lib/http";
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
    },
    plan: plan.planCode,
    subscription:
      plan.source === "subscription"
        ? { status: plan.status, currentPeriodEnd: plan.currentPeriodEnd }
        : null,
    quota: {
      ...quota,
      shareRewardAvailableToday: true,
    },
  });
};
