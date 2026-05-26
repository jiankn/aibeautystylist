/**
 * Email Service — Postal HTTP API
 *
 * Cloudflare Workers 不支持 SMTP/TCP，因此邮件发送统一通过 Postal HTTP API。
 */
import type { RuntimeEnv } from '../cloudflare/runtime';
import { getRuntimeValue } from '../cloudflare/runtime';

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  tag?: string;
}

interface PostalSendResponse {
  status?: string;
  message_id?: string;
  messages?: Record<string, { id?: number; token?: string }>;
  error?: string;
  message?: string;
}

function getRequiredEnv(env: RuntimeEnv | undefined, key: keyof RuntimeEnv): string {
  const value = getRuntimeValue(env, key);
  if (!value) throw new Error(`${String(key)} not configured`);
  return value;
}

function getFromAddress(env: RuntimeEnv | undefined): string {
  const from = getRequiredEnv(env, 'SMTP_FROM');
  const name = getRuntimeValue(env, 'POSTAL_API_FROM_NAME');
  return name ? `${name} <${from}>` : from;
}

export async function sendEmail(
  env: RuntimeEnv | undefined,
  input: SendEmailInput,
): Promise<void> {
  const apiUrl = getRequiredEnv(env, 'POSTAL_API_URL');
  const apiKey = getRequiredEnv(env, 'POSTAL_API_KEY');

  const resp = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Server-API-Key': apiKey,
    },
    body: JSON.stringify({
      to: [input.to],
      from: getFromAddress(env),
      sender: getRuntimeValue(env, 'SMTP_FROM'),
      subject: input.subject,
      plain_body: input.text,
      html_body: input.html,
      tag: input.tag,
    }),
  });

  const responseText = await resp.text().catch(() => '');
  let parsed: PostalSendResponse | null = null;
  try {
    parsed = responseText ? JSON.parse(responseText) as PostalSendResponse : null;
  } catch {
    parsed = null;
  }

  if (!resp.ok || parsed?.error) {
    const detail = parsed?.error ?? parsed?.message ?? responseText ?? `HTTP ${resp.status}`;
    throw new Error(`Postal send failed: ${detail}`);
  }
}

export function buildPasswordResetEmail(input: {
  resetUrl: string;
  recipientName?: string | null;
}): { subject: string; html: string; text: string } {
  const name = input.recipientName?.trim() || 'there';
  const subject = 'Reset your AI Beauty Stylist password';
  const text = [
    `Hi ${name},`,
    '',
    'We received a request to reset your AI Beauty Stylist password.',
    `Open this secure link to choose a new password: ${input.resetUrl}`,
    '',
    'This link expires in 1 hour. If you did not request this, you can safely ignore this email.',
    '',
    'AI Beauty Stylist',
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#1f1a1a;max-width:560px;margin:0 auto;padding:24px;">
      <p style="font-size:14px;color:#8a6d72;margin:0 0 12px;">AI Beauty Stylist</p>
      <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 16px;color:#1f1a1a;">Reset your password</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>We received a request to reset your AI Beauty Stylist password.</p>
      <p style="margin:24px 0;">
        <a href="${escapeHtml(input.resetUrl)}" style="display:inline-block;background:#b07f86;color:#fff;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:700;">Choose a new password</a>
      </p>
      <p style="font-size:14px;color:#6f6262;">This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
      <p style="font-size:12px;color:#8f8585;word-break:break-all;">${escapeHtml(input.resetUrl)}</p>
    </div>
  `;

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] ?? char));
}
