import type { APIRoute } from "astro";

import { isAppLocale, getLanguageByLocale } from "../../../i18n/config";
import { resolveLocaleRoute } from "../../../i18n/routing";
import { getAccountByUserId } from "../../../lib/accounts";
import { requireAuthenticatedUser } from "../../../lib/authGuard";
import {
  buildCheckoutStatusUrl,
  safeCheckoutPricingPath,
} from "../../../lib/checkoutRedirect";
import {
  SubscriptionUpgradeError,
  upgradeActiveSubscriptionPlan,
} from "../../../lib/billingUpgrade";
import { apiError, apiSuccess } from "../../../lib/http";
import {
  getPlanRank,
  isPlanCode,
  PLAN_DEFINITIONS,
  type BillingInterval,
  type PlanCode,
} from "../../../lib/plans";
import { createProxyFetcher } from "../../../lib/proxyFetch";
import { getRuntimeBindings, type RuntimeBindings } from "../../../lib/runtime";
import {
  createStripeClient,
  StripeError,
  toStripeCheckoutLocale,
} from "../../../lib/stripe";
import {
  getEffectiveSubscription,
  getStripeCustomerId,
} from "../../../lib/subscriptions";

interface CheckoutBody {
  planCode?: string;
  interval?: string;
  pricingPath?: string;
  returnTo?: string;
  locale?: string;
  prorationDate?: number;
}

