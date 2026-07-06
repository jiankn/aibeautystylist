(function () {
  "use strict";

  var CONSENT_KEY = "abs_cookie_consent_v2";
  var VISITOR_KEY = "abs_analytics_visitor_v1";
  var ATTRIBUTION_KEY = "abs_analytics_attribution_v1";
  var isDev =
    location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var enabled = false;
  var pageViewSent = false;
  var conversionSent = false;

  function safeParse(value) {
    try {
      return value ? JSON.parse(value) : null;
    } catch (_) {
      return null;
    }
  }

  function hasAnalyticsConsent() {
    try {
      var preference = safeParse(localStorage.getItem(CONSENT_KEY));
      return preference && preference.choice === "all";
    } catch (_) {
      return false;
    }
  }

  function randomVisitorId() {
    if (crypto.randomUUID) return crypto.randomUUID();
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
  }

  function getVisitorId() {
    try {
      var existing = localStorage.getItem(VISITOR_KEY);
      if (existing) return existing;
      var visitorId = randomVisitorId();
      localStorage.setItem(VISITOR_KEY, visitorId);
      return visitorId;
    } catch (_) {
      return randomVisitorId();
    }
  }

  function externalReferrerHost() {
    if (!document.referrer) return "";
    try {
      var host = new URL(document.referrer).hostname;
      return host === location.hostname ? "" : host;
    } catch (_) {
      return "";
    }
  }

  function currentAttribution() {
    var params = new URLSearchParams(location.search);
    var incoming = {
      source: params.get("utm_source") || "",
      medium: params.get("utm_medium") || "",
      campaign: params.get("utm_campaign") || "",
      content: params.get("utm_content") || "",
      term: params.get("utm_term") || "",
      referrerHost: externalReferrerHost(),
      landingPath: location.pathname,
    };
    var hasIncomingCampaign = Boolean(
      incoming.source || incoming.campaign || incoming.content,
    );

    try {
      if (hasIncomingCampaign) {
        sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(incoming));
        return incoming;
      }
      return safeParse(sessionStorage.getItem(ATTRIBUTION_KEY)) || incoming;
    } catch (_) {
      return incoming;
    }
  }

  function send(event, properties) {
    if (!enabled) return false;

    var attribution = currentAttribution();
    var payload = {
      event: event,
      visitorId: getVisitorId(),
      timestamp: new Date().toISOString(),
      properties: Object.assign(
        {
          path: location.pathname,
          source: attribution.source || "",
          medium: attribution.medium || "",
          campaign: attribution.campaign || "",
          content: attribution.content || "",
          term: attribution.term || "",
          referrerHost: attribution.referrerHost || "",
          landingPath: attribution.landingPath || location.pathname,
        },
        properties || {},
      ),
    };

    if (isDev) {
      console.log("[Analytics]", payload);
      return true;
    }

    try {
      var body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/events",
          new Blob([body], { type: "application/json" }),
        );
      } else {
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body,
          keepalive: true,
        }).catch(function () {});
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  function sendPageViewOnce() {
    if (!enabled || pageViewSent) return;
    pageViewSent = true;
    send("page_view");
  }

  function sendUrlConversionOnce() {
    if (!enabled || conversionSent) return;
    var params = new URLSearchParams(location.search);
    if (params.get("checkout") !== "success") return;
    conversionSent = true;
    send("subscription_checkout_success");
  }

  function clearOptionalAnalyticsStorage() {
    try {
      localStorage.removeItem(VISITOR_KEY);
      sessionStorage.removeItem(ATTRIBUTION_KEY);
    } catch (_) {}
  }

  window.__track = send;
  enabled = hasAnalyticsConsent();
  sendPageViewOnce();
  sendUrlConversionOnce();

  window.addEventListener("abs:cookie-consent", function (event) {
    var choice = event.detail && event.detail.choice;
    enabled = choice === "all";
    if (enabled) {
      sendPageViewOnce();
      sendUrlConversionOnce();
    } else clearOptionalAnalyticsStorage();
  });
})();
