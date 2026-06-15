// 前端埋点工具函数（轻量版，直接嵌入页面）。
// 完整类型定义在 src/lib/analytics.ts，此脚本为浏览器端精简版。
(function () {
  var isDev = location.hostname === "localhost" || location.hostname === "127.0.0.1";

  window.__track = function (event, properties) {
    var payload = {
      event: event,
      properties: properties || {},
      timestamp: new Date().toISOString(),
    };

    if (isDev) {
      console.log("[Analytics]", payload);
      return;
    }

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/events", JSON.stringify(payload));
      } else {
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) { /* 静默 */ }
  };

  // 自动追踪页面访问。
  window.__track("page_view", { path: location.pathname });
})();
