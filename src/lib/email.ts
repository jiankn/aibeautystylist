// Postal 邮件发送（自建 Postal HTTP API）。
// POST {POSTAL_API_URL}/api/v1/send/message，头 X-Server-API-Key，JSON body。
// 支持注入 fetcher 复用出口中继代理；未配置时静默跳过（开发态不阻断流程）。
import type { RuntimeBindings } from "./runtime";

export type EmailErrorCode = "EMAIL_NOT_CONFIGURED" | "EMAIL_SEND_FAILED";

export class EmailError extends Error {
  constructor(
    public readonly code: EmailErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface SendEmailInput {
  to: string;
  subject: string;
  htmlBody: string;
  plainBody?: string;
}

export interface SendEmailResult {
  sent: boolean;
  skipped?: boolean;
}

export async function sendEmail(
  input: SendEmailInput,
  bindings: RuntimeBindings,
  fetcher: typeof fetch = fetch,
): Promise<SendEmailResult> {
  const baseUrl = bindings.POSTAL_API_URL;
  const apiKey = bindings.POSTAL_API_KEY;
  const from = buildFrom(bindings);

  if (!baseUrl || !apiKey || !from) {
    // 未配置邮件：开发态不阻断（例如注册仍可完成），由调用方决定如何提示。
    return { sent: false, skipped: true };
  }

  const endpoint = `${baseUrl.replace(/\/+$/, "")}/api/v1/send/message`;
  let response: Response;
  try {
    response = await fetcher(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-server-api-key": apiKey,
      },
      body: JSON.stringify({
        to: [input.to],
        from,
        subject: input.subject,
        html_body: input.htmlBody,
        plain_body: input.plainBody ?? stripHtml(input.htmlBody),
      }),
    });
  } catch (error) {
    throw new EmailError(
      "EMAIL_SEND_FAILED",
      error instanceof Error ? error.message : "邮件发送失败",
    );
  }

  const payload = (await response.json().catch(() => null)) as {
    status?: string;
    data?: unknown;
  } | null;
  if (!response.ok || payload?.status !== "success") {
    throw new EmailError(
      "EMAIL_SEND_FAILED",
      `Postal 返回异常：HTTP ${response.status}`,
    );
  }
  return { sent: true };
}

function buildFrom(bindings: RuntimeBindings): string | undefined {
  const address = bindings.SMTP_FROM;
  if (!address) return undefined;
  const name = bindings.POSTAL_API_FROM_NAME;
  return name ? `${name} <${address}>` : address;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
