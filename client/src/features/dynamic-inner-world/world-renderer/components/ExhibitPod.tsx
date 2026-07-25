import { CalendarDays, ExternalLink, FileText, Maximize2, MousePointer2 } from "lucide-react";
import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import { HtmlArtifactRenderer } from "@/lib/rendering";
import type { WorldNode, WorldRenderContext } from "../types";
import { worldTransform } from "../styles";

function formatDate(value: string): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "Undated";
  }

  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(value: string): string {
  return value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hasRenderableHtml(value: string): boolean {
  const trimmed = value.trim();
  return /^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed) || /<body[\s>]/i.test(trimmed) || /<\/?[a-z][\s\S]*>/i.test(trimmed);
}

function artifactKind(artifact: InnerWorldArtifactRecord): "html" | "image" | "code" | "audio" | "text" {
  const tags = artifact.tags.map((tag) => tag.toLowerCase());

  if (artifact.thumbnailUrl || tags.includes("image")) return "image";
  if (tags.includes("audio")) return "audio";
  if (tags.includes("code") || /<code|<pre|```|function\s|const\s|class\s/i.test(artifact.html)) return "code";
  if (hasRenderableHtml(artifact.html)) return "html";
  return "text";
}

function renderableHtmlDocument(artifact: InnerWorldArtifactRecord): string {
  const content = artifact.html || artifact.summary || artifact.title;

  if (hasRenderableHtml(content)) {
    return content;
  }

  const body = escapeHtml(content || artifact.summary || "No artifact body yet.").replace(/\n/g, "<br />");
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: #ecfeff;
        background:
          radial-gradient(circle at 18% 12%, rgba(18, 214, 255, 0.22), transparent 34%),
          radial-gradient(circle at 88% 22%, rgba(191, 0, 255, 0.16), transparent 30%),
          linear-gradient(145deg, #071015, #02040a 72%);
      }
      main { padding: 34px; }
      .eyebrow {
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: rgba(165, 243, 252, 0.72);
        font-size: 11px;
      }
      h1 { margin: 14px 0 18px; font-size: clamp(28px, 7vw, 56px); line-height: 0.96; }
      p { color: rgba(236, 254, 255, 0.72); line-height: 1.7; font-size: 16px; max-width: 72ch; }
      .body {
        margin-top: 24px;
        border: 1px solid rgba(255,255,255,0.11);
        border-radius: 28px;
        padding: 22px;
        background: rgba(255,255,255,0.04);
        box-shadow: inset 0 0 52px rgba(18,214,255,0.06);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="eyebrow">Rendered artifact</div>
      <h1>${escapeHtml(artifact.title)}</h1>
      <p>${escapeHtml(artifact.summary || "A saved piece in the Dynamic Inner World.")}</p>
      <section class="body">${body}</section>
    </main>
  </body>
</html>`;
}

function previewText(artifact: InnerWorldArtifactRecord): string {
  return stripHtml(artifact.summary || artifact.html || artifact.title).slice(0, 170) || "No summary has been written for this artifact yet.";
}

export function ExhibitPod({ node, context }: { node: WorldNode; context: WorldRenderContext }) {
  const artifact = node.artifactId ? context.artifactsById.get(node.artifactId) : null;

  if (!artifact || !node.artifactId) {
    return null;
  }

  const selected = node.emphasis === "primary";
  const tags = artifact.tags.slice(0, selected ? 4 : 3);
  const kind = artifactKind(artifact);
  const frameHeight = selected ? "h-56" : "h-40";
  const frameDoc = renderableHtmlDocument(artifact);
  const frameMinHeight = selected ? 224 : 160;

  return (
    <article
      aria-label={`${selected ? "Selected showcase" : "Showcase"} ${artifact.title}`}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          context.onOpenArtifact(node.artifactId!);
        }
      }}
      className={`absolute left-1/2 top-1/2 w-[20rem] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.45rem] border text-left shadow-[0_28px_90px_rgba(0,0,0,0.44)] backdrop-blur-xl transition-[border-color,box-shadow,opacity,filter] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80 md:w-[23rem] ${
        selected
          ? "border-cyan-100/48 bg-cyan-100/[0.12] text-white shadow-[0_0_70px_rgba(18,214,255,0.28)]"
          : "border-white/12 bg-black/40 text-white/82 hover:border-cyan-100/25 hover:bg-cyan-100/[0.06]"
      }`}
      style={{ transform: `translate(-50%, -50%) ${worldTransform(node.position)}` }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[1.45rem] bg-[radial-gradient(circle_at_top,rgba(18,214,255,0.18),transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_45%)]" />
      <div className="pointer-events-none absolute inset-x-7 top-0 h-px bg-cyan-100/42 shadow-[0_0_28px_rgba(18,214,255,0.54)]" />

      <div className="relative p-3">
        <div className={`relative overflow-hidden rounded-[1.12rem] border ${selected ? "border-cyan-100/28" : "border-white/10"} bg-black/52 shadow-[inset_0_0_42px_rgba(18,214,255,0.05)]`}>
          <HtmlArtifactRenderer
            title={`${artifact.title} preview`}
            html={frameDoc}
            retrievalMode="persistent"
            minHeight={frameMinHeight}
            autoResize={false}
            chrome={false}
            loading="lazy"
            className={`pointer-events-none w-full ${frameHeight} origin-top-left bg-white`}
          />
          <div className="pointer-events-none absolute inset-0 rounded-[1.1rem] bg-[linear-gradient(180deg,transparent_58%,rgba(0,0,0,0.46)),radial-gradient(circle_at_50%_0%,rgba(18,214,255,0.10),transparent_34%)]" />
          <div className="absolute left-3 top-3 rounded-full border border-black/30 bg-black/64 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-50/80 backdrop-blur-md">
            {kind === "html" ? "live html" : `${kind} surface`}
          </div>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => context.onSelectArtifact(node.artifactId!)}
            onDoubleClick={() => context.onOpenArtifact(node.artifactId!)}
            className="min-w-0 flex-1 rounded-[1rem] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/64">
              {selected ? "Pulled forward" : artifact.originRoom.replace(/_/g, " ")}
            </p>
            <h3 className={`${selected ? "text-lg" : "text-base"} mt-2 line-clamp-2 font-semibold leading-6 text-white`}>{artifact.title}</h3>
          </button>

          <button
            type="button"
            onClick={() => context.onOpenArtifact(node.artifactId!)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-100/20 bg-cyan-100/10 text-cyan-50 transition-colors hover:bg-cyan-100/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
            aria-label={`Open ${artifact.title}`}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/62">{previewText(artifact)}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/48">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/24 px-2.5 py-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(artifact.updatedAt || artifact.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/24 px-2.5 py-1.5">
            <FileText className="h-3.5 w-3.5" />
            Showcase
          </span>
          {selected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-100/18 bg-cyan-100/10 px-2.5 py-1.5 text-cyan-50/80">
              <MousePointer2 className="h-3.5 w-3.5" />
              Enter opens
            </span>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-black/24 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-white/58">
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {selected ? (
          <button
            type="button"
            onClick={() => context.onOpenArtifact(node.artifactId!)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-100/24 bg-cyan-100/12 px-4 py-2 text-xs font-semibold text-cyan-50 transition-colors hover:bg-cyan-100/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/80"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open full artifact
          </button>
        ) : null}
      </div>
    </article>
  );
}
