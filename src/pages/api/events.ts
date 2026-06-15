import type { APIRoute } from "astro";

// 埋点事件接收端点。当前仅记录日志，后续可接入持久化存储。
export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = (await request.json()) as {
      event?: string;
      properties?: Record<string, unknown>;
    };

    // 开发模式：仅日志输出。
    if (payload?.event) {
      console.log("[Event]", payload.event, payload.properties || {});
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
