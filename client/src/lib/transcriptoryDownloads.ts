import type { TranscriptoryCapture, TranscriptorySession, TranscriptorySource } from "@/lib/transcriptory";
import { slugifyFileName } from "@/lib/innerWorldFiles";

export type TranscriptoryDownloadFormat = "html" | "txt" | "json";

export type TranscriptoryDownloadPayload = {
  fileName: string;
  mimeType: string;
  content: string;
  label: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function buildHtmlDocument(input: {
  capture: TranscriptoryCapture;
  sessionTitle?: string | null;
  sourceLabels?: string[];
}): string {
  const summary = input.capture.summary || "No summary available.";
  const transcript = input.capture.transcriptText || input.capture.rawTranscript || "No transcript available.";
  const sourceLine = input.sourceLabels?.length ? input.sourceLabels.join(", ") : input.capture.sourceKind || "Transcriptory";
  const sessionLine = input.sessionTitle || input.capture.sessionId || "No session attached";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.capture.title)}</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 32px; background: #051017; color: #eaf8ff; }
      .card { max-width: 880px; margin: 0 auto; padding: 28px; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; background: rgba(255,255,255,0.04); }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.24em; font-size: 11px; color: rgba(137,227,255,0.82); }
      .meta { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin: 20px 0; }
      .meta div { padding: 14px; border-radius: 18px; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.08); }
      .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(255,255,255,0.46); }
      .value { margin-top: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
      pre { white-space: pre-wrap; line-height: 1.8; font-size: 14px; background: rgba(0,0,0,0.24); padding: 20px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); }
    </style>
  </head>
  <body>
    <article class="card">
      <p class="eyebrow">Transcriptory export</p>
      <h1>${escapeHtml(input.capture.title)}</h1>
      <div class="meta">
        <div><div class="label">Session</div><div class="value">${escapeHtml(sessionLine)}</div></div>
        <div><div class="label">Source lineage</div><div class="value">${escapeHtml(sourceLine)}</div></div>
        <div><div class="label">Status</div><div class="value">${escapeHtml(input.capture.status || "pending")}</div></div>
      </div>
      <h2>Summary</h2>
      <p>${escapeHtml(summary)}</p>
      <h2>Transcript</h2>
      <pre>${escapeHtml(transcript)}</pre>
    </article>
  </body>
</html>`;
}

export function buildTranscriptoryDownloadPayload(input: {
  capture: TranscriptoryCapture;
  session?: TranscriptorySession | null;
  sources?: TranscriptorySource[];
}, format: TranscriptoryDownloadFormat): TranscriptoryDownloadPayload {
  const baseName = slugifyFileName(input.capture.title) || "transcriptory-capture";
  const sessionTitle = input.session?.title ?? input.capture.sessionId ?? null;
  const sourceLabels = input.sources?.length ? input.sources.map((source) => source.source_type.replace(/_/g, " ")) : [];
  const transcript = input.capture.transcriptText || input.capture.rawTranscript || input.capture.summary || input.capture.title;

  if (format === "json") {
    return {
      fileName: `${baseName}.json`,
      mimeType: "application/json;charset=utf-8",
      label: "JSON metadata",
      content: JSON.stringify(
        {
          capture: input.capture,
          sessionTitle,
          sourceLabels,
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
        `Title: ${input.capture.title}`,
        `Session: ${sessionTitle || "No session attached"}`,
        `Source lineage: ${sourceLabels.join(", ") || input.capture.sourceKind || "Transcriptory"}`,
        `Status: ${input.capture.status || "pending"}`,
        "",
        input.capture.summary ? `Summary:\n${input.capture.summary}` : "",
        `Transcript:\n${transcript}`,
      ].filter(Boolean).join("\n\n"),
    };
  }

  return {
    fileName: `${baseName}.html`,
    mimeType: "text/html;charset=utf-8",
    label: "HTML",
    content: buildHtmlDocument({
      capture: input.capture,
      sessionTitle,
      sourceLabels,
    }),
  };
}

export function downloadTranscriptoryCapture(
  input: {
    capture: TranscriptoryCapture;
    session?: TranscriptorySession | null;
    sources?: TranscriptorySource[];
  },
  format: TranscriptoryDownloadFormat,
): TranscriptoryDownloadPayload {
  const payload = buildTranscriptoryDownloadPayload(input, format);
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return payload;
}
