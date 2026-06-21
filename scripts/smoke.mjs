import { access } from "node:fs/promises";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright-core";

const baseUrl = (process.env.BASE_URL ?? "http://127.0.0.1:4322").replace(
  /\/+$/,
  "",
);
const localeFiles = {
  "": "en.json",
  "zh-cn": "zh-CN.json",
  de: "de.json",
  fr: "fr.json",
  ja: "ja.json",
  ko: "ko.json",
  "zh-tw": "zh-TW.json",
  es: "es.json",
  "pt-br": "pt-BR.json",
};
const localeSlug =
  new URL(baseUrl).pathname.split("/").filter(Boolean)[0] ?? "";
const localeFile = localeFiles[localeSlug] ?? localeFiles[""];
const copy = JSON.parse(
  readFileSync(join(process.cwd(), "src", "locales", localeFile), "utf8"),
);
const browserCandidates = [
  process.env.EDGE_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);

let executablePath;
for (const candidate of browserCandidates) {
  if (
    await access(candidate)
      .then(() => true)
      .catch(() => false)
  ) {
    executablePath = candidate;
    break;
  }
}

if (!executablePath) {
  throw new Error("未找到可用于烟雾测试的 Edge 或 Chrome。");
}

const routes = [
  "/",
  "/discover",
  "/diagnosis",
  "/pricing",
  "/share-card",
  "/tryon-free",
  "/tryon-pro",
  "/tryon-premium",
  "/privacy",
  "/terms",
  "/ai-disclaimer",
  "/support",
  "/about",
  "/faq",
  "/blog",
  "/blog/how-to-determine-skin-undertone",
  "/blog/ai-tryon-vs-beauty-filters",
  "/blog/face-shape-and-makeup-gravity",
  "/login",
  "/reset-password",
];
const darkModeRoutes = [
  { route: "/", surface: "body.home-main", panel: ".assurance-card" },
  { route: "/discover", surface: ".discover-main", panel: ".look-library" },
  {
    route: "/diagnosis",
    surface: ".diagnosis-main",
    panel: ".diagnosis-banner",
  },
  { route: "/pricing", surface: ".pricing-main", panel: ".pricing-plan-card" },
  {
    route: "/tryon-free",
    surface: "body.workspace-body",
    panel: ".selector-panel",
  },
  {
    route: "/tryon-pro",
    surface: "body.workspace-body",
    panel: ".selector-panel",
  },
  {
    route: "/tryon-premium",
    surface: "body.workspace-body",
    panel: ".selector-panel",
  },
  { route: "/login", surface: "body.auth-body", panel: ".auth-form-pane" },
  { route: "/privacy", surface: ".legal-main", panel: ".legal-document" },
  { route: "/share-card", surface: ".share-page" },
  { route: "/support", surface: ".support-main", panel: ".support-form-panel" },
  { route: "/about", surface: ".about-main", panel: ".principle-list article" },
  { route: "/faq", surface: ".faq-main", panel: ".faq-search" },
  { route: "/blog", surface: ".blog-main" },
  {
    route: "/blog/how-to-determine-skin-undertone",
    surface: ".article-main",
  },
];
const browser = await chromium.launch({ executablePath, headless: true });
let smokeAuthSession;

