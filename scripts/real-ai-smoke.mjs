// Controlled real-AI acceptance smoke test.
//
// 安全约束（默认不烧钱）：
// - 只有在显式设置 RUN_REAL_AI=1 时才会触发真实 Gemini / Evolink 付费调用。
// - 缺省直接退出，不发起任何真实调用，也不修改任何配置。
// - 只使用 1 张测试自拍（.local/smoke-selfie.jpg）。
// - 不打印 .dev.vars 内的真实密钥。
//
// 链路：写入照片同意 -> 上传自拍到 R2 -> 创建 tryon job（同步触发 Gemini 诊断 +
// Evolink 妆效图）-> 等待成功或降级 -> 校验私有结果可读 -> 删除结果与诊断 ->
// 校验删除后不可读 -> 审计 ai_call_logs。
//
// 用法：
//   $env:RUN_REAL_AI="1"; node scripts/real-ai-smoke.mjs
// 可选环境变量：
//   REAL_AI_BASE_URL   默认 http://127.0.0.1:4399
//   REAL_AI_LOOK_SLUG  默认 client-meeting-nude
//   REAL_AI_SELFIE     默认 .local/smoke-selfie.jpg

import { spawn } from "node:child_process";
import { readFile, writeFile, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { Buffer } from "node:buffer";

const CONSENT_VERSION = "2026-06-07";
const BASE_URL = process.env.REAL_AI_BASE_URL ?? "http://127.0.0.1:4399";
const PORT = new URL(BASE_URL).port || "4399";
const LOOK_SLUG = process.env.REAL_AI_LOOK_SLUG ?? "client-meeting-nude";
const SELFIE_PATH = process.env.REAL_AI_SELFIE ?? ".local/smoke-selfie.jpg";
const D1_PERSIST = "app/.wrangler/state";
const DEV_VARS = ".dev.vars";
const DEV_VARS_BACKUP = ".dev.vars.real-ai-smoke.bak";

// 人工目检模式：设置 REAL_AI_KEEP_ARTIFACTS=1 时，把原图、妆效图、诊断 JSON 落盘到
// .local/inspect/，生成并排对比 HTML，并跳过删除步骤以便保留产物供肉眼检查。
// 默认关闭（按 PRD 删除验证流程），产物目录已被 .gitignore 忽略（.local/）。
const KEEP_ARTIFACTS = process.env.REAL_AI_KEEP_ARTIFACTS === "1";
const INSPECT_DIR = ".local/inspect";

// 本机所有出站网络调用（含 worker 内部对 Gemini/Evolink 的 fetch）必须走本地 HTTP 代理，
// 否则会 UND_ERR_CONNECT_TIMEOUT。可用 REAL_AI_PROXY 覆盖。
const PROXY_URL = process.env.REAL_AI_PROXY ?? "http://127.0.0.1:10808";
const PROXY_ENV = {
  HTTP_PROXY: PROXY_URL,
  HTTPS_PROXY: PROXY_URL,
  http_proxy: PROXY_URL,
  https_proxy: PROXY_URL,
  NODE_USE_ENV_PROXY: "1",
  NO_PROXY: "127.0.0.1,localhost",
  no_proxy: "127.0.0.1,localhost",
};

// workerd 不读系统代理，因此 worker 出站请求先发到本机中继，再由中继经代理转发。
const RELAY_PORT = process.env.EGRESS_RELAY_PORT ?? "10809";
const RELAY_URL = `http://127.0.0.1:${RELAY_PORT}/`;

if (process.env.RUN_REAL_AI !== "1") {
  console.log(
    [
      "real-ai-smoke：未设置 RUN_REAL_AI=1，已安全退出，不触发任何真实付费调用。",
      "如需执行受控真实验收，请显式运行：",
      '  $env:RUN_REAL_AI="1"; node scripts/real-ai-smoke.mjs',
    ].join("\n"),
  );
  process.exit(0);
}

let cookie = "";
const steps = [];
let devServer;
let relayServer;
let devVarsSwapped = false;

function log(message) {
  console.log(`[real-ai-smoke] ${message}`);
}

function record(name, status, detail) {
  steps.push({ name, status, detail });
  log(
    `${status === "ok" ? "✓" : status === "info" ? "•" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`,
  );
}

function saveCookie(res) {
  for (const value of res.headers.getSetCookie?.() ?? []) {
    cookie = value.split(";")[0];
  }
}

function headers(extra = {}) {
  const merged = { ...extra, origin: BASE_URL };
  if (cookie) merged.cookie = cookie;
  return merged;
}

async function getJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers() });
  saveCookie(res);
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function postJson(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: headers({ "content-type": "application/json" }),
    body: JSON.stringify(payload),
  });
  saveCookie(res);
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function deleteJson(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: headers(),
  });
  saveCookie(res);
  return { status: res.status, body: await res.json().catch(() => null) };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// .dev.vars 临时切换为真实模式（UPLOAD_PROVIDER=r2、TRYON_PROVIDER=gemini），
