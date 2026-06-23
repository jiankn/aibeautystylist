const toast = document.querySelector(".toast") || document.createElement("div");
if (!toast.isConnected) {
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
}

const APP_LOCALE = window.__absLocale || document.documentElement.lang || "en";
const LOCALIZED_MESSAGES = window.__absMessages || {};
const APP_MESSAGES = {
  "zh-CN": {
    loginRequired: "请先登录后再上传自拍",
    favoriteLoginRequired: "请先登录后再收藏妆容",
    favoriteSaved: "已收藏妆容",
    favoriteRemoved: "已取消收藏",
    favoriteSaveFailed: "收藏操作失败，请稍后重试",
    favoriteLimitReached: "收藏数量已满，请先取消一个收藏",
    loginToUpload: "登录后上传自拍",
    uploadButton: "上传自拍试这个妆",
    chooseFile: "请选择 JPG、PNG、WebP 或 HEIC 自拍",
    consentRequired: "上传前请先确认照片处理说明",
    uploadFailed: "上传失败",
    jobCreateFailed: "任务创建失败",
    quotaRefresh: "{date}刷新基础额度",
    loginAfter: "登录后",
    viewAfter: "查看",
    loginQuotaNote: "登录后可使用免费额度并查看剩余次数",
    cookieAllSaved: "Cookie 偏好已保存；当前没有额外分析追踪",
    cookieNecessarySaved: "仅使用必要 Cookie",
    filterAll: "全部",
    filterSummary: "共找到 {count} 个可直接试妆的妆容",
    filterToast: "已找到 {count} 个妆容",
    selectedLook: "已选择“{look}”",
    fallbackLook: "蜜桃气色妆",
    fallbackLookShort: "蜜桃气色",
    jobCreated: "任务已创建，正在排队…",
    uploadValidating: "正在校验照片…",
    diagnosisRunning: "正在分析面部与色彩…",
    imageRunning: "正在生成试妆效果…",
    generationFailedRefunded: "生成失败，额度已自动返还，可重试",
    taskCancelledRefunded: "任务已取消，额度已自动返还，可重试",
    timedOutRefunded: "生成超时，额度已自动返还，可重试",
    referenceEffect: "参考效果",
    tryonEffect: "试妆效果",
    originalPhoto: "上传自拍",
    referenceAlt: "{look}参考效果",
    resultDisclaimer: "生成结果仅供参考，实际效果因个人条件而异。",
    referenceGenerated: "参考效果已生成",
    tryonGenerated: "试妆效果已生成",
    referenceGeneratedNote: "参考效果已生成，真实 AI 上脸效果将在服务接入后启用",
    taskIncomplete: "任务未完成，请稍后重试",
    cancelGeneration: "取消生成",
    statusQueryFailed: "任务状态查询失败",
    uploadingSafely: "正在校验并安全上传…",
    cancelUpload: "取消上传",
    confirmingConsent: "正在确认照片处理授权…",
    validatingUpload: "正在校验图片并安全上传…",
    generatingReference: "正在生成参考效果…",
    uploadValidated: "照片校验通过，正在生成参考效果…",
    uploadCancelled: "上传已取消，可重新选择或重试",
    processFailed: "处理失败，请稍后重试",
    loginQuotaRequired: "登录后可使用你的试妆额度",
    cancelFailed: "取消任务失败",
    retryCreating: "正在创建重试任务…",
    retryCreateFailed: "重试任务创建失败",
    deleteUploadFailed: "删除原始自拍失败",
    originalDeleted: "原始自拍已删除，试妆结果仍可继续查看",
    deleteResultFailed: "删除试妆结果失败",
    resultDeletedTitle: "试妆结果已删除",
    resultDeletedDesc: "你可以重新上传自拍并生成新的试妆结果",
    openMenu: "打开导航菜单",
    closeMenu: "关闭导航菜单",
    dialogAlertTitle: "提示",
    dialogConfirmTitle: "确认操作",
    dialogOk: "确定",
    dialogCancel: "取消",
    dialogConfirm: "确认",
  },
  en: {
    loginRequired: "Please sign in before uploading a selfie",
    favoriteLoginRequired: "Please sign in to save looks",
    favoriteSaved: "Look saved",
    favoriteRemoved: "Saved look removed",
    favoriteSaveFailed: "Could not update saved looks. Try again later.",
    favoriteLimitReached: "Your saved-look list is full. Remove one first.",
    loginToUpload: "Sign in to upload photo",
    uploadButton: "Upload & Try This Look",
    chooseFile: "Please choose a JPG, PNG, WebP, or HEIC selfie",
    consentRequired: "Please confirm the photo processing notice before uploading",
    uploadFailed: "Upload failed",
    jobCreateFailed: "Task creation failed",
    quotaRefresh: "Base quota refreshes on {date}",
    loginAfter: "Sign in",
    viewAfter: "to view",
    loginQuotaNote: "Sign in to use free credits and view remaining quota",
    cookieAllSaved: "Cookie preferences saved; no extra analytics tracking is currently enabled",
    cookieNecessarySaved: "Necessary cookies only",
    filterAll: "All",
    filterSummary: "{count} try-on-ready looks found",
    filterToast: "{count} looks found",
    selectedLook: "Selected “{look}”",
    fallbackLook: "Peach Fresh Look",
    fallbackLookShort: "Peach Fresh",
    jobCreated: "Task created, waiting in queue…",
    uploadValidating: "Validating photo…",
    diagnosisRunning: "Analyzing face and color…",
    imageRunning: "Generating try-on result…",
    generationFailedRefunded: "Generation failed. Quota was automatically refunded. You can retry.",
    taskCancelledRefunded: "Task cancelled. Quota was automatically refunded. You can retry.",
    timedOutRefunded: "Generation timed out. Quota was automatically refunded. You can retry.",
    referenceEffect: "Reference Result",
    tryonEffect: "Try-On Result",
    originalPhoto: "Uploaded selfie",
    referenceAlt: "{look} reference result",
    resultDisclaimer: "Generated results are for reference only. Actual effects may vary by individual conditions.",
    referenceGenerated: "Reference result generated",
    tryonGenerated: "Try-on result generated",
    referenceGeneratedNote: "Reference result generated. Real AI face try-on will be enabled after service integration.",
    taskIncomplete: "Task is not complete. Please try again later.",
    cancelGeneration: "Cancel generation",
    statusQueryFailed: "Failed to query task status",
    uploadingSafely: "Validating and securely uploading…",
    cancelUpload: "Cancel upload",
    confirmingConsent: "Confirming photo processing consent…",
    validatingUpload: "Validating image and securely uploading…",
    generatingReference: "Generating reference result…",
    uploadValidated: "Photo validated. Generating reference result…",
    uploadCancelled: "Upload cancelled. Choose again or retry.",
    processFailed: "Processing failed. Please try again later.",
    loginQuotaRequired: "Sign in to use your try-on quota",
    cancelFailed: "Failed to cancel task",
    retryCreating: "Creating retry task…",
    retryCreateFailed: "Failed to create retry task",
    deleteUploadFailed: "Failed to delete original selfie",
    originalDeleted: "Original selfie deleted. Try-on result remains available.",
    deleteResultFailed: "Failed to delete try-on result",
    resultDeletedTitle: "Try-on result deleted",
    resultDeletedDesc: "You can upload a selfie again and generate a new result.",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    dialogAlertTitle: "Notice",
    dialogConfirmTitle: "Confirm action",
    dialogOk: "OK",
    dialogCancel: "Cancel",
    dialogConfirm: "Confirm",
  },
};

