import { describe, expect, it } from "vitest";
import actionsHandler from "../actions/[...path]";
import actionsHealthHandler from "../actions/health";
import providerStatusHandler from "../actions/providers/status";
import actionsEmbodimentProfilesHandler from "../actions/embodiment_profiles";
import actionsRuntimeHandler from "../actions/runtime";
import actionsFeaturesHandler from "../actions/features";
import actionsLogicHandler from "../actions/logic";
import { createAuthSessionCookie } from "../_lib/auth";

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
  function authCookie(tier: "free" | "core" | "pro" | "enterprise" = "core"): string {
    process.env.SESSION_SECRET = "actions-test-secret";
    return createAuthSessionCookie("actions@example.com", `actions-${tier}-user`, "user", tier);
  }

  it("returns health envelope", async () => {
    const req = {
      method: "GET",
      query: { path: ["health"] },
      headers: {},
      body: {},
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      version: "1.0.0",
      schemaVersion: "2.1.0",
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
      schemaVersion: "2.1.0",
      timestamp: expect.any(String),
    });
  });

  it("returns provider status from both the catch-all and explicit route", async () => {
    const catchAllReq = {
      method: "GET",
      query: { path: ["providers", "status"] },
      headers: {},
      body: {},
    };
    const catchAllRes = createRes();

    await actionsHandler(catchAllReq as never, catchAllRes as never);

    expect(catchAllRes.statusCode).toBe(200);
    expect(catchAllRes.body).toMatchObject({
      providers: expect.arrayContaining([
        expect.objectContaining({
          provider: "groq",
          available: expect.any(Boolean),
          priority: expect.any(Number),
        }),
      ]),
    });

    const directReq = { method: "GET", query: {}, headers: {}, body: {} };
    const directRes = createRes();

    await providerStatusHandler(directReq as never, directRes as never);

    expect(directRes.statusCode).toBe(200);
    expect(directRes.body).toMatchObject({
      providers: expect.arrayContaining([
        expect.objectContaining({
          provider: "openai",
          available: expect.any(Boolean),
          priority: expect.any(Number),
        }),
      ]),
    });
  });

  it("returns embodiment profiles through catch-all and explicit route files", async () => {
    const catchAllReq = {
      method: "GET",
      query: { path: ["embodiment_profiles"], slug: "billy" },
      headers: {},
      body: {},
    };
    const catchAllRes = createRes();

    await actionsHandler(catchAllReq as never, catchAllRes as never);

    expect(catchAllRes.statusCode).toBe(200);
    expect(catchAllRes.body).toMatchObject({
      schemaVersion: "2.1.0",
      importBaseUrl: "https://gestaltview-di-gsvw.vercel.app/api",
      profiles: [
        expect.objectContaining({
          slug: "billy",
          publicName: expect.any(String),
        }),
      ],
    });

    const directReq = { method: "GET", query: {}, headers: {}, body: {} };
    const directRes = createRes();

    await actionsEmbodimentProfilesHandler(
      directReq as never,
      directRes as never,
    );

    expect(directRes.statusCode).toBe(200);
    expect(directRes.body).toMatchObject({
      profileCount: expect.any(Number),
      profiles: expect.arrayContaining([
        expect.objectContaining({ slug: "billy" }),
      ]),
    });
  });

  it("returns runtime, feature, and logic manifests for GPT import grounding", async () => {
    const runtimeRes = createRes();
    await actionsRuntimeHandler(
      { method: "GET", query: {}, headers: {}, body: {} } as never,
      runtimeRes as never,
    );

    expect(runtimeRes.statusCode).toBe(200);
    expect(runtimeRes.body).toMatchObject({
      importBaseUrl: "https://gestaltview-di-gsvw.vercel.app/api",
      runtime: {
        actionServerUrl: "https://gestaltview-di-gsvw.vercel.app/api",
      },
      roomEmbodimentDefaults: expect.objectContaining({ billy: "billy" }),
    });

    const featuresRes = createRes();
    await actionsFeaturesHandler(
      { method: "GET", query: {}, headers: {}, body: {} } as never,
      featuresRes as never,
    );

    expect(featuresRes.statusCode).toBe(200);
    expect(featuresRes.body).toMatchObject({
      features: expect.arrayContaining([
        expect.objectContaining({
          id: "embodiment-profiles",
          status: "available",
        }),
      ]),
    });

    const logicRes = createRes();
    await actionsLogicHandler(
      { method: "GET", query: {}, headers: {}, body: {} } as never,
      logicRes as never,
    );

    expect(logicRes.statusCode).toBe(200);
    expect(logicRes.body).toMatchObject({
      logic: {
        routing: expect.arrayContaining([
          expect.stringContaining("embodiment_profiles"),
        ]),
        responseRules: expect.any(Array),
      },
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
    const req = {
      method: "POST",
      query: { path: ["chat"] },
      headers: {},
      body: {},
    };
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

  it("blocks anonymous advanced tribunal requests", async () => {
    const req = {
      method: "POST",
      query: { path: ["tribunal", "run"] },
      headers: {},
      body: { question: "what is coherent truth?" },
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      error: "upgrade_required",
      feature: "advanced_tribunal",
    });
  });

  it("blocks free-tier multi-participant tribunal requests", async () => {
    const req = {
      method: "POST",
      query: { path: ["tribunal", "run"] },
      headers: { cookie: authCookie("free") },
      body: {
        question: "what is coherent truth?",
        participants: ["billy", "the-architect"],
      },
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      error: "upgrade_required",
      feature: "advanced_tribunal",
    });
  });

  it("uses default tribunal participants for paid accounts when none are provided", async () => {
    const req = {
      method: "POST",
      query: { path: ["tribunal", "run"] },
      headers: { cookie: authCookie("core") },
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

  it("routes recognized Alice in Chains lyric fragments to ask_user instead of direct tribunal synthesis", async () => {
    process.env.SESSION_SECRET = "actions-test-secret";
    const req = {
      method: "POST",
      query: { path: ["tribunal", "run"] },
      headers: { cookie: authCookie("core") },
      body: { question: "Into the flood again, same old trip it was back then my way" },
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      provider: "cultural-preflight",
    });
    expect(JSON.stringify(res.body)).toContain("Alice in Chains");
  });

  it("returns 404 for unknown actions route", async () => {
    const req = {
      method: "GET",
      query: { path: ["unknown", "route"] },
      headers: {},
      body: {},
    };
    const res = createRes();

    await actionsHandler(req as never, res as never);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      error: "Unknown actions route: /actions/unknown/route",
    });
  });
});