// 退出时无条件还原，避免后续默认 smoke 误用真实模式。
async function enableRealModeDevVars() {
  const original = await readFile(DEV_VARS, "utf8");
  await writeFile(DEV_VARS_BACKUP, original, "utf8");
  devVarsSwapped = true;

  const lines = original.split(/\r?\n/);
  const setVar = (key, value) => {
    const index = lines.findIndex((line) => line.trim().startsWith(`${key}=`));
    if (index >= 0) lines[index] = `${key}=${value}`;
    else lines.push(`${key}=${value}`);
  };
  setVar("UPLOAD_PROVIDER", "r2");
  setVar("TRYON_PROVIDER", "gemini");
  setVar("OUTBOUND_PROXY_URL", RELAY_URL);
  await writeFile(DEV_VARS, lines.join("\n"), "utf8");
  log(
    ".dev.vars 已临时切换为真实模式（UPLOAD_PROVIDER=r2, TRYON_PROVIDER=gemini, OUTBOUND_PROXY_URL=中继）。",
  );
}

async function restoreDevVars() {
  if (!devVarsSwapped) return;
  try {
    const backup = await readFile(DEV_VARS_BACKUP, "utf8");
    await writeFile(DEV_VARS, backup, "utf8");
    await rm(DEV_VARS_BACKUP, { force: true });
    log(".dev.vars 已还原为安全默认配置。");
  } catch (error) {
    log(`警告：还原 .dev.vars 失败，请手动检查：${error.message}`);
  }
  devVarsSwapped = false;
}

async function startRelay() {
  relayServer = spawn("node", ["scripts/egress-relay.mjs"], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...PROXY_ENV, EGRESS_RELAY_PORT: RELAY_PORT },
  });
  relayServer.stdout.on("data", (chunk) => {
    if (process.env.REAL_AI_VERBOSE) process.stdout.write(`  [relay] ${chunk}`);
  });
  relayServer.stderr.on("data", (chunk) => {
    if (process.env.REAL_AI_VERBOSE) process.stderr.write(`  [relay] ${chunk}`);
  });
  await sleep(1_000);
  log(`出口中继已启动：${RELAY_URL}（经代理 ${PROXY_URL} 转发）。`);
}

function stopRelay() {
  if (!relayServer) return;
  try {
    relayServer.kill("SIGKILL");
  } catch {
    // already gone
  }
  relayServer = undefined;
}

async function startDevServer() {
  devServer = spawn(
    "npx",
    ["astro", "dev", "--host", "127.0.0.1", "--port", PORT],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, ...PROXY_ENV },
      shell: true,
    },
  );
  devServer.stdout.on("data", (chunk) => {
    if (process.env.REAL_AI_VERBOSE) process.stdout.write(`  [dev] ${chunk}`);
  });
  devServer.stderr.on("data", (chunk) => {
    if (process.env.REAL_AI_VERBOSE) process.stderr.write(`  [dev] ${chunk}`);
  });

  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.ok) return;
    } catch {
      // server not ready yet
    }
    await sleep(1_000);
  }
  throw new Error("dev server 启动超时");
}

