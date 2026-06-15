import { describe, expect, it } from "vitest";

import {
  getGoogleOAuthCallbackUrl,
  getOAuthLoginStatusUrl,
  isGoogleOAuthConfigured,
  safeAuthNextPath,
} from "./googleOAuth";

describe("Google OAuth helpers", () => {
  it("accepts only local next paths", () => {
    expect(safeAuthNextPath("/account?tab=history")).toBe(
      "/account?tab=history",
    );
    expect(safeAuthNextPath("https://example.com")).toBe("/");
    expect(safeAuthNextPath("//example.com")).toBe("/");
    expect(safeAuthNextPath("/\\example.com")).toBe("/");
  });

  it("requires the complete runtime configuration", () => {
    const DB = {} as never;
    expect(
      isGoogleOAuthConfigured({
        DB,
        GOOGLE_OAUTH_CLIENT_ID: "client",
        GOOGLE_OAUTH_CLIENT_SECRET: "secret",
      }),
    ).toBe(true);
    expect(isGoogleOAuthConfigured({ GOOGLE_OAUTH_CLIENT_ID: "client" })).toBe(
      false,
    );
  });

  it("uses the configured public origin for the callback", () => {
    expect(
      getGoogleOAuthCallbackUrl(
        { APP_PUBLIC_URL: "https://aibeautystylist.com/path" },
        "http://localhost:4321/api/auth/google/start",
      ),
    ).toBe("https://aibeautystylist.com/api/auth/google/callback");
  });

  it("preserves a safe destination in OAuth error redirects", () => {
    expect(getOAuthLoginStatusUrl("failed", "/account")).toBe(
      "/login?oauth=failed&next=%2Faccount",
    );
    expect(getOAuthLoginStatusUrl("failed", "//example.com")).toBe(
      "/login?oauth=failed",
    );
  });
});