try {
  const desktop = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const localHostname = new URL(baseUrl).hostname;
  await desktop.context().route("**/*", (route) => {
    const requestUrl = new URL(route.request().url());
    return requestUrl.protocol.startsWith("http") &&
      requestUrl.hostname !== localHostname
      ? route.abort()
      : route.continue();
  });

  for (const route of routes) {
    const response = await desktop.goto(`${baseUrl}${route}`, {
      waitUntil: "networkidle",
    });
    if (!response?.ok())
      throw new Error(`${route} 返回 ${response?.status() ?? "无响应"}`);
    await assertCompactNavigation(desktop, route, 1440);
    await assertUnifiedNavigation(desktop, route);
    await assertCompactFooter(desktop, route, 1440);
    await assertSingleAuthEntry(desktop, route, 1440);
    await assertSingleThemeToggle(desktop, route, 1440);
  }

  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  await desktop.evaluate(() => localStorage.setItem("theme", "light"));
  await desktop.reload({ waitUntil: "networkidle" });
  await desktop.locator("#theme-toggle").click();
  if (
    (await desktop.locator("html").getAttribute("data-theme")) !== "dark" ||
    (await desktop.locator("#theme-color").getAttribute("content")) !==
      "#0f1520"
  ) {
    throw new Error("主题按钮未同步切换页面主题与浏览器主题色。");
  }
  for (const check of darkModeRoutes) {
    await desktop.goto(`${baseUrl}${check.route}`, {
      waitUntil: "networkidle",
    });
    await assertDarkSurface(desktop, check.route, check.surface);
    if (check.panel) {
      await assertDarkSurface(desktop, check.route, check.panel);
    }
  }
  await desktop.evaluate(() => localStorage.setItem("theme", "light"));

  const cookiePage = await browser.newPage();
  await cookiePage.goto(baseUrl, { waitUntil: "networkidle" });
  const cookieBanner = cookiePage.locator("[data-cookie-consent]");
  if (!(await cookieBanner.isVisible())) {
    throw new Error("首次访问未展示 Cookie Consent。");
  }
  await cookiePage.locator('[data-cookie-choice="necessary"]').click();
  await cookieBanner.waitFor({ state: "hidden" });
  await cookiePage.waitForFunction(
    (expected) =>
      document.querySelector(".toast.show")?.textContent?.trim() === expected,
    copy.cookie.necessarySaved,
  );
  await cookiePage.reload({ waitUntil: "networkidle" });
  if (await cookieBanner.isVisible()) {
    throw new Error("Cookie 偏好在刷新后未保持。");
  }
  await cookiePage.locator("[data-cookie-settings]").click();
  if (!(await cookieBanner.isVisible())) {
    throw new Error("全站页脚无法重新打开 Cookie 设置。");
  }
  await cookiePage.locator('[data-cookie-choice="all"]').click();
  await cookieBanner.waitFor({ state: "hidden" });
  await cookiePage.waitForFunction(
    (expected) =>
      document.querySelector(".toast.show")?.textContent?.trim() === expected,
    copy.cookie.allSaved,
  );
  await cookiePage.close();

  const health = await desktop.evaluate(() =>
    fetch("/api/health").then((response) => response.json()),
  );
  if (
    !health.ok ||
    health.data?.providers?.ai !== "gemini" ||
    health.data?.providers?.upload !== "mock" ||
    health.data?.providers?.tryOnTask !== "mock" ||
    !health.data?.bindings?.d1 ||
    !health.data?.bindings?.r2
  ) {
    throw new Error(
      `运行时变量或 Cloudflare 绑定未生效：${JSON.stringify(health)}`,
    );
  }

  const noConsentPage = await browser.newPage();
  await noConsentPage.goto(`${baseUrl}/tryon-free`, {
    waitUntil: "networkidle",
  });
  const noConsentStatus = await noConsentPage.evaluate(
    async (jpegBytes) => {
      const form = new FormData();
      form.append(
        "photo",
        new File([new Uint8Array(jpegBytes)], "no-consent.jpg", {
          type: "image/jpeg",
        }),
      );
      form.append("consentVersion", "2026-06-07");
      return fetch("/api/uploads", { method: "POST", body: form }).then(
        (response) => response.status,
      );
    },
    [...minimalJpeg()],
  );
  await noConsentPage.close();
  if (noConsentStatus !== 401) {
    throw new Error(`未登录上传应返回 401，实际为 ${noConsentStatus}`);
  }

  const loginGatePage = await browser.newPage();
  await loginGatePage.goto(`${baseUrl}/tryon-free?look=no-makeup`, {
    waitUntil: "networkidle",
  });
  await loginGatePage.waitForFunction(
    (label) =>
      document.querySelector("[data-upload]")?.textContent?.includes(label),
    copy.tryon.loginToUpload,
  );
  await loginGatePage.locator("[data-upload]").click();
  await loginGatePage.waitForURL(/\/login\?next=/);
  const expectedLoginNext = new URL(`${baseUrl}/tryon-free?look=no-makeup`);
  const expectedNextValue = `${expectedLoginNext.pathname}${expectedLoginNext.search}`;
  if (!loginGatePage.url().includes(encodeURIComponent(expectedNextValue))) {
    throw new Error(`未登录上传没有保留回跳地址：${loginGatePage.url()}`);
  }
  await loginGatePage.close();

  await ensureSmokeAuth(desktop.context());

  await desktop.goto(`${baseUrl}/discover`, { waitUntil: "networkidle" });
  if ((await desktop.locator(".page-heading .notice").count()) > 0) {
    throw new Error("发现页顶部不应再展示大提示卡片。");
  }
  const discoverIntro =
    (await desktop.locator(".page-heading p").textContent()) ?? "";
  const discoverIntroMinimum = /^(zh|ja|ko)/.test(localeSlug) ? 28 : 40;
  if (discoverIntro.trim().length < discoverIntroMinimum) {
    throw new Error("发现页标题副文案过短，未提供足够的使用说明。");
  }
  const totalLooks = await desktop.locator("[data-look-card]").count();
  if (totalLooks !== 44)
    throw new Error(`发现页应展示 44 个妆容，实际为 ${totalLooks}`);

  const scenarioOptions = desktop.locator(
    '[data-filter-group="scenario"] [data-filter-value]',
  );
  if ((await scenarioOptions.count()) < 2) {
    throw new Error("发现页缺少可用的场景筛选项。");
  }
  await scenarioOptions.nth(1).click();
  const visibleDateLooks = await desktop
    .locator("[data-look-card]:visible")
    .count();
  if (visibleDateLooks <= 0 || visibleDateLooks >= totalLooks) {
    throw new Error(`约会筛选结果异常：${visibleDateLooks}`);
  }

  await desktop.locator(".filter-panel [data-clear-filters]").click();
  const visibleAfterClear = await desktop
    .locator("[data-look-card]:visible")
    .count();
  if (visibleAfterClear !== totalLooks) {
    throw new Error(
      `清空筛选后应恢复 ${totalLooks} 个妆容，实际为 ${visibleAfterClear}`,
    );
  }

  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  const heroNote = desktop.locator(".home-copy .generation-note");
  if ((await heroNote.count()) !== 1) {
    throw new Error("首页生成说明应放在左侧 CTA 下方。");
  }
  if ((await desktop.locator(".home-compare + .generation-note").count()) > 0) {
    throw new Error("首页生成说明不应放在右侧对比图下方。");
  }
  if (
    !((await heroNote.textContent()) ?? "").includes(copy.homepage.pricingRule)
  ) {
    throw new Error("首页生成说明文案未使用精简版本。");
  }
  if ((await desktop.locator(".home-section.panel").count()) > 0) {
    throw new Error("首页后半段不应继续使用外层大卡片包裹 section。");
  }
  const scenarioCards = desktop.locator("[data-home-scenario-card]");
  if ((await scenarioCards.count()) !== 6) {
    throw new Error("首页场景试妆区应展示 6 个图像场景入口。");
  }
  const scenarioCardHeights = await scenarioCards.evaluateAll((cards) =>
    cards.map((card) => card.getBoundingClientRect().height),
  );
  const scenarioCardWidths = await scenarioCards.evaluateAll((cards) =>
    cards.map((card) => card.getBoundingClientRect().width),
  );
  const tallestScenarioCard = Math.max(...scenarioCardHeights);
  const shortestScenarioCard = Math.min(...scenarioCardHeights);
  const widestScenarioCard = Math.max(...scenarioCardWidths);
  const narrowestScenarioCard = Math.min(...scenarioCardWidths);
  if (tallestScenarioCard > 570 || shortestScenarioCard < 520) {
    throw new Error(
      `首页场景卡应保持紧凑高度，实际范围 ${shortestScenarioCard}-${tallestScenarioCard}px。`,
    );
  }
  if (widestScenarioCard > 430 || narrowestScenarioCard < 380) {
    throw new Error(
      `首页场景卡应保持紧凑宽度，实际范围 ${narrowestScenarioCard}-${widestScenarioCard}px。`,
    );
  }
  const scenarioHrefs = await scenarioCards.evaluateAll((cards) =>
    cards.map((card) => card.getAttribute("href") || ""),
  );
  if (
    scenarioHrefs.some((href) => {
      const target = new URL(href, new URL(baseUrl).origin);
      return (
        !target.pathname.endsWith("/tryon-free") ||
        !target.searchParams.get("look") ||
        target.searchParams.get("source") !== "home_scenario"
      );
    })
  ) {
    throw new Error("首页场景入口应直接带妆容参数进入 Free 试妆页。");
  }
  if (!scenarioHrefs.some((href) => href.includes("look=flash-proof-satin"))) {
    throw new Error("首页场景入口缺少镜头抗闪光妆容。");
  }
  if (
    (await desktop
      .locator(".steps-grid, .trust-grid, .membership-grid")
      .count()) > 0
  ) {
    throw new Error("首页仍残留旧流程、安全或会员三卡模块。");
  }
  if (
    (await desktop.locator("[data-home-assurance] .assurance-card").count()) !==
    copy.homepage.uploadConcerns.length
  ) {
    throw new Error(
      `首页上传前说明应展示 ${copy.homepage.uploadConcerns.length} 个关键顾虑。`,
    );
  }
  const assuranceText =
    (await desktop.locator("[data-home-assurance]").textContent()) ?? "";
  for (const requiredCopy of [
    copy.homepage.assuranceTitle,
    ...copy.homepage.uploadConcerns.map((item) => item.title),
  ]) {
    if (!assuranceText.includes(requiredCopy)) {
      throw new Error(`首页上传前说明缺少终端用户文案：${requiredCopy}`);
    }
  }
  const forbiddenInternalCopy =
    localeSlug === "zh-cn" ? ["先把规则说清楚", "工作台处理"] : [];
  for (const internalCopy of forbiddenInternalCopy) {
    if (assuranceText.includes(internalCopy)) {
      throw new Error(`首页上传前说明仍残留内部化表达：${internalCopy}`);
    }
  }
  if (!(await desktop.locator("[data-home-upgrade-strip]").isVisible())) {
    throw new Error("首页缺少轻量升级入口。");
  }
  await desktop.waitForFunction(() =>
    Boolean(document.querySelector(".home-compare")?.dataset.syncedHeight),
  );
  const compareSlider = desktop.locator("[data-compare-slider]");
  const heroVisualState = await desktop.evaluate(() => {
    const copy = document.querySelector(".home-copy");
    const compare = document.querySelector(".home-compare");
    const image = document.querySelector(".compare-half img");
    const copyRect = copy?.getBoundingClientRect();
    const compareRect = compare?.getBoundingClientRect();
    return {
      copyHeight: copyRect?.height || 0,
      compareHeight: compareRect?.height || 0,
      objectFit: image ? getComputedStyle(image).objectFit : "",
      syncedHeight: compare?.getAttribute("data-synced-height") || "",
    };
  });
  if (
    Math.abs(heroVisualState.copyHeight - heroVisualState.compareHeight) > 2
  ) {
    throw new Error(
      `首页对比图高度应与左侧文案一致：${JSON.stringify(heroVisualState)}`,
    );
  }
  if (heroVisualState.objectFit !== "cover") {
    throw new Error("首页对比图必须使用 object-fit: cover 避免图片拉伸变形。");
  }
  const compareBox = await compareSlider.boundingBox();
  if (!compareBox) throw new Error("首页对比图未渲染。");
  await desktop.mouse.move(
    compareBox.x + compareBox.width * 0.5,
    compareBox.y + compareBox.height * 0.5,
  );
  await desktop.mouse.down();
  await desktop.mouse.move(
    compareBox.x + compareBox.width * 0.72,
    compareBox.y + compareBox.height * 0.5,
  );
  await desktop.mouse.up();
  const compareState = await compareSlider.evaluate((element) => {
    const knob = element.querySelector("[data-compare-knob]");
    return {
      position: element.style.getPropertyValue("--compare-position"),
      value: Number(knob?.getAttribute("aria-valuenow") || 0),
      hasDisabledToast: Boolean(knob?.hasAttribute("data-toast")),
    };
  });
  if (
    compareState.value < 68 ||
    compareState.value > 76 ||
    compareState.hasDisabledToast
  ) {
    throw new Error(`首页对比图拖动未生效：${JSON.stringify(compareState)}`);
  }
  await desktop.locator("[data-compare-knob]").press("Home");
  const compareKeyboardValue = Number(
    await desktop.locator("[data-compare-knob]").getAttribute("aria-valuenow"),
  );
  if (compareKeyboardValue !== 5) {
    throw new Error("首页对比图键盘控制未生效。");
  }

  await desktop.goto(`${baseUrl}/tryon-free?look=burgundy-velvet`, {
    waitUntil: "networkidle",
  });
  const burgundyActive = desktop.locator(
    '[data-look-slug="burgundy-velvet"].active',
  );
  const burgundyTitle = await burgundyActive.getAttribute("data-look");
  if (
    !burgundyTitle ||
    (await desktop.locator("[data-look-title]").textContent())?.trim() !==
      burgundyTitle ||
    (await burgundyActive.count()) !== 1
  ) {
    throw new Error("Free 工作台未带入发现页选择的非精选妆容。");
  }
  const advisorTitle = (
    await desktop.locator("[data-advisor-title]").textContent()
  )?.trim();
  const burgundyAdvisorText =
    (await desktop.locator("[data-look-advisor]").textContent()) ?? "";
  if (
    advisorTitle !== burgundyTitle ||
    !burgundyAdvisorText.includes(copy.tryon.advisorAnchors) ||
    !burgundyAdvisorText.includes(copy.tryon.advisorCaution)
  ) {
    throw new Error("Free 工作台右侧顾问卡未带入当前妆容。");
  }
  await desktop.locator('[data-look-slug="commute"]').click();
  const commuteAdvisorTitle = (
    await desktop.locator("[data-advisor-title]").textContent()
  )?.trim();
  const commuteAdvisorText =
    (await desktop.locator("[data-look-advisor]").textContent()) ?? "";
  const commuteTitle = await desktop
    .locator('[data-look-slug="commute"].active')
    .getAttribute("data-look");
  if (
    !commuteTitle ||
    commuteAdvisorTitle !== commuteTitle ||
    commuteAdvisorText === burgundyAdvisorText ||
    !commuteAdvisorText.includes(copy.tryon.advisorFit)
  ) {
    throw new Error("Free 工作台切换妆容后未刷新右侧顾问卡。");
  }

  await desktop.goto(`${baseUrl}/tryon-free?look=rose-milk-date`, {
    waitUntil: "networkidle",
  });
  const roseMilkTitle = await desktop
    .locator('[data-look-slug="rose-milk-date"].active')
    .getAttribute("data-look");
  const roseMilkImage = await desktop
    .locator('[data-look-slug="rose-milk-date"].active')
    .getAttribute("data-look-image");
  if (
    !roseMilkTitle ||
    !roseMilkImage ||
    (await desktop.locator("[data-look-title]").textContent())?.trim() !==
      roseMilkTitle
  ) {
    throw new Error("Free 工作台未根据 look 参数选择妆容。");
  }
  if ((await desktop.locator(".workspace-header").count()) !== 0) {
    throw new Error("工作台页面不应再渲染业务型 WorkspaceHeader。");
  }
  if ((await desktop.locator(".workspace-status").count()) !== 1) {
    throw new Error("工作台页面应在内容区展示额度与工作台状态条。");
  }
  const workspaceStatusText =
    (await desktop.locator(".workspace-status").textContent()) ?? "";
  if (
    !workspaceStatusText.includes(copy.tryon.title) ||
    (await desktop.locator("[data-quota-label]").count()) !== 1
  ) {
    throw new Error("Free 工作台状态条缺少页面内业务状态。");
  }
  const navText = (await desktop.locator(".site-header").textContent()) ?? "";
  for (const businessCopy of [
    copy.workspace.remaining,
    copy.tryon.saveResult,
    copy.tryon.downloadHd,
  ]) {
    if (navText.includes(businessCopy)) {
      throw new Error(`全站导航不应承载业务操作：${businessCopy}`);
    }
  }
  if ((await desktop.locator(".quota-bar").count()) !== 0) {
    throw new Error("工作台仍展示独立额度栏。");
  }
  if (await desktop.locator("#free-share-actions").isVisible()) {
    throw new Error("尚未生成结果时不应展示分享操作。");
  }
  const uploadButton = desktop.locator("[data-upload]");
  if (!(await uploadButton.isDisabled())) {
    throw new Error("未同意照片处理说明时上传按钮必须禁用。");
  }
  await desktop.locator("[data-photo-consent]").check();
  if (await uploadButton.isDisabled()) {
    throw new Error("同意照片处理说明后上传按钮应启用。");
  }
  const chooserPromise = desktop.waitForEvent("filechooser");
  await uploadButton.click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "smoke.jpg",
    mimeType: "image/jpeg",
    buffer: minimalJpeg(),
  });
  await desktop.locator(".generated-result").waitFor({ state: "visible" });
  if (!(await desktop.locator("#free-share-actions").isVisible())) {
    throw new Error("生成结果后未展示紧凑分享操作栏。");
  }
  const generatedResultImage = await desktop
    .locator(".generated-result img")
    .getAttribute("src");
  if (
    !generatedResultImage ||
    new URL(generatedResultImage, baseUrl).pathname !==
      new URL(roseMilkImage, baseUrl).pathname
  ) {
    throw new Error(
      `Free 工作台上传后未展示所选妆容的参考效果：${JSON.stringify({
        selected: roseMilkImage,
        generated: generatedResultImage,
      })}`,
    );
  }
  if (
    !(
      (await desktop.locator("[data-quota-label]").textContent()) ?? ""
    ).includes("2")
  ) {
    throw new Error("Free 工作台生成后未同步扣减服务端额度。");
  }
  if (
    (await desktop.locator("[data-upload-task]").getAttribute("data-state")) !==
      "success" ||
    (await desktop.locator("[data-upload-percent]").textContent()) !== "100%"
  ) {
    throw new Error("Free 工作台未展示上传与生成完成状态。");
  }
  const deleteOriginalButton = desktop.locator("[data-upload-delete]");
  if (!(await deleteOriginalButton.isVisible())) {
    throw new Error("生成后未显示删除原始自拍入口。");
  }
  await deleteOriginalButton.click();
  await deleteOriginalButton.waitFor({ state: "hidden" });
  if (!(await desktop.locator(".generated-result").isVisible())) {
    throw new Error("删除原始自拍后不应移除已生成结果。");
  }
  const deleteResultButton = desktop.locator("[data-result-delete]");
  if (!(await deleteResultButton.isVisible())) {
    throw new Error("生成后未显示删除试妆结果与诊断入口。");
  }
  await deleteResultButton.click();
  await deleteResultButton.waitFor({ state: "hidden" });
  if (await desktop.locator(".generated-result").isVisible()) {
    throw new Error("删除试妆结果后仍展示已删除结果。");
  }

  const uploadApiResult = await desktop.evaluate(
    async (jpegBytes) => {
      const consent = await fetch("/api/consents/photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accepted: true, version: "2026-06-07" }),
      }).then((response) => response.json());

      const validForm = new FormData();
      validForm.append(
        "photo",
        new File([new Uint8Array(jpegBytes)], "smoke.jpg", {
          type: "image/jpeg",
        }),
      );
      validForm.append("consentVersion", "2026-06-07");
      const validResponse = await fetch("/api/uploads", {
        method: "POST",
        body: validForm,
      });
      const valid = await validResponse.json();

      const idempotencyKey = crypto.randomUUID();
      const jobResponse = await fetch("/api/tryon-jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          uploadId: valid.data?.id,
          lookSlug: "commute",
          idempotencyKey,
        }),
      });
      const job = await jobResponse.json();
      const replayResponse = await fetch("/api/tryon-jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          uploadId: valid.data?.id,
          lookSlug: "commute",
          idempotencyKey,
        }),
      });
      const replay = await replayResponse.json();
      const queryResponse = await fetch(`/api/tryon-jobs/${job.data?.id}`);
      const query = await queryResponse.json();
      const shareIntentResponse = await fetch("/api/shares/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: job.data?.id, method: "copy_link" }),
      });
      const shareIntent = await shareIntentResponse.json();
      const rewardResponse = await fetch("/api/shares/reward", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId: job.data?.id,
          shareClaimToken: shareIntent.data?.claimToken,
        }),
      });
      const reward = await rewardResponse.json();
      const shareIntentReplayResponse = await fetch("/api/shares/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId: job.data?.id, method: "copy_link" }),
      });
      const shareIntentReplay = await shareIntentReplayResponse.json();
      const rewardReplayResponse = await fetch("/api/shares/reward", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jobId: job.data?.id,
          shareClaimToken: shareIntentReplay.data?.claimToken,
        }),
      });
      const rewardReplay = await rewardReplayResponse.json();
      const cancelResponse = await fetch(
        `/api/tryon-jobs/${job.data?.id}/cancel`,
        { method: "POST" },
      );
      const cancel = await cancelResponse.json();
      const retryResponse = await fetch(
        `/api/tryon-jobs/${job.data?.id}/retry`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ idempotencyKey: crypto.randomUUID() }),
        },
      );
      const retry = await retryResponse.json();
      const deleteJobResponse = await fetch(`/api/tryon-jobs/${job.data?.id}`, {
        method: "DELETE",
      });
      const deletedJob = await deleteJobResponse.json();
      const queryDeletedJobResponse = await fetch(
        `/api/tryon-jobs/${job.data?.id}`,
      );
      const repeatedJobDeleteResponse = await fetch(
        `/api/tryon-jobs/${job.data?.id}`,
        { method: "DELETE" },
      );
      const repeatedJobDelete = await repeatedJobDeleteResponse.json();
      const session = await fetch("/api/session").then((response) =>
        response.json(),
      );
      const looks = await fetch("/api/looks").then((response) =>
        response.json(),
      );

      const invalidForm = new FormData();
      invalidForm.append(
        "photo",
        new File([new Uint8Array([1, 2, 3])], "fake.jpg", {
          type: "image/jpeg",
        }),
      );
      invalidForm.append("consentVersion", "2026-06-07");
      const invalidResponse = await fetch("/api/uploads", {
        method: "POST",
        body: invalidForm,
      });
      const deleteResponse = await fetch(`/api/uploads/${valid.data?.id}`, {
        method: "DELETE",
      });
      const deleted = await deleteResponse.json();
      const accessAfterDelete = await fetch(`/api/uploads/${valid.data?.id}`);
      const repeatedDeleteResponse = await fetch(
        `/api/uploads/${valid.data?.id}`,
        { method: "DELETE" },
      );
      const repeatedDelete = await repeatedDeleteResponse.json();

      return {
        consentOk: consent.ok,
        uploadOk: valid.ok,
        storage: valid.data?.storage,
        jobOk: job.ok,
        jobStatus: job.data?.status,
        resultKind: job.data?.resultKind,
        replayOk: replay.ok,
        replayed: replay.data?.idempotentReplay,
        sameJob: replay.data?.id === job.data?.id,
        queryOk: query.ok,
        querySameJob: query.data?.id === job.data?.id,
        queryHidesOwner: !("userId" in (query.data ?? {})),
        shareIntentOk: shareIntent.ok,
        rewardOk: reward.ok,
        rewardGranted: reward.data?.rewarded,
        rewardQuotaRemaining: reward.data?.quota?.remaining,
        shareIntentReplayOk: shareIntentReplay.ok,
        rewardReplayOk: rewardReplay.ok,
        rewardReplayGranted: rewardReplay.data?.rewarded,
        cancelStatus: cancelResponse.status,
        cancelCode: cancel.error?.code,
        retryStatus: retryResponse.status,
        retryCode: retry.error?.code,
        deleteJobOk: deletedJob.ok,
        deletedJobDiagnosis: deletedJob.data?.deletedDiagnosis,
        queryDeletedJobStatus: queryDeletedJobResponse.status,
        repeatedJobDeleteOk: repeatedJobDelete.ok,
        repeatedJobDeleteIdempotent: repeatedJobDelete.data?.alreadyDeleted,
        quotaRemaining: session.data?.quota?.remaining,
        lookCount: looks.data?.looks?.length,
        invalidStatus: invalidResponse.status,
        deleteOk: deleted.ok,
        deletedStatus: deleted.data?.status,
        accessAfterDeleteStatus: accessAfterDelete.status,
        repeatedDeleteOk: repeatedDelete.ok,
        repeatedDeleteIdempotent: repeatedDelete.data?.alreadyDeleted,
      };
    },
    [...minimalJpeg()],
  );
  if (
    !uploadApiResult.consentOk ||
    !uploadApiResult.uploadOk ||
    uploadApiResult.storage !== "mock-no-storage" ||
    !uploadApiResult.jobOk ||
    uploadApiResult.jobStatus !== "succeeded" ||
    uploadApiResult.resultKind !== "reference-fallback" ||
    !uploadApiResult.replayOk ||
    !uploadApiResult.replayed ||
    !uploadApiResult.sameJob ||
    !uploadApiResult.queryOk ||
    !uploadApiResult.querySameJob ||
    !uploadApiResult.queryHidesOwner ||
    !uploadApiResult.shareIntentOk ||
    !uploadApiResult.rewardOk ||
    !uploadApiResult.rewardGranted ||
    uploadApiResult.rewardQuotaRemaining !== 2 ||
    !uploadApiResult.shareIntentReplayOk ||
    !uploadApiResult.rewardReplayOk ||
    uploadApiResult.rewardReplayGranted !== false ||
    uploadApiResult.cancelStatus !== 409 ||
    uploadApiResult.cancelCode !== "JOB_NOT_CANCELLABLE" ||
    uploadApiResult.retryStatus !== 409 ||
    uploadApiResult.retryCode !== "JOB_NOT_RETRYABLE" ||
    !uploadApiResult.deleteJobOk ||
    uploadApiResult.deletedJobDiagnosis !== false ||
    uploadApiResult.queryDeletedJobStatus !== 404 ||
    !uploadApiResult.repeatedJobDeleteOk ||
    !uploadApiResult.repeatedJobDeleteIdempotent ||
    uploadApiResult.quotaRemaining !== 2 ||
    uploadApiResult.lookCount !== 44 ||
    uploadApiResult.invalidStatus !== 422 ||
    !uploadApiResult.deleteOk ||
    uploadApiResult.deletedStatus !== "deleted" ||
    uploadApiResult.accessAfterDeleteStatus !== 404 ||
    !uploadApiResult.repeatedDeleteOk ||
    !uploadApiResult.repeatedDeleteIdempotent
  ) {
    throw new Error(
      `同意与上传 API 烟雾测试失败：${JSON.stringify(uploadApiResult)}`,
    );
  }

  const pollingPage = await browser.newPage();
  await ensureSmokeAuth(pollingPage.context());
  let pollCount = 0;
  await pollingPage.route(/\/api\/tryon-jobs$/, (route) =>
    fulfillApi(route, mockJob("created", "mock-poll-job")),
  );
  await pollingPage.route(/\/api\/tryon-jobs\/mock-poll-job$/, (route) => {
    pollCount += 1;
    return fulfillApi(
      route,
      mockJob(pollCount >= 2 ? "succeeded" : "image_running", "mock-poll-job"),
    );
  });
  await runMockedUpload(pollingPage);
  await pollingPage.locator(".generated-result").waitFor({ state: "visible" });
  if (pollCount < 2) {
    throw new Error(`Free 工作台未持续轮询运行中任务，查询次数：${pollCount}`);
  }
  await pollingPage.close();

  const cancelRetryPage = await browser.newPage();
  await ensureSmokeAuth(cancelRetryPage.context());
  let cancelled = false;
  await cancelRetryPage.route(/\/api\/tryon-jobs$/, (route) =>
    fulfillApi(route, mockJob("image_running", "mock-cancel-job")),
  );
  await cancelRetryPage.route(/\/api\/tryon-jobs\/mock-cancel-job$/, (route) =>
    fulfillApi(
      route,
      mockJob(cancelled ? "cancelled" : "image_running", "mock-cancel-job"),
    ),
  );
  await cancelRetryPage.route(
    /\/api\/tryon-jobs\/mock-cancel-job\/cancel$/,
    (route) => {
      cancelled = true;
      return fulfillApi(route, mockJob("cancelled", "mock-cancel-job"));
    },
  );
  await cancelRetryPage.route(
    /\/api\/tryon-jobs\/mock-cancel-job\/retry$/,
    (route) => fulfillApi(route, mockJob("succeeded", "mock-retry-job")),
  );
  await runMockedUpload(cancelRetryPage);
  await cancelRetryPage.waitForFunction(
    () =>
      document.querySelector("[data-upload-percent]")?.textContent === "92%" &&
      !document.querySelector("[data-upload-cancel]")?.hidden,
  );
  await cancelRetryPage.locator("[data-upload-cancel]").click();
  await cancelRetryPage.waitForFunction(
    () =>
      document.querySelector("[data-upload-task]")?.dataset.state === "error" &&
      !document.querySelector("[data-upload-retry]")?.hidden,
  );
  await cancelRetryPage.locator("[data-upload-retry]").click();
  try {
    await cancelRetryPage
      .locator(".generated-result")
      .waitFor({ state: "visible" });
  } catch {
    const retryState = await cancelRetryPage.evaluate(() => ({
      taskState: document.querySelector("[data-upload-task]")?.dataset.state,
      status: document.querySelector("[data-upload-status]")?.textContent,
      retryHidden: document.querySelector("[data-upload-retry]")?.hidden,
      resultCount: document.querySelectorAll(".generated-result").length,
    }));
    throw new Error(`取消后重试未生成结果：${JSON.stringify(retryState)}`);
  }
  await cancelRetryPage.close();

  await desktop.route(/\/api\/session$/, (route) =>
    fulfillApi(route, {
      user: {
        id: "smoke-pro-user",
        kind: "account",
        email: "smoke-pro@example.com",
      },
      plan: "pro",
      subscription: {
        status: "active",
        currentPeriodEnd: "2026-07-01T00:00:00.000Z",
      },
      quota: {
        remaining: 2,
        total: 70,
        used: 68,
        periodStart: "2026-06-01T00:00:00.000Z",
        nextRefreshAt: "2026-07-01T00:00:00.000Z",
        shareRewardAvailableToday: false,
      },
    }),
  );
  await desktop.goto(`${baseUrl}/tryon-pro?look=french-natural-chic`, {
    waitUntil: "networkidle",
  });
  const proFrenchActive = desktop.locator(
    '#pro-content [data-look-slug="french-natural-chic"].active',
  );
  const proFrenchTitle = await proFrenchActive.getAttribute("data-look");
  if (
    !proFrenchTitle ||
    (await desktop.locator("[data-look-title]").textContent())?.trim() !==
      proFrenchTitle ||
    (await proFrenchActive.count()) !== 1
  ) {
    throw new Error("Pro 工作台未带入非精选妆容参数。");
  }
  await desktop.locator('#pro-content [data-look-slug="no-makeup"]').click();
  if (!desktop.url().includes("look=no-makeup")) {
    throw new Error("工作台选择妆容后未更新 URL 参数。");
  }
  const selectedLookTitle = (
    await desktop.locator("[data-look-title]").textContent()
  )?.trim();
  const selectedNoMakeupTitle = await desktop
    .locator('#pro-content [data-look-slug="no-makeup"].active')
    .getAttribute("data-look");
  if (!selectedNoMakeupTitle || selectedLookTitle !== selectedNoMakeupTitle) {
    throw new Error(
      `工作台选择妆容后未更新标题，实际为 ${selectedLookTitle ?? "空"}`,
    );
  }
  await desktop.unroute(/\/api\/session$/);

  await desktop.route(/\/api\/session$/, (route) =>
    fulfillApi(route, {
      user: {
        id: "smoke-premium-user",
        kind: "account",
        email: "smoke-premium@example.com",
      },
      plan: "premium",
      subscription: {
        status: "active",
        currentPeriodEnd: "2026-07-01T00:00:00.000Z",
      },
      quota: {
        remaining: 3,
        total: 150,
        used: 147,
        periodStart: "2026-06-01T00:00:00.000Z",
        nextRefreshAt: "2026-07-01T00:00:00.000Z",
        shareRewardAvailableToday: false,
      },
    }),
  );
  await desktop.goto(`${baseUrl}/tryon-premium?look=french-natural-chic`, {
    waitUntil: "networkidle",
  });
  const premiumFrenchActive = desktop.locator(
    '#prem-content [data-look-slug="french-natural-chic"].active',
  );
  const premiumFrenchTitle =
    await premiumFrenchActive.getAttribute("data-look");
  if (
    !premiumFrenchTitle ||
    (await desktop.locator("[data-look-title]").textContent())?.trim() !==
      premiumFrenchTitle ||
    (await premiumFrenchActive.count()) !== 1
  ) {
    throw new Error("Premium 工作台未带入选择器首屏外的妆容参数。");
  }
  await desktop.unroute(/\/api\/session$/);

  for (const viewport of [
    { width: 375, height: 812 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    const page = await browser.newPage({ viewport });
    for (const route of routes) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      await assertCompactNavigation(page, route, viewport.width);
      await assertUnifiedNavigation(page, route);
      await assertCompactFooter(page, route, viewport.width);
      await assertSingleAuthEntry(page, route, viewport.width);
      await assertSingleThemeToggle(page, route, viewport.width);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 1) {
        throw new Error(
          `${route} 在 ${viewport.width}px 视口存在 ${overflow}px 横向溢出`,
        );
      }
    }
    await page.close();
  }

  console.log(
    `浏览器烟雾测试通过：运行时变量与 D1/R2 绑定、13 个路由、暗黑模式、全站法律入口与 Cookie Consent、44 个妆容、筛选、无同意拦截、上传、删除原图/结果/诊断、任务查询/轮询/取消/重试、额度幂等、工作台切换、参数跳转和三档视口溢出检查。`,
  );
} finally {
  await browser.close();
}

