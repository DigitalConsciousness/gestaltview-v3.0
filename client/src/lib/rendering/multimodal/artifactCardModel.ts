import type { ArtifactContentFormat } from "@shared/gen-engine/types";
import type { RenderableArtifact } from "../types";
import { analyzeMarkdown } from "../markdown/analyzeMarkdown";

type ArtifactAttachment = {
  kind?: string;
  name?: string;
  mimeType?: string;
  size?: number;
  dataUrl?: string;
  objectUrl?: string;
  previewUrl?: string;
  textContent?: string;
};

export type MultimodalArtifactInput = {
  title: string;
  text?: string;
  content?: string;
  summary?: string;
  type?: string;
  source?: string;
  tags?: string[];
  transcript?: string;
  metadata?: Record<string, unknown>;
  attachment?: ArtifactAttachment;
};

export type ArtifactCardCompanion = {
  label: "Summary" | "Transcript" | "Attachment Notes";
  content: string;
};

export type ArtifactCardModel = {
  primaryArtifact: RenderableArtifact;
  primaryLabel: string;
  badges: string[];
  companions: ArtifactCardCompanion[];
  attachmentUrl: string | null;
  attachmentName: string | null;
};

function lower(value = ""): string {
  return value.toLowerCase();
}

function attachmentUrl(attachment?: ArtifactAttachment): string | null {
  return attachment?.dataUrl ?? attachment?.objectUrl ?? attachment?.previewUrl ?? null;
}

function hasHtmlDocument(value: string): boolean {
  return /^\s*<!doctype html/i.test(value) || /^\s*<html[\s>]/i.test(value) || /<body[\s>]/i.test(value);
}

function looksLikeMarkdown(value: string): boolean {
  return /^#{1,6}\s/m.test(value) || /\n\s*[-*+]\s+/.test(value) || /\n\s*\d+\.\s+/.test(value) || /```/.test(value);
}

function looksLikeCode(value: string, filename = "", type = ""): boolean {
  return type === "code" || /\.(ts|tsx|js|jsx|json|py|css|html)$/i.test(filename) || /```[\s\S]*```/.test(value) || /\b(function|const|class|import)\s/.test(value);
}

function formatFromAttachment(attachment?: ArtifactAttachment): ArtifactContentFormat | null {
  const mime = lower(attachment?.mimeType);
  const name = lower(attachment?.name);
  const kind = lower(attachment?.kind);

  if (kind === "image" || mime.startsWith("image/")) return "image";
  if (kind === "audio" || mime.startsWith("audio/")) return "audio";
  if (kind === "video" || mime.startsWith("video/")) return "video";
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "pdf";
  if (mime.includes("markdown") || name.endsWith(".md") || name.endsWith(".markdown")) return "markdown";
  if (mime.includes("html") || name.endsWith(".html") || name.endsWith(".htm")) return "html";
  if (mime.includes("json") || name.endsWith(".json")) return "json";
  if (mime.startsWith("text/")) return "text";

  return null;
}

function formatFromContent(input: MultimodalArtifactInput, content: string): ArtifactContentFormat {
  const tags = (input.tags ?? []).map(lower);
  const type = lower(input.type);
  const filename = input.attachment?.name ?? "";

  if (tags.includes("mindmap") || tags.includes("mind-map") || type === "mindmap") return "mindmap";
  if (hasHtmlDocument(content)) return "html";
  if (looksLikeMarkdown(content)) return "markdown";
  if (looksLikeCode(content, filename, type)) return filename.endsWith(".py") ? "python" : "code";

  return "text";
}

function collectBadges(format: ArtifactContentFormat, input: MultimodalArtifactInput, content: string): string[] {
  const badges = new Set<string>([format]);
  const tags = input.tags ?? [];

  for (const tag of tags.slice(0, 4)) {
    badges.add(tag.toLowerCase());
  }

  if (format === "markdown" && analyzeMarkdown(content).diagramBlocks.length > 0) {
    badges.add("diagram");
  }

  if (input.attachment?.kind) {
    badges.add(input.attachment.kind.toLowerCase());
  }

  return Array.from(badges);
}

export function buildArtifactCardModel(input: MultimodalArtifactInput): ArtifactCardModel {
  const attachment = input.attachment;
  const url = attachmentUrl(attachment);
  const transcript = input.transcript ?? (typeof input.metadata?.transcript === "string" ? input.metadata.transcript : "") ?? attachment?.textContent ?? "";
  const content = url || input.content || input.text || input.summary || transcript || "";
  const attachmentFormat = formatFromAttachment(attachment);
  const format = attachmentFormat ?? formatFromContent(input, content);
  const companions: ArtifactCardCompanion[] = [];

  if (input.summary && input.summary !== content) {
    companions.push({ label: "Summary", content: input.summary });
  }

  if (transcript && transcript !== content) {
    companions.push({ label: "Transcript", content: transcript });
  }

  if (attachment?.textContent && attachment.textContent !== transcript && attachment.textContent !== content) {
    companions.push({ label: "Attachment Notes", content: attachment.textContent });
  }

  return {
    primaryArtifact: {
      title: input.title,
      content,
      format,
      contentFormat: format,
      mimeType: attachment?.mimeType,
      filename: attachment?.name,
    },
    primaryLabel: format === "html" ? "interactive html" : `${format} surface`,
    badges: collectBadges(format, input, content),
    companions,
    attachmentUrl: url,
    attachmentName: attachment?.name ?? null,
  };
}
