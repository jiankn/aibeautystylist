// 统一埋点模块：12 个核心事件。
// 当前实现为 console.log + 预留 POST /api/events 接入。
// 生产环境可接入 Google Analytics、Mixpanel 或自研事件服务。

export type AnalyticsEvent =
  | "home_start_tryon_click"
  | "discover_filter_apply"
  | "look_selected"
  | "photo_consent_accepted"
  | "photo_upload_success"
  | "diagnosis_generated"
  | "tryon_generated"
  | "share_card_created"
  | "share_completed"
  | "pricing_viewed"
  | "checkout_started"
  | "subscription_activated";

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
  timestamp?: string;
}

// 是否在开发模式下（只 console.log）。
const isDev =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

/**
 * 发送埋点事件。
 * 开发模式下仅 console.log，生产模式发送到 /api/events。
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, string | number | boolean>,
): void {
  const payload: AnalyticsPayload = {
    event,
    properties,
    timestamp: new Date().toISOString(),
  };

  if (isDev) {
    console.log("[Analytics]", payload);
    return;
  }

  // 生产模式：异步发送，不阻塞 UI。
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/events", JSON.stringify(payload));
    } else {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        /* 埋点失败不影响用户体验 */
      });
    }
  } catch {
    /* 静默失败 */
  }
}
