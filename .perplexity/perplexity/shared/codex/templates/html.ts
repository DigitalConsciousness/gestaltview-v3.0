import type { CodexArtifact } from "../contracts.js";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderBlock(block: Extract<CodexArtifact, { kind: "session_recap" }>["body"]["sections"][number]): string {
  switch (block.type) {
    case "markdown":
      return `<section data-block="${escapeHtml(block.id)}"><pre>${escapeHtml(block.markdown)}</pre></section>`;
    case "callout":
      return `<aside data-tone="${escapeHtml(block.tone)}">${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ""}<p>${escapeHtml(block.text)}</p></aside>`;
    case "timeline":
      return `<ol>${block.items.map((item) => `<li><strong>${escapeHtml(item.at)}</strong> ${escapeHtml(item.title)}${item.text ? `<p>${escapeHtml(item.text)}</p>` : ""}</li>`).join("")}</ol>`;
    case "list":
      return block.ordered
        ? `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
        : `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
  }
}

function artifactSummary(artifact: CodexArtifact): string {
  if ("summary" in artifact.body && typeof artifact.body.summary === "string") {
    return artifact.body.summary;
  }

  if (artifact.kind === "share_card") {
    return artifact.body.subhead || artifact.body.headline;
  }

  if (artifact.kind === "audio_narration") {
    return artifact.body.script.slice(0, 500);
  }

  return artifact.title;
}

export function renderArtifactHtml(artifact: CodexArtifact): string {
  const sectionBlocks =
    "sections" in artifact.body && Array.isArray(artifact.body.sections)
      ? artifact.body.sections.map(renderBlock).join("\n")
      : `<pre>${escapeHtml(JSON.stringify(artifact.body, null, 2))}</pre>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(artifact.title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <main data-codex-artifact="${escapeHtml(artifact.id)}" data-kind="${escapeHtml(artifact.kind)}">
    <header>
      <h1>${escapeHtml(artifact.title)}</h1>
      <p>${escapeHtml(artifactSummary(artifact))}</p>
    </header>
    ${sectionBlocks}
  </main>
</body>
</html>`;
}
