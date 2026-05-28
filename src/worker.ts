/**
 * Cloudflare Worker 自定义入口
 *
 * - fetch：交给 Astro 标准 handler 处理。
 * - scheduled：Cron Trigger 自动清理超过 24 小时的 R2 自拍对象，
 *   避免无人调用 /api/admin/cleanup-uploads 导致用户上传积压。
 *
 * 在 wrangler.jsonc 中通过 `main` 指向当前文件，并通过 `triggers.crons`
 * 配置调度表达式（默认每小时运行一次）。
 */
import { handle } from '@astrojs/cloudflare/handler';
import type { RuntimeEnv } from './lib/cloudflare/runtime';
import { cleanupStoredPhotosOlderThan } from './lib/repositories/tryOnJobRepository';

// 最小化 Workers runtime 类型，避免引入 @cloudflare/workers-types 全局污染。
interface WorkerExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}
interface WorkerScheduledController {
  cron: string;
  scheduledTime: number;
  noRetry?: () => void;
}

type WorkerEnv = RuntimeEnv & Record<string, unknown>;

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: WorkerExecutionContext): Promise<Response> {
    return handle(request, env, ctx);
  },
  scheduled(event: WorkerScheduledController, env: WorkerEnv, ctx: WorkerExecutionContext): void {
    ctx.waitUntil(runScheduledCleanup(event, env));
  },
};

async function runScheduledCleanup(event: WorkerScheduledController, env: WorkerEnv): Promise<void> {
  const cron = event.cron;
  const startedAt = new Date().toISOString();
  try {
    const result = await cleanupStoredPhotosOlderThan(env, {
      olderThanHours: 24,
      limit: 200,
      dryRun: false,
    });
    console.log(
      `[cron ${cron}] cleanup-uploads ok startedAt=${startedAt} candidates=${result.keys.length} deleted=${result.deletedPhotoKeys.length} cutoff=${result.cutoff}`,
    );
  } catch (error) {
    console.error(`[cron ${cron}] cleanup-uploads failed startedAt=${startedAt}`, error);
  }
}