function minimalJpeg() {
  return Buffer.from([
    0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x01, 0x00, 0x01, 0x00, 0x03,
    0x01, 0x11, 0x00, 0x02, 0x11, 0x00, 0x03, 0x11, 0x00, 0xff, 0xd9,
  ]);
}

async function ensureSmokeAuth(context) {
  if (!smokeAuthSession) {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const userId = `smoke_auth_${crypto.randomUUID()}`;
    const email = `${userId}@example.com`;
    const token = generateSmokeToken();
    const tokenHash = await hashSmokeToken(token);
    runLocalD1(`
      INSERT OR IGNORE INTO users (id, email, created_at, deleted_at)
      VALUES (${sql(userId)}, ${sql(email)}, ${sql(now.toISOString())}, NULL);
      INSERT OR IGNORE INTO auth_accounts
        (user_id, email, email_verified_at, password_hash, password_salt, created_at, updated_at)
      VALUES
        (${sql(userId)}, ${sql(email)}, ${sql(now.toISOString())}, NULL, NULL, ${sql(now.toISOString())}, ${sql(now.toISOString())});
      INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at)
      VALUES (${sql(crypto.randomUUID())}, ${sql(userId)}, ${sql(tokenHash)}, ${sql(now.toISOString())}, ${sql(expires.toISOString())});
    `);
    smokeAuthSession = { token, expires };
  }
  const url = new URL(baseUrl);
  await context.addCookies([
    {
      name: "abs_session",
      value: smokeAuthSession.token,
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      expires: Math.floor(smokeAuthSession.expires.getTime() / 1000),
    },
  ]);
}

