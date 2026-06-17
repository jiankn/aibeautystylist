import { describe, expect, it } from "vitest";

import { createStripeClient } from "./stripe";

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
});
