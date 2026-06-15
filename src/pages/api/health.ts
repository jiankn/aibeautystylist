import type { APIRoute } from "astro";

import { getRuntimeBindings } from "../../lib/runtime";

export const GET: APIRoute = () => {
  const bindings = getRuntimeBindings();
  return Response.json({
    ok: true,
    data: {
      service: "ai-beauty-stylist",
      locale: "zh-CN",
      providers: {
        ai: bindings.AI_PROVIDER,
        tryOnTask: bindings.TRYON_PROVIDER,
        upload: bindings.UPLOAD_PROVIDER,
        image: bindings.IMAGE_PROVIDER,
      },
      bindings: {
        d1: Boolean(bindings.DB),
        r2: Boolean(bindings.USER_UPLOADS),
      },
    },
  });
};
