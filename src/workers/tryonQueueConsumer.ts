import type { RuntimeBindings } from "../lib/runtime";
import {
  processTryOnJobQueueMessage,
  type TryOnJobQueueMessage,
} from "../lib/tryonQueue";

export default {
  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      await processTryOnJobQueueMessage(message.body, env);
    }
  },
} satisfies ExportedHandler<RuntimeBindings, TryOnJobQueueMessage>;
