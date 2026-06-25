import { describe, expect, it } from "vitest";

import { createStripeClient, toStripeCheckoutLocale } from "./stripe";

function createRecordingFetcher() {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: typeof fetch = async (url, init) => {
    requests.push({ url: String(url), init });
    return new Response(
      JSON.stringify({ id: "cs_test", url: "https://pay.test" }),
      {
        headers: { "content-type": "application/json" },
      },
    );
  };

  return { fetcher, requests };
}

function checkoutInput() {
  return {
    priceId: "price_pro_monthly",
    successUrl: "https://example.com/pricing?checkout=success",
    cancelUrl: "https://example.com/pricing?checkout=cancel",
    clientReferenceId: "user_123",
  };
}

describe("Stripe client", () => {
  it("maps app locales to Stripe Checkout locales", () => {
    expect(toStripeCheckoutLocale("en")).toBe("en");
    expect(toStripeCheckoutLocale("zh-CN")).toBe("zh");
    expect(toStripeCheckoutLocale("zh-TW")).toBe("zh-TW");
    expect(toStripeCheckoutLocale("ja-JP")).toBe("ja");
    expect(toStripeCheckoutLocale("ko-KR")).toBe("ko");
    expect(toStripeCheckoutLocale("de-DE")).toBe("de");
    expect(toStripeCheckoutLocale("fr-FR")).toBe("fr");
    expect(toStripeCheckoutLocale("es-ES")).toBe("es");
    expect(toStripeCheckoutLocale("es-419")).toBe("es-419");
    expect(toStripeCheckoutLocale("pt-BR")).toBe("pt-BR");
    expect(toStripeCheckoutLocale("unknown")).toBeUndefined();
  });

  it("passes the Checkout locale when provided", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.createCheckoutSession({
      ...checkoutInput(),
      locale: "en",
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(body.get("locale")).toBe("en");
  });

  it("passes the account email to Checkout when creating a new customer", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.createCheckoutSession({
      ...checkoutInput(),
      customerEmail: "user@example.com",
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(body.get("customer_email")).toBe("user@example.com");
    expect(body.has("customer")).toBe(false);
  });

  it("does not send customer_email together with an existing customer id", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.createCheckoutSession({
      ...checkoutInput(),
      customerId: "cus_123",
      customerEmail: "user@example.com",
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(body.get("customer")).toBe("cus_123");
    expect(body.has("customer_email")).toBe(false);
  });

  it("can sync an existing Stripe customer email before checkout", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.updateCustomer({
      customerId: "cus_123",
      email: "user@example.com",
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(requests[0]?.url).toBe(
      "https://api.stripe.com/v1/customers/cus_123",
    );
    expect(body.get("email")).toBe("user@example.com");
  });

  it("can retrieve a Checkout Session by id", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.retrieveCheckoutSession("cs_test_123");

    expect(requests[0]?.url).toBe(
      "https://api.stripe.com/v1/checkout/sessions/cs_test_123",
    );
    expect(requests[0]?.init?.method).toBe("GET");
  });

  it("updates a subscription item price with immediate proration", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.updateSubscriptionPrice({
      subscriptionId: "sub_123",
      itemId: "si_123",
      priceId: "price_premium_monthly",
      prorationDate: 1781712000,
      metadata: { userId: "user_123", planCode: "premium" },
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(requests[0]?.url).toBe(
      "https://api.stripe.com/v1/subscriptions/sub_123",
    );
    expect(requests[0]?.init?.method).toBe("POST");
    expect(body.get("items[0][id]")).toBe("si_123");
    expect(body.get("items[0][price]")).toBe("price_premium_monthly");
    expect(body.get("proration_behavior")).toBe("always_invoice");
    expect(body.get("proration_date")).toBe("1781712000");
    expect(body.get("payment_behavior")).toBe("error_if_incomplete");
    expect(body.get("metadata[userId]")).toBe("user_123");
    expect(body.get("metadata[planCode]")).toBe("premium");
  });

  it("creates a preview invoice for an existing subscription price change", async () => {
    const { fetcher, requests } = createRecordingFetcher();
    const stripe = createStripeClient({ apiKey: "sk_test", fetcher });

    await stripe.createPreviewInvoice({
      customerId: "cus_123",
      subscriptionId: "sub_123",
      itemId: "si_123",
      priceId: "price_premium_monthly",
      prorationDate: 1781712000,
    });

    const body = new URLSearchParams(String(requests[0]?.init?.body));
    expect(requests[0]?.url).toBe(
      "https://api.stripe.com/v1/invoices/create_preview",
    );
    expect(requests[0]?.init?.method).toBe("POST");
    expect(body.get("customer")).toBe("cus_123");
    expect(body.get("subscription")).toBe("sub_123");
    expect(body.get("subscription_details[items][0][id]")).toBe("si_123");
    expect(body.get("subscription_details[items][0][price]")).toBe(
      "price_premium_monthly",
    );
    expect(body.get("subscription_details[proration_date]")).toBe("1781712000");
  });
});
