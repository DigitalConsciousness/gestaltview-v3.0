import React from "react";
import { cn } from "@/lib/utils";
import BillyMarkdown from "@/components/BillyMarkdown";
import {
  detectFileKind,
  fileKindLabel,
  type UserFileKind,
} from "@/lib/innerWorldFiles";

type UploadedDocumentPreviewProps = {
  name: string;
  mimeType?: string;
  kind?: UserFileKind | "docx";
  previewText?: string | null;
  previewHtml?: string | null;
  previewUrl?: string | null;
  dataUrl?: string | null;
  className?: string;
  showHeader?: boolean;
};

function resolvePreviewKind(name: string, mimeType?: string, kind?: UserFileKind | "docx"): UserFileKind {
  if (kind === "docx") {
    return "text";
  }

  return kind ?? detectFileKind(name, mimeType ?? "");
}

export default function UploadedDocumentPreview({
  name,
  mimeType,
  kind,
  previewText,
  previewHtml,
  previewUrl,
  dataUrl,
  className,
  showHeader = true,
}: UploadedDocumentPreviewProps) {
  const resolvedKind = resolvePreviewKind(name, mimeType, kind);
  const sourceUrl = previewUrl ?? dataUrl ?? null;
  const bodyText = previewText ?? previewHtml ?? "";

  const body = (() => {
    if (resolvedKind === "image" && sourceUrl) {
      return <img src={sourceUrl} alt={name} className="max-h-[28rem] w-full rounded-[1.35rem] object-cover" />;
    }

    if (resolvedKind === "audio" && sourceUrl) {
      return <audio controls className="w-full" src={sourceUrl} />;
    }

    if (resolvedKind === "video" && sourceUrl) {
      return (
        <video
          controls
          className="w-full overflow-hidden rounded-[1.35rem] border border-white/10 bg-black"
          src={sourceUrl}
        />
      );
    }

    if (resolvedKind === "pdf") {
      if (sourceUrl) {
        return (
          <object
            data={sourceUrl}
            type={mimeType || "application/pdf"}
            className="min-h-[28rem] w-full rounded-[1.35rem] border border-white/10 bg-black/40"
          >
            <div className="p-4 text-sm text-white/62">PDF preview unavailable for {name}.</div>
          </object>
        );
      }

      if (bodyText.trim()) {
        return (
          <BillyMarkdown
            content={bodyText}
            className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4 text-white/78"
          />
        );
      }

      return (
        <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4 text-sm text-white/56">
          PDF preview unavailable.
        </div>
      );
    }

    if (resolvedKind === "html") {
      return (
        <iframe
          title={name}
          srcDoc={bodyText}
          sandbox=""
          className="min-h-[28rem] w-full rounded-[1.35rem] border border-white/10 bg-black"
        />
      );
    }

    if (resolvedKind === "markdown" || resolvedKind === "text") {
      return (
        <BillyMarkdown
          content={bodyText}
          className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4 text-white/78"
        />
      );
    }

    if (bodyText.trim()) {
      return (
        <pre className="overflow-x-auto rounded-[1.35rem] border border-white/10 bg-black/40 p-4 font-mono text-[12px] leading-6 text-white/80">
          {bodyText}
        </pre>
      );
    }

    return (
      <div className="rounded-[1.35rem] border border-white/10 bg-black/35 p-4 text-sm text-white/56">
        This file does not expose a text preview.
      </div>
    );
  })();

  return (
    <div className={cn("space-y-3", className)}>
      {showHeader ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
              {fileKindLabel(resolvedKind)}
            </p>
            <h3 className="mt-2 break-words text-lg font-semibold text-white">{name}</h3>
          </div>
          {mimeType ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/54">
              {mimeType}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-4">{body}</div>
    </div>
  );
}
