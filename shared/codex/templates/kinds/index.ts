import type { CodexArtifact } from "../../contracts.js";
import { buildHtmlShell } from "../html-shell.js";
import {
  kindLabel,
  renderArtifactSummary,
  renderBlock,
  renderBulletList,
  renderParagraphs,
  renderProvenanceDrawer,
  safeAttr,
  safeText,
} from "../renderers/index.js";

function sanitizeMermaidLabel(value: string): string {
  const normalized = value
    .replace(/[\r\n]+/g, " ")
    .replace(/&/g, " and ")
    .replace(/[\[\]{}()<>`|;:#\"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "Untitled";
}

function buildMindMapDiagram(artifact: Extract<CodexArtifact, { kind: "mind_map" }>): string {
  const nodes = artifact.body.nodes.map((node, index) => ({
    id: `node${index + 1}`,
    label: sanitizeMermaidLabel(node.label),
    parentId: node.parentId ? `node${artifact.body.nodes.findIndex((candidate) => candidate.id === node.parentId) + 1}` : null,
    sourceId: node.id,
  }));
  const nodeLines = nodes.map((node) => `${node.id}["${node.label}"]`).join("\n");
  const edges = artifact.body.edges.length
    ? artifact.body.edges.map((edge) => {
        const from = nodes.find((node) => node.sourceId === edge.from)?.id ?? edge.from;
        const to = nodes.find((node) => node.sourceId === edge.to)?.id ?? edge.to;
        return `${from} --> ${to}`;
      })
    : nodes.filter((node) => node.parentId).map((node) => `${node.parentId} --> ${node.id}`);
  const edgeLines = edges.join("\n");

  return `graph LR\n${nodeLines}\n${edgeLines}`.trim();
}

function renderSessionRecap(artifact: Extract<CodexArtifact, { kind: "session_recap" }>): string {
  const themes = Array.from(new Set([
    ...artifact.body.decisions.slice(0, 5),
    ...artifact.body.openLoops.slice(0, 5),
  ]));
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.summary,
    meta: {
      artifactId: artifact.id,
      version: artifact.body.sections.length.toString(),
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <h2 class="gv-section__title" style="font-size: 2rem; margin-top: 0.6rem;">${safeText(artifact.body.summary)}</h2>
        <p class="gv-muted">${safeText(artifact.body.summary)}</p>
      </section>
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Key Themes</h3>
        <div class="gv-chip-row">${themes.map((theme) => `<span class="gv-chip">${safeText(theme)}</span>`).join("") || `<span class="gv-chip">No themes yet</span>`}</div>
      </section>
      ${artifact.body.sections.map((block) => renderBlock(block)).join("")}
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderBlueprint(artifact: Extract<CodexArtifact, { kind: "blueprint" }>): string {
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.summary,
    meta: {
      artifactId: artifact.id,
      principles: String(artifact.body.principles.length),
      risks: String(artifact.body.risks.length),
    },
    bodyContent: `
      <section class="gv-grid gv-grid--2">
        <section class="gv-section gv-card">
          <h3 class="gv-section__title">Purpose</h3>
          <p>${safeText(artifact.body.summary)}</p>
          <div class="gv-chip-row">${artifact.body.principles.map((item) => `<span class="gv-chip">${safeText(item)}</span>`).join("") || `<span class="gv-chip">No principles provided</span>`}</div>
        </section>
        <section class="gv-section gv-card">
          <h3 class="gv-section__title">Outline</h3>
          <ol class="gv-outline">
            ${artifact.body.sections.map((block, index) => `<li><strong>${safeText(block.type)}</strong> ${safeText(`Section ${index + 1}`)}</li>`).join("")}
          </ol>
        </section>
      </section>
      ${artifact.body.sections.map((block) => renderBlock(block)).join("")}
      <section class="gv-section gv-card gv-callout">
        <h3 class="gv-section__title">Risks</h3>
        ${renderBulletList(artifact.body.risks)}
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderReportDocument(artifact: Extract<CodexArtifact, { kind: "report_document" }>): string {
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.summary,
    meta: {
      artifactId: artifact.id,
      sections: String(artifact.body.sections.length),
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <h2 class="gv-section__title" style="font-size: 2rem; margin-top: 0.6rem;">${safeText(artifact.body.summary)}</h2>
        <p>${safeText(artifact.body.summary)}</p>
      </section>
      ${artifact.body.sections.map((block) => renderBlock(block)).join("")}
      ${artifact.body.appendix.length ? `<section class="gv-section gv-card"><h3 class="gv-section__title">Appendix</h3>${renderBulletList(artifact.body.appendix)}</section>` : ""}
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderMindMap(artifact: Extract<CodexArtifact, { kind: "mind_map" }>): string {
  const diagram = buildMindMapDiagram(artifact);
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.summary,
    meta: {
      artifactId: artifact.id,
      nodes: String(artifact.body.nodes.length),
    },
    mermaidDiagram: diagram,
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <p>${safeText(artifact.body.summary)}</p>
      </section>
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Mermaid Diagram</h3>
        <div class="gv-prose gv-mermaid" data-mermaid>${safeText(diagram)}</div>
        <pre class="gv-mermaid-fallback">${safeText(diagram)}</pre>
      </section>
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Nodes</h3>
        <div class="gv-grid gv-grid--3">
          ${artifact.body.nodes.map((node) => `<article class="gv-card gv-portrait-card">
            <strong>${safeText(node.label)}</strong>
            <p class="gv-muted">${safeText(node.id)}</p>
          </article>`).join("")}
        </div>
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderShareCard(artifact: Extract<CodexArtifact, { kind: "share_card" }>): string {
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.subhead || artifact.body.headline,
    meta: { artifactId: artifact.id },
    bodyContent: `
      <section class="gv-share-card">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <div>
          <h2 class="gv-share-card__headline">${safeText(artifact.body.headline)}</h2>
          ${artifact.body.subhead ? `<p class="gv-share-card__excerpt">${safeText(artifact.body.subhead)}</p>` : ""}
        </div>
        <div class="gv-meta" style="justify-content: flex-start; color: rgba(255,255,255,0.82)">
          <span>${safeText(artifact.body.theme)}</span>
        </div>
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderCodeModule(artifact: Extract<CodexArtifact, { kind: "code_module" }>): string {
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.entryFile,
    meta: {
      artifactId: artifact.id,
      files: String(artifact.body.files.length),
      language: artifact.body.language,
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <h3 class="gv-section__title">Entry file</h3>
        <p>${safeText(artifact.body.entryFile)}</p>
        <p class="gv-muted">${safeText(artifact.body.language)}</p>
      </section>
      <section class="gv-section gv-grid gv-grid--2">
        ${artifact.body.files.map((file) => `<article class="gv-card gv-section">
          <h3 class="gv-section__title">${safeText(file.path)}</h3>
          <pre>${safeText(file.contents)}</pre>
        </article>`).join("")}
      </section>
      ${artifact.body.notes.length ? `<section class="gv-section gv-card"><h3 class="gv-section__title">Notes</h3>${renderBulletList(artifact.body.notes)}</section>` : ""}
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderSpatialScene(artifact: Extract<CodexArtifact, { kind: "spatial_scene" }>): string {
  const nodes = artifact.body.nodes;
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.sceneVersion,
    meta: {
      artifactId: artifact.id,
      nodes: String(nodes.length),
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <p>${safeText(artifact.body.camera ? `Camera ${artifact.body.camera.position.join(", ")}` : "Spatial scene")}</p>
      </section>
      <section class="gv-scene">
        <div class="gv-scene__stage">
          ${nodes.map((node, index) => {
            const x = 8 + ((index * 19) % 68);
            const y = 10 + ((index * 17) % 68);
            return `<div class="gv-scene__node" style="left:${x}%; top:${y}%">
              <strong>${safeText(node.label)}</strong>
              <span>${safeText(node.nodeType)}</span>
            </div>`;
          }).join("")}
        </div>
        <div class="gv-card gv-section">
          <h3 class="gv-section__title">Legend</h3>
          <div class="gv-scene__legend">
            ${Array.from(new Set(nodes.map((node) => node.nodeType))).map((type) => `<span>${safeText(type)}</span>`).join("")}
          </div>
          <p class="gv-muted" style="margin-top: 1rem;">Three.js and offline bundling arrive in a follow-on worker. This shell preserves a spatial reading surface now.</p>
        </div>
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderAudioNarration(artifact: Extract<CodexArtifact, { kind: "audio_narration" }>): string {
  const audioReady = typeof artifact.meta?.audioStatus === "string" && artifact.meta.audioStatus === "ready";
  const audioUrl = typeof artifact.meta?.audioUrl === "string" ? artifact.meta.audioUrl : undefined;
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.voiceId || "audio narrative",
    meta: {
      artifactId: artifact.id,
      segments: String(artifact.body.segments.length),
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <div class="gv-wave" aria-hidden="true">${Array.from({ length: 16 }, () => "<span></span>").join("")}</div>
        <p class="gv-muted">${audioReady ? "Audio ready." : "Audio generating..."}</p>
      </section>
      ${audioReady && audioUrl ? `<section class="gv-section gv-card"><audio controls src="${safeAttr(audioUrl)}" style="width:100%"></audio></section>` : `<section class="gv-section gv-card gv-callout"><strong>Notify me</strong><p>Transcript available while the audio worker finishes.</p></section>`}
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Transcript</h3>
        <div class="gv-prose">${renderParagraphs(artifact.body.script)}</div>
      </section>
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Segments</h3>
        ${artifact.body.segments.map((segment) => `<article class="gv-card gv-section">
          <strong>${safeText(segment.id)}</strong>
          <p>${safeText(segment.text)}</p>
        </article>`).join("")}
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

function renderProfilePortrait(artifact: Extract<CodexArtifact, { kind: "profile_portrait" }>): string {
  const filledSegments = Math.max(1, Math.round(artifact.body.overallConfidence * 10));
  return buildHtmlShell({
    kind: artifact.kind,
    title: artifact.title,
    subtitle: artifact.body.tagline,
    meta: {
      artifactId: artifact.id,
      version: String(artifact.body.version),
    },
    bodyContent: `
      <section class="gv-section gv-card gv-hero-panel">
        <div class="gv-kind">${safeText(kindLabel(artifact.kind))}</div>
        <p>${safeText(artifact.body.tagline)}</p>
        <div class="gv-dim-confidence" aria-label="confidence meter">
          ${Array.from({ length: 10 }, (_, index) => `<span data-on="${index < filledSegments ? "true" : "false"}"></span>`).join("")}
        </div>
      </section>
      <section class="gv-grid gv-grid--2">
        ${artifact.body.dimensions.map((dimension) => `
          <article class="gv-card gv-portrait-card ${dimension.kind === "growth_edges" ? "gv-portrait-card--growth" : ""}">
            <h3 class="gv-section__title">${safeText(dimension.label)}</h3>
            <p>${safeText(dimension.summary)}</p>
            <div class="gv-dim-confidence" aria-hidden="true">
              ${Array.from({ length: 10 }, (_, index) => `<span data-on="${index < Math.max(1, Math.round(dimension.confidence * 10)) ? "true" : "false"}"></span>`).join("")}
            </div>
            <details class="gv-quote-list">
              <summary>Supporting voices</summary>
              <div class="gv-quote-list">
                ${(dimension.rawQuotes ?? []).map((quote) => `<blockquote class="gv-quote">
                  <p>${safeText(quote)}</p>
                  <footer>
                    <button type="button" aria-pressed="true">Hide</button>
                    <button type="button" aria-pressed="true">Delete</button>
                  </footer>
                </blockquote>`).join("") || `<p class="gv-muted">No raw quotes available.</p>`}
              </div>
            </details>
          </article>`).join("")}
      </section>
      <section class="gv-section gv-card">
        <h3 class="gv-section__title">Lineage</h3>
        <p class="gv-muted">${artifact.body.deltaFromPrevious ? safeText(artifact.body.deltaFromPrevious) : "This is the current validated portrait."}</p>
      </section>
      ${renderProvenanceDrawer(artifact)}
    `,
  });
}

export function renderArtifactHtml(artifact: CodexArtifact): string {
  const fallbackArtifact = artifact as CodexArtifact;

  switch (artifact.kind) {
    case "session_recap":
      return renderSessionRecap(artifact);
    case "blueprint":
      return renderBlueprint(artifact);
    case "report_document":
      return renderReportDocument(artifact);
    case "mind_map":
      return renderMindMap(artifact);
    case "share_card":
      return renderShareCard(artifact);
    case "code_module":
      return renderCodeModule(artifact);
    case "spatial_scene":
      return renderSpatialScene(artifact);
    case "audio_narration":
      return renderAudioNarration(artifact);
    case "profile_portrait":
      return renderProfilePortrait(artifact);
    default:
      return buildHtmlShell({
        kind: fallbackArtifact.kind,
        title: fallbackArtifact.title,
        subtitle: renderArtifactSummary(fallbackArtifact),
        meta: { artifactId: fallbackArtifact.id },
        bodyContent: `<section class="gv-section gv-card gv-prose">${renderParagraphs(JSON.stringify(fallbackArtifact.body, null, 2))}</section>`,
      });
  }
}
