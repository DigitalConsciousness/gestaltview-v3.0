import { describe, expect, it, vi } from "vitest";

vi.mock("../trainer/_helpers.js", () => ({
  handleTrainerOptions: vi.fn(() => false),
  requireTrainerAdmin: vi.fn(async () => ({ id: "u1", email: "keithsoyka@gmail.com", tier: "pro", isAdmin: true })),
}));

vi.mock("../../server/agent-trainer/persistence.js", () => ({
  getTrainerQueueHealth: vi.fn(async () => {
    throw new Error("trainer_queue_health_timeout");
  }),
}));

import handler from "../trainer/queue-health";

type MockRes = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string | Buffer) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string | Buffer) {
      if (typeof value === "string") {
        this.body = JSON.parse(value);
        return;
      }
      this.body = value ?? null;
    },
  };
}

describe("trainer queue-health route", () => {
  it("falls back to an empty health snapshot when the health check times out", async () => {
    const req = {
      method: "GET",
      headers: {},
      query: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      queueHealth: {
        queuedCount: 0,
        leasedCount: 0,
        retryWaitCount: 0,
        failedCount: 0,
        awaitingReviewCount: 0,
        staleLeaseCount: 0,
        onlineWorkerCount: 0,
        offlineWorkerCount: 0,
        oldestQueuedAt: null,
        oldestQueuedAgeMs: null,
        workers: [],
        staleJobs: [],
      },
    });
  });
});
