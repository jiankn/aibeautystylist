import type { APIRoute } from "astro";

import { isAppLocale, getLanguageByLocale } from "../../../i18n/config";
import { getLocalizedAppHref, resolveLocaleRoute } from "../../../i18n/routing";
import { getAccountByUserId } from "../../../lib/accounts";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  canPlanBuyCreditPacks,
  CREDIT_PACKS,
  getCreditPackPriceId,
  isCreditPackCode,
} from "../../../lib/creditPacks";
import { apiError, apiSuccess } from "../../../lib/http";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings } from "../../../lib/runtime";
import {
  createStripeClient,
  StripeError,
  toStripeCheckoutLocale,
} from "../../../lib/stripe";
import {
  getEffectivePlan,
  getStripeCustomerId,
} from "../../../lib/subscriptions";

interface CreditPackCheckoutBody {
  packCode?: string;
  returnTo?: string;
  locale?: string;
}

export const POST: APIRoute = async ({ cookies, request }) => {
  const body = (await request
    .json()
    .catch(() => null)) as CreditPackCheckoutBody | null;
  if (!isCreditPackCode(body?.packCode)) {
    return apiError(
      {
        code: "INVALID_CREDIT_PACK",
        message: "请选择有效的额度包",
        retryable: false,
      },
      422,
    );
  }

  const bindings = getRuntimeBindings();
  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;

  const plan = await getEffectivePlan(auth.user.id, bindings.DB);
  if (!canPlanBuyCreditPacks(plan.planCode)) {
    return apiError(
      {
        code: "CREDIT_PACK_REQUIRES_PAID_PLAN",
        message: "额度包仅供 Pro 和 Premium 会员购买",
        retryable: false,
      },
      403,
    );
  }

  const priceId = getCreditPackPriceId(body.packCode, bindings);
  if (!bindings.STRIPE_SECRET_KEY || !priceId) {
    return apiError(
      {
        code: "CREDIT_PACK_NOT_CONFIGURED",
        message: "额度包支付尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const appLocale =
    body?.locale && isAppLocale(body.locale) ? body.locale : undefined;
  const language = getLanguageByLocale(appLocale);
  const slug = language?.slug ?? "en";

  const returnPath = safeInternalPath(body?.returnTo) ?? "/tryon";
  const suffixStart = returnPath.search(/[?#]/);
  const rawPathname = suffixStart === -1 ? returnPath : returnPath.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : returnPath.slice(suffixStart);

  const route = resolveLocaleRoute(rawPathname);
  const localizedReturnPath = getLocalizedAppHref(route.routePathname + suffix, slug);

  const baseUrl = bindings.APP_PUBLIC_URL ?? new URL(request.url).origin;
  const successUrl = new URL(localizedReturnPath, baseUrl);
  successUrl.searchParams.set("credit_pack", "success");
  successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  const cancelUrl = new URL(localizedReturnPath, baseUrl);
  cancelUrl.searchParams.set("credit_pack", "cancel");

  const account = bindings.DB
    ? await getAccountByUserId(auth.user.id, bindings.DB)
    : undefined;
  const customerId = await getStripeCustomerId(auth.user.id, bindings.DB);
  const pack = CREDIT_PACKS[body.packCode];
  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    if (customerId && account?.email) {
      await stripe.updateCustomer({ customerId, email: account.email });
    }
    const session = await stripe.createOneTimeCheckoutSession({
      priceId,
      successUrl: successUrl.toString(),
      cancelUrl: cancelUrl.toString(),
      clientReferenceId: auth.user.id,
      customerId,
      customerEmail: account?.email,
      locale: toStripeCheckoutLocale(appLocale),
      metadata: {
        purchaseType: "credit_pack",
        userId: auth.user.id,
        planCode: plan.planCode,
        packCode: pack.code,
        credits: String(pack.credits),
        priceId,
        ...(plan.currentPeriodStart
          ? { periodStart: plan.currentPeriodStart }
          : {}),
        ...(plan.currentPeriodEnd ? { periodEnd: plan.currentPeriodEnd } : {}),
      },
    });
    return apiSuccess({ id: session.id, url: session.url });
  } catch (error) {
    const message =
      error instanceof StripeError ? error.message : "创建额度包结账会话失败";
    return apiError(
      {
        code: "CREDIT_PACK_CHECKOUT_FAILED",
        message,
        retryable: true,
      },
      502,
    );
  }
};

function safeInternalPath(
  value: string | null | undefined,
): string | undefined {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return undefined;
  }
  return value;
}
