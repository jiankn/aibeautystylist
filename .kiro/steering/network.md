---
inclusion: always
---

# 网络出口代理规则

本机访问外网（尤其是 Google / Gemini API）必须经本地代理，否则会连接超时。

- 代理类型：HTTP 代理
- 代理地址：`http://127.0.0.1:10808`
- 适用范围：**所有出站网络调用**都要走该代理，包括连通性探测、真实 AI 调用、依赖下载等需要访问外网的场景。
- 仅 `localhost` / `127.0.0.1` 等本机请求不需要走代理。

## 各场景用法

- 命令行（curl）：`curl -x http://127.0.0.1:10808 <url>`，或设置环境变量 `HTTP_PROXY` / `HTTPS_PROXY`。
- Node.js 全局 `fetch`（undici）：设置环境变量 `NODE_USE_ENV_PROXY=1` 并配合 `HTTPS_PROXY=http://127.0.0.1:10808`（Node 22+ 让内置 fetch 读取代理环境变量）。
- wrangler / workerd dev server：启动进程时注入 `HTTPS_PROXY=http://127.0.0.1:10808` 和 `HTTP_PROXY=http://127.0.0.1:10808`，使 worker 内部对 Google 等外网的 fetch 走代理。
- 受控真实验收脚本（`scripts/real-ai-smoke.mjs`）启动 dev server 时必须注入上述代理环境变量。

## 验证

- 连通性自检：`curl -x http://127.0.0.1:10808 -s -o NUL -w "%{http_code}" https://generativelanguage.googleapis.com/`，预期返回 404（连通正常）。
- 如出现 `UND_ERR_CONNECT_TIMEOUT` 或连接超时，先检查代理是否在 10808 端口运行，再排查其他问题。
