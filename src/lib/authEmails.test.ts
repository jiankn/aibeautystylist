import { afterEach, describe, expect, it, vi } from "vitest";

import { sendPasswordResetEmail, sendVerificationEmail } from "./authEmails";
import { supportedLocales, type SupportedLocale } from "./i18n";
import type { RuntimeBindings } from "./runtime";

const bindings: RuntimeBindings = {
  APP_PUBLIC_URL: "https://aibeautystylist.com",
  POSTAL_API_URL: "https://postal.example.com",
  POSTAL_API_KEY: "postal-key",
  SMTP_FROM: "noreply@aibeautystylist.com",
  POSTAL_API_FROM_NAME: "AI Beauty Stylist",
  SUPPORT_EMAIL: "support@aibeautystylist.com",
};

const expectedVerificationSubjects: Record<SupportedLocale, string> = {
  en: "Verify your AI Beauty Stylist email",
  "zh-CN": "验证你的 AI Beauty Stylist 邮箱",
  "de-DE": "Bestätige deine AI Beauty Stylist E-Mail",
  "fr-FR": "Vérifiez votre e-mail AI Beauty Stylist",
  "ja-JP": "AI Beauty Stylist のメールアドレスを確認してください",
  "ko-KR": "AI Beauty Stylist 이메일 인증",
  "zh-TW": "驗證你的 AI Beauty Stylist 電子郵件",
  "es-ES": "Verifica tu correo de AI Beauty Stylist",
  "es-419": "Verifica tu correo de AI Beauty Stylist",
  "pt-BR": "Verifique seu e-mail do AI Beauty Stylist",
};

function mockPostal() {
  const sent: unknown[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      sent.push(JSON.parse(String(init.body)));
      return Response.json({ status: "success" });
    }),
  );
  return sent;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("auth emails", () => {
  it.each(supportedLocales)(
    "localizes verification email subject for %s",
    async (locale) => {
      const sent = mockPostal();

      await sendVerificationEmail(
        "user@example.com",
        "verify-token",
        bindings,
        "http://localhost:4321",
        locale,
      );

      const payload = sent[0] as {
        subject: string;
        html_body: string;
      };
      expect(payload.subject).toBe(expectedVerificationSubjects[locale]);
      if (locale !== "zh-CN") {
        expect(payload.html_body).not.toContain("验证你的邮箱");
      }
    },
  );

  it("sends English verification email with brand and locale-aware link", async () => {
    const sent = mockPostal();

    await sendVerificationEmail(
      "user@example.com",
      "verify-token",
      bindings,
      "http://localhost:4321",
      "en",
    );

    const payload = sent[0] as {
      subject: string;
      html_body: string;
      plain_body: string;
    };
    expect(payload.subject).toBe("Verify your AI Beauty Stylist email");
    expect(payload.html_body).toContain("Verify your email");
    expect(payload.html_body).toContain("font-family:'Satisfy Brand'");
    expect(payload.html_body).not.toContain("<img");
    expect(payload.html_body).not.toContain("width:46px;height:46px");
    expect(payload.html_body).toContain("aibeautystylist.com");
    expect(payload.html_body).toContain("locale=en");
    expect(payload.plain_body).toContain(
      "AI Beauty Stylist will never ask for your password",
    );
    expect(payload.html_body).not.toContain("验证你的邮箱");
  });

  it("sends Japanese verification email when registration locale is Japanese", async () => {
    const sent = mockPostal();

    await sendVerificationEmail(
      "user@example.com",
      "verify-token",
      bindings,
      "http://localhost:4321",
      "ja-JP",
    );

    const payload = sent[0] as {
      subject: string;
      html_body: string;
      plain_body: string;
    };
    expect(payload.subject).toBe(
      "AI Beauty Stylist のメールアドレスを確認してください",
    );
    expect(payload.html_body).toContain("メールアドレスを確認");
    expect(payload.html_body).toContain("locale=ja-JP");
    expect(payload.plain_body).toContain("この確認リンクは24時間有効です。");
    expect(payload.html_body).not.toContain("验证你的邮箱");
  });

  it("sends localized password reset link for Japanese reset requests", async () => {
    const sent = mockPostal();

    await sendPasswordResetEmail(
      "user@example.com",
      "reset-token",
      bindings,
      "http://localhost:4321",
      "ja-JP",
    );

    const payload = sent[0] as {
      subject: string;
      html_body: string;
      plain_body: string;
    };
    expect(payload.subject).toBe("AI Beauty Stylist のパスワードを再設定");
    expect(payload.html_body).toContain(
      "https://aibeautystylist.com/ja/reset-password?token=reset-token",
    );
    expect(payload.plain_body).toContain("この再設定リンクは1時間有効です。");
    expect(payload.html_body).not.toContain("重置你的密码");
  });
});