function withCheckoutSessionId(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}session_id={CHECKOUT_SESSION_ID}`;
}

function safeProrationDate(
  value: unknown,
  now = new Date(),
): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "number") return undefined;
  if (!Number.isInteger(value)) return undefined;
  const currentSeconds = Math.floor(now.getTime() / 1000);
  // The preview must be recent, otherwise Stripe's actual prorated amount can drift.
  if (value < currentSeconds - 10 * 60 || value > currentSeconds + 2 * 60) {
    return undefined;
  }
  return value;
}

function buildPortalReturnUrl(input: {
  baseUrl: string;
  pricingPath?: string | null;
  languageSlug?: string;
}): string {
  const base = new URL(input.baseUrl);
  return new URL(
    safeCheckoutPricingPath(input.pricingPath, input.languageSlug),
    base.origin,
  ).toString();
}

function appLocaleFromString(value: string | null | undefined) {
  return value && isAppLocale(value) ? value : undefined;
}

function localeFromInternalPath(value: string | null | undefined) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    return undefined;
  }

  try {
    const url = new URL(value, "https://aibeautystylist.local");
    return resolveLocaleRoute(url.pathname).language.locale;
  } catch {
    return undefined;
  }
}

function resolveCheckoutAppLocale(input: {
  body: CheckoutBody | null;
  cookieLocale?: string;
  localsLocale?: string;
}) {
  return (
    appLocaleFromString(input.body?.locale) ??
    localeFromInternalPath(input.body?.pricingPath) ??
    appLocaleFromString(input.cookieLocale) ??
    appLocaleFromString(input.localsLocale)
  );
}

export const POST: APIRoute = async ({ cookies, locals, request }) => {
  const body = (await request.json().catch(() => null)) as CheckoutBody | null;
  const requestNow = new Date();
  const interval: BillingInterval =
    body?.interval === "yearly" ? "yearly" : "monthly";

  if (!isPlanCode(body?.planCode) || body?.planCode === "free") {
    return apiError(
      {
        code: "INVALID_PLAN",
        message: "请选择 Pro 或 Premium 计划",
        retryable: false,
      },
      422,
    );
  }
  const planCode = body.planCode as Exclude<PlanCode, "free">;
  const prorationDate = safeProrationDate(body?.prorationDate, requestNow);
  if (body?.prorationDate !== undefined && !prorationDate) {
    return apiError(
      {
        code: "PRORATION_PREVIEW_EXPIRED",
        message: "升级金额预览已过期，请重新确认后再升级。",
        retryable: true,
      },
      409,
    );
  }

  const bindings = getRuntimeBindings();
  if (!bindings.STRIPE_SECRET_KEY) {
    return apiError(
      {
        code: "BILLING_NOT_CONFIGURED",
        message: "支付尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const priceEnvKey = PLAN_DEFINITIONS[planCode].priceEnvKeys[interval];
  const priceId = priceEnvKey
    ? bindings[priceEnvKey as keyof RuntimeBindings]
    : undefined;
  if (!priceId || typeof priceId !== "string") {
    return apiError(
      {
        code: "PRICE_NOT_CONFIGURED",
        message: "所选计划的价格尚未配置",
        retryable: false,
      },
      503,
    );
  }

  const auth = await requireAuthenticatedUser(cookies, bindings.DB);
  if (!auth.ok) return auth.response;
  const userId = auth.user.id;
  const baseUrl = bindings.APP_PUBLIC_URL ?? new URL(request.url).origin;
  const appLocale = resolveCheckoutAppLocale({
    body,
    cookieLocale: cookies.get("abs_locale")?.value,
    localsLocale: locals.audienceContext?.locale,
  });
  const languageSlug = getLanguageByLocale(appLocale)?.slug ?? "en";
  const stripeLocale = toStripeCheckoutLocale(appLocale);
  const stripe = createStripeClient({
    apiKey: bindings.STRIPE_SECRET_KEY,
    fetcher: bindings.OUTBOUND_PROXY_URL
      ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
      : undefined,
  });

  try {
    const account = bindings.DB
      ? await getAccountByUserId(userId, bindings.DB)
      : undefined;
    const customerId = await getStripeCustomerId(userId, bindings.DB);
    if (customerId && account?.email) {
      await stripe.updateCustomer({ customerId, email: account.email });
    }
    const portalReturnUrl = buildPortalReturnUrl({
      baseUrl,
      pricingPath: body?.pricingPath,
      languageSlug,
    });
    const openPortal = async () =>
      customerId
        ? await stripe.createBillingPortalSession({
            customerId,
            returnUrl: portalReturnUrl,
          })
        : undefined;
    const currentSubscription = await getEffectiveSubscription(
      userId,
      bindings.DB,
    );

    if (currentSubscription) {
      if (getPlanRank(planCode) <= getPlanRank(currentSubscription.planCode)) {
        const portal = await openPortal();
        if (portal) {
          return apiSuccess({ url: portal.url, mode: "portal" });
        }
        return apiError(
          {
            code: "SUBSCRIPTION_ALREADY_ACTIVE",
            message: "当前订阅已包含该计划权益，请在订阅管理中调整。",
            retryable: false,
          },
          409,
        );
      }

      if (currentSubscription.planCode === "pro" && planCode === "premium") {
        try {
          const upgrade = await upgradeActiveSubscriptionPlan({
            userId,
            toPlanCode: planCode,
            interval,
            priceId,
            stripe,
            DB: bindings.DB,
            prorationDate,
            metadata: {
              ...(appLocale ? { locale: appLocale } : {}),
            },
          });
          return apiSuccess({ mode: "subscription_update", ...upgrade });
        } catch (error) {
          if (error instanceof SubscriptionUpgradeError) {
            if (customerId) {
              const portal = await openPortal();
              if (portal) {
                return apiSuccess({ url: portal.url, mode: "portal" });
              }
            }
            return apiError(
              {
                code: error.code,
                message: error.message,
                retryable: error.retryable,
              },
              error.status,
            );
          }
          if (error instanceof StripeError && customerId) {
            const portal = await openPortal();
            if (portal) {
              return apiSuccess({ url: portal.url, mode: "portal" });
            }
          }
          throw error;
        }
      }
    }

    const session = await stripe.createCheckoutSession({
      priceId,
      successUrl: withCheckoutSessionId(
        buildCheckoutStatusUrl({
          baseUrl,
          pricingPath: body?.pricingPath,
          status: "success",
          returnTo: body?.returnTo,
          languageSlug,
        }),
      ),
      cancelUrl: buildCheckoutStatusUrl({
        baseUrl,
        pricingPath: body?.pricingPath,
        status: "cancel",
        returnTo: body?.returnTo,
        languageSlug,
      }),
      clientReferenceId: userId,
      customerId,
      customerEmail: account?.email,
      locale: stripeLocale,
      metadata: {
        userId,
        planCode,
        priceId,
        ...(appLocale ? { locale: appLocale } : {}),
      },
    });
    return apiSuccess({ id: session.id, url: session.url });
  } catch (error) {
    const message =
      error instanceof StripeError ? error.message : "创建结账会话失败";
    return apiError({ code: "CHECKOUT_FAILED", message, retryable: true }, 502);
  }
};