function msg(key, values = {}) {
  const template =
    LOCALIZED_MESSAGES[key] ||
    APP_MESSAGES[APP_LOCALE]?.[key] ||
    APP_MESSAGES.en[key] ||
    key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

window.showToast = showToast;

function upsertBackgroundTask(task) {
  if (window.__absBackgroundTasks?.upsert) {
    window.__absBackgroundTasks.upsert(task);
    return;
  }
  document.dispatchEvent(
    new CustomEvent("abs:background-task", {
      detail: { action: "upsert", task },
    }),
  );
}

function removeBackgroundTask(id) {
  if (!id) return;
  if (window.__absBackgroundTasks?.remove) {
    window.__absBackgroundTasks.remove(id);
    return;
  }
  document.dispatchEvent(
    new CustomEvent("abs:background-task", {
      detail: { action: "remove", id },
    }),
  );
}

function ensureAppDialog() {
  let root = document.querySelector("[data-app-dialog]");
  if (!root) {
    root = document.createElement("div");
    root.className = "app-dialog-backdrop";
    root.hidden = true;
    root.dataset.appDialog = "";
    root.innerHTML = `
      <section class="app-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title" aria-describedby="app-dialog-message">
        <div class="app-dialog-mark" aria-hidden="true">ABS</div>
        <div class="app-dialog-copy">
          <h2 id="app-dialog-title"></h2>
          <p id="app-dialog-message"></p>
        </div>
        <div class="app-dialog-actions">
          <button class="btn app-dialog-cancel" type="button" data-app-dialog-cancel></button>
          <button class="btn btn-primary app-dialog-confirm" type="button" data-app-dialog-confirm></button>
        </div>
      </section>
    `;
    document.body.appendChild(root);
  }

  return {
    root,
    panel: root.querySelector(".app-dialog-panel"),
    title: root.querySelector("#app-dialog-title"),
    message: root.querySelector("#app-dialog-message"),
    cancelButton: root.querySelector("[data-app-dialog-cancel]"),
    confirmButton: root.querySelector("[data-app-dialog-confirm]"),
  };
}

let appDialogQueue = Promise.resolve();

function runAppDialog(options) {
  return new Promise((resolve) => {
    const {
      root,
      title,
      message,
      cancelButton,
      confirmButton,
    } = ensureAppDialog();
    const showCancel = Boolean(options.showCancel);
    const previousFocus = document.activeElement;
    let settled = false;

    title.textContent =
      options.title ||
      (showCancel ? msg("dialogConfirmTitle") : msg("dialogAlertTitle"));
    message.textContent = String(options.message ?? "");
    cancelButton.textContent = options.cancelLabel || msg("dialogCancel");
    confirmButton.textContent =
      options.confirmLabel || (showCancel ? msg("dialogConfirm") : msg("dialogOk"));
    cancelButton.hidden = !showCancel;
    root.dataset.variant = options.variant || (showCancel ? "confirm" : "notice");
    root.hidden = false;

    function finish(value) {
      if (settled) return;
      settled = true;
      root.classList.remove("is-open");
      root.removeEventListener("click", handleBackdrop);
      document.removeEventListener("keydown", handleKeydown);
      window.setTimeout(() => {
        root.hidden = true;
        if (previousFocus && typeof previousFocus.focus === "function") {
          previousFocus.focus({ preventScroll: true });
        }
        resolve(value);
      }, 180);
    }

    function handleBackdrop(event) {
      if (event.target === root) finish(!showCancel);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        finish(!showCancel);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [cancelButton, confirmButton].filter(
        (button) => button && !button.hidden,
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    cancelButton.onclick = () => finish(false);
    confirmButton.onclick = () => finish(true);
    root.addEventListener("click", handleBackdrop);
    document.addEventListener("keydown", handleKeydown);
    requestAnimationFrame(() => {
      root.classList.add("is-open");
      confirmButton.focus({ preventScroll: true });
    });
  });
}

function openAppDialog(options) {
  const run = () => runAppDialog(options);
  const next = appDialogQueue.then(run, run);
  appDialogQueue = next.catch(() => undefined);
  return next;
}

window.absAlert = async function absAlert(message, options = {}) {
  await openAppDialog({
    ...options,
    message,
    showCancel: false,
  });
};

window.absConfirm = function absConfirm(message, options = {}) {
  return openAppDialog({
    ...options,
    message,
    showCancel: true,
  });
};

const nativeAlert = window.alert.bind(window);
window.alert = function absStyledAlert(message) {
  if (!document.body) {
    nativeAlert(message);
    return;
  }
  void window.absAlert(message);
};

const PHOTO_CONSENT_VERSION = "2026-06-07";
let currentSessionPromise;

function getLoginUrl() {
  const login = new URL("/login", window.location.origin);
  login.searchParams.set(
    "next",
    `${window.location.pathname}${window.location.search}${window.location.hash}`,
  );
  return login.toString();
}

function isAccountSession(session) {
  return session?.user?.kind === "account";
}

async function getCurrentSession({ refresh = false } = {}) {
  if (!currentSessionPromise || refresh) {
    currentSessionPromise = fetch("/api/session")
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.ok) return undefined;
        return payload.data;
      })
      .catch(() => undefined);
  }
  return currentSessionPromise;
}

function redirectToLogin(message = msg("loginRequired")) {
  showToast(message);
  window.setTimeout(() => {
    window.location.href = getLoginUrl();
  }, 300);
}

function createNativeImagePicker(anchor) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,image/heic,image/heif";
  input.className = "native-file-picker";
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  anchor?.insertAdjacentElement("afterend", input);
  return input;
}

function syncUploadAuthGate(session) {
  const authenticated = isAccountSession(session);
  document.querySelectorAll("[data-upload]").forEach((button) => {
    const uploadBox = button.closest(".upload-box");
    const consent = uploadBox?.querySelector("[data-photo-consent]");
    const consentRow = consent?.closest(".privacy-consent");
    const lockPanel = uploadBox?.querySelector("[data-upload-auth-lock]");
    button.dataset.defaultLabel ||= button.textContent.trim();

    if (!authenticated) {
      button.dataset.loginRequired = "true";
      button.disabled = false;
      button.textContent = button.dataset.loginLabel || msg("loginToUpload");
      if (consent) {
        consent.checked = false;
        consent.disabled = true;
      }
      if (consentRow) consentRow.hidden = true;
      if (lockPanel) lockPanel.hidden = false;
      return;
    }

    delete button.dataset.loginRequired;
    button.textContent = button.dataset.defaultLabel || msg("uploadButton");
    if (consent) {
      consent.disabled = false;
      button.disabled = !consent.checked;
    }
    if (consentRow) consentRow.hidden = false;
    if (lockPanel) lockPanel.hidden = true;
  });
}

if (document.querySelector("[data-upload]")) {
  getCurrentSession()
    .then((session) => syncUploadAuthGate(session))
    .catch(() => {});
}

async function readApiPayload(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || fallbackMessage);
  }
  return payload.data;
}

