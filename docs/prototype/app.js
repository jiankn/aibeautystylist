const toast = document.querySelector(".toast") || document.createElement("div");
if (!toast.isConnected) {
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateQuotaDisplay(quota) {
  const quotaBar = document.querySelector("[data-quota-live]");
  if (!quotaBar || !quota) return;

  quotaBar.querySelector("[data-quota-remaining]").textContent = quota.remaining;
  quotaBar.querySelector("[data-quota-total]").textContent = quota.total;
  quotaBar.querySelector("[data-quota-meter]").style.width =
    `${Math.max(0, Math.min(100, (quota.remaining / quota.total) * 100))}%`;

  const refresh = quotaBar.querySelector("[data-quota-refresh]");
  if (refresh && quota.nextRefreshAt) {
    const refreshDate = new Intl.DateTimeFormat("zh-CN", {
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(quota.nextRefreshAt));
    refresh.textContent = `${refreshDate}刷新基础额度`;
  }
}

async function refreshQuotaDisplay() {
  if (!document.querySelector("[data-quota-live]")) return;
  const response = await fetch("/api/session");
  const session = await response.json();
  if (response.ok) updateQuotaDisplay(session.data.quota);
}

refreshQuotaDisplay().catch(() => {});

document.querySelectorAll("[data-toast]").forEach((el) => {
  el.addEventListener("click", (event) => {
    if (el.tagName === "A" && el.getAttribute("href") !== "#") return;
    event.preventDefault();
    showToast(el.dataset.toast);
  });
});

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const group = chip.closest(".filter-group");
    group.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    applyLookFilters();
  });
});

function applyLookFilters() {
  const selections = Object.fromEntries(
    [...document.querySelectorAll("[data-filter-group]")].map((group) => [
      group.dataset.filterGroup,
      group.querySelector(".filter-chip.active")?.dataset.filterValue || "全部",
    ]),
  );

  let visibleCount = 0;
  document.querySelectorAll("[data-look-card]").forEach((card) => {
    const matchesScenario =
      selections.scenario === "全部" || card.dataset.scenarios?.split("|").includes(selections.scenario);
    const matchesFinish =
      selections.finish === "全部" || card.dataset.finishes?.split("|").includes(selections.finish);
    const matchesExperience =
      selections.experience === "全部" || card.dataset.experience === selections.experience;
    const visible = matchesScenario && matchesFinish && matchesExperience;
    card.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  const summary = document.querySelector("[data-filter-summary]");
  if (summary) summary.textContent = `共找到 ${visibleCount} 个可直接试妆的妆容`;
  showToast(`已找到 ${visibleCount} 个妆容`);
}

document.querySelectorAll("[data-clear-filters]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter-group]").forEach((group) => {
      group.querySelectorAll(".filter-chip").forEach((chip) => chip.classList.remove("active"));
      group.querySelector('[data-filter-value="全部"]')?.classList.add("active");
    });
    applyLookFilters();
  });
});

document.querySelectorAll("[data-look-slug]").forEach((item) => {
  const selectLook = () => {
    const container = item.closest(".selector-list, .featured-grid");
    container?.querySelectorAll("[data-look-slug]").forEach((option) => option.classList.remove("active"));
    item.classList.add("active");
    document.querySelectorAll("[data-look-title]").forEach((title) => {
      title.textContent = item.dataset.look || "蜜桃气色";
    });
    document.querySelectorAll("[data-result-image]").forEach((image) => {
      if (item.dataset.lookImage) image.src = item.dataset.lookImage;
    });
    const url = new URL(window.location.href);
    url.searchParams.set("look", item.dataset.lookSlug);
    window.history.replaceState({}, "", url);
    showToast(`已选择“${item.dataset.look || "蜜桃气色"}”`);
  };

  item.addEventListener("click", selectLook);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectLook();
    }
  });
});

document.querySelectorAll("[data-photo-consent]").forEach((checkbox) => {
  const uploadButton = checkbox.closest(".upload-box")?.querySelector("[data-upload]");
  checkbox.addEventListener("change", () => {
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
  let controller;
  let lastFile;
  let idempotencyKey;

  const setUploadState = (
    message,
    progressValue,
    { state = "running", cancellable = false, retryable = false } = {},
  ) => {
    if (!task) return;
    task.hidden = false;
    task.dataset.state = state;
    status.textContent = message;
    percent.textContent = `${progressValue}%`;
    progress.style.width = `${progressValue}%`;
    cancelButton.hidden = !cancellable;
    retryButton.hidden = !retryable;
  };

  const runUpload = async (file) => {
    if (!file) return;
    lastFile = file;
    idempotencyKey ||= crypto.randomUUID();
    const originalLabel = button.textContent;
    controller = new AbortController();
    button.disabled = true;
    button.textContent = "正在校验并安全上传…";
    setUploadState("正在确认照片处理授权…", 12, { cancellable: true });

    try {
      const consentResponse = await fetch("/api/consents/photo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accepted: true, version: "2026-06-07" }),
        signal: controller.signal,
      });
      if (!consentResponse.ok) throw new Error("CONSENT_FAILED");
      setUploadState("正在校验图片并安全上传…", 38, { cancellable: true });

      const formData = new FormData();
      formData.append("photo", file);
      formData.append("consentVersion", "2026-06-07");
      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const result = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(result.error?.message || "UPLOAD_FAILED");

      button.dataset.uploadId = result.data.id;
      button.textContent = "正在生成参考效果…";
      controller = undefined;
      setUploadState("照片校验通过，正在生成参考效果…", 76);
      const activeLook = document.querySelector("[data-look-slug].active");
      const jobResponse = await fetch("/api/tryon-jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          uploadId: result.data.id,
          lookSlug: activeLook?.dataset.lookSlug,
          idempotencyKey,
        }),
      });
      const job = await jobResponse.json();
      if (!jobResponse.ok) throw new Error(job.error?.message || "TRYON_FAILED");

      const resultTarget = document.querySelector("[data-result-target]");
      if (resultTarget) {
        const wrapper = document.createElement("div");
        wrapper.className = "generated-result";
        const image = document.createElement("img");
        image.src = job.data.resultImage;
        image.alt = `${job.data.lookTitle}参考效果`;
        const badge = document.createElement("span");
        badge.className = "pill pill-teal";
        badge.textContent = "参考效果";
        const message = document.createElement("p");
        message.textContent = job.data.disclaimer;
        wrapper.append(badge, image, message);
        resultTarget.replaceChildren(wrapper);
      }
      updateQuotaDisplay(job.data.quota);
      setUploadState("参考效果已生成", 100, { state: "success" });
      showToast("参考效果已生成，真实 AI 上脸效果将在服务接入后启用");
    } catch (error) {
      const aborted = error.name === "AbortError";
      const errorMessage = aborted
        ? "上传已取消，可重新选择或重试"
        : error.message === "UPLOAD_FAILED" || error.message === "TRYON_FAILED"
          ? "处理失败，请稍后重试"
          : error.message;
      setUploadState(errorMessage, 0, {
        state: "error",
        retryable: true,
      });
      showToast(errorMessage);
    } finally {
      controller = undefined;
      button.textContent = originalLabel;
      button.disabled = !uploadBox?.querySelector("[data-photo-consent]")?.checked;
    }
  };

  button.addEventListener("click", async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.addEventListener("change", async () => {
      if (input.files?.length) {
        idempotencyKey = crypto.randomUUID();
        await runUpload(input.files[0]);
      }
    });
    input.click();
  });

  cancelButton?.addEventListener("click", () => controller?.abort());
  retryButton?.addEventListener("click", () => runUpload(lastFile));
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
