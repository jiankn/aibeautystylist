// 本地受控验收专用：workerd 的出站 fetch 不读 HTTP(S)_PROXY 环境变量，
// 因此真实 AI 调用无法直接走本机代理。设置 OUTBOUND_PROXY_URL 后，worker 会把
// 出站请求转发给本机的 Node「出口中继」（workerd 可访问 127.0.0.1），由中继经系统
// 代理打到真实目标。生产环境不设置该变量时，AI 调用保持默认直连，行为不变。
export function createProxyFetcher(relayUrl: string): typeof fetch {
  return async (input, init) => {
    const request = new Request(input as RequestInfo, init);
    const headers = new Headers(request.headers);
    headers.set("x-egress-url", request.url);

    const method = request.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;

    return fetch(relayUrl, {
      method,
      headers,
      body,
      signal: request.signal,
    });
  };
}
