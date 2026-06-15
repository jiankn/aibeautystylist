import type { APIRoute } from "astro";

import { sendEmail } from "../../lib/email";
import { apiError, apiSuccess } from "../../lib/http";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit";
import { getRuntimeBindings } from "../../lib/runtime";

interface SupportBody {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  locale?: string;
  website?: string;
}

const TOPICS = new Set([
  "billing",
  "tryon",
  "diagnosis",
  "account",
  "cooperation",
  "other",
]);

export const POST: APIRoute = async ({ request }) => {
  if (Number(request.headers.get("content-length") || 0) > 20_000) {
    return invalid("提交内容过长，请精简后重试");
  }

  const body = (await request.json().catch(() => null)) as SupportBody | null;
  if (!body || body.website) return invalid("提交内容无效");

  const name = clean(body.name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const topic = clean(body.topic, 40);
  const message = clean(body.message, 3000);
  const locale = body.locale?.startsWith("zh") ? "zh-CN" : "en";

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !TOPICS.has(topic) ||
    message.length < 10
  ) {
    return invalid(
      locale === "en" ? "Please check the required fields." : "请检查必填信息",
    );
  }

  const bindings = getRuntimeBindings();
  if (!bindings.DB) {
    return apiError(
      {
        code: "SUPPORT_UNAVAILABLE",
        message:
          locale === "en"
            ? "Support is temporarily unavailable. Please email support@aibeautystylist.com."
            : "在线工单暂时不可用，请发送邮件至 support@aibeautystylist.com",
        retryable: true,
      },
      503,
    );
  }

  const rateLimit = await checkRateLimit(
    `support:${getClientIp(request)}`,
    { windowMs: 60 * 60 * 1000, maxRequests: 5 },
    bindings.DB,
  );
  if (!rateLimit.allowed) {
    return apiError(
      {
        code: "RATE_LIMITED",
        message:
          locale === "en"
            ? "Too many requests. Please try again later."
            : "提交过于频繁，请稍后再试",
        retryable: true,
      },
      429,
    );
  }

  const id = crypto.randomUUID();
  const ticketCode = `ABS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${id.slice(0, 6).toUpperCase()}`;
  const now = new Date().toISOString();

  await bindings.DB.prepare(
    `INSERT INTO support_requests
      (id, ticket_code, name, email, topic, message, locale, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
  )
    .bind(id, ticketCode, name, email, topic, message, locale, now, now)
    .run();

  const inbox = bindings.SUPPORT_EMAIL ?? "support@aibeautystylist.com";
  try {
    await sendEmail(
      {
        to: inbox,
        subject: `[${ticketCode}] ${topic} - ${name}`,
        htmlBody: `<h2>New support request</h2>
          <p><strong>Ticket:</strong> ${escapeHtml(ticketCode)}</p>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replaceAll("\n", "<br>")}</p>`,
      },
      bindings,
    );
  } catch {
    // The persisted ticket is the source of truth. Email delivery is best-effort.
  }

  return apiSuccess({ ticketCode }, { status: 201 });
};

function clean(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function invalid(message: string): Response {
  return apiError(
    { code: "INVALID_SUPPORT_REQUEST", message, retryable: false },
    400,
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