window.__absCreateTryOnJob = async function createTryOnJobFlow({
  file,
  lookSlug,
  requiredPlan = "free",
  purpose = "tryon",
  idempotencyKey,
  signal,
}) {
  if (!file) throw new Error(msg("chooseFile"));
  const session = await getCurrentSession({ refresh: true });
  if (!isAccountSession(session)) {
    throw new Error(msg("loginRequired"));
  }

  await readApiPayload(
    await fetch("/api/consents/photo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accepted: true, version: PHOTO_CONSENT_VERSION }),
      signal,
    }),
    msg("consentRequired"),
  );

  const formData = new FormData();
  formData.append("photo", file);
  formData.append("consentVersion", PHOTO_CONSENT_VERSION);
  const upload = await readApiPayload(
    await fetch("/api/uploads", {
      method: "POST",
      body: formData,
      signal,
    }),
    msg("uploadFailed"),
  );
  const job = await readApiPayload(
    await fetch("/api/tryon-jobs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        uploadId: upload.id,
        lookSlug,
        idempotencyKey: idempotencyKey || crypto.randomUUID(),
        requiredPlan,
        purpose,
      }),
    }),
    msg("jobCreateFailed"),
  );

  return { upload, job };
};

function updateQuotaDisplay(quota) {
  const quotaBar = document.querySelector("[data-quota-live]");
  if (!quotaBar || !quota) return;

  const total = Number(quota.total) || 0;
  const remaining = Number(quota.remaining) || 0;
  const used = Number(quota.used) || 0;
  const pct = total > 0 ? Math.max(0, Math.min(100, (used / total) * 100)) : 0;
  const label = quotaBar.querySelector("[data-quota-label]");
  const meter = quotaBar.querySelector("[data-quota-meter]");
  if (label) {
    label.textContent = remaining + "/" + total;
  }
  if (meter) {
    meter.style.width = pct + "%";
  }

  const refresh = quotaBar.querySelector("[data-quota-refresh]");
  if (refresh && quota.nextRefreshAt) {
    const refreshDate = new Intl.DateTimeFormat(APP_LOCALE, {
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(quota.nextRefreshAt));
    refresh.textContent = msg("quotaRefresh", { date: refreshDate });
  }
}

window.updateQuotaDisplay = updateQuotaDisplay;

function syncQuotaForSession(session) {
  const quotaBar = document.querySelector("[data-quota-live]");
  if (!quotaBar) return;

  if (!isAccountSession(session)) {
    const meter = quotaBar.querySelector("[data-quota-meter]");
    if (meter) meter.style.width = "0%";
    const label = quotaBar.querySelector("[data-quota-label]");
    if (label) label.textContent = msg("loginAfter") + " / " + msg("viewAfter");
    const refresh = quotaBar.querySelector("[data-quota-refresh]");
    if (refresh) refresh.textContent = msg("loginQuotaNote");
    return;
  }

  updateQuotaDisplay(session?.quota);
}

async function refreshQuotaDisplay() {
  if (!document.querySelector("[data-quota-live]")) return;
  const session = await getCurrentSession();
  syncQuotaForSession(session);
}

refreshQuotaDisplay().catch(() => {});


const heroSyncMedia = window.matchMedia("(min-width: 901px)");

function syncHeroVisualHeight() {
  const shouldSync = heroSyncMedia.matches;
  document.querySelectorAll("[data-hero-copy-sync]").forEach((hero) => {
    const copy = hero.querySelector(".home-copy");
    const compare = hero.querySelector("[data-hero-visual] .home-compare");
    if (!copy || !compare) return;

    if (!shouldSync) {
      if (compare.dataset.syncedHeight) {
        compare.style.height = "";
        compare.style.minHeight = "";
        delete compare.dataset.syncedHeight;
      }
      return;
    }

    const copyHeight = Math.round(copy.getBoundingClientRect().height);
    if (copyHeight <= 0) return;
    compare.style.height = `${copyHeight}px`;
    compare.style.minHeight = `${copyHeight}px`;
    compare.dataset.syncedHeight = String(copyHeight);
  });
}

const heroSyncSections = document.querySelectorAll("[data-hero-copy-sync]");
if (heroSyncSections.length) {
  const scheduleHeroSync = () => window.requestAnimationFrame(syncHeroVisualHeight);
  const heroResizeObserver =
    "ResizeObserver" in window ? new ResizeObserver(scheduleHeroSync) : null;

  heroSyncSections.forEach((hero) => {
    const copy = hero.querySelector(".home-copy");
    if (copy) heroResizeObserver?.observe(copy);
  });
  window.addEventListener("resize", scheduleHeroSync);
  window.addEventListener("load", scheduleHeroSync);
  heroSyncMedia.addEventListener("change", scheduleHeroSync);
  scheduleHeroSync();
}

document.querySelectorAll("[data-compare-slider]").forEach((slider) => {
  if (slider.dataset.compareReady === "true") return;
  const knob = slider.querySelector("[data-compare-knob]");
  if (!knob) return;
  slider.dataset.compareReady = "true";

  const setPosition = (value) => {
    const pct = Math.max(5, Math.min(95, value));
    slider.style.setProperty("--compare-position", `${pct}%`);
    knob.setAttribute("aria-valuenow", String(Math.round(pct)));
  };

  let sliderRect = null;
  let pendingPosition = null;
  let positionFrame = 0;

  const flushPosition = () => {
    positionFrame = 0;
    if (pendingPosition === null) return;
    setPosition(pendingPosition);
    pendingPosition = null;
  };

  const queuePosition = (value) => {
    pendingPosition = Math.max(5, Math.min(95, value));
    if (!positionFrame) {
      positionFrame = window.requestAnimationFrame(flushPosition);
    }
  };

  const setFromClientX = (clientX, immediate = false) => {
    const rect = sliderRect || slider.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    immediate ? setPosition(next) : queuePosition(next);
  };

  let isDragging = false;
  const endDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    sliderRect = null;
    slider.classList.remove("is-dragging");
    if (event?.pointerId !== undefined) {
      slider.releasePointerCapture?.(event.pointerId);
    }
    if (positionFrame) {
      window.cancelAnimationFrame(positionFrame);
      flushPosition();
    }
  };

  slider.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    isDragging = true;
    sliderRect = slider.getBoundingClientRect();
    slider.classList.add("is-dragging");
    slider.setPointerCapture?.(event.pointerId);
    knob.focus({ preventScroll: true });
    setFromClientX(event.clientX, true);
    event.preventDefault();
  });
  slider.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    setFromClientX(event.clientX);
    event.preventDefault();
  });
  slider.addEventListener("pointerup", endDrag);
  slider.addEventListener("pointercancel", endDrag);
  slider.addEventListener("lostpointercapture", endDrag);

  knob.addEventListener("keydown", (event) => {
    const current = Number(knob.getAttribute("aria-valuenow") || 50);
    const step = event.shiftKey ? 10 : 5;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPosition(current - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setPosition(current + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      setPosition(5);
    } else if (event.key === "End") {
      event.preventDefault();
      setPosition(95);
    }
  });

  // 自动演示：页面加载后播放一次平滑滑动，暗示可拖拽交互
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let demoCancelled = false;
    const cancelDemo = () => { demoCancelled = true; };
    slider.addEventListener("pointerdown", cancelDemo, { once: true });

    const animate = (from, to, duration) => new Promise((resolve) => {
      const start = performance.now();
      const step = (now) => {
        if (demoCancelled) { resolve(); return; }
        const progress = Math.min((now - start) / duration, 1);
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        setPosition(from + (to - from) * eased);
        progress < 1 ? requestAnimationFrame(step) : resolve();
      };
      requestAnimationFrame(step);
    });

    window.setTimeout(async () => {
      if (demoCancelled) return;
      await animate(50, 30, 600);
      if (demoCancelled) return;
      await animate(30, 65, 700);
      if (demoCancelled) return;
      await animate(65, 50, 500);
      slider.removeEventListener("pointerdown", cancelDemo);
    }, 1200);
  }
});

