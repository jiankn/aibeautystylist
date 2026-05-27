export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete?(key: string): Promise<void>;
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results?: T[]; success?: boolean; error?: string }>;
  run(): Promise<{ success?: boolean; error?: string }>;
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike;
}

export interface R2BucketLike {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
      customMetadata?: Record<string, string>;
    },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

export interface RuntimeEnv {
  APP_ENV?: string;
  APP_PUBLIC_URL?: string;
  AI_PROVIDER?: string;
  UPLOAD_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  /** 免费用户用的便宜模型，默认 gemini-2.5-flash-lite */
  GEMINI_MODEL_FREE?: string;
  GEMINI_API_BASE?: string;
  GEMINI_TIMEOUT_MS?: string;
  GEMINI_THINKING_LEVEL?: string;
  GEMINI_IMAGE_MODEL?: string;
  GEMINI_IMAGE_API_BASE?: string;
  GEMINI_IMAGE_TIMEOUT_MS?: string;
  // Auth
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  // Stripe
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_PRO_MONTHLY?: string;
  STRIPE_PRICE_PRO_YEARLY?: string;
  STRIPE_PRICE_PREMIUM_MONTHLY?: string;
  STRIPE_PRICE_PREMIUM_YEARLY?: string;
  STRIPE_PRICE_SINGLE_OCCASION?: string;
  // Admin allowlist: 逗号分隔的管理员邮箱，用于 /admin 与 /api/analytics/look-scores 鉴权
  ADMIN_EMAILS?: string;
  // Email (Postal HTTP API)
  POSTAL_API_URL?: string;
  POSTAL_API_KEY?: string;
  SMTP_FROM?: string;
  POSTAL_API_FROM_NAME?: string;
  // Bindings
  SESSION?: KVNamespaceLike;
  USAGE_LIMITS?: KVNamespaceLike;
  DB?: D1DatabaseLike;
  USER_UPLOADS?: R2BucketLike;
}

export function getRuntimeEnv(_context?: { locals?: unknown }): RuntimeEnv {
  return (cloudflareEnv ?? {}) as RuntimeEnv;
}

export function getRuntimeValue(env: RuntimeEnv | undefined, key: keyof RuntimeEnv): string | undefined {
  const value = env?.[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}
import { env as cloudflareEnv } from 'cloudflare:workers';