function runLocalD1(command) {
  const tempDir = mkdtempSync(join(tmpdir(), "abs-smoke-"));
  const sqlFile = join(tempDir, "auth.sql");
  writeFileSync(sqlFile, command, "utf8");
  const wranglerArgs = [
    "wrangler",
    "d1",
    "execute",
    "DB",
    "--local",
    "--persist-to",
    "app/.wrangler/state",
    "--file",
    sqlFile,
    "--json",
  ];
  const executable = process.platform === "win32" ? "cmd.exe" : "npx";
  const args =
    process.platform === "win32"
      ? ["/c", "npx.cmd", ...wranglerArgs]
      : wranglerArgs;
  try {
    const result = spawnSync(executable, args, {
      encoding: "utf8",
      cwd: process.cwd(),
    });
    if (result.status !== 0) {
      throw new Error(
        `创建 smoke 登录会话失败：${result.error?.message || result.stderr || result.stdout}`,
      );
    }
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function sql(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateSmokeToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Buffer.from(bytes).toString("base64url");
}

async function hashSmokeToken(token) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function assertCompactNavigation(page, route, viewportWidth) {
  const navigation = page.locator(".site-header");
  if ((await navigation.count()) === 0) return;
  const height = await navigation
    .first()
    .evaluate((element) => element.getBoundingClientRect().height);
  if (height > 53 || height < 51) {
    throw new Error(
      `${route} 在 ${viewportWidth}px 视口的导航高度应为 52px，实际为 ${height}px`,
    );
  }
}

async function assertUnifiedNavigation(page, route) {
  if ((await page.locator(".workspace-header").count()) > 0) {
    throw new Error(`${route} 不应再渲染 WorkspaceHeader。`);
  }
  const header = page.locator(".site-header");
  if ((await header.count()) === 0) return;
  if (["/login", "/reset-password"].includes(route)) return;
  const headerText = (await header.textContent()) ?? "";
  for (const label of [
    copy.navigation.tryOn,
    copy.navigation.discover,
    copy.navigation.diagnosis,
    copy.navigation.pricing,
  ]) {
    if (!headerText.includes(label)) {
      throw new Error(`${route} 的全站导航缺少固定入口：${label}`);
    }
  }
  for (const businessCopy of [
    copy.workspace.remaining,
    copy.tryon.saveResult,
    copy.tryon.downloadHd,
  ]) {
    if (headerText.includes(businessCopy)) {
      throw new Error(`${route} 的全站导航不应包含业务操作：${businessCopy}`);
    }
  }
}

async function assertCompactFooter(page, route, viewportWidth) {
  const footer = page.locator(".site-footer");
  if ((await footer.count()) === 0) return;
  const height = await footer.evaluate(
    (element) => element.getBoundingClientRect().height,
  );
  const maxHeight =
    viewportWidth <= 700 ? 940 : viewportWidth <= 980 ? 780 : 420;
  if (height > maxHeight) {
    throw new Error(
      `${route} 在 ${viewportWidth}px 视口的页脚高度应不超过 ${maxHeight}px，实际为 ${height}px`,
    );
  }
}

async function assertSingleAuthEntry(page, route, viewportWidth) {
  const expected = ["/share-card", "/login", "/reset-password"].includes(route)
    ? 0
    : 1;
  const count = await page.locator("[data-auth-entry]").count();
  if (count !== expected) {
    throw new Error(
      `${route} 在 ${viewportWidth}px 视口应展示 ${expected} 个登录状态入口，实际为 ${count} 个`,
    );
  }
}

async function assertSingleThemeToggle(page, route, viewportWidth) {
  const expected = route === "/share-card" ? 0 : 1;
  const count = await page.locator("#theme-toggle").count();
  if (count !== expected) {
    throw new Error(
      `${route} 在 ${viewportWidth}px 视口应展示 ${expected} 个主题按钮，实际为 ${count} 个`,
    );
  }
}

async function assertDarkSurface(page, route, selector) {
  const result = await page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element);
      const declaration = `${style.backgroundColor} ${style.backgroundImage}`;
      const colors = [...declaration.matchAll(/rgba?\(([^)]+)\)/g)]
        .map((match) => match[1].split(/,\s*/).map(Number))
        .filter((channels) => channels.length >= 3 && channels[3] !== 0)
        .map((channels) => channels.slice(0, 3));
      return { declaration, colors };
    });
  if (
    result.colors.length === 0 ||
    result.colors.some((channels) => Math.max(...channels) > 130)
  ) {
    throw new Error(
      `${route} 的 ${selector} 未进入暗色表面：${result.declaration}`,
    );
  }
}