function setActiveFilterChip(group, activeChip) {
  group.querySelectorAll(".filter-chip").forEach((item) => {
    const isActive = item === activeChip;
    item.classList.toggle("active", isActive);
    item.setAttribute("aria-pressed", String(isActive));
  });
}

function findFilterGroup(groupId) {
  return [...document.querySelectorAll("[data-filter-group]")].find(
    (group) => group.dataset.filterGroup === groupId,
  );
}

function setFilterChipValue(groupId, value) {
  const group = findFilterGroup(groupId);
  if (!group || !value) return false;
  const activeChip = [...group.querySelectorAll(".filter-chip")].find(
    (chip) => chip.dataset.filterValue === value,
  );
  if (!activeChip) return false;
  setActiveFilterChip(group, activeChip);
  return true;
}

function syncMobileFilterTabs(selections) {
  const activeValues = Object.fromEntries(
    Object.entries(selections).map(([groupId, selection]) => [
      groupId,
      selection?.value || "",
    ]),
  );
  document.querySelectorAll("[data-mobile-tab-filter-group]").forEach((tab) => {
    const groupId = tab.dataset.mobileTabFilterGroup;
    const isActive =
      Boolean(groupId) &&
      activeValues[groupId] === tab.dataset.mobileTabFilterValue;
    tab.classList.toggle("active", isActive);
    if (isActive) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
}

function applyMobileFilterTabsFromUrl() {
  const tabs = [...document.querySelectorAll("[data-mobile-tab-filter-group]")];
  if (!tabs.length) return;
  const params = new URLSearchParams(window.location.search);
  const handledGroups = new Set();
  tabs.forEach((tab) => {
    const groupId = tab.dataset.mobileTabFilterGroup;
    const filterValue = tab.dataset.mobileTabFilterValue;
    const queryParam = tab.dataset.mobileTabQueryParam;
    const queryValue = tab.dataset.mobileTabQueryValue;
    if (
      !groupId ||
      !filterValue ||
      !queryParam ||
      !queryValue ||
      handledGroups.has(groupId)
    ) {
      return;
    }
    const requestedValue = params.get(queryParam) || "recommended";
    const matchedTab = tabs.find(
      (item) =>
        item.dataset.mobileTabFilterGroup === groupId &&
        item.dataset.mobileTabQueryValue === requestedValue,
    );
    if (!matchedTab) return;
    if (setFilterChipValue(groupId, matchedTab.dataset.mobileTabFilterValue)) {
      handledGroups.add(groupId);
    }
  });
}

const filterPanel = document.querySelector("[data-filter-panel]");
const filterOpenButton = document.querySelector("[data-filter-open]");
const filterBackdrop = document.querySelector("[data-filter-backdrop]");
const filterApplyButton = document.querySelector("[data-filter-apply]");
const filterSheetMedia = window.matchMedia("(max-width: 700px)");
const discoverSearchPanel = document.querySelector("[data-discover-search-panel]");
const discoverSearchInput = document.querySelector("[data-look-search]");
const discoverSearchClear = document.querySelector("[data-look-search-clear]");
const mobileSearchToggleButtons = document.querySelectorAll(
  "[data-mobile-search-toggle]",
);
let filterLastFocus = null;

function normalizeLookSearch(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getLookSearchQuery() {
  return normalizeLookSearch(discoverSearchInput?.value);
}

function updateDiscoverSearchControl() {
  if (discoverSearchClear) {
    discoverSearchClear.hidden = getLookSearchQuery().length === 0;
  }
}

function openDiscoverSearch({ focus = true } = {}) {
  if (!discoverSearchPanel) return;
  discoverSearchPanel.hidden = false;
  mobileSearchToggleButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });
  discoverSearchPanel.scrollIntoView({
    block: "nearest",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
  if (focus) {
    discoverSearchInput?.focus({ preventScroll: true });
    window.setTimeout(() => discoverSearchInput?.focus(), 60);
  }
}

const favoriteLookButtons = document.querySelectorAll("[data-look-favorite]");
let favoriteLookSlugs = new Set();

function setFavoriteLookButtonState(button, isFavorite) {
  if (!button) return;
  const label = isFavorite
    ? button.dataset.favoritedLabel || "Saved look"
    : button.dataset.favoriteLabel || "Save look";
  const title = button.dataset.favoriteLookTitle || "";
  button.setAttribute("aria-pressed", String(isFavorite));
  button.setAttribute("aria-label", title ? `${label}: ${title}` : label);
  const card = button.closest("[data-look-card]");
  if (card) card.dataset.favorite = String(isFavorite);
}

function syncFavoriteLookButtons() {
  favoriteLookButtons.forEach((button) => {
    setFavoriteLookButtonState(
      button,
      favoriteLookSlugs.has(button.dataset.favoriteLookSlug),
    );
  });
}

async function hydrateFavoriteLooks() {
  if (!favoriteLookButtons.length) return;
  favoriteLookButtons.forEach((button) =>
    setFavoriteLookButtonState(button, false),
  );

  const session = await getCurrentSession().catch(() => undefined);
  if (!isAccountSession(session)) {
    applyLookFilters();
    return;
  }

  try {
    const response = await fetch("/api/favorite-looks");
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) return;
    favoriteLookSlugs = new Set(
      (payload.data?.items || [])
        .map((item) => item.lookSlug)
        .filter(Boolean),
    );
    syncFavoriteLookButtons();
    applyLookFilters();
  } catch {
    /* 收藏状态加载失败不影响浏览妆容。 */
  }
}

async function toggleFavoriteLook(button) {
  const lookSlug = button?.dataset.favoriteLookSlug;
  if (!lookSlug || button.disabled) return;

  const session = await getCurrentSession({ refresh: true }).catch(
    () => undefined,
  );
  if (!isAccountSession(session)) {
    redirectToLogin(msg("favoriteLoginRequired"));
    return;
  }

  const wasFavorite = favoriteLookSlugs.has(lookSlug);
  button.disabled = true;
  try {
    const response = await fetch(
      wasFavorite
        ? `/api/favorite-looks/${encodeURIComponent(lookSlug)}`
        : "/api/favorite-looks",
      wasFavorite
        ? { method: "DELETE" }
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lookSlug }),
          },
    );
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      if (response.status === 401 || payload.error?.code === "AUTH_REQUIRED") {
        redirectToLogin(msg("favoriteLoginRequired"));
        return;
      }
      if (payload.error?.code === "FAVORITE_LOOK_LIMIT_REACHED") {
        showToast(msg("favoriteLimitReached"));
        return;
      }
      throw new Error(payload.error?.message || "FAVORITE_LOOK_FAILED");
    }

    if (wasFavorite) {
      favoriteLookSlugs.delete(lookSlug);
    } else {
      favoriteLookSlugs.add(lookSlug);
    }
    setFavoriteLookButtonState(button, !wasFavorite);
    applyLookFilters({ track: true });
    showToast(wasFavorite ? msg("favoriteRemoved") : msg("favoriteSaved"));
    window.__track?.("favorite_look_toggled", {
      lookSlug,
      saved: !wasFavorite,
      placement: "discover_library",
    });
  } catch (error) {
    console.error("Favorite look update failed", error);
    showToast(msg("favoriteSaveFailed"));
  } finally {
    button.disabled = false;
  }
}

