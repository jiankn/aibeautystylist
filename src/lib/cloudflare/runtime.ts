export interface KVNamespaceLike {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete?(key: string): Promise<void>;
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike;
  first<T = Record<string, unknown>>(): Promise<T | null>;
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
  AI_PROVIDER?: string;
  UPLOAD_PROVIDER?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_API_BASE?: string;
  GEMINI_TIMEOUT_MS?: string;
  GEMINI_THINKING_LEVEL?: string;
  R2_PUBLIC_BASE_URL?: string;
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
