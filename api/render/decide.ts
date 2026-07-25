import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getRenderer, SUPPORTED_ARTIFACT_KINDS } from "../../shared/rendering/index.js";

const MIME_BY_FORMAT: Record<string, string> = {
  html: "text/html",
  pdf: "application/pdf",
  json: "application/json",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mermaid: "text/plain; charset=utf-8",
  png: "image/png",
};

type ArtifactBlock = {
  type?: string;
  markdown?: string;
  text?: string;
  content?: string;
};

type SectionedArtifact = {
  title?: string;
  summary?: string;
  body?: {
    summary?: string;
    sections?: ArtifactBlock[];
    appendix?: string[];
  };
};

function blockToMarkdown(block: ArtifactBlock, index: number): string {
  if (typeof block.markdown === "string" && block.markdown.trim()) {
    return block.markdown.trim();
  }

  if (typeof block.text === "string" && block.text.trim()) {
    return `## Section ${index + 1}\n\n${block.text.trim()}`;
  }

  if (typeof block.content === "string" && block.content.trim()) {
    return `## Section ${index + 1}\n\n${block.content.trim()}`;
  }

  return `## Section ${index + 1}\n\n\`\`\`json\n${JSON.stringify(block, null, 2)}\n\`\`\``;
}

function normalizeRendererContent(artifactKind: string, content: unknown): unknown {
  if (typeof content === "string" || !content || typeof content !== "object") {
    return content;
  }

  if (!["report_document", "session_recap", "blueprint", "spatial_scene", "markdown"].includes(artifactKind)) {
    return content;
  }

  const artifact = content as SectionedArtifact;
  const sections = Array.isArray(artifact.body?.sections) ? artifact.body.sections : [];

  if (sections.length === 0) {
    return content;
  }

  const summary = artifact.body?.summary ?? artifact.summary ?? "";
  const appendix = Array.isArray(artifact.body?.appendix) && artifact.body.appendix.length > 0
    ? `\n\n## Appendix\n\n${artifact.body.appendix.map((item) => `- ${item}`).join("\n")}`
    : "";

  return [
    artifact.title ? `# ${artifact.title}` : "",
    summary ? `\n${summary}` : "",
    sections.map((block, index) => blockToMarkdown(block, index)).join("\n\n"),
    appendix,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { artifactKind, content, format } = (req.body ?? {}) as {
      artifactKind?: string;
      content?: unknown;
      format?: string;
    };

    if (!artifactKind) {
      res.status(400).json({
        ok: false,
        error: "Missing artifactKind.",
        supportedKinds: SUPPORTED_ARTIFACT_KINDS,
      });
      return;
    }

    if (!format) {
      res.status(400).json({ ok: false, error: "Missing format." });
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

    const normalizedContent = normalizeRendererContent(artifactKind, content);
    const artifact = await renderer.render(normalizedContent as never, format);
    const contentType = MIME_BY_FORMAT[artifact.format] ?? "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    if (Buffer.isBuffer(artifact.data)) {
      res.status(200).send(artifact.data);
      return;
    }

    if (artifact.format === "json") {
      res.status(200).json(JSON.parse(String(artifact.data)));
      return;
    }

    res.status(200).send(String(artifact.data));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ ok: false, error: "render_failed", message });
  }
}