favoriteLookButtons.forEach((button) => {
  setFavoriteLookButtonState(button, false);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavoriteLook(button);
  });
});
hydrateFavoriteLooks();

function matchesLookSearch(card, query) {
  if (!query) return true;
  return normalizeLookSearch(card.dataset.searchIndex).includes(query);
}

function readLookFilterSelections() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-filter-group]")].map((group) => {
      const activeChip = group.querySelector(".filter-chip.active");
      const allChip = group.querySelector("[data-filter-all]");
      const value =
        activeChip?.dataset.filterValue || allChip?.dataset.filterValue || "";
      const label = activeChip?.textContent?.trim().replace(/\s+/g, " ") || value;
      const matchValues = (activeChip?.dataset.filterMatch || value)
        .split("|")
        .filter(Boolean);
      return [
        group.dataset.filterGroup,
        {
          value,
          label,
          matchValues,
          isAll: activeChip === allChip || activeChip?.hasAttribute("data-filter-all"),
          allLabel: allChip?.textContent?.trim().replace(/\s+/g, " ") || value,
        },
      ];
    }),
  );
}

function isMobileFilterSheet() {
  return Boolean(filterPanel && filterSheetMedia.matches);
}

function updateFilterSheetA11y() {
  if (!filterPanel) return;
  if (!isMobileFilterSheet()) {
    filterPanel.classList.remove("filter-sheet-open");
    filterPanel.removeAttribute("aria-hidden");
    filterOpenButton?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("filter-sheet-lock");
    if (filterBackdrop) {
      filterBackdrop.hidden = true;
      filterBackdrop.classList.remove("visible");
    }
    return;
  }
  filterPanel.setAttribute(
    "aria-hidden",
    String(!filterPanel.classList.contains("filter-sheet-open")),
  );
}

function openFilterSheet() {
  if (!isMobileFilterSheet()) return;
  filterLastFocus = document.activeElement;
  filterPanel.classList.add("filter-sheet-open");
  filterPanel.setAttribute("aria-hidden", "false");
  filterOpenButton?.setAttribute("aria-expanded", "true");
  document.body.classList.add("filter-sheet-lock");
  if (filterBackdrop) {
    filterBackdrop.hidden = false;
    requestAnimationFrame(() => filterBackdrop.classList.add("visible"));
  }
  const closeButton = filterPanel.querySelector("[data-filter-close]");
  closeButton?.focus();
}

function closeFilterSheet() {
  if (!filterPanel) return;
  filterPanel.classList.remove("filter-sheet-open");
  filterPanel.setAttribute("aria-hidden", "true");
  filterOpenButton?.setAttribute("aria-expanded", "false");
  document.body.classList.remove("filter-sheet-lock");
  if (filterBackdrop) {
    filterBackdrop.classList.remove("visible");
    window.setTimeout(() => {
      if (!filterPanel.classList.contains("filter-sheet-open")) {
        filterBackdrop.hidden = true;
      }
    }, 180);
  }
  if (filterLastFocus instanceof HTMLElement) filterLastFocus.focus();
}

function updateMobileFilterSummary(selections, visibleCount) {
  const activeLabels = ["scenario", "finish", "experience", "favorite"]
    .map((key) => selections[key])
    .filter((selection) => selection && !selection.isAll)
    .map((selection) => selection.label);
  const allLabel =
    selections.scenario?.allLabel ||
    selections.finish?.allLabel ||
    selections.experience?.allLabel ||
    msg("filterAll");
  const summaryText = activeLabels.length
    ? activeLabels.join(" · ")
    : allLabel;
  document.querySelectorAll("[data-filter-mobile-summary]").forEach((summary) => {
    summary.textContent = summaryText;
  });
  document.querySelectorAll("[data-filter-mobile-count]").forEach((count) => {
    count.textContent = `${visibleCount} ${count.dataset.looksLabel || "looks"}`;
  });
  document.querySelectorAll("[data-filter-result-count]").forEach((count) => {
    count.textContent = String(visibleCount);
  });
}

filterOpenButton?.addEventListener("click", openFilterSheet);
mobileSearchToggleButtons.forEach((button) => {
  button.addEventListener("click", openDiscoverSearch);
});
discoverSearchInput?.addEventListener("input", () => {
  updateDiscoverSearchControl();
  applyLookFilters();
});
discoverSearchClear?.addEventListener("click", () => {
  if (!discoverSearchInput) return;
  discoverSearchInput.value = "";
  updateDiscoverSearchControl();
  applyLookFilters({ track: true });
  discoverSearchInput.focus();
});
document.querySelectorAll("[data-filter-close]").forEach((button) => {
  button.addEventListener("click", closeFilterSheet);
});
filterApplyButton?.addEventListener("click", closeFilterSheet);
filterSheetMedia.addEventListener("change", updateFilterSheetA11y);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && filterPanel?.classList.contains("filter-sheet-open")) {
    closeFilterSheet();
  }
});
if (filterPanel) {
  document.documentElement.classList.add("filter-sheet-ready");
  updateFilterSheetA11y();
}

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const group = chip.closest(".filter-group");
    if (!group) return;
    setActiveFilterChip(group, chip);
    applyLookFilters({ track: true });
  });
});

function includesFilterValue(values, selection) {
  if (!selection || selection.isAll) return true;
  return selection.matchValues.some((value) => values.includes(value));
}

function applyLookFilters({ track = false } = {}) {
  const selections = readLookFilterSelections();
  const searchQuery = getLookSearchQuery();

  let visibleCount = 0;
  document.querySelectorAll("[data-look-card]").forEach((card) => {
    const scenarioValues = card.dataset.scenarios?.split("|") || [];
    const finishValues = card.dataset.finishes?.split("|") || [];
    const matchesScenario = includesFilterValue(scenarioValues, selections.scenario);
    const matchesFinish = includesFilterValue(finishValues, selections.finish);
    const matchesExperience =
      selections.experience?.isAll ||
      card.dataset.experience === selections.experience?.value;
    const matchesFavorite =
      !selections.favorite?.value ||
      selections.favorite?.isAll ||
      card.dataset.favorite === "true";
    const matchesSearch = matchesLookSearch(card, searchQuery);
    const visible =
      matchesScenario &&
      matchesFinish &&
      matchesExperience &&
      matchesFavorite &&
      matchesSearch;
    card.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  const summary = document.querySelector("[data-filter-summary]");
  if (summary) {
    const template =
      summary.dataset.filterSummaryTemplate || msg("filterSummary");
    summary.textContent = template.replace("{count}", String(visibleCount));
  }
  updateMobileFilterSummary(selections, visibleCount);
  syncMobileFilterTabs(selections);
  updateDiscoverSearchControl();

  const emptyState = document.getElementById("empty-state");
  if (emptyState) emptyState.hidden = visibleCount > 0;
  if (summary) summary.hidden = visibleCount === 0;

  if (track) {
    window.__track?.("discover_filter_apply", {
      scenario: selections.scenario?.value,
      finish: selections.finish?.value,
      experience: selections.experience?.value,
      favoriteOnly: selections.favorite?.isAll ? undefined : true,
      search: searchQuery || undefined,
      resultCount: visibleCount,
    });
    if (visibleCount === 0) {
      showToast(summary?.textContent || msg("filterToast", { count: visibleCount }));
    }
  }
}

document.querySelectorAll("[data-clear-filters]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      const allChip = group.querySelector("[data-filter-all]");
      if (allChip) setActiveFilterChip(group, allChip);
    });
    applyLookFilters({ track: true });
  });
});

