import React, { useMemo, useRef, useState } from "react";
import { Download, ExternalLink, FileText, Image as ImageIcon, Music, Video, Code2, Quote, Layers3 } from "lucide-react";
import BillyMarkdown from "@/components/BillyMarkdown";
import { cn } from "@/lib/utils";
import { formatFileSize, isTextPreviewableFile } from "@/lib/artifact";
import { RenderingEngine } from "@/lib/rendering/RenderingEngine";
import { downloadCapturedDomNode, sanitizeCaptureFileName } from "@/lib/rendering/capture/domCapture";
import { EnhancedMarkdownRenderer } from "@/lib/rendering/markdown/EnhancedMarkdownRenderer";
import { buildArtifactCardModel } from "@/lib/rendering/multimodal/artifactCardModel";
import type { CaptureAttachment, CaptureMetadata } from "@/components/Scaffold";
import type { ArtifactContentFormat } from "@shared/gen-engine/types";

type ArtifactLike = {
  title: string;
  text?: string;
  content?: string;
  summary?: string;
  type?: string;
  source?: string;
  tags?: string[];
  createdAt?: string;
  status?: string;
  color?: string;
  transcript?: string;
  metadata?: Partial<CaptureMetadata> & Record<string, unknown>;
  attachment?: CaptureAttachment;
};

type ArtifactPreviewProps = {
  artifact: ArtifactLike | null;
  className?: string;
  compact?: boolean;
  allowOpen?: boolean;
};

function attachmentName(attachment: CaptureAttachment | undefined): string | null {
  return attachment?.name ?? null;
}

function attachmentUrl(attachment: CaptureAttachment | undefined): string | null {
  return attachment?.objectUrl ?? attachment?.previewUrl ?? attachment?.dataUrl ?? null;
}

function looksLikeMarkdown(text: string, attachment: CaptureAttachment | undefined): boolean {
  const name = attachment?.name?.toLowerCase() ?? "";
  const mime = attachment?.mimeType?.toLowerCase() ?? "";
  return (
    mime.includes("markdown") ||
    mime.includes("md") ||
    name.endsWith(".md") ||
    name.endsWith(".markdown") ||
    /^#{1,6}\s/m.test(text) ||
    /\n\s*[-*+]\s+/.test(text) ||
    /\n\s*\d+\.\s+/.test(text)
  );
}

function looksLikeCode(text: string, attachment: CaptureAttachment | undefined, type: ArtifactLike["type"]): boolean {
  const name = attachment?.name?.toLowerCase() ?? "";
  const mime = attachment?.mimeType?.toLowerCase() ?? "";
  return type === "code" || mime.includes("javascript") || mime.includes("typescript") || mime.includes("json") || name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js") || name.endsWith(".jsx") || name.endsWith(".json") || /```[\s\S]*```/.test(text);
}

function looksLikePdf(attachment: CaptureAttachment | undefined): boolean {
  const name = attachment?.name?.toLowerCase() ?? "";
  const mime = attachment?.mimeType?.toLowerCase() ?? "";
  return mime.includes("pdf") || name.endsWith(".pdf");
}

function looksLikeHtml(text: string, attachment: CaptureAttachment | undefined, type: ArtifactLike["type"]): boolean {
  const name = attachment?.name?.toLowerCase() ?? "";
  const mime = attachment?.mimeType?.toLowerCase() ?? "";
  return (
    type === "recap" ||
    mime.includes("html") ||
    name.endsWith(".html") ||
    name.endsWith(".htm") ||
    /^\s*<!doctype html/i.test(text) ||
    /^\s*<html[\s>]/i.test(text)
  );
}

