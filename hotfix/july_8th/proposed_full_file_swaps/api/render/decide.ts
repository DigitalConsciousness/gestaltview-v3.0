import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getRenderer, SUPPORTED_ARTIFACT_KINDS } from "../../shared/rendering/index.js";

const MIME_BY_FORMAT: Record<string, string> = {
  html: "text/html; charset=utf-8",
  pdf: "application/pdf",
  json: "application/json; charset=utf-8",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mermaid: "text/plain; charset=utf-8",
  png: "image/png",
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
  const artifactKind = typeof body.artifactKind === "string"
    ? body.artifactKind
    : typeof body.kind === "string"
      ? body.kind
      : "";
  const format = typeof body.format === "string" ? body.format : "html";
  const content = body.content ?? body.body ?? "";

  if (!artifactKind.trim()) {
    res.status(400).json({
      ok: false,
      error: "Missing artifactKind.",
      supportedKinds: SUPPORTED_ARTIFACT_KINDS,
    });
    return;
  }

  const renderer = getRenderer(artifactKind);
  if (!renderer) {
    res.status(400).json({
      ok: false,
      error: `No renderer found for artifactKind: ${artifactKind}`,
      supportedKinds: SUPPORTED_ARTIFACT_KINDS,
    });
    return;
  }

  const supportedFormats = renderer.formats();
  if (!supportedFormats.includes(format)) {
    res.status(422).json({
      ok: false,
      error: `Renderer ${artifactKind} does not support format ${format}.`,
      supportedFormats,
    });
    return;
  }

  try {
    const artifact = await renderer.render(content as never, format);
    const contentType = MIME_BY_FORMAT[artifact.format] ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    if (Buffer.isBuffer(artifact.data)) {
      res.setHeader("Content-Disposition", `attachment; filename="artifact.${artifact.format}"`);
      res.status(200).send(artifact.data);
      return;
    }

    if (artifact.format === "json") {
      try {
        res.status(200).json(JSON.parse(String(artifact.data)));
      } catch {
        res.status(200).json({ ok: true, data: artifact.data });
      }
      return;
    }

    res.status(200).send(String(artifact.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[api/render/decide] render failed", { artifactKind, format, message });
    res.status(500).json({
      ok: false,
      error: "render_failed",
      message,
      artifactKind,
      format,
    });
  }
}