document.querySelectorAll("[data-mobile-tab-filter-group]").forEach((tab) => {
  tab.addEventListener("click", (event) => {
    const groupId = tab.dataset.mobileTabFilterGroup;
    const filterValue = tab.dataset.mobileTabFilterValue;
    if (!groupId || !filterValue) return;

    const didSelect = setFilterChipValue(groupId, filterValue);
    if (!didSelect) return;

    event.preventDefault();

    const queryParam = tab.dataset.mobileTabQueryParam;
    const queryValue = tab.dataset.mobileTabQueryValue;
    if (queryParam && queryValue) {
      const url = new URL(window.location.href);
      url.searchParams.set(queryParam, queryValue);
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      const currentUrl =
        `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (nextUrl !== currentUrl) {
        window.history.pushState({}, "", nextUrl);
      }
    }

    applyLookFilters({ track: true });
  });
});

window.addEventListener("popstate", () => {
  applyMobileFilterTabsFromUrl();
  applyLookFilters();
});

applyMobileFilterTabsFromUrl();
applyLookFilters();

const inspirationDialog = document.querySelector("[data-inspiration-dialog]");
const inspirationSwitch = document.querySelector("[data-switch-inspiration]");
const inspirationClose = document.querySelector("[data-inspiration-close]");
const inspirationStatus = document.querySelector("[data-inspiration-status]");

inspirationSwitch?.addEventListener("click", () => {
  if (typeof inspirationDialog?.showModal === "function") {
    inspirationDialog.showModal();
    inspirationDialog.querySelector(".inspiration-option.active")?.focus();
  }
});

inspirationClose?.addEventListener("click", () => inspirationDialog?.close());
inspirationDialog?.addEventListener("click", (event) => {
  if (event.target === inspirationDialog) inspirationDialog.close();
});

document.querySelectorAll("[data-inspiration-value]").forEach((button) => {
  button.addEventListener("click", async () => {
    const marketProfile = button.dataset.inspirationValue;
    if (!marketProfile || button.classList.contains("active")) {
      inspirationDialog?.close();
      return;
    }
    inspirationDialog
      ?.querySelectorAll("[data-inspiration-value]")
      .forEach((option) => {
        option.disabled = true;
      });
    if (inspirationStatus) {
      inspirationStatus.textContent =
        APP_LOCALE === "en" ? "Applying inspiration…" : "正在应用妆容灵感…";
    }
    try {
      const response = await fetch("/api/content-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketProfile }),
      });
      if (!response.ok) throw new Error("PREFERENCE_SAVE_FAILED");
      window.location.reload();
    } catch {
      inspirationDialog
        ?.querySelectorAll("[data-inspiration-value]")
        .forEach((option) => {
          option.disabled = false;
        });
      if (inspirationStatus) {
        inspirationStatus.textContent =
          APP_LOCALE === "en"
            ? "Could not save the preference. Try again."
            : "偏好保存失败，请重试。";
      }
    }
  });
});

document.querySelectorAll("[data-look-select]").forEach((link) => {
  link.addEventListener("click", () => {
    window.__track?.("look_selected", {
      lookSlug: link.dataset.lookSlug,
      scenario: link.dataset.lookScenario,
      placement: link.dataset.lookSource || "discover_library",
    });
  });
});



document.querySelectorAll("[data-photo-consent]").forEach((checkbox) => {
  const uploadButton = checkbox.closest(".upload-box")?.querySelector("[data-upload]");
  checkbox.addEventListener("change", () => {
    if (uploadButton?.dataset.loginRequired === "true") return;
    if (uploadButton) uploadButton.disabled = !checkbox.checked;
  });
});

document.querySelectorAll("[data-upload]").forEach((button) => {
  const uploadBox = button.closest(".upload-box");
  const task = uploadBox?.querySelector("[data-upload-task]");
  const status = task?.querySelector("[data-upload-status]");
  const percent = task?.querySelector("[data-upload-percent]");
  const progress = task?.querySelector("[data-upload-progress]");
  const cancelButton = task?.querySelector("[data-upload-cancel]");
  const retryButton = task?.querySelector("[data-upload-retry]");
  const deleteButton = task?.querySelector("[data-upload-delete]");
  const deleteResultButton = task?.querySelector("[data-result-delete]");
  const stageItems = Array.from(
    task?.querySelectorAll("[data-upload-stage]") || [],
  );
  const waitingPanel = document.querySelector("[data-tryon-waiting]");
  const runningJobStates = new Set([
    "created",
    "upload_validating",
    "diagnosis_running",
    "image_running",
  ]);
  const retryableJobStates = new Set(["failed", "cancelled", "timed_out"]);
  const jobProgress = {
    created: [msg("jobCreated"), 46, "queue", "2/4"],
    upload_validating: [msg("uploadValidating"), 52, "queue", "2/4"],
    diagnosis_running: [msg("diagnosisRunning"), 72, "analyze", "3/4"],
    image_running: [msg("imageRunning"), 90, "render", "4/4"],
  };
  const terminalJobMessages = {
    failed: msg("generationFailedRefunded"),
    cancelled: msg("taskCancelledRefunded"),
    timed_out: msg("timedOutRefunded"),
  };
  let controller;
  let lastFile;
  let idempotencyKey;
  let activeJob;
  let previewUrl;
  const fileInput = createNativeImagePicker(button);

  const revealLoadedImage = (container, image) => {
    if (!container || !image) return;
    const reveal = () => container.classList.remove("is-loading");
    image.addEventListener("load", reveal, { once: true });
    image.addEventListener("error", reveal, { once: true });
    if (image.complete) window.requestAnimationFrame(reveal);
  };

  const taskRoutes = () => window.__absBackgroundTasks?.routes || {};
  const resultHrefForJob = (jobId) => {
    const base = (taskRoutes().resultBase || "/result").replace(/\/+$/, "");
    return `${base}/${encodeURIComponent(jobId)}`;
  };
  const currentTaskHref = () =>
    window.location.pathname + window.location.search + window.location.hash;
  const setCurrentJobInUrl = (jobId) => {
    if (!jobId || !window.history?.replaceState) return;
    const url = new URL(window.location.href);
    url.searchParams.set("jobId", jobId);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const clearCurrentJobInUrl = () => {
    if (!window.history?.replaceState) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("jobId");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  };
  const getActiveLook = () => document.querySelector("[data-look-slug].active");
  const setTaskNavSuppressed = (suppressed) => {
    window.absSetMobileBottomNavSuppressed?.("tryon-task", suppressed);
  };
  const syncTaskNavSuppression = () => {
    const taskRunning = task && !task.hidden && task.dataset.state === "running";
    const waitingVisible = waitingPanel && !waitingPanel.hidden;
    setTaskNavSuppressed(Boolean(taskRunning || waitingVisible));
  };
  const setWaitingPanelVisible = (visible) => {
    if (waitingPanel) waitingPanel.hidden = !visible;
    syncTaskNavSuppression();
  };
  const setUploadStage = (stageKey) => {
    if (!stageItems.length) return;
    const stageOrder = ["upload", "queue", "analyze", "render"];
    const currentIndex = Math.max(0, stageOrder.indexOf(stageKey));
    stageItems.forEach((item) => {
      const itemIndex = stageOrder.indexOf(item.dataset.uploadStage || "");
      const state =
        itemIndex < currentIndex
          ? "complete"
          : itemIndex === currentIndex
            ? "current"
            : "upcoming";
      item.dataset.state = state;
    });
  };
  const syncTryonBackgroundTask = (job, overrides = {}) => {
    if (!job?.id) return;
    const routes = taskRoutes();
    const lookTitle =
      job.lookTitle || getActiveLook()?.dataset.look || msg("fallbackLook");
    upsertBackgroundTask({
      id: job.id,
      type: "tryon",
      title: lookTitle
        ? `${msg("imageRunning")} · ${lookTitle}`
        : msg("imageRunning"),
      status: job.status || "running",
      progress: overrides.progress,
      stage: overrides.stage,
      href: currentTaskHref(),
      resultHref: job.id ? resultHrefForJob(job.id) : routes.history || "/history",
      ...overrides,
    });
  };

  const clearUploadPreview = () => {
    uploadBox?.classList.remove("has-photo");
    uploadBox?.closest(".upload-preview")?.classList.remove("has-photo-preview");
    uploadBox?.querySelector("[data-upload-preview]")?.remove();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = undefined;
    }
  };

  const renderUploadPreview = (file) => {
    if (!uploadBox || !file) return;
    clearUploadPreview();
    previewUrl = URL.createObjectURL(file);

    const preview = document.createElement("div");
    preview.className = "upload-original-preview is-loading";
    preview.dataset.uploadPreview = "";

    const image = document.createElement("img");
    image.loading = "eager";
    image.decoding = "async";
    image.src = previewUrl;
    image.alt = msg("originalPhoto");

    const badge = document.createElement("span");
    badge.className = "pill pill-neutral";
    badge.textContent = msg("originalPhoto");

    preview.append(image, badge);
    revealLoadedImage(preview, image);
    uploadBox.prepend(preview);
    uploadBox.classList.add("has-photo");
    uploadBox.closest(".upload-preview")?.classList.add("has-photo-preview");
  };

  const setUploadState = (
    message,
    progressValue,
    {
      state = "running",
      cancellable = false,
      retryable = false,
      stageKey,
      stepLabel,
    } = {},
  ) => {
    if (!task) return;
    task.hidden = false;
    task.dataset.state = state;
    status.textContent = message;
    percent.textContent = stepLabel || `${progressValue}%`;
    progress.style.width = `${progressValue}%`;
    cancelButton.hidden = !cancellable;
    retryButton.hidden = !retryable;
    if (stageKey) setUploadStage(stageKey);
    syncTaskNavSuppression();
  };

  const readApiData = async (response, fallbackMessage) => {
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error?.message || fallbackMessage);
    }
    return payload.data;
  };

  const renderSuccessfulJob = (job) => {
    setCurrentJobInUrl(job.id);
    const resultTarget = document.querySelector("[data-result-target]");
    if (resultTarget && job.resultImage) {
      const wrapper = document.createElement("div");
      wrapper.className = "generated-result is-loading";
      const image = document.createElement("img");
      image.loading = "eager";
      image.decoding = "async";
      image.fetchPriority = "high";
      image.src = job.resultImage;
      image.alt = msg("referenceAlt", { look: job.lookTitle });
      const badge = document.createElement("span");
      badge.className = "pill pill-teal";
      badge.textContent =
        job.resultKind === "reference-fallback" ? msg("referenceEffect") : msg("tryonEffect");
      const message = document.createElement("p");
      message.textContent = job.disclaimer || msg("resultDisclaimer");
      wrapper.append(badge, image, message);
      revealLoadedImage(wrapper, image);
      resultTarget.replaceChildren(wrapper);
    }
    deleteResultButton.hidden = false;
    updateQuotaDisplay(job.quota);
    window.__absLastSucceededJobId = job.id;
    document.dispatchEvent(
      new CustomEvent("abs:tryon-succeeded", {
        detail: { job },
      }),
    );
    syncTryonBackgroundTask(job, {
      status: "succeeded",
      progress: 100,
      stage:
        job.resultKind === "reference-fallback"
          ? msg("referenceGenerated")
          : msg("tryonGenerated"),
      resultHref: resultHrefForJob(job.id),
    });
    setUploadState(job.resultKind === "reference-fallback" ? msg("referenceGenerated") : msg("tryonGenerated"), 100, {
      state: "success",
      stageKey: "render",
      stepLabel: "4/4",
    });
    setWaitingPanelVisible(false);
    showToast(
      job.resultKind === "reference-fallback"
        ? msg("referenceGeneratedNote")
        : msg("tryonGenerated"),
    );
  };

  const presentTerminalJob = (job) => {
    activeJob = job;
    updateQuotaDisplay(job.quota);
    if (job.status === "succeeded") {
      renderSuccessfulJob(job);
      return;
    }

    const message = terminalJobMessages[job.status] || msg("taskIncomplete");
    syncTryonBackgroundTask(job, {
      status: job.status,
      progress: 0,
      stage: message,
    });
    setUploadState(message, 0, {
      state: "error",
      retryable: retryableJobStates.has(job.status),
      stageKey: "render",
    });
    setWaitingPanelVisible(false);
    showToast(message);
  };

  const waitForJob = async (initialJob) => {
    let job = initialJob;
    activeJob = job;
    setCurrentJobInUrl(job.id);
    updateQuotaDisplay(job.quota);

    while (runningJobStates.has(job.status)) {
      activeJob = job;
      const [message, progressValue, stageKey, stepLabel] =
        jobProgress[job.status];
      cancelButton.textContent = msg("cancelGeneration");
      setUploadState(message, progressValue, {
        cancellable: true,
        stageKey,
        stepLabel,
      });
      syncTryonBackgroundTask(job, {
        progress: progressValue,
        stage: message,
      });
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      job = await readApiData(await fetch(`/api/tryon-jobs/${job.id}`), msg("statusQueryFailed"));
      updateQuotaDisplay(job.quota);
    }

    presentTerminalJob(job);
  };

  const runUpload = async (file) => {
    if (!file) return;
    setTaskNavSuppressed(true);
    lastFile = file;
    renderUploadPreview(file);
    idempotencyKey ||= crypto.randomUUID();
    activeJob = undefined;
    clearCurrentJobInUrl();
    deleteResultButton.hidden = true;
    const originalLabel = button.textContent;
    controller = new AbortController();
    button.disabled = true;
    button.textContent = msg("uploadingSafely");
    cancelButton.textContent = msg("cancelUpload");
    setWaitingPanelVisible(true);
    setUploadState(msg("confirmingConsent"), 12, {
      cancellable: true,
      stageKey: "upload",
      stepLabel: "1/4",
    });

    try {
      const consentResponse = await fetch("/api/consents/photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accepted: true, version: PHOTO_CONSENT_VERSION }),
        signal: controller.signal,
      });
      if (!consentResponse.ok) throw new Error("CONSENT_FAILED");
      setUploadState(msg("validatingUpload"), 38, {
        cancellable: true,
        stageKey: "upload",
        stepLabel: "1/4",
      });

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("consentVersion", PHOTO_CONSENT_VERSION);
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const result = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(result.error?.message || "UPLOAD_FAILED");

      button.dataset.uploadId = result.data.id;
      deleteButton.hidden = false;
      button.textContent = msg("generatingReference");
      controller = undefined;
      setUploadState(msg("uploadValidated"), 46, {
        stageKey: "queue",
        stepLabel: "2/4",
      });
      const activeLook = getActiveLook();
      const job = await readApiData(
        await fetch("/api/tryon-jobs", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            uploadId: result.data.id,
            lookSlug: activeLook?.dataset.lookSlug,
            idempotencyKey,
          }),
        }),
        msg("jobCreateFailed"),
      );
      setCurrentJobInUrl(job.id);
      syncTryonBackgroundTask(job, {
        progress: 46,
        stage: msg("jobCreated"),
      });
      await waitForJob(job);
    } catch (error) {
      const aborted = error.name === "AbortError";
      const errorMessage = aborted
        ? msg("uploadCancelled")
        : error.message === "UPLOAD_FAILED" || error.message === "TRYON_FAILED"
          ? msg("processFailed")
          : error.message;
      setUploadState(errorMessage, 0, {
        state: "error",
        retryable: true,
        stageKey: "upload",
      });
      setWaitingPanelVisible(false);
      showToast(errorMessage);
    } finally {
      controller = undefined;
      button.textContent = originalLabel;
      button.disabled = !uploadBox?.querySelector("[data-photo-consent]")?.checked;
      syncTaskNavSuppression();
    }
  };

  const restoreJobFromUrl = async () => {
    const jobId = new URLSearchParams(window.location.search).get("jobId");
    if (!jobId) return;
    try {
      const job = await readApiData(
        await fetch(`/api/tryon-jobs/${encodeURIComponent(jobId)}`),
        msg("statusQueryFailed"),
      );
      activeJob = job;
      syncTryonBackgroundTask(job, {
        progress: runningJobStates.has(job.status) ? undefined : 100,
        resultHref: resultHrefForJob(job.id),
      });
      if (runningJobStates.has(job.status)) {
        setWaitingPanelVisible(true);
        await waitForJob(job);
      } else {
        presentTerminalJob(job);
      }
    } catch {
      clearCurrentJobInUrl();
    }
  };

  void restoreJobFromUrl();

  fileInput.addEventListener("change", async () => {
    if (!fileInput.files?.length) return;
    const file = fileInput.files[0];
    const session = await getCurrentSession({ refresh: true });
    if (!isAccountSession(session)) {
      syncUploadAuthGate(session);
      redirectToLogin(msg("loginQuotaRequired"));
      return;
    }

    idempotencyKey = crypto.randomUUID();
    activeJob = undefined;
    deleteResultButton.hidden = true;
    await runUpload(file);
  });

  button.addEventListener("click", () => {
    if (button.dataset.loginRequired === "true") {
      redirectToLogin(msg("loginQuotaRequired"));
      return;
    }
    fileInput.value = "";
    fileInput.click();
  });

  cancelButton?.addEventListener("click", async () => {
    if (controller) {
      controller.abort();
      return;
    }
    if (!activeJob || !runningJobStates.has(activeJob.status)) return;

    cancelButton.disabled = true;
    try {
      const job = await readApiData(
        await fetch(`/api/tryon-jobs/${activeJob.id}/cancel`, { method: "POST" }),
        msg("cancelFailed"),
      );
      presentTerminalJob(job);
    } catch (error) {
      showToast(error.message);
    } finally {
      cancelButton.disabled = false;
    }
  });

  retryButton?.addEventListener("click", async () => {
    if (!activeJob || !retryableJobStates.has(activeJob.status)) {
      idempotencyKey = crypto.randomUUID();
      await runUpload(lastFile);
      return;
    }

    retryButton.disabled = true;
    setUploadState(msg("retryCreating"), 46, {
      stageKey: "queue",
      stepLabel: "2/4",
    });
    try {
      const job = await readApiData(
        await fetch(`/api/tryon-jobs/${activeJob.id}/retry`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
        }),
        msg("retryCreateFailed"),
      );
      setWaitingPanelVisible(true);
      syncTryonBackgroundTask(job, {
        progress: 46,
        stage: msg("retryCreating"),
      });
      await waitForJob(job);
    } catch (error) {
      setUploadState(error.message, 0, {
        state: "error",
        retryable: true,
        stageKey: "queue",
      });
      setWaitingPanelVisible(false);
      showToast(error.message);
    } finally {
      retryButton.disabled = false;
    }
  });

  deleteButton?.addEventListener("click", async () => {
    const uploadId = button.dataset.uploadId;
    if (!uploadId) return;

    deleteButton.disabled = true;
    try {
      await readApiData(
        await fetch(`/api/uploads/${uploadId}`, { method: "DELETE" }),
        msg("deleteUploadFailed"),
      );
      delete button.dataset.uploadId;
      deleteButton.hidden = true;
      clearUploadPreview();
      showToast(msg("originalDeleted"));
    } catch (error) {
      showToast(error.message);
    } finally {
      deleteButton.disabled = false;
    }
  });

  deleteResultButton?.addEventListener("click", async () => {
    if (!activeJob) return;

    deleteResultButton.disabled = true;
    try {
      const deletedJobId = activeJob.id;
      await readApiData(
        await fetch(`/api/tryon-jobs/${deletedJobId}`, { method: "DELETE" }),
        msg("deleteResultFailed"),
      );
      const resultTarget = document.querySelector("[data-result-target]");
      const emptyState = document.createElement("div");
      emptyState.className = "result-state";
      const title = document.createElement("h3");
      title.textContent = msg("resultDeletedTitle");
      const message = document.createElement("p");
      message.textContent = msg("resultDeletedDesc");
      emptyState.append(title, message);
      resultTarget?.replaceChildren(emptyState);
      activeJob = undefined;
      window.__absLastSucceededJobId = undefined;
      clearCurrentJobInUrl();
      deleteResultButton.hidden = true;
      setUploadState(msg("resultDeletedTitle"), 0, { state: "success" });
      removeBackgroundTask(deletedJobId);
      showToast(msg("resultDeletedTitle"));
    } catch (error) {
      showToast(error.message);
    } finally {
      deleteResultButton.disabled = false;
    }
  });
});

document.querySelectorAll("[data-faq]").forEach((button) => {
  button.addEventListener("click", () => {
    const answer = document.querySelector(".faq-answer");
    answer.textContent = button.dataset.answer;
    answer.classList.add("show");
  });
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.closeDialog)?.close();
  });
});
