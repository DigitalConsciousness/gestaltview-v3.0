import type { VercelRequest, VercelResponse } from "@vercel/node";

import { sendJson } from "../_lib/response.js";
import { prepareJsonRoute, readBody } from "./_shared.js";
import {
  createChartSnapshotRenderer,
  type ChartSnapshotRenderer,
  type ChartSnapshotRequest,
} from "../../server/export/chartRenderAdapter.js";

type ChartSnapshotRouteRequest = ChartSnapshotRequest & {
  title?: string;
};

type ChartSnapshotHandlerOptions = {
  renderer?: ChartSnapshotRenderer;
};

export function createChartSnapshotHandler(options: ChartSnapshotHandlerOptions = {}) {
  const renderer = options.renderer ?? createChartSnapshotRenderer();

  return async function chartSnapshotHandler(req: VercelRequest, res: VercelResponse) {
    if (prepareJsonRoute(req, res, ["POST"])) return;

    const body = readBody<ChartSnapshotRouteRequest>(req);
    if (!isChartConfig(body.config)) {
      sendJson(res, 400, { error: "chart config is required" });
      return;
    }

    try {
      const renderRequest = {
        config: body.config,
        width: body.width,
        height: body.height,
        backgroundColor: body.backgroundColor,
        format: body.format ?? "png",
      } satisfies ChartSnapshotRequest;
      const buffer = await renderer.renderToBuffer(renderRequest);

      sendJson(res, 200, {
        fileName: `${sanitizeChartSnapshotFileName(body.title)}.png`,
        mimeType: "image/png",
        content: `data:image/png;base64,${buffer.toString("base64")}`,
        byteSize: buffer.byteLength,
        exportedAt: new Date().toISOString(),
      });
    } catch (error) {
      sendJson(res, 503, {
        error: "chart snapshot renderer unavailable",
        message: error instanceof Error ? error.message : "Chart snapshot rendering failed.",
      });
    }
  };
}

export function sanitizeChartSnapshotFileName(title: string | undefined): string {
  const base = (title ?? "chart-snapshot")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return base || "chart-snapshot";
}

function isChartConfig(value: unknown): value is ChartSnapshotRequest["config"] {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export default createChartSnapshotHandler();

