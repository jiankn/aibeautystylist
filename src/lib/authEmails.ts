import { defaultLanguage, getLanguageByLocale } from "../i18n/config";
import { getLocalizedAppHref } from "../i18n/routing";
import { createProxyFetcher } from "./proxyFetch";
import { sendEmail } from "./email";
import { normalizeLocale, type SupportedLocale } from "./i18n";
import type { RuntimeBindings } from "./runtime";

const BRAND_NAME = "AI Beauty Stylist";
const DEFAULT_SUPPORT_EMAIL = "support@aibeautystylist.com";

interface AuthEmailActionCopy {
  readonly subject: string;
  readonly preheader: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly cta: string;
  readonly expiry: string;
  readonly ignore: string;
  readonly security: string;
  readonly fallback: string;
}

interface AuthEmailLocaleCopy {
  readonly tagline: string;
  readonly domainLabel: string;
  readonly footer: string;
  readonly verification: AuthEmailActionCopy;
  readonly reset: AuthEmailActionCopy;
}

function baseUrl(bindings: RuntimeBindings, fallbackOrigin: string): string {
  return (bindings.APP_PUBLIC_URL ?? fallbackOrigin).replace(/\/+$/, "");
}

function fetcherFor(bindings: RuntimeBindings): typeof fetch {
  return bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
    : fetch;
}

function languageSlugFor(locale: SupportedLocale): string {
  return (getLanguageByLocale(locale) ?? defaultLanguage).slug;
}

function localizedUrl(
  siteUrl: string,
  path: string,
  locale: SupportedLocale,
): string {
  return `${siteUrl}${getLocalizedAppHref(path, languageSlugFor(locale))}`;
}

function verificationUrl(
  siteUrl: string,
  token: string,
  locale: SupportedLocale,
): string {
  const url = new URL(`${siteUrl}/api/auth/verify-email`);
  url.searchParams.set("token", token);
  url.searchParams.set("locale", locale);
  return url.toString();
}

function resetUrl(
  siteUrl: string,
  token: string,
  locale: SupportedLocale,
): string {
  return localizedUrl(
    siteUrl,
    `/reset-password?token=${encodeURIComponent(token)}`,
    locale,
  );
}

// HTML 转义：防止动态内容注入（邮件模板 XSS 防护）。
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function copyFor(localeInput?: string | null): {
  locale: SupportedLocale;
  copy: AuthEmailLocaleCopy;
} {
  const locale = normalizeLocale(localeInput);
  return { locale, copy: localizedEmailCopy[locale] ?? localizedEmailCopy.en };
}

