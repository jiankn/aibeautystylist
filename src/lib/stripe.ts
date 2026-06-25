// 轻量 Stripe REST 客户端（Workers 兼容）：用 fetch + application/x-www-form-urlencoded，
// 不引入 stripe-node（其依赖 Node 内置模块，在 workerd 上不可靠）。
// 支持注入 fetcher 以复用本地出口中继（OUTBOUND_PROXY_URL）。

export type StripeErrorCode =
  | "STRIPE_NOT_CONFIGURED"
  | "STRIPE_REQUEST_FAILED"
  | "STRIPE_TIMEOUT";

export class StripeError extends Error {
  constructor(
    public readonly code: StripeErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

const STRIPE_API_BASE = "https://api.stripe.com";

export type StripeCheckoutLocale =
  | "en"
  | "zh"
  | "zh-TW"
  | "de"
  | "fr"
  | "ja"
  | "ko"
  | "es"
  | "es-419"
  | "pt-BR";

export function toStripeCheckoutLocale(
  locale: string | null | undefined,
): StripeCheckoutLocale | undefined {
  switch (locale) {
    case "en":
      return "en";
    case "zh-CN":
      return "zh";
    case "zh-TW":
      return "zh-TW";
    case "de-DE":
      return "de";
    case "fr-FR":
      return "fr";
    case "ja-JP":
      return "ja";
    case "ko-KR":
      return "ko";
    case "es-ES":
      return "es";
    case "es-419":
      return "es-419";
    case "pt-BR":
      return "pt-BR";
    default:
      return undefined;
  }
}

export interface StripeClientOptions {
  apiKey: string;
  timeoutMs?: number;
  fetcher?: typeof fetch;
}

export function createStripeClient(options: StripeClientOptions) {
  if (!options.apiKey) {
    throw new StripeError("STRIPE_NOT_CONFIGURED", "Stripe 密钥未配置");
  }
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? 20_000;

  async function request<T>(
    method: "GET" | "POST",
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const body = params ? encodeForm(params) : undefined;
    try {
      const response = await fetcher(`${STRIPE_API_BASE}${path}`, {
        method,
        headers: {
          authorization: `Bearer ${options.apiKey}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body,
        signal: controller.signal,
      });
      const payload = (await response.json().catch(() => null)) as
        | (T & { error?: { message?: string } })
        | null;
      if (!response.ok || !payload) {
        throw new StripeError(
          "STRIPE_REQUEST_FAILED",
          payload?.error?.message ?? `Stripe 返回 HTTP ${response.status}`,
          response.status,
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof StripeError) throw error;
      throw new StripeError(
        error instanceof DOMException && error.name === "AbortError"
          ? "STRIPE_TIMEOUT"
          : "STRIPE_REQUEST_FAILED",
        error instanceof Error ? error.message : "Stripe 请求失败",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    createCheckoutSession(input: {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
      clientReferenceId: string;
      customerId?: string;
      customerEmail?: string;
      locale?: StripeCheckoutLocale;
      metadata?: Record<string, string>;
    }): Promise<{ id: string; url: string | null }> {
      const params: Record<string, string | number | boolean | undefined> = {
        mode: "subscription",
        "line_items[0][price]": input.priceId,
        "line_items[0][quantity]": 1,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.clientReferenceId,
        customer: input.customerId,
        customer_email: input.customerId ? undefined : input.customerEmail,
        allow_promotion_codes: true,
        locale: input.locale,
      };
      for (const [key, value] of Object.entries(input.metadata ?? {})) {
        params[`metadata[${key}]`] = value;
        params[`subscription_data[metadata][${key}]`] = value;
      }
      return request("POST", "/v1/checkout/sessions", params);
    },

    retrieveCheckoutSession(sessionId: string): Promise<StripeCheckoutSession> {
      return request(
        "GET",
        `/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      );
    },

    updateCustomer(input: {
      customerId: string;
      email: string;
    }): Promise<{ id: string; email?: string }> {
      return request(
        "POST",
        `/v1/customers/${encodeURIComponent(input.customerId)}`,
        {
          email: input.email,
        },
      );
    },

    createBillingPortalSession(input: {
      customerId: string;
      returnUrl: string;
    }): Promise<{ id: string; url: string }> {
      return request("POST", "/v1/billing_portal/sessions", {
        customer: input.customerId,
        return_url: input.returnUrl,
      });
    },

    retrieveSubscription(subscriptionId: string): Promise<StripeSubscription> {
      return request(
        "GET",
        `/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
      );
    },

    updateSubscriptionPrice(input: {
      subscriptionId: string;
      itemId: string;
      priceId: string;
      prorationBehavior?: "always_invoice" | "create_prorations" | "none";
      paymentBehavior?:
        | "allow_incomplete"
        | "default_incomplete"
        | "pending_if_incomplete"
        | "error_if_incomplete";
      metadata?: Record<string, string>;
    }): Promise<StripeSubscription> {
      const params: Record<string, string | number | boolean | undefined> = {
        "items[0][id]": input.itemId,
        "items[0][price]": input.priceId,
        proration_behavior: input.prorationBehavior ?? "always_invoice",
        payment_behavior: input.paymentBehavior ?? "error_if_incomplete",
      };
      for (const [key, value] of Object.entries(input.metadata ?? {})) {
        params[`metadata[${key}]`] = value;
      }
      return request(
        "POST",
        `/v1/subscriptions/${encodeURIComponent(input.subscriptionId)}`,
        params,
      );
    },
  };
}

export interface StripeSubscription {
  id: string;
  status: string;
  current_period_end?: number;
  customer?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  items?: {
    data?: Array<{ id?: string; price?: { id?: string } }>;
  };
}

export interface StripeCheckoutSession {
  id: string;
  mode?: string;
  status?: string;
  payment_status?: string;
  subscription?: string;
  customer?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
}

function encodeForm(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.append(key, String(value));
  }
  return search.toString();
}
