/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly APP_ENV?: 'development' | 'staging' | 'production';
  readonly AI_PROVIDER?: 'mock' | 'cloudflare-ai' | 'external';
  readonly UPLOAD_PROVIDER?: 'mock' | 'r2';
  readonly STRIPE_PRICE_PRO_MONTHLY?: string;
  readonly STRIPE_PRICE_PREMIUM_MONTHLY?: string;
  readonly R2_PUBLIC_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
