import { describe, expect, it, vi } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

vi.mock("../_lib/auth.js", () => ({
  getAuthUser: vi.fn(async () => ({ id: "test-user" })),
}));

vi.mock("../_lib/codexBridge.js", () => ({
  bridgeToCodex: vi.fn(async () => ({
    codex_artifact: { id: "codex-artifact-id" },
    warnings: [],
    validation_passed: true,
  })),
}));

vi.mock("../_lib/llmRouter.js", () => ({
  routeLlm: vi.fn(async () => ({
    response: "RENDERED_CONTENT",
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

describe("gen-engine artifacts API", () => {
  it("POST /api/gen-engine/artifacts uses routeLlm content as final artifact content", async () => {
    const { default: handler } = await import("../gen-engine/artifacts.js");
    const res = makeRes();

    await handler(makeReq({
      sourceCaptureIds: ["capture-1"],
      targetType: "markdown",
      synthesisStyle: "faithful",
      title: "Rendered Artifact",
      sourceText: "Source text for synthesis.",
      consent: { analyzeText: true },
    }), res);
    const json = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(json.artifact.content).toBe("RENDERED_CONTENT");
    expect(json.artifact.metadata.llmSynthesized).toBe(true);
  });
});
