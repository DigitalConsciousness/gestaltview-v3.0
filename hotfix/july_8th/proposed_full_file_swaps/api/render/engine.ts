import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getRenderer } from "../../shared/rendering/index.js";

type SceneGraphNode = {
  id?: string;
  type?: string;
  name?: string;
  props?: Record<string, unknown>;
};

type SceneGraph = {
  graphId?: string;
  schema?: string;
  metadata?: Record<string, unknown>;
  nodes?: SceneGraphNode[];
};

function parseBody(req: VercelRequest): Record<string, unknown> {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return req.body as Record<string, unknown>;
}

function graphToMarkdown(graph: SceneGraph): string {
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const title = graph.graphId ?? "GestaltView Render Package";

  const renderedNodes = nodes.map((node) => {
    const type = node.type ?? "Node";
    const name = node.name ?? node.id ?? "Untitled";
    const props = node.props ?? {};

    if (typeof props.source === "string") {
      return `## ${name}\n\n${props.source}`;
    }

    if (typeof props.title === "string") {
      return `## ${name}\n\n${props.title}`;
    }

    return [
      `## ${name}`,
      "",
      `- Type: ${type}`,
      `- ID: ${node.id ?? "unknown"}`,
      "",
      "```json",
      JSON.stringify(props, null, 2),
      "```",
    ].join("\n");
  });

  return [
    `# ${title}`,
    "",
    graph.metadata?.purpose ? `> ${String(graph.metadata.purpose)}` : "",
    "",
    renderedNodes.join("\n\n---\n\n"),
  ].join("\n").trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ ok: false, error: "Method not allowed. Use POST." });
    return;
  }

  const body = parseBody(req);
  const graph = (body.graph ?? body) as SceneGraph;
  const jobId = String(body.jobId ?? `render_${Date.now()}`);
  const format = typeof body.format === "string" ? body.format : "html";

  try {
    const markdown = graphToMarkdown(graph);
    const renderer = getRenderer("markdown");

    if (!renderer) {
      res.status(200).json({
        ok: true,
        jobId,
        fallback: true,
        graph,
        outputs: {
          markdown,
        },
        diagnostics: [
          {
            level: "warn",
            message: "Markdown renderer unavailable; returned normalized graph markdown.",
          },
        ],
      });
      return;
    }

    const rendered = await renderer.render(markdown as never, format === "json" ? "json" : "html");
    const isBuffer = Buffer.isBuffer(rendered.data);

    res.setHeader(
      "Content-Type",
      rendered.format === "html"
        ? "text/html; charset=utf-8"
        : rendered.format === "json"
          ? "application/json; charset=utf-8"
          : "application/octet-stream",
    );

    if (isBuffer) {
      res.status(200).send(rendered.data);
      return;
    }

    if (rendered.format === "json") {
      try {
        res.status(200).json(JSON.parse(String(rendered.data)));
      } catch {
        res.status(200).json({ ok: true, jobId, data: rendered.data });
      }
      return;
    }

    res.status(200).send(String(rendered.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/render/engine] render failed", { jobId, message });
    res.status(500).json({
      ok: false,
      error: "render_engine_failed",
      message,
      jobId,
    });
  }
}
