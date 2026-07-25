import { describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

vi.mock("../_lib/llmRouter.js", () => ({
  routeLlm: vi.fn(async () => ({
    response: "Led a team of 12 engineers, increasing delivery speed by 40% while preserving the user's exact voice like a compass.",
    provider: "mock-provider",
    timestamp: new Date().toISOString(),
    free: true,
    tokensUsed: null,
    processingTime: 1,
    metadata: {},
  })),
}));

function makeReq(body: unknown, method = "POST"): VercelRequest {
  return { method, body, headers: {} } as VercelRequest;
}

function makeRes() {
  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: "",
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    end(payload?: string) {
      this.body = payload ?? "";
      return this;
    },
  };
  return res as unknown as VercelResponse & typeof res;
}

describe("resume-rockstar API handlers", () => {
  it("POST /api/modules/resume-rockstar/analyze returns ATS > 60 and a valid grade", async () => {
    const { default: handler } = await import("../modules/resume-rockstar/analyze.js");
    const res = makeRes();

    handler(makeReq({ text: "Led managed developed implemented optimized delivery for a team of 12 engineers, increasing delivery speed by 40% with React TypeScript Node AWS Docker CI/CD microservices analytics across three projects." }), res);
    const json = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(json.ats.total).toBeGreaterThan(60);
    expect(["A+", "A", "B", "C", "D"]).toContain(json.ats.grade);
  });

  it("POST /api/modules/resume-rockstar/enhance returns ATS and PLK deltas", async () => {
    const { default: handler } = await import("../modules/resume-rockstar/enhance.js");
    const res = makeRes();

    await handler(makeReq({ text: "Led support work like a compass for teams." }), res);
    const json = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(json.enhanced).toContain("Led a team of 12 engineers");
    expect(json).toHaveProperty("atsDelta");
    expect(json).toHaveProperty("plkDelta");
  });
});