function renderAuthEmail(options: {
  siteUrl: string;
  recipient: string;
  link: string;
  supportEmail: string;
  localeCopy: AuthEmailLocaleCopy;
  actionCopy: AuthEmailActionCopy;
}): { htmlBody: string; plainBody: string } {
  const siteUrl = options.siteUrl;
  const domain = new URL(siteUrl).hostname.replace(/^www\./, "");
  const safeLink = escapeHtml(options.link);
  const safeDomain = escapeHtml(domain);
  const safeSiteUrl = escapeHtml(siteUrl);
  const safeSupport = escapeHtml(options.supportEmail);
  const safeRecipient = escapeHtml(options.recipient);
  const copy = options.localeCopy;
  const action = options.actionCopy;

  const htmlBody = `<!doctype html>
<html>
  <body style="margin:0;background:#f7f4f2;color:#242126;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(action.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4f2;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfe2;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 20px;background:#fff7fa;border-bottom:1px solid #f0dfe5;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font-family:'Satisfy Brand','Segoe Script','Brush Script MT',cursive;font-size:28px;font-weight:400;line-height:1.12;letter-spacing:0;word-spacing:.04em;color:#221f24;">${BRAND_NAME}</div>
                      <div style="margin-top:7px;font-size:13px;line-height:1.4;color:#7e6870;">${escapeHtml(copy.tagline)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 10px;">
                <div style="margin-bottom:12px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#b12d58;">${escapeHtml(action.eyebrow)}</div>
                <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;color:#211d22;">${escapeHtml(action.title)}</h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#4e464c;">${escapeHtml(action.intro)}</p>
                <p style="margin:0 0 24px;">
                  <a href="${safeLink}" style="display:inline-block;padding:13px 20px;border-radius:999px;background:#b12d58;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;">${escapeHtml(action.cta)}</a>
                </p>
                <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b5e66;">${escapeHtml(action.expiry)}</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#6b5e66;">${escapeHtml(action.ignore)}</p>
                <div style="margin:0 0 24px;padding:14px 16px;border-radius:12px;background:#faf7f5;border:1px solid #efe6e2;color:#675a62;font-size:13px;line-height:1.65;">${escapeHtml(action.security)}</div>
                <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#8a7a82;">${escapeHtml(action.fallback)}</p>
                <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:#8a7a82;word-break:break-all;"><a href="${safeLink}" style="color:#9b294e;">${safeLink}</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;border-top:1px solid #f0e5e7;">
                <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#8a7a82;">${escapeHtml(copy.domainLabel)} <a href="${safeSiteUrl}" style="color:#9b294e;text-decoration:none;">${safeDomain}</a></p>
                <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#8a7a82;">${escapeHtml(copy.footer)} <a href="mailto:${safeSupport}" style="color:#9b294e;text-decoration:none;">${safeSupport}</a></p>
                <p style="margin:0;font-size:11px;line-height:1.6;color:#a1949a;">${BRAND_NAME} · ${safeRecipient}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const plainBody = [
    `${BRAND_NAME}`,
    copy.tagline,
    "",
    action.title,
    "",
    action.intro,
    "",
    `${action.cta}: ${options.link}`,
    "",
    action.expiry,
    action.ignore,
    "",
    action.security,
    "",
    `${copy.domainLabel} ${siteUrl}`,
    `${copy.footer} ${options.supportEmail}`,
  ].join("\n");

  return { htmlBody, plainBody };
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  bindings: RuntimeBindings,
  origin: string,
  localeInput?: string | null,
) {
  const siteUrl = baseUrl(bindings, origin);
  const { locale, copy } = copyFor(localeInput);
  const link = verificationUrl(siteUrl, token, locale);
  const { htmlBody, plainBody } = renderAuthEmail({
    siteUrl,
    recipient: email,
    link,
    supportEmail: bindings.SUPPORT_EMAIL ?? DEFAULT_SUPPORT_EMAIL,
    localeCopy: copy,
    actionCopy: copy.verification,
  });

  return sendEmail(
    {
      to: email,
      subject: copy.verification.subject,
      htmlBody,
      plainBody,
    },
    bindings,
    fetcherFor(bindings),
  );
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  bindings: RuntimeBindings,
  origin: string,
  localeInput?: string | null,
) {
  const siteUrl = baseUrl(bindings, origin);
  const { locale, copy } = copyFor(localeInput);
  const link = resetUrl(siteUrl, token, locale);
  const { htmlBody, plainBody } = renderAuthEmail({
    siteUrl,
    recipient: email,
    link,
    supportEmail: bindings.SUPPORT_EMAIL ?? DEFAULT_SUPPORT_EMAIL,
    localeCopy: copy,
    actionCopy: copy.reset,
  });

  return sendEmail(
    {
      to: email,
      subject: copy.reset.subject,
      htmlBody,
      plainBody,
    },
    bindings,
    fetcherFor(bindings),
  );
}

const localizedEmailCopy: Record<SupportedLocale, AuthEmailLocaleCopy> = {
  en: {
    tagline: "Personalized makeup try-on and beauty guidance.",
    domainLabel: "Official site:",
    footer: "Need help? Contact",
    verification: {
      subject: "Verify your AI Beauty Stylist email",
      preheader: "Confirm your email to activate your account.",
      eyebrow: "Email verification",
      title: "Verify your email",
      intro:
        "Confirm this email address to activate your AI Beauty Stylist account and save your looks, diagnoses, and membership benefits.",
      cta: "Verify email",
      expiry: "This verification link is valid for 24 hours.",
      ignore:
        "If you did not create an AI Beauty Stylist account, you can safely ignore this email.",
      security:
        "AI Beauty Stylist will never ask for your password, verification code, or payment card details by email.",
      fallback:
        "If the button does not work, copy and paste this link into your browser:",
    },
    reset: {
      subject: "Reset your AI Beauty Stylist password",
      preheader: "Use this secure link to set a new password.",
      eyebrow: "Password reset",
      title: "Reset your password",
      intro:
        "We received a request to reset the password for your AI Beauty Stylist account. Use the secure link below to set a new password.",
      cta: "Reset password",
      expiry: "This password reset link is valid for 1 hour.",
      ignore:
        "If you did not request a password reset, you can safely ignore this email.",
      security:
        "For your safety, do not forward this email. AI Beauty Stylist will never ask for your password by email.",
      fallback:
        "If the button does not work, copy and paste this link into your browser:",
    },
  },
  "zh-CN": {
    tagline: "个性化 AI 试妆与美妆建议。",
    domainLabel: "官方网站：",
    footer: "需要帮助？请联系",
    verification: {
      subject: "验证你的 AI Beauty Stylist 邮箱",
      preheader: "确认邮箱后即可激活账户。",
      eyebrow: "邮箱验证",
      title: "验证你的邮箱",
      intro:
        "请确认这个邮箱地址，用于激活你的 AI Beauty Stylist 账户，并保存妆容、诊断报告和会员权益。",
      cta: "验证邮箱",
      expiry: "此验证链接 24 小时内有效。",
      ignore: "如果不是你创建了 AI Beauty Stylist 账户，可以安全忽略这封邮件。",
      security:
        "AI Beauty Stylist 不会通过邮件索要你的密码、验证码或银行卡信息。",
      fallback: "如果按钮无法打开，请复制下面的链接到浏览器：",
    },
    reset: {
      subject: "重置你的 AI Beauty Stylist 密码",
      preheader: "使用安全链接设置新密码。",
      eyebrow: "密码重置",
      title: "重置你的密码",
      intro:
        "我们收到了重置 AI Beauty Stylist 账户密码的请求。请使用下面的安全链接设置新密码。",
      cta: "重置密码",
      expiry: "此密码重置链接 1 小时内有效。",
      ignore: "如果不是你本人操作，可以安全忽略这封邮件。",
      security:
        "为了账户安全，请不要转发这封邮件。AI Beauty Stylist 不会通过邮件索要你的密码。",
      fallback: "如果按钮无法打开，请复制下面的链接到浏览器：",
    },
  },
  "de-DE": {
    tagline: "Personalisierte Make-up Try-ons und Beauty-Empfehlungen.",
    domainLabel: "Offizielle Website:",
    footer: "Brauchst du Hilfe? Kontakt:",
    verification: {
      subject: "Bestätige deine AI Beauty Stylist E-Mail",
      preheader: "Bestätige deine E-Mail, um dein Konto zu aktivieren.",
      eyebrow: "E-Mail-Bestätigung",
      title: "Bestätige deine E-Mail",
      intro:
        "Bestätige diese E-Mail-Adresse, um dein AI Beauty Stylist Konto zu aktivieren und Looks, Diagnosen und Vorteile zu speichern.",
      cta: "E-Mail bestätigen",
      expiry: "Dieser Bestätigungslink ist 24 Stunden gültig.",
      ignore:
        "Wenn du kein AI Beauty Stylist Konto erstellt hast, kannst du diese E-Mail ignorieren.",
      security:
        "AI Beauty Stylist fragt dich niemals per E-Mail nach Passwort, Bestätigungscode oder Kartendaten.",
      fallback:
        "Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:",
    },
    reset: {
      subject: "Setze dein AI Beauty Stylist Passwort zurück",
      preheader:
        "Nutze diesen sicheren Link, um ein neues Passwort festzulegen.",
      eyebrow: "Passwort zurücksetzen",
      title: "Setze dein Passwort zurück",
      intro:
        "Wir haben eine Anfrage zum Zurücksetzen deines AI Beauty Stylist Passworts erhalten. Nutze den sicheren Link unten.",
      cta: "Passwort zurücksetzen",
      expiry: "Dieser Link ist 1 Stunde gültig.",
      ignore:
        "Wenn du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.",
      security:
        "Leite diese E-Mail nicht weiter. AI Beauty Stylist fragt nie per E-Mail nach deinem Passwort.",
      fallback:
        "Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:",
    },
  },
  "fr-FR": {
    tagline: "Essai maquillage personnalisé et conseils beauté.",
    domainLabel: "Site officiel :",
    footer: "Besoin d'aide ? Contact :",
    verification: {
      subject: "Vérifiez votre e-mail AI Beauty Stylist",
      preheader: "Confirmez votre e-mail pour activer votre compte.",
      eyebrow: "Vérification e-mail",
      title: "Vérifiez votre e-mail",
      intro:
        "Confirmez cette adresse e-mail pour activer votre compte AI Beauty Stylist et enregistrer vos looks, diagnostics et avantages.",
      cta: "Vérifier l'e-mail",
      expiry: "Ce lien de vérification est valable 24 heures.",
      ignore:
        "Si vous n'avez pas créé de compte AI Beauty Stylist, vous pouvez ignorer cet e-mail.",
      security:
        "AI Beauty Stylist ne vous demandera jamais votre mot de passe, code de vérification ou données bancaires par e-mail.",
      fallback:
        "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    },
    reset: {
      subject: "Réinitialisez votre mot de passe AI Beauty Stylist",
      preheader:
        "Utilisez ce lien sécurisé pour définir un nouveau mot de passe.",
      eyebrow: "Réinitialisation",
      title: "Réinitialisez votre mot de passe",
      intro:
        "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte AI Beauty Stylist. Utilisez le lien sécurisé ci-dessous.",
      cta: "Réinitialiser le mot de passe",
      expiry: "Ce lien de réinitialisation est valable 1 heure.",
      ignore:
        "Si vous n'avez pas demandé cette action, vous pouvez ignorer cet e-mail.",
      security:
        "Pour votre sécurité, ne transférez pas cet e-mail. AI Beauty Stylist ne demandera jamais votre mot de passe par e-mail.",
      fallback:
        "Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :",
    },
  },
  "ja-JP": {
    tagline: "自分に合うメイク試着とビューティー提案。",
    domainLabel: "公式サイト：",
    footer: "お困りの場合：",
    verification: {
      subject: "AI Beauty Stylist のメールアドレスを確認してください",
      preheader: "メールを確認してアカウントを有効化します。",
      eyebrow: "メール確認",
      title: "メールアドレスを確認",
      intro:
        "AI Beauty Stylist アカウントを有効化し、メイク、診断、会員特典を保存するため、このメールアドレスを確認してください。",
      cta: "メールを確認する",
      expiry: "この確認リンクは24時間有効です。",
      ignore:
        "AI Beauty Stylist アカウントを作成していない場合、このメールは無視できます。",
      security:
        "AI Beauty Stylist がメールでパスワード、確認コード、カード情報を求めることはありません。",
      fallback:
        "ボタンが開かない場合は、次のリンクをブラウザに貼り付けてください：",
    },
    reset: {
      subject: "AI Beauty Stylist のパスワードを再設定",
      preheader: "安全なリンクで新しいパスワードを設定します。",
      eyebrow: "パスワード再設定",
      title: "パスワードを再設定",
      intro:
        "AI Beauty Stylist アカウントのパスワード再設定リクエストを受け取りました。下の安全なリンクから新しいパスワードを設定してください。",
      cta: "パスワードを再設定",
      expiry: "この再設定リンクは1時間有効です。",
      ignore: "この操作に心当たりがない場合、このメールは無視できます。",
      security:
        "安全のため、このメールを転送しないでください。AI Beauty Stylist がメールでパスワードを求めることはありません。",
      fallback:
        "ボタンが開かない場合は、次のリンクをブラウザに貼り付けてください：",
    },
  },
  "ko-KR": {
    tagline: "개인 맞춤 메이크업 체험과 뷰티 가이드.",
    domainLabel: "공식 사이트:",
    footer: "도움이 필요하면 문의하세요:",
    verification: {
      subject: "AI Beauty Stylist 이메일 인증",
      preheader: "이메일을 인증해 계정을 활성화하세요.",
      eyebrow: "이메일 인증",
      title: "이메일을 인증하세요",
      intro:
        "AI Beauty Stylist 계정을 활성화하고 룩, 진단, 멤버십 혜택을 저장하려면 이 이메일 주소를 인증하세요.",
      cta: "이메일 인증",
      expiry: "이 인증 링크는 24시간 동안 유효합니다.",
      ignore:
        "AI Beauty Stylist 계정을 만들지 않았다면 이 이메일을 무시해도 됩니다.",
      security:
        "AI Beauty Stylist는 이메일로 비밀번호, 인증 코드 또는 카드 정보를 요청하지 않습니다.",
      fallback: "버튼이 작동하지 않으면 이 링크를 브라우저에 붙여넣으세요:",
    },
    reset: {
      subject: "AI Beauty Stylist 비밀번호 재설정",
      preheader: "안전한 링크로 새 비밀번호를 설정하세요.",
      eyebrow: "비밀번호 재설정",
      title: "비밀번호를 재설정하세요",
      intro:
        "AI Beauty Stylist 계정의 비밀번호 재설정 요청을 받았습니다. 아래 안전한 링크로 새 비밀번호를 설정하세요.",
      cta: "비밀번호 재설정",
      expiry: "이 비밀번호 재설정 링크는 1시간 동안 유효합니다.",
      ignore: "요청한 적이 없다면 이 이메일을 무시해도 됩니다.",
      security:
        "안전을 위해 이 이메일을 전달하지 마세요. AI Beauty Stylist는 이메일로 비밀번호를 요청하지 않습니다.",
      fallback: "버튼이 작동하지 않으면 이 링크를 브라우저에 붙여넣으세요:",
    },
  },
  "zh-TW": {
    tagline: "個人化 AI 試妝與美妝建議。",
    domainLabel: "官方網站：",
    footer: "需要協助？請聯絡",
    verification: {
      subject: "驗證你的 AI Beauty Stylist 電子郵件",
      preheader: "確認電子郵件即可啟用帳戶。",
      eyebrow: "電子郵件驗證",
      title: "驗證你的電子郵件",
      intro:
        "請確認這個電子郵件地址，用於啟用你的 AI Beauty Stylist 帳戶，並儲存妝容、診斷與會員權益。",
      cta: "驗證電子郵件",
      expiry: "此驗證連結 24 小時內有效。",
      ignore: "如果不是你建立了 AI Beauty Stylist 帳戶，可以安全忽略這封郵件。",
      security:
        "AI Beauty Stylist 不會透過電子郵件索取你的密碼、驗證碼或信用卡資料。",
      fallback: "如果按鈕無法開啟，請複製下方連結到瀏覽器：",
    },
    reset: {
      subject: "重設你的 AI Beauty Stylist 密碼",
      preheader: "使用安全連結設定新密碼。",
      eyebrow: "密碼重設",
      title: "重設你的密碼",
      intro:
        "我們收到了重設 AI Beauty Stylist 帳戶密碼的請求。請使用下方安全連結設定新密碼。",
      cta: "重設密碼",
      expiry: "此密碼重設連結 1 小時內有效。",
      ignore: "如果不是你本人操作，可以安全忽略這封郵件。",
      security:
        "為了帳戶安全，請不要轉寄這封郵件。AI Beauty Stylist 不會透過電子郵件索取你的密碼。",
      fallback: "如果按鈕無法開啟，請複製下方連結到瀏覽器：",
    },
  },
  "es-ES": {
    tagline: "Prueba de maquillaje personalizada y guía de belleza.",
    domainLabel: "Sitio oficial:",
    footer: "¿Necesitas ayuda? Contacta con",
    verification: {
      subject: "Verifica tu correo de AI Beauty Stylist",
      preheader: "Confirma tu correo para activar tu cuenta.",
      eyebrow: "Verificación de correo",
      title: "Verifica tu correo",
      intro:
        "Confirma esta dirección de correo para activar tu cuenta de AI Beauty Stylist y guardar looks, diagnósticos y ventajas.",
      cta: "Verificar correo",
      expiry: "Este enlace de verificación es válido durante 24 horas.",
      ignore:
        "Si no creaste una cuenta de AI Beauty Stylist, puedes ignorar este correo.",
      security:
        "AI Beauty Stylist nunca te pedirá por correo tu contraseña, código de verificación ni datos de tarjeta.",
      fallback:
        "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    },
    reset: {
      subject: "Restablece tu contraseña de AI Beauty Stylist",
      preheader: "Usa este enlace seguro para crear una nueva contraseña.",
      eyebrow: "Restablecer contraseña",
      title: "Restablece tu contraseña",
      intro:
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta de AI Beauty Stylist. Usa el enlace seguro de abajo.",
      cta: "Restablecer contraseña",
      expiry:
        "Este enlace para restablecer la contraseña es válido durante 1 hora.",
      ignore: "Si no solicitaste este cambio, puedes ignorar este correo.",
      security:
        "Por seguridad, no reenvíes este correo. AI Beauty Stylist nunca te pedirá tu contraseña por correo.",
      fallback:
        "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    },
  },
  "es-419": {
    tagline: "Prueba de maquillaje personalizada y guía de belleza.",
    domainLabel: "Sitio oficial:",
    footer: "¿Necesitas ayuda? Contacta a",
    verification: {
      subject: "Verifica tu correo de AI Beauty Stylist",
      preheader: "Confirma tu correo para activar tu cuenta.",
      eyebrow: "Verificación de correo",
      title: "Verifica tu correo",
      intro:
        "Confirma esta dirección de correo para activar tu cuenta de AI Beauty Stylist y guardar looks, diagnósticos y beneficios.",
      cta: "Verificar correo",
      expiry: "Este enlace de verificación es válido durante 24 horas.",
      ignore:
        "Si no creaste una cuenta de AI Beauty Stylist, puedes ignorar este correo.",
      security:
        "AI Beauty Stylist nunca te pedirá por correo tu contraseña, código de verificación ni datos de tarjeta.",
      fallback:
        "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    },
    reset: {
      subject: "Restablece tu contraseña de AI Beauty Stylist",
      preheader: "Usa este enlace seguro para crear una nueva contraseña.",
      eyebrow: "Restablecer contraseña",
      title: "Restablece tu contraseña",
      intro:
        "Recibimos una solicitud para restablecer la contraseña de tu cuenta de AI Beauty Stylist. Usa el enlace seguro de abajo.",
      cta: "Restablecer contraseña",
      expiry:
        "Este enlace para restablecer la contraseña es válido durante 1 hora.",
      ignore: "Si no solicitaste este cambio, puedes ignorar este correo.",
      security:
        "Por seguridad, no reenvíes este correo. AI Beauty Stylist nunca te pedirá tu contraseña por correo.",
      fallback:
        "Si el botón no funciona, copia y pega este enlace en tu navegador:",
    },
  },
  "pt-BR": {
    tagline: "Teste de maquiagem personalizado e orientação de beleza.",
    domainLabel: "Site oficial:",
    footer: "Precisa de ajuda? Fale com",
    verification: {
      subject: "Verifique seu e-mail do AI Beauty Stylist",
      preheader: "Confirme seu e-mail para ativar sua conta.",
      eyebrow: "Verificação de e-mail",
      title: "Verifique seu e-mail",
      intro:
        "Confirme este endereço de e-mail para ativar sua conta do AI Beauty Stylist e salvar looks, diagnósticos e benefícios.",
      cta: "Verificar e-mail",
      expiry: "Este link de verificação é válido por 24 horas.",
      ignore:
        "Se você não criou uma conta no AI Beauty Stylist, pode ignorar este e-mail.",
      security:
        "O AI Beauty Stylist nunca pedirá sua senha, código de verificação ou dados de cartão por e-mail.",
      fallback:
        "Se o botão não funcionar, copie e cole este link no navegador:",
    },
    reset: {
      subject: "Redefina sua senha do AI Beauty Stylist",
      preheader: "Use este link seguro para criar uma nova senha.",
      eyebrow: "Redefinição de senha",
      title: "Redefina sua senha",
      intro:
        "Recebemos uma solicitação para redefinir a senha da sua conta do AI Beauty Stylist. Use o link seguro abaixo.",
      cta: "Redefinir senha",
      expiry: "Este link de redefinição é válido por 1 hora.",
      ignore: "Se você não solicitou isso, pode ignorar este e-mail.",
      security:
        "Para sua segurança, não encaminhe este e-mail. O AI Beauty Stylist nunca pedirá sua senha por e-mail.",
      fallback:
        "Se o botão não funcionar, copie e cole este link no navegador:",
    },
  },
};
