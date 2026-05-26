/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly APP_ENV?: 'development' | 'staging' | 'production';
  readonly AI_PROVIDER?: 'mock' | 'gemini' | 'cloudflare-ai' | 'external';
  readonly UPLOAD_PROVIDER?: 'mock' | 'r2';
  readonly GEMINI_API_KEY?: string;
  readonly GEMINI_MODEL?: string;
  readonly GEMINI_MODEL_FREE?: string;
  readonly GEMINI_API_BASE?: string;
  readonly GEMINI_TIMEOUT_MS?: string;
  readonly GEMINI_THINKING_LEVEL?: 'minimal' | 'low' | 'medium' | 'high' | 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  readonly GEMINI_IMAGE_MODEL?: string;
  readonly GEMINI_IMAGE_API_BASE?: string;
  readonly GEMINI_IMAGE_TIMEOUT_MS?: string;
  readonly STRIPE_PRICE_PRO_MONTHLY?: string;
  readonly STRIPE_PRICE_PRO_YEARLY?: string;
  readonly STRIPE_PRICE_PREMIUM_MONTHLY?: string;
  readonly STRIPE_PRICE_PREMIUM_YEARLY?: string;
  readonly STRIPE_PRICE_SINGLE_OCCASION?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly GOOGLE_OAUTH_CLIENT_ID?: string;
  readonly GOOGLE_OAUTH_CLIENT_SECRET?: string;
  readonly NANO_BANANA_PRO_API_KEY?: string;
  readonly EVOLINK_API_KEY?: string;
  readonly EVOLINK_API_BASE?: string;
  readonly EVOLINK_IMAGE_MODEL?: string;
  readonly EVOLINK_IMAGE_SIZE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
