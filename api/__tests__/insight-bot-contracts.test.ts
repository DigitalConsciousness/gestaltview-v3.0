import { describe, expect, it } from "vitest";
import {
  INSIGHT_BOT_SCHEMA_VERSION,
  assertInsightRuntimeResponse,
  parseInsightRuntimeRequest,
  toPublicInsightResponse,
  type InsightRuntimeResponse,
} from "../../shared/insight-bot/contracts";

const request = {
  schemaVersion: INSIGHT_BOT_SCHEMA_VERSION,
  requestId: "request-1",
  source: { channel: "discord", visibility: "public" },
  context: { originalText: "Keep my words intact.", publicContextOnly: true },
  consent: {
    allowCapture: false,
    allowArtifactProposal: false,
    allowMemoryUse: false,
  },
};

describe("Insight-Bot runtime contracts", () => {
  it("accepts a public, memory-isolated request", () => {
    expect(parseInsightRuntimeRequest(request).context.originalText).toBe(
      "Keep my words intact.",
    );
  });

  it("rejects private-memory use and non-public context", () => {
    expect(() =>
      parseInsightRuntimeRequest({
        ...request,
        consent: { ...request.consent, allowMemoryUse: true },
      }),
    ).toThrow(/private runtime memory/);
    expect(() =>
      parseInsightRuntimeRequest({
        ...request,
        context: { ...request.context, publicContextOnly: false },
      }),
    ).toThrow(/publicContextOnly/);
  });

  it("validates responses and strips artifact proposals from public output", () => {
    const response: InsightRuntimeResponse = {
      schemaVersion: INSIGHT_BOT_SCHEMA_VERSION,
      requestId: "request-1",
      content: "Something is here, but the frame is not settled yet.",
      trace: {
        traceId: "trace-1",
        generatedAt: new Date().toISOString(),
      },
      actions: [
        {
          kind: "artifact",
          status: "proposed",
          title: "Draft",
          body: "...",
          sourceRequestId: "request-1",
          requiresUserApproval: true,
        },
        {
          kind: "capture",
          status: "proposed",
          originalText: "Original",
          requiresUserApproval: true,
        },
      ],
    };
    expect(() => assertInsightRuntimeResponse(response)).not.toThrow();
    expect(toPublicInsightResponse(response).actions).toEqual([
      expect.objectContaining({ kind: "capture" }),
    ]);
  });
});
