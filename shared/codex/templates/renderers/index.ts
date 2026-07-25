import type { CodexArtifact } from "../../contracts.js";

const EMBELLISHMENT_PATTERNS = [
  /\bthat must (?:be|feel|have been)[^.!?]*[.!?]/gi,
  /\bI\s+hear\s+you[.!]?/gi,
  /\bI'?m here for you[.!]?/gi,
  /\bLet me (?:reflect|sit with|honor)[^.!?]*[.!?]/gi,
  /\b(?:Beautiful|Tender|Powerful|Incredible|Amazing)[!.]/g,
  /\bWhat I hear is[^.!?]*[.!?]/gi,
];

export function stripEmbellishment(text: string): string {
  let out = text;
  for (const pattern of EMBELLISHMENT_PATTERNS) {
    out = out.replace(pattern, "");
  }
  return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function safeText(value: string): string {
  return escapeHtml(stripEmbellishment(value));
}

export function safeAttr(value: string): string {
  return escapeHtml(value);
}

export function kindLabel(kind: CodexArtifact["kind"]): string {
  return kind.replace(/_/g, " ");
}

function renderInlineMarkdown(value: string): string {
  const escaped = escapeHtml(stripEmbellishment(value));
  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

export function renderMarkdown(value: string): string {
  const lines = stripEmbellishment(value)
    .split(/\r?\n/)
    .map((line) => line.trimEnd());

  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }

    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" ").trim()).replace(/\n/g, "<br />")}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) {
      listType = null;
      listItems = [];
      return;
    }

    const tagName = listType;
    blocks.push(`<${tagName}>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</${tagName}>`);
    listType = null;
    listItems = [];
  };

  const flushQuote = () => {
    if (!quoteLines.length) {
      return;
    }

    const quoteHtml = quoteLines
      .join("\n")
      .split(/\n{2,}/)
      .map((part) => `<p>${renderInlineMarkdown(part.replace(/\n/g, " ").trim())}</p>`)
      .join("");
    blocks.push(`<blockquote class="gv-callout">${quoteHtml}</blockquote>`);
    quoteLines = [];
  };

  for (const line of lines) {
    if (!line) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*•]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ul") {
        flushList();
      }
      listType = "ul";
      listItems.push(unorderedMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== "ol") {
        flushList();
      }
      listType = "ol";
      listItems.push(orderedMatch[1]);
      continue;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    flushList();
    flushQuote();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return blocks.join("");
}

export function renderParagraphs(value: string): string {
  const blocks = stripEmbellishment(value).split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  if (blocks.length === 0) {
    return "";
  }

  return blocks.map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`).join("");
}

export function renderBulletList(items: string[]): string {
  if (!items.length) {
    return "";
  }

  return `<ul>${items.map((item) => `<li>${safeText(item)}</li>`).join("")}</ul>`;
}

export function renderBlock(block: Extract<CodexArtifact, { kind: "session_recap" }>["body"]["sections"][number]): string {
  switch (block.type) {
    case "markdown":
      return `<section class="gv-section gv-card gv-prose" data-block="${safeAttr(block.id)}">${renderMarkdown(block.markdown)}</section>`;
    case "callout":
      return `<aside class="gv-section gv-card gv-callout" data-tone="${safeAttr(block.tone)}">
        ${block.title ? `<h3 class="gv-section__title">${safeText(block.title)}</h3>` : ""}
        <p>${safeText(block.text)}</p>
      </aside>`;
    case "timeline":
      return `<section class="gv-section gv-card">
        <h3 class="gv-section__title">Timeline</h3>
        <ol class="gv-outline">
          ${block.items.map((item) => `<li>
            <strong>${safeText(item.at)}</strong>
            <span>${safeText(item.title)}</span>
            ${item.text ? `<p class="gv-muted">${safeText(item.text)}</p>` : ""}
          </li>`).join("")}
        </ol>
      </section>`;
    case "list":
      return `<section class="gv-section gv-card">
        <h3 class="gv-section__title">List</h3>
        ${block.ordered ? `<ol class="gv-outline">${block.items.map((item) => `<li>${safeText(item)}</li>`).join("")}</ol>` : renderBulletList(block.items)}
      </section>`;
    default:
      return `<pre>${safeText(JSON.stringify(block, null, 2))}</pre>`;
  }
}

export function renderProvenanceDrawer(artifact: CodexArtifact): string {
  return `<details class="gv-section gv-card">
    <summary class="gv-section__title">Provenance</summary>
    <ol class="gv-outline">
      ${artifact.provenance.map((edge) => `<li>${safeText(`${edge.sourceType}:${edge.sourceId}`)} via ${safeText(edge.transform)}</li>`).join("")}
    </ol>
  </details>`;
}

export function renderArtifactSummary(artifact: CodexArtifact): string {
  if (artifact.kind === "profile_portrait") {
    return artifact.body.tagline;
  }

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