async function runMockedUpload(page) {
  await page.goto(`${baseUrl}/tryon-free`, { waitUntil: "networkidle" });
  await page.locator("[data-photo-consent]").check();
  const chooserPromise = page.waitForEvent("filechooser");
  await page.locator("[data-upload]").click();
  const chooser = await chooserPromise;
  await chooser.setFiles({
    name: "smoke-job-lifecycle.jpg",
    mimeType: "image/jpeg",
    buffer: minimalJpeg(),
  });
}

function mockJob(status, id) {
  const succeeded = status === "succeeded";
  return {
    id,
    status,
    lookSlug: "commute",
    lookTitle: "通勤清透妆",
    createdAt: "2026-06-07T00:00:00.000Z",
    updatedAt: "2026-06-07T00:00:01.000Z",
    ...(succeeded
      ? {
          completedAt: "2026-06-07T00:00:01.000Z",
          resultImage: "/images/look-commute.webp",
          resultKind: "reference-fallback",
          disclaimer: "烟雾测试参考效果",
        }
      : {}),
    quota: {
      remaining: 2,
      total: 3,
      used: 1,
      periodStart: "2026-06-01T00:00:00.000Z",
      nextRefreshAt: "2026-07-01T00:00:00.000Z",
    },
  };
}

function fulfillApi(route, data) {
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, data, requestId: "smoke-request" }),
  });
}