async function stopDevServer() {
  if (!devServer) return;
  const pid = devServer.pid;
  await new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    devServer.once("exit", done);
    if (process.platform === "win32" && pid) {
      // shell:true 包了一层 cmd.exe，必须按进程树强杀，否则 dev server 残留并占用端口。
      spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
        shell: true,
      }).on("close", done);
    } else {
      devServer.kill("SIGTERM");
    }
    setTimeout(() => {
      try {
        devServer.kill("SIGKILL");
      } catch {
        // already gone
      }
      done();
    }, 8_000);
  });
  devServer = undefined;
}

function runWrangler(args) {
  return new Promise((resolve, reject) => {
    const quoted = args.map((arg) =>
      /[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg,
    );
    const child = spawn("npx", ["wrangler", ...quoted], {
      env: { ...process.env, WRANGLER_SEND_METRICS: "false", CI: "1" },
      shell: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.stdin.end("n\n");
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else
        reject(
          new Error(`wrangler ${args.join(" ")} 退出码 ${code}: ${stderr}`),
        );
    });
  });
}

async function queryAiCallLogs(userId) {
  const sql = `SELECT provider, operation, model, status, duration_ms, estimated_cost_micros, total_tokens, error_code FROM ai_call_logs WHERE user_id = '${userId.replace(/'/g, "''")}' ORDER BY created_at ASC;`;
  const output = await runWrangler([
    "d1",
    "execute",
    "DB",
    "--local",
    "--persist-to",
    D1_PERSIST,
    "--json",
    "--command",
    sql,
  ]);
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start < 0 || end < 0) return [];
  const parsed = JSON.parse(output.slice(start, end + 1));
  return parsed?.[0]?.results ?? [];
}

async function queryDiagnosisJson(jobId) {
  const sql = `SELECT result_json FROM diagnoses WHERE job_id = '${jobId.replace(/'/g, "''")}' LIMIT 1;`;
  const output = await runWrangler([
    "d1",
    "execute",
    "DB",
    "--local",
    "--persist-to",
    D1_PERSIST,
    "--json",
    "--command",
    sql,
  ]);
  const start = output.indexOf("[");
  const end = output.lastIndexOf("]");
  if (start < 0 || end < 0) return null;
  const parsed = JSON.parse(output.slice(start, end + 1));
  return parsed?.[0]?.results?.[0]?.result_json ?? null;
}

async function createSmokeAuthSession() {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const userId = `real_ai_smoke_${crypto.randomUUID()}`;
  const email = `${userId}@example.com`;
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const sql = [
    `INSERT OR IGNORE INTO users (id, email, created_at, deleted_at) VALUES (${quoteSql(userId)}, ${quoteSql(email)}, ${quoteSql(now.toISOString())}, NULL)`,
    `INSERT OR IGNORE INTO auth_accounts (user_id, email, email_verified_at, password_hash, password_salt, created_at, updated_at) VALUES (${quoteSql(userId)}, ${quoteSql(email)}, ${quoteSql(now.toISOString())}, NULL, NULL, ${quoteSql(now.toISOString())}, ${quoteSql(now.toISOString())})`,
    `INSERT INTO auth_sessions (id, user_id, token_hash, created_at, expires_at) VALUES (${quoteSql(crypto.randomUUID())}, ${quoteSql(userId)}, ${quoteSql(tokenHash)}, ${quoteSql(now.toISOString())}, ${quoteSql(expires.toISOString())})`,
  ].join("; ");
  await runWrangler([
    "d1",
    "execute",
    "DB",
    "--local",
    "--persist-to",
    D1_PERSIST,
    "--json",
    "--command",
    sql,
  ]);
  cookie = `abs_session=${token}`;
  return { userId, email };
}

