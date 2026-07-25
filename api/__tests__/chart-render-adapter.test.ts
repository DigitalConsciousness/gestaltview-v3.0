import { describe, expect, it } from "vitest";

import {
  createChartSnapshotRenderer,
  normalizeChartSnapshotRequest,
  type ChartSnapshotRendererFactory,
} from "../../server/export/chartRenderAdapter.js";

describe("chart render adapter", () => {
  it("normalizes chart snapshot requests for deterministic server rendering", () => {
    const request = normalizeChartSnapshotRequest({
      config: { type: "bar", data: { labels: ["A"], datasets: [{ data: [7] }] } },
      width: 0,
      height: Number.NaN,
      backgroundColor: "transparent",
    });

    expect(request.width).toBe(800);
    expect(request.height).toBe(420);
    expect(request.format).toBe("png");
    expect(request.backgroundColor).toBe("transparent");
  });

  it("caches chart renderer instances by normalized size and background", async () => {
    const renders: string[] = [];
    const created: string[] = [];
    const factory: ChartSnapshotRendererFactory = async (options) => {
      created.push(`${options.width}x${options.height}:${options.backgroundColor}`);
      return {
        renderToBuffer: async (config) => {
          renders.push(String(config.type));
          return Buffer.from(`chart:${options.width}x${options.height}:${config.type}`);
        },
      };
    };
    const renderer = createChartSnapshotRenderer({ factory });
    const config = { type: "line", data: { labels: ["A"], datasets: [{ data: [1] }] } };

    const first = await renderer.renderToBuffer({ config, width: 640, height: 360, backgroundColor: "#020617" });
    const second = await renderer.renderToDataUrl({ config, width: 640, height: 360, backgroundColor: "#020617" });

    expect(first.toString("utf8")).toBe("chart:640x360:line");
    expect(second).toBe(`data:image/png;base64,${Buffer.from("chart:640x360:line").toString("base64")}`);
    expect(created).toEqual(["640x360:#020617"]);
    expect(renders).toEqual(["line", "line"]);
  });
});

