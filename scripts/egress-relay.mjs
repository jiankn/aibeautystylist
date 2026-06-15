// 本地「出口中继」：workerd 的出站 fetch 不读系统代理环境变量，
// 受控真实验收时由 worker 把出站请求发到本中继（127.0.0.1，workerd 可达），
// 中继读取 x-egress-url 头，按其转发到真实目标，并经 Node 的代理（NODE_USE_ENV_PROXY +
// HTTPS_PROXY）打到外网。仅用于本地验收，不参与生产。
import { createServer } from "node:http";
import { Buffer } from "node:buffer";
import { appendFileSync } from "node:fs";

const PORT = Number(process.env.EGRESS_RELAY_PORT ?? 10809);
// 可选调试：设置 EGRESS_DEBUG_LOG=路径 时，把 Evolink 任务查询的原始响应追加写入，
// 用于排查真实成本字段位置。默认关闭，不影响生产/常规验收。
const DEBUG_LOG = process.env.EGRESS_DEBUG_LOG;

const server = createServer((req, res) => {
  const target = req.headers["x-egress-url"];
  if (!target || typeof target !== "string") {
    res.writeHead(400, { "content-type": "text/plain" });
    res.end("missing x-egress-url");
    return;
  }

  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", async () => {
    const headers = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (
        key === "host" ||
        key === "x-egress-url" ||
        key === "content-length" ||
        key === "connection" ||
        key.startsWith("x-forwarded")
      ) {
        continue;
      }
      headers[key] = value;
    }

    const method = req.method ?? "GET";
    const hasBody = method !== "GET" && method !== "HEAD" && chunks.length > 0;

    try {
      const upstream = await fetch(target, {
        method,
        headers,
        body: hasBody ? Buffer.concat(chunks) : undefined,
      });
      const buffer = Buffer.from(await upstream.arrayBuffer());
      if (DEBUG_LOG && /\/v1\/tasks\//.test(target)) {
        try {
          appendFileSync(
            DEBUG_LOG,
            `\n=== ${new Date().toISOString()} ${target} (HTTP ${upstream.status}) ===\n${buffer.toString("utf8").slice(0, 4000)}\n`,
          );
        } catch {
          // 调试日志失败不影响主流程
        }
      }
      const outHeaders = {};
      upstream.headers.forEach((value, key) => {
        if (key === "content-encoding" || key === "transfer-encoding") return;
        outHeaders[key] = value;
      });
      res.writeHead(upstream.status, outHeaders);
      res.end(buffer);
    } catch (error) {
      res.writeHead(502, { "content-type": "text/plain" });
      res.end(`relay error: ${error?.message ?? error}`);
    }
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[egress-relay] listening on http://127.0.0.1:${PORT}`);
});
