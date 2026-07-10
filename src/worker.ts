import { handle } from "@astrojs/cloudflare/handler";

import { getDirectImageNavigationResponse } from "./seo/googleImageDirectNavigation";

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> {
    const directImageRedirect = getDirectImageNavigationResponse(request);
    if (directImageRedirect) return directImageRedirect;

    return handle(request, env, context);
  },
} satisfies ExportedHandler<Env>;
