import { describe, expect, it } from "vitest";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import type { ChartSnapshotRenderer } from "../../server/export/chartRenderAdapter.js";

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

describe("chart snapshot API", () => {
  it("returns a PNG data URL from the injected chart snapshot renderer", async () => {
    const { createChartSnapshotHandler } = await import("../gen-engine/chart-snapshot.js");
    const calls: unknown[] = [];
    const renderer: ChartSnapshotRenderer = {
      renderToBuffer: async (request) => {
        calls.push(request);
        return Buffer.from("chart-png");
      },
      renderToDataUrl: async () => {
        throw new Error("route should call renderToBuffer so byte size remains deterministic");
      },
    };
    const handler = createChartSnapshotHandler({ renderer });
    const res = makeRes();

    await handler(
      makeReq({
        title: "Revenue Snapshot",
        config: { type: "bar", data: { labels: ["Q1"], datasets: [{ data: [42] }] } },
        width: 640,
        height: 360,
        backgroundColor: "#020617",
      }),
      res,
    );

    const json = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(json).toMatchObject({
      fileName: "revenue-snapshot.png",
      mimeType: "image/png",
      content: `data:image/png;base64,${Buffer.from("chart-png").toString("base64")}`,
      byteSize: Buffer.byteLength("chart-png"),
    });
    expect(json.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(calls).toEqual([
      {
        config: { type: "bar", data: { labels: ["Q1"], datasets: [{ data: [42] }] } },
        width: 640,
        height: 360,
        backgroundColor: "#020617",
        format: "png",
      },
    ]);
  });

  it("rejects requests without a chart config", async () => {
    const { createChartSnapshotHandler } = await import("../gen-engine/chart-snapshot.js");
    const handler = createChartSnapshotHandler({
      renderer: {
        renderToBuffer: async () => Buffer.from("unused"),
        renderToDataUrl: async () => "unused",
      },
    });
    const res = makeRes();

    await handler(makeReq({ title: "Missing Config" }), res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body)).toEqual({ error: "chart config is required" });
  });
});