function artifactBody(artifact: ArtifactLike) {
  const text = artifact.content ?? artifact.text ?? artifact.summary ?? "";
  const attachment = artifact.attachment;
  const transcript = artifact.transcript ?? artifact.metadata?.transcript ?? attachment?.textContent ?? "";
  const primaryText = text || transcript;
  const textPreviewableFile = attachment?.kind === "file" && isTextPreviewableFile(attachment.mimeType, attachment.name);

  if (
    attachment?.kind === "file" &&
    !textPreviewableFile &&
    !attachment?.mimeType?.startsWith("image/") &&
    !attachment?.mimeType?.startsWith("audio/") &&
    !attachment?.mimeType?.startsWith("video/") &&
    !looksLikePdf(attachment)
  ) {
    return {
      kind: "file" as const,
      node: (
        <div className="space-y-4 rounded-[1.2rem] border border-white/10 bg-black/35 p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
            <Layers3 className="h-3.5 w-3.5" />
            File attachment
          </div>

          <div className="grid gap-3 text-sm text-white/72 sm:grid-cols-2">
            <div className="rounded-[1.05rem] border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">File</p>
              <p className="mt-1 break-words">{attachment.name}</p>
            </div>
            <div className="rounded-[1.05rem] border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Type</p>
              <p className="mt-1 break-words">{attachment.mimeType || "application/octet-stream"}</p>
            </div>
            <div className="rounded-[1.05rem] border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Size</p>
              <p className="mt-1">{formatFileSize(attachment.size)}</p>
            </div>
            <div className="rounded-[1.05rem] border border-white/10 bg-black/20 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Preview</p>
              <p className="mt-1">Binary attachment</p>
            </div>
          </div>

          {attachment.textContent ? (
            <p className="rounded-[1.05rem] border border-white/10 bg-white/[0.035] p-3 text-sm leading-relaxed text-white/68">
              {attachment.textContent}
            </p>
          ) : null}
        </div>
      ),
      icon: Layers3,
      label: "file",
    };
  }

  if (attachment?.kind === "image" || attachment?.mimeType?.startsWith("image/")) {
    return {
      kind: "image" as const,
      node: (
        <figure className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-black/35">
          {attachment.dataUrl ? (
            <img src={attachment.dataUrl} alt={artifact.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex min-h-40 items-center justify-center p-6 text-sm text-white/50">Image preview unavailable.</div>
          )}
        </figure>
      ),
      icon: ImageIcon,
      label: "image",
    };
  }

  if (attachment?.kind === "audio" || attachment?.mimeType?.startsWith("audio/")) {
    return {
      kind: "audio" as const,
      node: (
        <div className="space-y-3">
          <audio controls className="w-full" src={attachment.dataUrl} />
          {transcript ? (
            <BillyMarkdown content={transcript} className="rounded-[1.2rem] border border-cyan-300/10 bg-cyan-300/[0.04] p-4 text-cyan-50" />
          ) : (
            <p className="text-sm leading-relaxed text-white/58">Audio capture with no transcript yet.</p>
          )}
        </div>
      ),
      icon: Music,
      label: "audio",
    };
  }

  if (attachment?.kind === "video" || attachment?.mimeType?.startsWith("video/")) {
    return {
      kind: "video" as const,
      node: (
        <div className="space-y-3">
          <video controls className="w-full overflow-hidden rounded-[1.2rem] border border-white/10 bg-black" src={attachment.dataUrl} />
          {transcript ? <BillyMarkdown content={transcript} className="text-white/78" /> : null}
        </div>
      ),
      icon: Video,
      label: "video",
    };
  }

  if (looksLikePdf(attachment)) {
    return {
      kind: "pdf" as const,
      node: attachment?.dataUrl ? (
        <object
          data={attachment.dataUrl}
          type={attachment.mimeType || "application/pdf"}
          className="min-h-[22rem] w-full rounded-[1.2rem] border border-white/10 bg-black/40"
        >
          <div className="space-y-3 p-4 text-sm text-white/60">
            <p>PDF preview unavailable in this browser.</p>
            <p className="text-white/45">{attachment.name}</p>
          </div>
        </object>
      ) : (
        <div className="rounded-[1.2rem] border border-white/10 bg-black/35 p-4 text-sm text-white/55">
          PDF preview unavailable.
        </div>
      ),
      icon: FileText,
      label: "pdf",
    };
  }

  if (looksLikeHtml(primaryText, attachment, artifact.type)) {
    return {
      kind: "html" as const,
      node: (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
            <ExternalLink className="h-3.5 w-3.5" />
            Interactive HTML surface
          </div>
          <iframe
            title={artifact.title}
            srcDoc={primaryText}
            sandbox="allow-scripts"
            className="min-h-[32rem] w-full rounded-[1.2rem] border border-white/10 bg-white"
          />
        </div>
      ),
      icon: ExternalLink,
      label: "html",
    };
  }

  if (looksLikeCode(primaryText, attachment, artifact.type)) {
    return {
      kind: "code" as const,
      node: (
        <pre className="overflow-x-auto rounded-[1.2rem] border border-emerald-300/10 bg-black/45 p-4 font-mono text-[12px] leading-6 text-emerald-50/85">
          {primaryText}
        </pre>
      ),
      icon: Code2,
      label: "code",
    };
  }

  if (looksLikeMarkdown(primaryText, attachment)) {
    return {
      kind: "markdown" as const,
      node: (
        <BillyMarkdown
          content={primaryText}
          className="rounded-[1.2rem] border border-white/10 bg-black/35 p-4 text-white/78"
        />
      ),
      icon: FileText,
      label: "markdown",
    };
  }

  if (artifact.type === "context" || artifact.type === "memory") {
    return {
      kind: "notes" as const,
      node: (
        <div className="space-y-3 rounded-[1.2rem] border border-amber-300/12 bg-amber-300/[0.04] p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-amber-100/70">
            <Quote className="h-3.5 w-3.5" />
            Notes
          </div>
          <p className="text-sm leading-relaxed text-white/78">{primaryText}</p>
        </div>
      ),
      icon: Quote,
      label: "notes",
    };
  }

  return {
    kind: "raw" as const,
    node: (
      <div className="space-y-3 rounded-[1.2rem] border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/45">
          <Layers3 className="h-3.5 w-3.5" />
          Raw expression
        </div>
        <p className="text-sm leading-relaxed text-white/78">{primaryText}</p>
      </div>
    ),
    icon: Layers3,
    label: "raw expression",
  };
}

export default function ArtifactPreview({ artifact, className, compact = false, allowOpen = true }: ArtifactPreviewProps) {
  const previewRef = useRef<HTMLElement | null>(null);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "capturing" | "ready" | "error">("idle");
  const model = useMemo(() => (artifact ? buildArtifactCardModel(artifact) : null), [artifact]);

  if (!artifact) {
    return (
      <div className={cn("rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 text-sm text-white/52", className)}>
        No artifact selected.
      </div>
    );
  }

  const attachment = artifact.attachment;
  const Icon = iconForFormat(model?.primaryArtifact.format);
  const canCaptureImage = typeof window !== "undefined";

  const handleSaveImage = async () => {
    if (!previewRef.current || !canCaptureImage) return;

    setCaptureStatus("capturing");
    try {
      await downloadCapturedDomNode(previewRef.current, {
        fileName: sanitizeCaptureFileName(artifact.title),
        backgroundColor: "#020617",
      });
      setCaptureStatus("ready");
    } catch (error) {
      console.error("Artifact image export failed", error);
      setCaptureStatus("error");
    }
  };

  return (
    <section ref={previewRef} className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
            {model?.primaryLabel ?? "artifact"}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">{artifact.title}</h3>
        </div>
        <Icon className="mt-1 h-5 w-5 text-[#7fe9ff]" />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        {artifact.type ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{artifact.type}</span> : null}
        {artifact.source ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{artifact.source}</span> : null}
        {model?.badges.map((badge) => (
          <span key={badge} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{badge}</span>
        ))}
        {model?.attachmentName ? <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{model.attachmentName}</span> : null}
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/28 p-3">
        {model ? (
          <RenderingEngine
            artifact={model.primaryArtifact}
            maxHeight={compact ? 320 : 560}
            noAurora
            className="artifact-preview-renderer"
          />
        ) : null}
      </div>

      {model?.companions.length ? (
        <div className="mt-4 grid gap-3">
          {model.companions.map((companion) => (
            <div key={companion.label} className="rounded-[1.15rem] border border-cyan-200/12 bg-cyan-200/[0.04] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/58">{companion.label}</p>
              <div className="mt-2">
                <EnhancedMarkdownRenderer content={companion.content} mode="compact" className="border-white/8 bg-black/18 shadow-none" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2" data-capture-exclude="true">
        {canCaptureImage ? (
          <button
            type="button"
            onClick={handleSaveImage}
            disabled={captureStatus === "capturing"}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50/72 transition-colors hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {captureStatus === "capturing" ? "Saving" : "Save image"}
          </button>
        ) : null}
        {allowOpen && model?.attachmentUrl ? (
          <a
            href={model.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open there
          </a>
        ) : null}
        {model?.attachmentUrl ? (
          <a
            href={model.attachmentUrl}
            download={attachment?.name ?? artifact.title}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        ) : null}
      </div>

      {captureStatus === "error" ? (
        <p className="mt-2 text-xs text-rose-100/68" data-capture-exclude="true">
          Image export could not capture this artifact in the current browser.
        </p>
      ) : null}

      {!compact ? (
        <div className="mt-4 grid gap-3 text-sm text-white/55 sm:grid-cols-2">
          <div className="rounded-[1.1rem] border border-white/10 bg-black/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Created</p>
            <p className="mt-1">{artifact.createdAt ?? artifact.metadata?.createdAt ?? "Unknown"}</p>
          </div>
          <div className="rounded-[1.1rem] border border-white/10 bg-black/20 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">Status</p>
            <p className="mt-1">{artifact.status ?? "saved"}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function iconForFormat(format: ArtifactContentFormat | undefined) {
  switch (format) {
    case "image":
      return ImageIcon;
    case "audio":
      return Music;
    case "video":
      return Video;
    case "code":
    case "python":
    case "json":
      return Code2;
    case "html":
    case "html5":
    case "react":
      return ExternalLink;
    case "mindmap":
      return Layers3;
    default:
      return FileText;
  }
}
