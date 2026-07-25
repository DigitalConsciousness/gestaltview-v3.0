import type { InnerWorldArtifactRecord } from "@/lib/innerWorldFiles";
import { slugifyFileName } from "@/lib/innerWorldFiles";

export type InnerWorldDownloadFormat = "html" | "txt" | "json";

export type InnerWorldDownloadPayload = {
  fileName: string;
  mimeType: string;
  content: string;
  label: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildArtifactSlug(record: InnerWorldArtifactRecord): string {
  return slugifyFileName(record.title) || "inner-world-artifact";
}

function buildHtmlDocument(record: InnerWorldArtifactRecord): string {
  const innerHtml = record.html.trim()
    ? record.html
    : `<p>${stripHtml(record.summary || record.title) || "No content available."}</p>`;

  if (/<!doctype html/i.test(innerHtml) || /<html[\s>]/i.test(innerHtml)) {
    return innerHtml;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${record.title.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</title>
  </head>
  <body>
    ${innerHtml}
  </body>
</html>`;
}

export function buildInnerWorldArtifactDownloadPayload(
  record: InnerWorldArtifactRecord,
  format: InnerWorldDownloadFormat,
): InnerWorldDownloadPayload {
  const baseName = buildArtifactSlug(record);

  if (format === "json") {
    return {
      fileName: `${baseName}.json`,
      mimeType: "application/json;charset=utf-8",
      label: "JSON metadata",
      content: JSON.stringify(
        {
          id: record.id,
          title: record.title,
          summary: record.summary,
          originRoom: record.originRoom,
          sourceFileId: record.sourceFileId,
          evidenceNodeIds: record.evidenceNodeIds,
          tags: record.tags,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
          html: record.html,
        },
        null,
        2,
      ),
    };
  }

  if (format === "txt") {
    return {
      fileName: `${baseName}.txt`,
      mimeType: "text/plain;charset=utf-8",
      label: "plain text",
      content: [
        `Title: ${record.title}`,
        `Summary: ${record.summary || "No summary available."}`,
        `Origin: ${record.originRoom}`,
        `Source file: ${record.sourceFileId ?? "None"}`,
        `Evidence nodes: ${record.evidenceNodeIds.join(", ") || "None"}`,
        `Tags: ${record.tags.join(", ") || "None"}`,
        "",
        stripHtml(record.html) || "No content available.",
      ].join("\n"),
    };
  }

  return {
    fileName: `${baseName}.html`,
    mimeType: "text/html;charset=utf-8",
    label: "HTML",
    content: buildHtmlDocument(record),
  };
}

export function downloadInnerWorldArtifact(
  record: InnerWorldArtifactRecord,
  format: InnerWorldDownloadFormat,
): InnerWorldDownloadPayload {
  const payload = buildInnerWorldArtifactDownloadPayload(record, format);
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return payload;
}
