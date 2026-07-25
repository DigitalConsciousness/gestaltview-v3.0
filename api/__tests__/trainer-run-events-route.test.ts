import { describe, expect, it, vi } from "vitest";

vi.mock("../trainer/_helpers.js", () => ({
  handleTrainerOptions: vi.fn(() => false),
  requireTrainerAdmin: vi.fn(async () => ({ id: "u1", email: "keithsoyka@gmail.com", tier: "pro", isAdmin: true })),
  extractRouteParam: vi.fn((value: string | string[] | undefined, key: string) => {
    const resolved = Array.isArray(value) ? value[0] : value;
    if (!resolved) {
      throw new Error(`Missing route parameter: ${key}`);
    }
    return resolved;
  }),
}));

vi.mock("../../server/agent-trainer/persistence.js", () => ({
  listTrainingRunEvents: vi.fn(async () => [
    {
      eventId: "evt-1",
      runId: "run-1",
      jobId: null,
      actorType: "system",
      actorId: null,
      eventType: "run_created",
      message: "Run created",
      payload: {},
      createdAt: "2026-04-15T00:00:00.000Z",
    },
  ]),
}));

import handler from "../trainer/runs/[id]/events";
import { listTrainingRunEvents } from "../../server/agent-trainer/persistence.js";

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

describe("trainer run events route", () => {
  it("returns run events for a valid GET request", async () => {
    const req = {
      method: "GET",
      query: { id: "run-1", limit: "4" },
      headers: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(listTrainingRunEvents).toHaveBeenCalledWith("run-1", 4);
    expect(res.body).toMatchObject({
      events: [
        {
          eventId: "evt-1",
          eventType: "run_created",
        },
      ],
    });
  });

  it("returns 400 when route parameter is missing", async () => {
    const req = {
      method: "GET",
      query: {},
      headers: {},
    };
    const res = createRes();

    await handler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({
      error: expect.stringContaining("Missing route parameter: id"),
    });
  });
});
