import { describe, expect, it } from "vitest";

import { parseNextGenRenderResponse } from "@/lib/nextGenRenderClient";

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
});
