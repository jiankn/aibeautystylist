import type { TryOnJobQueueMessage } from "./tryonJobQueueTypes";

export interface D1StatementLike {
  bind(...values: unknown[]): D1StatementLike;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<{ results?: T[] }>;
  run(): Promise<unknown>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1StatementLike;
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  get(key: string): Promise<{
    body: ReadableStream | ArrayBuffer;
    httpMetadata?: { contentType?: string };
  } | null>;
  delete(key: string): Promise<void>;
}

export interface RuntimeBindings {
  DB?: D1DatabaseLike;
  USER_UPLOADS?: R2BucketLike;
  IMAGES?: ImagesBinding;
  TRYON_JOBS_QUEUE?: Queue<TryOnJobQueueMessage>;
  AI_PROVIDER?: string;
  UPLOAD_PROVIDER?: string;
  TRYON_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_MODEL_FREE?: string;
  GEMINI_IMAGE_MODEL?: string;
  GEMINI_PRIVATE_REFERENCE_IMAGE_MODEL?: string;
  GEMINI_TIMEOUT_MS?: string;
  GEMINI_IMAGE_TIMEOUT_MS?: string;
  GEMINI_THINKING_LEVEL?: string;
  EVOLINK_API_KEY?: string;
  EVOLINK_IMAGE_MODEL?: string;
  EVOLINK_IMAGE_SIZE?: string;
  EVOLINK_IMAGE_QUALITY?: string;
  EVOLINK_IMAGE_TIMEOUT_MS?: string;
  // 妆效图生成 Provider：默认 gemini（gemini-2.5-flash-image），可设为 evolink 使用 Wan Image。
  IMAGE_PROVIDER?: string;
  ENABLE_CF_IMAGE_VARIANTS?: string;
  CLEANUP_SECRET?: string;
  // 本地受控验收用：worker 出站 fetch 经此中继走系统代理。生产留空即直连。
  OUTBOUND_PROXY_URL?: string;
  // Stripe（会员与支付）
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_PRO_MONTHLY?: string;
  STRIPE_PRICE_PRO_YEARLY?: string;
  STRIPE_PRICE_PREMIUM_MONTHLY?: string;
  STRIPE_PRICE_PREMIUM_YEARLY?: string;
  STRIPE_PRICE_CREDITS_20?: string;
  STRIPE_PRICE_CREDITS_60?: string;
  APP_PUBLIC_URL?: string;
  // 邮件（Postal）与第三方登录（OAuth）
  POSTAL_API_URL?: string;
  POSTAL_API_KEY?: string;
  POSTAL_API_FROM_NAME?: string;
  SMTP_FROM?: string;
  SUPPORT_EMAIL?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  MICROSOFT_OAUTH_CLIENT_ID?: string;
  MICROSOFT_OAUTH_CLIENT_SECRET?: string;
}

export function getRuntimeBindings(): RuntimeBindings {
  const runtime = env as RuntimeBindings;
  const uploadProvider =
    runtime.UPLOAD_PROVIDER ?? import.meta.env.UPLOAD_PROVIDER ?? "mock";
  const requestedTryOnProvider =
    runtime.TRYON_PROVIDER ?? import.meta.env.TRYON_PROVIDER ?? "mock";
  const tryOnProvider =
    requestedTryOnProvider === "gemini" && uploadProvider !== "r2"
      ? "mock"
      : requestedTryOnProvider;
  return {
    ...runtime,
    AI_PROVIDER: runtime.AI_PROVIDER ?? import.meta.env.AI_PROVIDER ?? "mock",
    UPLOAD_PROVIDER: uploadProvider,
    ENABLE_CF_IMAGE_VARIANTS:
      runtime.ENABLE_CF_IMAGE_VARIANTS ??
      import.meta.env.ENABLE_CF_IMAGE_VARIANTS,
    // Without persisted uploads, real diagnosis cannot run safely; force mock
    // task mode to keep local/mock environments coherent and avoid paid calls.
    TRYON_PROVIDER: tryOnProvider,
  };
}

import { env } from "cloudflare:workers";
