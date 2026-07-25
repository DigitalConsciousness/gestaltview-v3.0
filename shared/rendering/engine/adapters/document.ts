import { BaseBackend } from "./base.js";
import type {
  BackendCapabilityManifest,
  RenderDiagnostic,
  RenderJob,
  RenderResult,
  SceneNode,
} from "../core/types.js";
import { result, writeTextArtifact } from "../core/artifacts.js";

export interface DocumentRenderStrategy {
  renderMarkdown(md: string): Promise<string>;
}

export class DocumentBackend extends BaseBackend {
  readonly capability: BackendCapabilityManifest = {
    id: "gestalt-document-backend",
    kind: "document",
    displayName: "GestaltView Document Renderer",
    supportedNodeTypes: ["Document", "Markdown", "Chart", "DOMSnapshot", "AgentArtifact", "ExportRequest"],
    supportedFormats: ["html"],
    executionMode: "in-process",
    sourceProjects: ["internal-safe-markdown"],
    strengths: [
      "Deterministic safe Markdown-to-HTML",
      "Complete standalone HTML documents",
      "No raw Markdown fallback in the visible surface",
    ],
  };

  constructor(private readonly markdownStrategy?: DocumentRenderStrategy) {
    super();
  }

  protected async renderValidated(job: RenderJob): Promise<RenderResult> {
    const diagnostics: RenderDiagnostic[] = [];
    const bodyParts: string[] = [];
    const markdownNodes = job.graph.nodes.filter((node) => node.type === "Markdown");

    for (const node of markdownNodes) {
      const source = String(node.props.source ?? node.props.assetRef ?? "");
      if (!source.trim()) continue;
      if (this.markdownStrategy) {
        try {
          bodyParts.push(await this.markdownStrategy.renderMarkdown(source));
          continue;
        } catch (error) {
          diagnostics.push({
            code: "MARKDOWN_STRATEGY_FAILED",
            message: `External Markdown strategy failed; safe built-in rendering was used: ${
              error instanceof Error ? error.message : String(error)
            }`,
            severity: "warning",
            stage: "rendering",
          });
        }
      }
      bodyParts.push(renderSafeMarkdown(source));
    }

    for (const node of job.graph.nodes.filter((candidate) => candidate.type !== "Markdown")) {
      bodyParts.push(renderNode(node));
    }

    const body = bodyParts.join("\n");
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(job.graph.graphId)}</title>
  <style>
    :root{color-scheme:dark;--gv-bg:#0f0f11;--gv-surface:#1a1a1e;--gv-border:#2e2e38;--gv-text:#e2e8f0;--gv-muted:#94a3b8;--gv-accent:#818cf8;--gv-radius:8px}
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,sans-serif;margin:2rem clamp(1rem,5vw,4rem);background:var(--gv-bg);color:var(--gv-text);line-height:1.7;max-width:860px;margin-inline:auto}
    .node{border:1px solid var(--gv-border);padding:16px;margin:12px 0;border-radius:var(--gv-radius);background:var(--gv-surface)}
    .meta{color:var(--gv-muted);font-size:12px;letter-spacing:.08em;text-transform:uppercase}
    pre,code{background:#1e1e2a;border-radius:4px;font-size:.875em}
    code{padding:.1em .4em} pre{padding:1.25rem;overflow-x:auto} pre code{padding:0;background:transparent}
    blockquote{border-left:3px solid var(--gv-accent);margin:1rem 0;padding:.5rem 1rem;background:var(--gv-surface);border-radius:0 var(--gv-radius) var(--gv-radius) 0;color:var(--gv-muted)}
    table{border-collapse:collapse;width:100%} th,td{border:1px solid var(--gv-border);padding:.5rem .75rem} th{background:var(--gv-surface);color:var(--gv-accent)}
    h1,h2,h3,h4,h5,h6{color:var(--gv-text);margin-top:2rem;margin-bottom:.5rem}
    a{color:#9ee2ff} img{max-width:100%;border-radius:var(--gv-radius)}
  </style>
</head>
<body>
  <main>
    <h1>GestaltView Render: ${escapeHtml(job.graph.graphId)}</h1>
    ${body}
  </main>
</body>
</html>`;

    const artifact = await writeTextArtifact(
      job,
      this.capability.id,
      `${job.jobId}.document.html`,
      html,
      "html",
      {
        nodeCount: job.graph.nodes.length,
        markdownRendered: markdownNodes.length > 0,
        markdownRenderer: this.markdownStrategy ? "external-with-safe-fallback" : "internal-safe",
      },
    );

    return result(job, this.capability.id, [artifact], diagnostics, {
      capability: this.capability,
      nodeCount: job.graph.nodes.length,
      markdownRendered: markdownNodes.length > 0,
    });
  }
}

function renderSafeMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let codeFence: { language: string; lines: string[] } | null = null;

  const closeParagraph = () => {
    if (paragraph.length === 0) return;
    output.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const closeList = () => {
    if (!listType) return;
    output.push(`</${listType}>`);
    listType = null;
  };

  for (const line of lines) {
    const fence = line.match(/^```(.*)$/);
    if (fence) {
      closeParagraph();
      closeList();
      if (codeFence) {
        output.push(
          `<pre><code${
            codeFence.language ? ` class="language-${escapeHtml(codeFence.language)}"` : ""
          }>${escapeHtml(codeFence.lines.join("\n"))}</code></pre>`,
        );
        codeFence = null;
      } else {
        codeFence = { language: fence[1].trim(), lines: [] };
      }
      continue;
    }
    if (codeFence) {
      codeFence.lines.push(line);
      continue;
    }
    if (!line.trim()) {
      closeParagraph();
      closeList();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      closeParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      closeParagraph();
      closeList();
      output.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      closeParagraph();
      const nextType = unordered ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${listType}>`);
      }
      output.push(`<li>${renderInline((unordered ?? ordered)?.[1] ?? "")}</li>`);
      continue;
    }
    if (/^([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      closeParagraph();
      closeList();
      output.push("<hr>");
      continue;
    }
    paragraph.push(line.trim());
  }

  if (codeFence) output.push(`<pre><code>${escapeHtml(codeFence.lines.join("\n"))}</code></pre>`);
  closeParagraph();
  closeList();
  return `<section class="render-pass">${output.join("\n")}</section>`;
}

function renderInline(value: string): string {
  let rendered = escapeHtml(value);
  rendered = rendered.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" rel="noopener noreferrer">$1</a>',
  );
  rendered = rendered.replace(/`([^`]+)`/g, "<code>$1</code>");
  rendered = rendered.replace(new RegExp("\\*\\*([^*]+)\\*\\*", "g"), "<strong>$1</strong>");
  rendered = rendered.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  rendered = rendered.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  return rendered;
}

function renderNode(node: SceneNode): string {
  const label = node.name ?? node.id;
  if (node.type === "Chart") {
    return `<section class="node"><div class="meta">Chart · ${escapeHtml(node.id)}</div><h2>${escapeHtml(label)}</h2><pre><code>${escapeHtml(JSON.stringify(node.props.data ?? {}, null, 2))}</code></pre></section>`;
  }
  if (node.type === "Document") {
    return `<section class="node"><div class="meta">Document · ${escapeHtml(node.id)}</div><h2>${escapeHtml(label)}</h2><p>${escapeHtml(String(node.props.title ?? node.props.format ?? "document"))}</p></section>`;
  }
  if (node.type === "DOMSnapshot") {
    return `<section class="node"><div class="meta">DOM Snapshot · ${escapeHtml(node.id)}</div><pre><code>${escapeHtml(String(node.props.html ?? node.props.snapshotRef ?? node.props.assetRef ?? ""))}</code></pre></section>`;
  }
  return `<section class="node"><div class="meta">${node.type} · ${escapeHtml(node.id)}</div><h2>${escapeHtml(label)}</h2></section>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
