import type { CodexArtifact } from "./contracts.js";

export interface RenderedArtifact {
  html: string;
  markdown?: string;
}

function wrapHtml(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${body}</body></html>`;
}

export async function renderArtifact(artifact: CodexArtifact): Promise<RenderedArtifact> {
  switch (artifact.kind) {
    case "session_recap":
      return {
        html: wrapHtml(artifact.title, `<h1>${artifact.title}</h1><p>${artifact.body.summary}</p>`),
      };
    case "audio_narration":
      return {
        html: wrapHtml(artifact.title, `<blockquote>${artifact.body.script}</blockquote>`),
      };
    default:
      return {
        html: wrapHtml(artifact.title, `<pre>${JSON.stringify(artifact.body, null, 2)}</pre>`),
      };
  }
}
