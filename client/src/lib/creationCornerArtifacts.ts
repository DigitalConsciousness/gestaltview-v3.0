import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";

export type CreationCornerRenderableResult = {
  id: string;
  title: string;
  artifact_type: string;
  content?: string;
  image_prompt?: string;
  audio_prompt?: string;
  generation_mode: string;
  fallback_used: boolean;
  warnings: string[];
  provenance?: {
    artifactId: string;
    sourceCaptureIds: string[];
    sourceHashes: string[];
    artifactHash: string;
    generatedAt: string;
    engineVersion: string;
  };
  codex?: {
    status: string;
    artifact: {
      id: string;
      contractVersion: string;
      kind: string;
      templateKey: string;
      securityClass: string;
    };
    manifest: Array<{
      format: string;
      status: string;
      mimeType?: string;
      bytes?: number;
      storagePath?: string;
      sha256?: string;
    }>;
  };
};

export type CreationCornerExportFormat = "markdown" | "html" | "json";

export type CreationCornerExportFile = {
  fileName: string;
  mimeType: string;
  content: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugifyFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "creation-corner-artifact";
}

function resultBody(result: CreationCornerRenderableResult): string {
  return result.content ?? result.image_prompt ?? result.audio_prompt ?? result.title;
}

function exportableResult(result: CreationCornerRenderableResult): Omit<CreationCornerRenderableResult, "warnings"> {
  const { warnings: _warnings, ...rest } = result;
  return rest;
}

/**
 * Lightweight markdown → HTML converter.
 * No external dependency. Handles the common cases produced by the synthesis
 * engine: headers, bold, italic, inline code, unordered lists, paragraphs.
 */
function renderMarkdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;

  const inlineFormat = (text: string) =>
    text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const raw of lines) {
    const line = raw;

    // Close open list if needed
    if (inList && !/^[-*+]\s/.test(line)) {
      out.push("</ul>");
      inList = false;
    }

    if (/^###\s/.test(line)) {
      out.push(`<h3>${inlineFormat(line.replace(/^###\s+/, ""))}</h3>`);
    } else if (/^##\s/.test(line)) {
      out.push(`<h2>${inlineFormat(line.replace(/^##\s+/, ""))}</h2>`);
    } else if (/^#\s/.test(line)) {
      out.push(`<h1>${inlineFormat(line.replace(/^#\s+/, ""))}</h1>`);
    } else if (/^[-*+]\s/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inlineFormat(line.replace(/^[-*+]\s+/, ""))}</li>`);
    } else if (line.trim() === "") {
      out.push("");
    } else {
      out.push(`<p>${inlineFormat(line)}</p>`);
    }
  }

  if (inList) out.push("</ul>");
  return out.join("\n");
}

export function buildCreationCornerHtml(result: CreationCornerRenderableResult): string {
  const content = resultBody(result);

  // Already a full HTML document — pass through untouched
  if (/<!doctype html|<html[\s>]/i.test(content)) {
    return content;
  }

  const isMermaid = /```mermaid/i.test(content);
  const isMarkdown = !isMermaid && (content.trimStart().startsWith("#") || /\*\*|__|^\s*[-*+] /m.test(content));
  const isJson = !isMermaid && !isMarkdown && (content.trimStart().startsWith("{") || content.trimStart().startsWith("["));

  const manifest = result.codex?.manifest.length
    ? `<section><h2>Export Manifest</h2><ul>${result.codex.manifest
        .map((item) => `<li>${escapeHtml(item.format)} · ${escapeHtml(item.status)}${item.mimeType ? ` · ${escapeHtml(item.mimeType)}` : ""}</li>`)
        .join("")}</ul></section>`
    : "";

  // Mermaid: strip fences, inject CDN init script
  const mermaidScript = isMermaid
    ? `<script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
      mermaid.initialize({startOnLoad:false,theme:'dark',securityLevel:'strict'});
      const renderMermaid = async () => {
        const targets = Array.from(document.querySelectorAll('.mermaid'));
        for (const [index, target] of targets.entries()) {
          const source = target.textContent?.trim() ?? '';
          if (!source) continue;
          try {
            const rendered = await mermaid.render('gv-cc-mermaid-' + index + '-' + Date.now(), source);
            target.innerHTML = rendered.svg;
          } catch {
            target.classList.add('mermaid-error');
            target.setAttribute('data-mermaid-error', 'true');
          }
        }
      };
      void renderMermaid();
    </script>`
    : "";

  const processedMermaid = isMermaid
    ? content.replace(/```mermaid\s*([\s\S]*?)```/gi, (_match, diagram: string) =>
        `<div class="mermaid">${escapeHtml(diagram.trim())}</div>`)
    : content;

  let bodyHtml: string;
  if (isMermaid) {
    bodyHtml = `<div class="mermaid-wrap">${processedMermaid}</div>`;
  } else if (isJson) {
    bodyHtml = `<pre class="json-block">${escapeHtml(content)}</pre>`;
  } else if (isMarkdown) {
    bodyHtml = renderMarkdownToHtml(content);
  } else {
    bodyHtml = `<pre>${escapeHtml(content)}</pre>`;
  }

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${mermaidScript}<style>
    :root{color-scheme:dark}
    body{margin:0;font-family:Inter,system-ui,sans-serif;background:#05070b;color:#f8fafc}
    .shell{min-height:100vh;padding:32px;background:radial-gradient(circle at top,rgba(18,214,255,.16),transparent 30%),#05070b}
    .frame{max-width:960px;margin:0 auto;border:1px solid rgba(255,255,255,.12);border-radius:28px;background:rgba(255,255,255,.04);overflow:hidden}
    .chrome{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.08)}
    .meta{font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.5)}
    h1{margin:.45rem 0 0;font-size:32px}
    h2{font-size:1.25rem;margin:1.5rem 0 .5rem;color:#7dd3fc}
    h3{font-size:1rem;margin:1.25rem 0 .4rem;color:#a5b4fc}
    .body{padding:24px;line-height:1.7}
    pre{white-space:pre-wrap;word-break:break-word;font:inherit;color:rgba(255,255,255,.76)}
    .json-block{font-family:monospace;font-size:.8rem;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:16px}
    .mermaid-wrap{padding:8px 0}
    .mermaid{background:transparent}
    .mermaid-error{padding:16px;border:1px dashed rgba(251,191,36,.45);border-radius:12px;white-space:pre-wrap;color:rgba(253,230,138,.9)}
    p{margin:.6rem 0}
    ul,ol{padding-left:1.5rem}
    li{margin:.35rem 0;color:rgba(255,255,255,.72)}
    strong{color:#fff}
    em{color:rgba(255,255,255,.85)}
    section{margin-top:1.25rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.08)}
    code{font-family:monospace;font-size:.85em;background:rgba(255,255,255,.08);padding:2px 6px;border-radius:4px}
  </style></head><body><div class="shell"><article class="frame">
    <div class="chrome"><div class="meta">Creation Corner · ${escapeHtml(result.artifact_type)} · ${escapeHtml(result.generation_mode)}</div><h1>${escapeHtml(result.title)}</h1></div>
    <div class="body">${bodyHtml}${manifest}</div>
  </article></div></body></html>`;
}

export function buildCreationCornerMarkdown(result: CreationCornerRenderableResult): string {
  const content = resultBody(result);
  if (result.artifact_type === "blueprint_json") {
    return `# ${result.title}\n\n\`\`\`json\n${content}\n\`\`\`\n`;
  }

  return content.startsWith("#") ? content : `# ${result.title}\n\n${content}`;
}

export function buildCreationCornerExportFile(
  result: CreationCornerRenderableResult,
  format: CreationCornerExportFormat,
): CreationCornerExportFile {
  const slug = slugifyFileName(result.title);
  if (format === "html") {
    return {
      fileName: `${slug}.html`,
      mimeType: "text/html;charset=utf-8",
      content: buildCreationCornerHtml(result),
    };
  }

  if (format === "json") {
    return {
      fileName: `${slug}.json`,
      mimeType: "application/json;charset=utf-8",
      content: JSON.stringify(exportableResult(result), null, 2),
    };
  }

  return {
    fileName: `${slug}.md`,
    mimeType: "text/markdown;charset=utf-8",
    content: buildCreationCornerMarkdown(result),
  };
}

export function buildCreationCornerInnerWorldArtifact(
  result: CreationCornerRenderableResult,
  userId: string,
): InnerWorldArtifactRecord {
  const now = new Date().toISOString();
  const summary = resultBody(result).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);

  return {
    id: result.id,
    userId,
    title: result.title,
    summary,
    sourceFileId: null,
    html: buildCreationCornerHtml(result),
    thumbnailUrl: undefined,
    createdAt: result.provenance?.generatedAt ?? now,
    updatedAt: now,
    originRoom: "creation_corner",
    evidenceNodeIds: [result.provenance?.artifactHash ?? result.id],
    tags: Array.from(
      new Set([
        "creation-corner",
        "dynamic-inner-world-showcase",
        result.artifact_type,
        result.generation_mode,
        result.codex?.artifact.kind ? `codex-${result.codex.artifact.kind}` : null,
      ].filter((tag): tag is string => Boolean(tag))),
    ),
    status: "ready",
  };
}
