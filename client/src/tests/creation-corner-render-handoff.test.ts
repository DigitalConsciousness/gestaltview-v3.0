import { readFile } from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";

import { projectRenderToInnerWorld } from "@/lib/renderProjectionClient";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Creation Corner canonical render handoff", () => {
  it("uses the canonical client and retains an explicit projection boundary", async () => {
    const source = await readFile(
      new URL("../pages/CreationCornerPage.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("submitNextGenRender({");
    expect(source).toContain("Local preview — not yet saved to the render ledger");
    expect(source).toContain("Project to Inner World");
    expect(source).toContain("projectRenderToInnerWorld({");
    expect(source).not.toContain('fetch(`${API_BASE}/render/engine`');
    expect(source).not.toContain("appendResultToInnerWorld");
    expect(source).not.toContain("All formats available");
  });

  it("requests an explicit Dynamic Inner World projection receipt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          projectedIds: ["projection-1"],
          skipped: [],
          targetRoom: "dynamic_inner_world",
          idempotent: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      projectRenderToInnerWorld({
        renderJobId: "33333333-3333-4333-8333-333333333333",
        title: "Projection proof",
      }),
    ).resolves.toMatchObject({
      ok: true,
      projectedIds: ["projection-1"],
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/render/promote-to-gallery",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: expect.stringContaining('"targetRoom":"dynamic_inner_world"'),
      }),
    );
  });

  it("keeps a failed projection actionable instead of claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: false,
            projectedIds: [],
            skipped: [],
            error: {
              code: "RENDER_JOB_NOT_READY",
              message: "Render job is rendering, not ready.",
            },
          }),
          { status: 409, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    await expect(
      projectRenderToInnerWorld({
        renderJobId: "33333333-3333-4333-8333-333333333333",
      }),
    ).rejects.toThrow("Render job is rendering, not ready.");
  });
});
