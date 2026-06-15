// Stripe Webhook 签名校验（Workers 兼容，使用 WebCrypto HMAC-SHA256）。
// 复刻 Stripe 的 `t=...,v1=...` 签名方案：签名串为 `${timestamp}.${payload}`。

export type WebhookVerifyErrorCode =
  | "WEBHOOK_NOT_CONFIGURED"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "WEBHOOK_TIMESTAMP_INVALID"
  | "WEBHOOK_PAYLOAD_INVALID";

export class WebhookVerifyError extends Error {
  constructor(
    public readonly code: WebhookVerifyErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

const DEFAULT_TOLERANCE_SECONDS = 300;

export async function verifyStripeWebhook(options: {
  payload: string;
  signatureHeader: string | null;
  secret: string;
  toleranceSeconds?: number;
  now?: Date;
}): Promise<StripeEvent> {
  if (!options.secret) {
    throw new WebhookVerifyError(
      "WEBHOOK_NOT_CONFIGURED",
      "Webhook 签名密钥未配置",
    );
  }
  const parsed = parseSignatureHeader(options.signatureHeader);
  if (!parsed) {
    throw new WebhookVerifyError(
      "WEBHOOK_SIGNATURE_INVALID",
      "缺少或无法解析签名头",
    );
  }

  const nowSeconds = Math.floor((options.now ?? new Date()).getTime() / 1000);
  const tolerance = options.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (Math.abs(nowSeconds - parsed.timestamp) > tolerance) {
    throw new WebhookVerifyError(
      "WEBHOOK_TIMESTAMP_INVALID",
      "签名时间戳超出容忍窗口",
    );
  }

  const expected = await computeSignature(
    options.secret,
    `${parsed.timestamp}.${options.payload}`,
  );
  const matched = parsed.signatures.some((candidate) =>
    timingSafeEqual(candidate, expected),
  );
  if (!matched) {
    throw new WebhookVerifyError("WEBHOOK_SIGNATURE_INVALID", "签名校验失败");
  }

  try {
    const event = JSON.parse(options.payload) as StripeEvent;
    if (!event?.id || !event?.type || !event?.data?.object) {
      throw new Error("missing fields");
    }
    return event;
  } catch {
    throw new WebhookVerifyError(
      "WEBHOOK_PAYLOAD_INVALID",
      "Webhook 负载不是合法事件 JSON",
    );
  }
}

// 用于测试与本地签名生成。
export async function computeSignature(
  secret: string,
  signedPayload: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );
  return toHex(new Uint8Array(signature));
}

function parseSignatureHeader(
  header: string | null,
): { timestamp: number; signatures: string[] } | null {
  if (!header) return null;
  let timestamp = NaN;
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const [key, value] = part.split("=");
    if (key === "t") timestamp = Number(value);
    else if (key === "v1" && value) signatures.push(value);
  }
  if (!Number.isFinite(timestamp) || signatures.length === 0) return null;
  return { timestamp, signatures };
}

function toHex(bytes: Uint8Array): string {
  let hex = "";
  for (const byte of bytes) hex += byte.toString(16).padStart(2, "0");
  return hex;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}
