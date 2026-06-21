import { describe, expect, it } from "vitest";

import { supportedLocales, type SupportedLocale } from "../lib/i18n";
import { getLocalizedAuthResponseMessages } from "./authContent";

const expectedRegisterSuccess: Record<SupportedLocale, string> = {
  en: "Account created. Check your email to verify it.",
  "zh-CN": "注册成功，请查收验证邮件。",
  "de-DE": "Konto erstellt. Bitte bestätige deine E-Mail.",
  "fr-FR": "Compte créé. Vérifiez votre e-mail.",
  "ja-JP": "アカウントを作成しました。メールをご確認ください。",
  "ko-KR": "계정이 생성되었습니다. 이메일을 확인하세요.",
  "zh-TW": "帳戶已建立，請查收驗證郵件。",
  "es-ES": "Cuenta creada. Revisa tu correo.",
  "es-419": "Cuenta creada. Revisa tu correo.",
  "pt-BR": "Conta criada. Confira seu e-mail.",
};

describe("auth response messages", () => {
  it.each(supportedLocales)(
    "localizes register success feedback for %s",
    (locale) => {
      const copy = getLocalizedAuthResponseMessages(locale);

      expect(copy.registerSuccess).toBe(expectedRegisterSuccess[locale]);
      if (locale !== "zh-CN") {
        expect(copy.registerSuccess).not.toContain("注册成功");
      }
    },
  );
});
