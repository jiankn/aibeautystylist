import { createProxyFetcher } from "./proxyFetch";
import { sendEmail } from "./email";
import type { RuntimeBindings } from "./runtime";

function baseUrl(bindings: RuntimeBindings, fallbackOrigin: string): string {
  return (bindings.APP_PUBLIC_URL ?? fallbackOrigin).replace(/\/+$/, "");
}

function fetcherFor(bindings: RuntimeBindings): typeof fetch {
  return bindings.OUTBOUND_PROXY_URL
    ? createProxyFetcher(bindings.OUTBOUND_PROXY_URL)
    : fetch;
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

export async function sendVerificationEmail(
  email: string,
  token: string,
  bindings: RuntimeBindings,
  origin: string,
) {
  const link = `${baseUrl(bindings, origin)}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  const safeLink = escapeHtml(link);
  return sendEmail(
    {
      to: email,
      subject: "验证你的 AI Beauty Stylist 邮箱",
      htmlBody: `<p>你好，</p><p>请点击下面的链接验证邮箱并激活账户：</p><p><a href="${safeLink}">验证邮箱</a></p><p>如果不是你本人操作，请忽略本邮件。链接 24 小时内有效。</p>`,
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
) {
  const link = `${baseUrl(bindings, origin)}/reset-password?token=${encodeURIComponent(token)}`;
  const safeLink = escapeHtml(link);
  return sendEmail(
    {
      to: email,
      subject: "重置你的 AI Beauty Stylist 密码",
      htmlBody: `<p>你好，</p><p>我们收到了重置密码的请求。点击下面的链接设置新密码：</p><p><a href="${safeLink}">重置密码</a></p><p>如果不是你本人操作，请忽略本邮件。链接 1 小时内有效。</p>`,
    },
    bindings,
    fetcherFor(bindings),
  );
}
