import { describe, expect, it } from "vitest";

import { getOAuthLoginStatusUrl } from "./oauth";
import {
  createPkceChallenge,
  getMicrosoftAuthorizeUrl,
  getMicrosoftOAuthCallbackUrl,
  getMicrosoftTokenUrl,
  getMicrosoftUserInfoUrl,
  isMicrosoftOAuthConfigured,
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
    expect(getOAuthLoginStatusUrl("failed", "/account", "microsoft")).toBe(
      "/login?oauth=failed&provider=microsoft&next=%2Faccount",
    );
  });

  it("creates a standards-compatible S256 PKCE challenge", async () => {
    await expect(
      createPkceChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
    ).resolves.toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  });
});
