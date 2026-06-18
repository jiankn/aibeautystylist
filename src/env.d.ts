/// <reference types="astro/client" />

declare module "node:async_hooks" {
  export class AsyncLocalStorage<T> {
    getStore(): T | undefined;
    run<R>(store: T, callback: () => R): R;
  }
}

interface Window {
  showToast?: (message?: string) => void;
  absAlert?: (
    message?: unknown,
    options?: {
      title?: string;
      confirmLabel?: string;
      variant?: "notice" | "confirm" | "danger";
    },
  ) => Promise<void>;
  absConfirm?: (
    message?: unknown,
    options?: {
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      variant?: "notice" | "confirm" | "danger";
    },
  ) => Promise<boolean>;
}

declare namespace App {
  interface Locals {
    /** 用户内容上下文 — 由 middleware 注入 */
    audienceContext: import("./data/makeup/audienceTypes").AudienceContext;
    /** 当前用户是否已登录 — 由 middleware 注入 */
    isLoggedIn: boolean;
    /** URL 级语言路由信息 — 由 middleware 注入 */
    localeRoute: import("./i18n/routing").LocaleRoute;
    /** Cloudflare adapter runtime context，用于 waitUntil 后台任务 */
    cfContext?: ExecutionContext;
  }
}
