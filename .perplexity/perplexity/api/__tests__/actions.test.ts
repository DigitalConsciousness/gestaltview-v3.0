import { describe, expect, it } from "vitest";
import actionsHandler from "../actions/[...path]";
import actionsHealthHandler from "../actions/health";
import providerStatusHandler from "../actions/providers/status";

type MockRes = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  status: (code: number) => MockRes;
  setHeader: (key: string, value: string) => MockRes;
  end: (value?: string) => void;
};

function createRes(): MockRes {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
      return this;
    },
    end(value?: string) {
      this.body = value ? JSON.parse(value) : null;
    },
  };
}

describe("actions API routes", () => {
  it("returns health envelope", async () => {
    const req = { method: "GET", query: { path: ["health"] }, headers: {}, body: {} };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      version: "1.0.0",
      schemaVersion: "2.0.0",
      timestamp: expect.any(String),
    });
  });

  it("handles the explicit health route file", async () => {
    const req = { method: "GET", query: {}, headers: {}, body: {} };
    const res = createRes();

    await actionsHealthHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      version: "1.0.0",
      schemaVersion: "2.0.0",
      timestamp: expect.any(String),
    });
  });

  it("returns provider status from both the catch-all and explicit route", async () => {
    const catchAllReq = { method: "GET", query: { path: ["providers", "status"] }, headers: {}, body: {} };
    const catchAllRes = createRes();

    await actionsHandler(catchAllReq as never, catchAllRes as never);

    expect(catchAllRes.statusCode).toBe(200);
    expect(catchAllRes.body).toMatchObject({
      providers: expect.arrayContaining([
        expect.objectContaining({ provider: "groq", available: expect.any(Boolean), priority: expect.any(Number) }),
      ]),
    });

    const directReq = { method: "GET", query: {}, headers: {}, body: {} };
    const directRes = createRes();

    await providerStatusHandler(directReq as never, directRes as never);

    expect(directRes.statusCode).toBe(200);
    expect(directRes.body).toMatchObject({
      providers: expect.arrayContaining([
        expect.objectContaining({ provider: "openai", available: expect.any(Boolean), priority: expect.any(Number) }),
      ]),
    });
  });

  it("handles preflight requests", async () => {
    const req = { method: "OPTIONS", query: {}, headers: {}, body: {} };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.headers["Access-Control-Allow-Origin"]).toBe("*");
  });

  it("validates required message for chat", async () => {
    const req = { method: "POST", query: { path: ["chat"] }, headers: {}, body: {} };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "message is required" });
  });

  it("handles billy synthesize and normalizes topK metadata", async () => {
    const req = {
      method: "POST",
      query: { path: ["billy", "synthesize"] },
      headers: { "x-user-id": " user-123 " },
      body: { query: "map this idea", topK: 99, sectionId: "core" },
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      provider: "test-provider",
      userId: "user-123",
      metadata: {
        sectionId: "core",
        topK: 12,
        mode: "synthesize",
      },
    });
  });

  it("uses default tribunal participants when none are provided", async () => {
    const req = {
      method: "POST",
      query: { path: ["tribunal", "run"] },
      headers: {},
      body: { question: "what is coherent truth?" },
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      provider: "test-provider",
      metadata: {
        participants: ["gemini", "openai", "anthropic"],
      },
    });
  });

  it("returns 404 for unknown actions route", async () => {
    const req = { method: "GET", query: { path: ["unknown", "route"] }, headers: {}, body: {} };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Unknown actions route: /actions/unknown/route" });
  });
});
