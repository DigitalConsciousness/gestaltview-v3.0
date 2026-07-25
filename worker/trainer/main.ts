import { randomUUID } from "node:crypto";

import {
  cancelTrainerJob,
  claimTrainerJob,
  completeTrainerJob,
  failTrainerJob,
  heartbeatTrainerWorker,
  markTrainerWorkerIdle,
  markTrainerWorkerOffline,
  registerTrainerWorker,
} from "../../server/agent-trainer/persistence.js";
import { runTraining } from "../../server/agent-trainer/orchestrator.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const workerId = process.env.TRAINER_WORKER_ID || `trainer-worker-${randomUUID()}`;
  const idleDelayMs = Number(process.env.TRAINER_IDLE_DELAY_MS || 4_000);
  const heartbeatMs = Number(process.env.TRAINER_HEARTBEAT_MS || 12_000);
  let currentJobId: string | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  console.log(`[trainer-worker] starting ${workerId}`);
  await registerTrainerWorker({ workerId, status: "starting" }).catch(() => undefined);

  while (true) {
    try {
      await markTrainerWorkerIdle(workerId).catch(() => undefined);
      const job = await claimTrainerJob(workerId);

      if (!job) {
        await sleep(idleDelayMs);
        continue;
      }

      console.log(`[trainer-worker] claimed job ${job.jobId} for run ${job.runId}`);
      currentJobId = job.jobId;
      await heartbeatTrainerWorker({
        workerId,
        currentJobId: job.jobId,
        status: "busy",
      }).catch(() => undefined);
      heartbeatTimer = setInterval(() => {
        void heartbeatTrainerWorker({
          workerId,
          currentJobId: job.jobId,
          status: "busy",
        }).catch(() => undefined);
      }, heartbeatMs);

      const run = await runTraining(job.runId);
      if (run.status === "cancelled") {
        await cancelTrainerJob(job.jobId);
      } else {
        await completeTrainerJob(job.jobId);
      }
      currentJobId = null;
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      await markTrainerWorkerIdle(workerId).catch(() => undefined);
      console.log(`[trainer-worker] completed job ${job.jobId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[trainer-worker] failure", message);

      try {
        if (currentJobId) {
          await failTrainerJob(currentJobId, message);
          currentJobId = null;
        }
      } catch (secondaryError) {
        console.error("[trainer-worker] could not mark failure", secondaryError);
      }

       if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      await markTrainerWorkerIdle(workerId).catch(() => undefined);

      await sleep(idleDelayMs);
    }
  }
}

main().catch((error) => {
  console.error("[trainer-worker] fatal", error);
  const workerId = process.env.TRAINER_WORKER_ID;
  if (workerId) {
    void markTrainerWorkerOffline(workerId).catch(() => undefined);
  }
  process.exitCode = 1;
});
