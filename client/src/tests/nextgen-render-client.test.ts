import { afterEach, describe, expect, it, vi } from "vitest";

import {
  parseNextGenRenderResponse,
  submitNextGenRender,
} from "@/lib/nextGenRenderClient";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("NextGen render response parsing", () => {
  it("accepts the render engine's HTML output as a successful manifest", async () => {
    const result = await parseNextGenRenderResponse(
      new Response("<!doctype html><html><body>Rendered</body></html>", {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
      }),
      "job-1",
    );

    expect(result).toMatchObject({
      ok: true,
      jobId: "job-1",
      output: {
        format: "html",
        contentType: "text/html; charset=utf-8",
        previewAvailable: true,
      },
    });
  });

  it("reports a useful error for an HTML error page instead of throwing JSON parse noise", async () => {
    await expect(
      parseNextGenRenderResponse(
        new Response("<!doctype html><html><body>Not found</body></html>", {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        "job-404",
      ),
    ).rejects.toThrow("NextGen render returned 404");
  });

  it("submits the exact versioned v2 contract", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          job: { id: "job-v2", graphId: "graph-v2", status: "ready" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await submitNextGenRender({
      sceneGraph: {
        schema: "nextgen.scene-graph.v1",
        graphId: "graph-v2",
        nodes: [],
        edges: [],
      },
    });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(init.body))).toMatchObject({
      contractVersion: "gestaltview.render-request.v2",
      sourceFamily: "scene_graph",
      sceneGraph: { graphId: "graph-v2" },
    });
  });
});
