import { handle } from "@astrojs/cloudflare/handler";

import type { RuntimeBindings } from "./lib/runtime";
import {
  getDirectImageNavigationResponse,
  getGoogleImageWorkerFirstPaths,
} from "./seo/googleImageDirectNavigation";

type WorkerEnv = RuntimeBindings & {
  ASSETS: Fetcher;
  SESSION: KVNamespace;
};

const googleImageWorkerFirstPaths = new Set(getGoogleImageWorkerFirstPaths());

export default {
  async fetch(
    request: Request,
    env: WorkerEnv,
    context: ExecutionContext,
  ): Promise<Response> {
    const directImageRedirect = getDirectImageNavigationResponse(request);
    if (directImageRedirect) return directImageRedirect;

    if (googleImageWorkerFirstPaths.has(new URL(request.url).pathname)) {
      return env.ASSETS.fetch(request);
    }

    return handle(request, env, context);
  },
} satisfies ExportedHandler<WorkerEnv>;
