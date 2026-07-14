import { handle } from "@astrojs/cloudflare/handler";

import type { RuntimeBindings } from "./lib/runtime";
import { getDirectImageNavigationResponse } from "./seo/googleImageDirectNavigation";

type WorkerEnv = RuntimeBindings & {
  ASSETS: Fetcher;
  SESSION: KVNamespace;
};

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    context: ExecutionContext,
  ): Promise<Response> {
    const directImageRedirect = getDirectImageNavigationResponse(request);
    if (directImageRedirect) return directImageRedirect;

    return handle(request, env, context);
  },
} satisfies ExportedHandler<WorkerEnv>;
