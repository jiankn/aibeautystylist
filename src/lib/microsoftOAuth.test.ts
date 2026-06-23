import { describe, expect, it } from "vitest";

import { getOAuthLoginStatusUrl } from "./oauth";
import {
  createPkceChallenge,
  decodeMicrosoftIdToken,
  getMicrosoftAuthorizeUrl,
  getMicrosoftOAuthCallbackUrl,
  getMicrosoftTokenUrl,
  getMicrosoftUserInfoUrl,
  isMicrosoftOAuthConfigured,
  isUsableMicrosoftIdTokenClaims,
  resolveMicrosoftEmail,
} from "./microsoftOAuth";

describe("Microsoft OAuth helpers", () => {
  it("requires the complete runtime configuration", () => {
    const DB = {} as never;
    expect(
      isMicrosoftOAuthConfigured({
        DB,
        MICROSOFT_OAUTH_CLIENT_ID: "client",
        MICROSOFT_OAUTH_CLIENT_SECRET: "secret",
      }),
    ).toBe(true);
    expect(
      isMicrosoftOAuthConfigured({ MICROSOFT_OAUTH_CLIENT_ID: "client" }),
    ).toBe(false);
  });

  it("uses the configured public origin for the callback", () => {
    expect(
      getMicrosoftOAuthCallbackUrl(
        { APP_PUBLIC_URL: "https://aibeautystylist.com/path" },
        "http://localhost:4321/api/auth/microsoft/start",
      ),
    ).toBe("https://aibeautystylist.com/api/auth/microsoft/callback");
  });

  it("uses Microsoft common authorization endpoints", () => {
    expect(getMicrosoftAuthorizeUrl()).toBe(
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    );
    expect(getMicrosoftTokenUrl()).toBe(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    );
    expect(getMicrosoftUserInfoUrl()).toBe(
      "https://graph.microsoft.com/oidc/userinfo",
    );
  });

  it("can tag login status redirects with the provider", () => {
    expect(
      getOAuthLoginStatusUrl("failed", "/dashboard#account-panel", "microsoft"),
    ).toBe(
      "/login?oauth=failed&provider=microsoft&next=%2Fdashboard%23account-panel",
    );
  });

  it("creates a standards-compatible S256 PKCE challenge", async () => {
    await expect(
      createPkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    ).resolves.toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });

  it("decodes Microsoft ID token payload claims", () => {
    const token = createJwt({
      aud: "client",
      exp: 4_102_444_800,
      preferred_username: "person@hotmail.com",
      sub: "subject",
    });

    expect(decodeMicrosoftIdToken(token)).toEqual({
      aud: "client",
      exp: 4_102_444_800,
      preferred_username: "person@hotmail.com",
      sub: "subject",
    });
    expect(decodeMicrosoftIdToken("not-a-jwt")).toBeUndefined();
  });

  it("accepts only current ID token claims for the configured client", () => {
    const now = new Date("2026-06-21T00:00:00.000Z");
    expect(
      isUsableMicrosoftIdTokenClaims(
        { aud: "client", exp: 1_783_555_200, sub: "subject" },
        "client",
        now,
      ),
    ).toBe(true);
    expect(
      isUsableMicrosoftIdTokenClaims(
        { aud: "other", exp: 1_783_555_200, sub: "subject" },
        "client",
        now,
      ),
    ).toBe(false);
    expect(
      isUsableMicrosoftIdTokenClaims(
        { aud: "client", exp: 1_735_689_600, sub: "subject" },
        "client",
        now,
      ),
    ).toBe(false);
  });

  it("falls back to preferred_username when Microsoft omits email", () => {
    expect(
      resolveMicrosoftEmail(
        { sub: "subject" },
        { preferred_username: "person@hotmail.com" },
      ),
    ).toBe("person@hotmail.com");
    expect(
      resolveMicrosoftEmail(
        { email: "primary@example.com" },
        { preferred_username: "person@hotmail.com" },
      ),
    ).toBe("primary@example.com");
    expect(
      resolveMicrosoftEmail(
        { sub: "subject" },
        { preferred_username: "not-an-email" },
      ),
    ).toBeUndefined();
  });
});

function createJwt(payload: Record<string, unknown>): string {
  return ["header", encodeBase64Url(JSON.stringify(payload)), "signature"].join(
    ".",
  );
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