function quoteSql(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return Buffer.from(bytes).toString("base64url");
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// 人工目检产物：保存原图、妆效图、诊断 JSON，并生成并排对比 HTML。
async function saveInspectionArtifacts({
  job,
  resultBuffer,
  resultContentType,
}) {
  await mkdir(INSPECT_DIR, { recursive: true });
  const ext = resultContentType.includes("webp")
    ? "webp"
    : resultContentType.includes("jpeg") || resultContentType.includes("jpg")
      ? "jpg"
      : "png";

  const selfieBytes = await readFile(SELFIE_PATH);
  const selfieExt = SELFIE_PATH.toLowerCase().endsWith(".png") ? "png" : "jpg";
  const beforeName = `before.${selfieExt}`;
  const afterName = `after.${ext}`;
  await writeFile(`${INSPECT_DIR}/${beforeName}`, selfieBytes);
  await writeFile(`${INSPECT_DIR}/${afterName}`, Buffer.from(resultBuffer));

  let diagnosis = null;
  try {
    const diagnosisJson = await queryDiagnosisJson(job.id);
    if (diagnosisJson) diagnosis = JSON.parse(diagnosisJson);
  } catch {
    // 诊断读取失败不阻塞产物保存
  }
  await writeFile(
    `${INSPECT_DIR}/diagnosis.json`,
    JSON.stringify(diagnosis ?? { note: "未取到诊断记录" }, null, 2),
    "utf8",
  );

  await writeFile(
    `${INSPECT_DIR}/compare.html`,
    inspectionHtml({
      job,
      beforeName,
      afterName,
      resultBytes: resultBuffer.byteLength,
    }),
    "utf8",
  );
  log(`人工目检产物已保存到 ${INSPECT_DIR}/（compare.html 可在浏览器打开）。`);
}

function inspectionHtml({ job, beforeName, afterName, resultBytes }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>妆效图人工目检对比</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f6f6f7; color: #1a1a1a; }
  h1 { font-size: 20px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
  .pair { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
  .col { flex: 1; min-width: 300px; }
  .col h2 { font-size: 14px; margin: 0 0 8px; }
  img { width: 100%; height: auto; border-radius: 8px; border: 1px solid #ddd; background: #fff; }
  .rubric { margin-top: 24px; background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
  .rubric h2 { font-size: 15px; }
  table { border-collapse: collapse; width: 100%; font-size: 13px; }
  th, td { border: 1px solid #e2e2e2; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #fafafa; }
</style>
</head>
<body>
  <h1>妆效图人工目检对比</h1>
  <div class="meta">
    jobId: ${job.id} ｜ 妆容: ${job.lookTitle ?? job.lookSlug ?? "n/a"} ｜ 结果图: ${resultBytes} 字节
  </div>
  <div class="pair">
    <div class="col"><h2>原图（before）</h2><img src="./${beforeName}" alt="原图" /></div>
    <div class="col"><h2>妆效图（after）</h2><img src="./${afterName}" alt="妆效图" /></div>
  </div>
  <div class="rubric">
    <h2>身份保持评分维度（1=差，5=好）</h2>
    <table>
      <tr><th>维度</th><th>看什么</th><th>评分</th></tr>
      <tr><td>是否同一个人</td><td>整体一眼看上去还是不是本人</td><td></td></tr>
      <tr><td>五官结构</td><td>眼/鼻/嘴/脸型位置和比例是否保持</td><td></td></tr>
      <tr><td>身份特征</td><td>年龄感、肤色深浅、脸型未被改变</td><td></td></tr>
      <tr><td>非妆容元素</td><td>发型、表情、背景、衣着、光线是否保留</td><td></td></tr>
      <tr><td>妆容真实度</td><td>底妆/腮红/眼妆/唇色是否自然、贴合脸</td><td></td></tr>
      <tr><td>瑕疵</td><td>有无变形、AI 伪影、多余人物、文字水印</td><td></td></tr>
    </table>
    <p>诊断结构化数据见同目录 diagnosis.json。</p>
  </div>
</body>
</html>`;
}

async function run() {
  if (!existsSync(SELFIE_PATH)) {
    throw new Error(`找不到测试自拍：${SELFIE_PATH}`);
  }

  await enableRealModeDevVars();
  log("正在启动出口中继...");
  await startRelay();
  log("正在启动 dev server（真实模式）...");
  await startDevServer();

  const health = await getJson("/api/health");
  const providers = health.body?.data?.providers ?? {};
  const bindings = health.body?.data?.bindings ?? {};
  if (
    providers.ai !== "gemini" ||
    providers.tryOnTask !== "gemini" ||
    providers.upload !== "r2" ||
    !bindings.d1 ||
    !bindings.r2
  ) {
    throw new Error(
      `真实模式环境未生效：${JSON.stringify({ providers, bindings })}`,
    );
  }
  record(
    "真实模式健康检查",
    "ok",
    "ai/tryOnTask=gemini, upload=r2, D1+R2 已绑定",
  );

  const smokeUser = await createSmokeAuthSession();
  const authSession = await getJson("/api/session");
  if (authSession.body?.data?.user?.kind !== "account") {
    throw new Error(`登录会话未生效：${JSON.stringify(authSession.body)}`);
  }
  record("创建登录会话", "ok", smokeUser.email);

  // 1. 写入照片同意
  const consent = await postJson("/api/consents/photo", {
    accepted: true,
    version: CONSENT_VERSION,
  });
  if (consent.status !== 200 || consent.body?.ok !== true) {
    throw new Error(`照片同意失败：${JSON.stringify(consent)}`);
  }
  record("写入照片同意", "ok");

  // 2. 上传自拍到 R2
  const selfie = await readFile(SELFIE_PATH);
  const form = new FormData();
  form.append(
    "photo",
    new Blob([selfie], { type: "image/jpeg" }),
    "real-ai-selfie.jpg",
  );
  form.append("consentVersion", CONSENT_VERSION);
  const uploadRes = await fetch(`${BASE_URL}/api/uploads`, {
    method: "POST",
    headers: headers(),
    body: form,
  });
  saveCookie(uploadRes);
  const upload = await uploadRes.json().catch(() => null);
  if (
    uploadRes.status !== 201 ||
    upload?.ok !== true ||
    upload.data?.storage !== "private-r2"
  ) {
    throw new Error(
      `上传到 R2 失败：${uploadRes.status} ${JSON.stringify(upload?.data ?? upload?.error)}`,
    );
  }
  const uploadId = upload.data.id;
  record("上传自拍到私有 R2", "ok", `uploadId=${uploadId}`);

  const sessionBefore = await getJson("/api/session");
  const quotaBefore = sessionBefore.body?.data?.quota?.remaining;
  record("记录初始额度", "info", `remaining=${quotaBefore}`);

  // 3+4+5. 创建任务（同步触发 Gemini 诊断 + Evolink 妆效图），等待成功或降级
  const idempotencyKey = crypto.randomUUID();
  const jobRes = await postJson("/api/tryon-jobs", {
    uploadId,
    lookSlug: LOOK_SLUG,
    idempotencyKey,
  });
  if (jobRes.status !== 201 || jobRes.body?.ok !== true) {
    throw new Error(
      `创建任务失败：${jobRes.status} ${JSON.stringify(jobRes.body?.error ?? jobRes.body)}`,
    );
  }
  const job = jobRes.body.data;
  record(
    "创建 tryon job（Gemini + Evolink）",
    "ok",
    `jobId=${job.id}, status=${job.status}, resultKind=${job.resultKind ?? "n/a"}`,
  );

  const quotaAfter = job.quota?.remaining;
  let result = {
    succeeded: job.status === "succeeded",
    resultKind: job.resultKind,
    errorCode: job.errorCode,
    aiGenerated: job.resultKind === "ai-generated",
    fallback: job.resultKind === "reference-fallback",
  };

  if (job.status === "failed") {
    // 失败不假装通过：保留失败原因并校验额度已返还。
    record(
      "Gemini 诊断链路失败",
      "info",
      `errorCode=${job.errorCode}; 额度 ${quotaBefore} -> ${quotaAfter}`,
    );
    if (quotaAfter !== quotaBefore) {
      record(
        "失败任务额度返还",
        "fail",
        `期望 ${quotaBefore}，实际 ${quotaAfter}`,
      );
    } else {
      record("失败任务额度返还", "ok", "额度未被错误消耗");
    }
  } else if (job.status === "succeeded") {
    record(
      "任务成功",
      "ok",
      result.aiGenerated
        ? "AI 已生成私有妆效图"
        : "图像生成不可用/失败，已降级为参考图",
    );

    if (result.aiGenerated) {
      // 校验私有结果图可读
      const resultRead = await fetch(
        `${BASE_URL}/api/tryon-jobs/${job.id}/result`,
        {
          headers: headers(),
        },
      );
      const buffer = await resultRead
        .arrayBuffer()
        .catch(() => new ArrayBuffer(0));
      if (resultRead.status !== 200 || buffer.byteLength <= 0) {
        record(
          "私有结果图可读",
          "fail",
          `status=${resultRead.status}, bytes=${buffer.byteLength}`,
        );
      } else {
        record(
          "私有结果图可读",
          "ok",
          `bytes=${buffer.byteLength}, type=${resultRead.headers.get("content-type")}`,
        );
        if (KEEP_ARTIFACTS) {
          await saveInspectionArtifacts({
            job,
            resultBuffer: buffer,
            resultContentType:
              resultRead.headers.get("content-type") ?? "image/png",
          });
        }
      }

      // 校验其它会话不可读
      const strangerRead = await fetch(
        `${BASE_URL}/api/tryon-jobs/${job.id}/result`,
        {
          headers: { origin: BASE_URL },
        },
      );
      record(
        "他人会话不可读结果",
        strangerRead.status === 404 ? "ok" : "fail",
        `status=${strangerRead.status}`,
      );
    }
  } else {
    record("任务状态异常", "fail", `status=${job.status}`);
  }

  // 6/7. 删除试妆结果与诊断、校验删除后不可读、删除原图
  // 人工目检模式下跳过删除，保留 R2 私有结果与诊断供后续检查（产物已落盘到本地）。
  if (KEEP_ARTIFACTS) {
    record(
      "人工目检模式：跳过删除",
      "info",
      `已保留任务 ${job.id} 的结果图与诊断；产物见 ${INSPECT_DIR}/。检查完请手动清理或重跑默认验收验证删除。`,
    );
  } else {
    // 6. 删除试妆结果与诊断
    const deleteJob = await deleteJson(`/api/tryon-jobs/${job.id}`);
    if (deleteJob.status !== 200 || deleteJob.body?.ok !== true) {
      record(
        "删除试妆结果与诊断",
        "fail",
        JSON.stringify(deleteJob.body?.error ?? deleteJob.body),
      );
    } else {
      record(
        "删除试妆结果与诊断",
        "ok",
        `deletedDiagnosis=${deleteJob.body.data?.deletedDiagnosis}`,
      );
    }

    // 7. 删除后结果不可读
    if (result.aiGenerated) {
      const afterDelete = await fetch(
        `${BASE_URL}/api/tryon-jobs/${job.id}/result`,
        {
          headers: headers(),
        },
      );
      record(
        "删除后结果不可读",
        afterDelete.status === 404 ? "ok" : "fail",
        `status=${afterDelete.status}`,
      );
    }
    const queryDeleted = await getJson(`/api/tryon-jobs/${job.id}`);
    record(
      "删除后任务不可查询",
      queryDeleted.status === 404 ? "ok" : "fail",
      `status=${queryDeleted.status}`,
    );

    // 删除原始自拍，避免遗留真实人脸图
    const deleteUpload = await deleteJson(`/api/uploads/${uploadId}`);
    record(
      "删除原始自拍",
      deleteUpload.status === 200 ? "ok" : "fail",
      `status=${deleteUpload.status}`,
    );
  }

  // 8. 审计 ai_call_logs：按 operation 区分诊断与图像调用（图像 provider 可能是 gemini 或 evolink）
  const userId = sessionBefore.body?.data?.user?.id;
  const logs = await queryAiCallLogs(userId);
  const jobLogs = logs.filter((entry) => entry !== null);
  const diagnosisLog = jobLogs.find((entry) => entry.operation === "diagnosis");
  const imageLog = jobLogs.find(
    (entry) => entry.operation === "image_generation",
  );

  if (!diagnosisLog) {
    record("ai_call_logs 记录诊断调用", "fail", "未找到诊断调用记录");
  } else {
    record(
      "ai_call_logs 记录诊断调用",
      "ok",
      `provider=${diagnosisLog.provider}, status=${diagnosisLog.status}, model=${diagnosisLog.model}, duration=${diagnosisLog.duration_ms}ms, tokens=${diagnosisLog.total_tokens ?? "n/a"}, error=${diagnosisLog.error_code ?? "none"}`,
    );
  }

  const diagnosisSucceeded = diagnosisLog?.status === "succeeded";
  if (!imageLog) {
    record(
      "ai_call_logs 记录图像调用",
      diagnosisSucceeded ? "fail" : "info",
      diagnosisSucceeded
        ? "诊断成功但缺少图像调用记录"
        : "诊断阶段失败/未连通，未进入图像阶段（符合预期）",
    );
  } else {
    const micros = imageLog.estimated_cost_micros;
    const cost =
      typeof micros === "number"
        ? imageLog.provider === "evolink"
          ? `${micros / 1_000_000} credits`
          : `${micros} micros`
        : "n/a";
    record(
      "ai_call_logs 记录图像调用",
      "ok",
      `provider=${imageLog.provider}, status=${imageLog.status}, model=${imageLog.model}, duration=${imageLog.duration_ms}ms, tokens=${imageLog.total_tokens ?? "n/a"}, cost=${cost}, error=${imageLog.error_code ?? "none"}`,
    );
  }

  return {
    job,
    result,
    quotaBefore,
    quotaAfter,
    diagnosisLog,
    imageLog,
  };
}

let summary;
let failure;
try {
  summary = await run();
} catch (error) {
  failure = error;
  record("受控真实验收", "fail", error.message);
} finally {
  await stopDevServer();
  stopRelay();
  await restoreDevVars();
}

console.log("\n================ real-ai-smoke 结论 ================");
const failed = steps.filter((step) => step.status === "fail");
for (const step of steps) {
  const icon = step.status === "ok" ? "✓" : step.status === "info" ? "•" : "✗";
  console.log(`${icon} ${step.name}${step.detail ? `：${step.detail}` : ""}`);
}

if (failure || failed.length > 0) {
  console.log("\n结果：未通过。请保留上述失败原因，不要直接标记为通过。");
  process.exit(1);
}

if (summary?.result?.aiGenerated) {
  const imageProvider = summary.imageLog?.provider ?? "AI";
  console.log(
    `\n结果：通过。Gemini 诊断 + ${imageProvider} 妆效图全链路成功，私有结果可读、删除后不可读，ai_call_logs 可审计。`,
  );
  process.exit(0);
}

if (summary?.job?.status === "failed") {
  console.log(
    [
      "\n结果：未通过（链路被阻塞）。",
      `诊断阶段失败：errorCode=${summary.job.errorCode}。`,
      "已确认：额度已正确返还、原图/任务已删除、失败也写入了 ai_call_logs（可审计）。",
      "请先排查诊断阶段阻塞点（模型、参数、上传 URL、size、image_urls、认证或网络出口），不要直接标记为通过。",
    ].join("\n"),
  );
  process.exit(1);
}

if (summary?.result?.fallback) {
  console.log(
    "\n结果：链路完成但未生成真实妆效图（已降级为参考图）。请检查图像 Provider 配置、模型、参数或认证后再判定。",
  );
  process.exit(1);
}

console.log("\n结果：未通过（未生成真实妆效图）。");
process.exit(1);
