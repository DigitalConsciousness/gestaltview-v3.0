export interface HtmlShellOptions {
  kind: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  bodyContent: string;
  inlineScripts?: string[];
  inlineStyles?: string[];
  meta?: Record<string, string>;
  mermaidDiagram?: string;
  offline?: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const EMBELLISHMENT_PATTERNS = [
  /\bthat must (?:be|feel|have been)[^.!?]*[.!?]/gi,
  /\bI\s+hear\s+you[.!]?/gi,
  /\bI'?m here for you[.!]?/gi,
  /\bLet me (?:reflect|sit with|honor)[^.!?]*[.!?]/gi,
  /\b(?:Beautiful|Tender|Powerful|Incredible|Amazing)[!.]/g,
  /\bWhat I hear is[^.!?]*[.!?]/gi,
];

function stripEmbellishment(text: string): string {
  let out = text;
  for (const pattern of EMBELLISHMENT_PATTERNS) {
    out = out.replace(pattern, "");
  }
  return out.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function safeText(value: string): string {
  return escapeHtml(stripEmbellishment(value));
}

function safeAttr(value: string): string {
  return escapeHtml(value);
}

function shellStyles(accentColor: string, offline: boolean, inlineStyles: string[] = []): string {
  return [
    `
      :root {
        color-scheme: light dark;
        --gv-accent: ${accentColor};
        --gv-accent-strong: color-mix(in srgb, ${accentColor} 88%, #000 12%);
        --gv-accent-soft: color-mix(in srgb, ${accentColor} 15%, #fff 85%);
        --gv-bg: #f4f0e8;
        --gv-surface: rgba(255, 255, 255, 0.82);
        --gv-surface-strong: rgba(255, 255, 255, 0.96);
        --gv-text: #1d1b18;
        --gv-muted: #625d56;
        --gv-line: rgba(56, 48, 40, 0.14);
        --gv-shadow: 0 22px 70px rgba(39, 28, 16, 0.12);
        --gv-radius-xl: 28px;
        --gv-radius-lg: 22px;
        --gv-radius-md: 16px;
        --gv-radius-sm: 12px;
        --gv-font-body: ${offline ? "ui-sans-serif, system-ui, sans-serif" : "'Satoshi', ui-sans-serif, system-ui, sans-serif"};
        --gv-font-display: ${offline ? "ui-serif, Georgia, serif" : "'Satoshi', ui-sans-serif, system-ui, sans-serif"};
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --gv-bg: #10100f;
          --gv-surface: rgba(22, 22, 22, 0.76);
          --gv-surface-strong: rgba(27, 27, 27, 0.96);
          --gv-text: #f4f0e8;
          --gv-muted: #beb7ae;
          --gv-line: rgba(255, 255, 255, 0.12);
          --gv-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
        }
      }

      * { box-sizing: border-box; }
      html { background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--gv-accent) 16%, transparent), transparent 34%),
        radial-gradient(circle at 85% 10%, rgba(255, 170, 96, 0.12), transparent 30%),
        linear-gradient(180deg, var(--gv-bg), color-mix(in srgb, var(--gv-bg) 82%, #fff 18%));
      }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: var(--gv-font-body);
        color: var(--gv-text);
        line-height: 1.55;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      a { color: var(--gv-accent); }
      button {
        font: inherit;
        border: 0;
        border-radius: 999px;
        padding: 0.72rem 1rem;
        background: var(--gv-accent);
        color: white;
        cursor: pointer;
      }
      button[aria-pressed="false"] {
        background: transparent;
        color: var(--gv-accent);
        border: 1px solid color-mix(in srgb, var(--gv-accent) 30%, var(--gv-line));
      }
      .gv-shell {
        width: min(1160px, calc(100vw - 32px));
        margin: 18px auto 28px;
        border: 1px solid var(--gv-line);
        border-radius: var(--gv-radius-xl);
        background: var(--gv-surface);
        box-shadow: var(--gv-shadow);
        overflow: clip;
        backdrop-filter: blur(18px);
      }
      .gv-shell__bar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px;
        border-bottom: 1px solid var(--gv-line);
        background: linear-gradient(90deg, color-mix(in srgb, var(--gv-accent) 12%, transparent), transparent 58%);
      }
      .gv-brand {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .gv-mark {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--gv-accent), color-mix(in srgb, var(--gv-accent) 40%, #fff));
        box-shadow: 0 10px 24px color-mix(in srgb, var(--gv-accent) 28%, transparent);
      }
      .gv-kind {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.75rem;
        border-radius: 999px;
        background: var(--gv-accent-soft);
        color: var(--gv-accent-strong);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }
      .gv-title {
        margin: 0;
        font-family: var(--gv-font-display);
        font-size: clamp(2rem, 4vw, 3.5rem);
        line-height: 1.02;
        letter-spacing: -0.04em;
      }
      .gv-subtitle {
        margin: 0.35rem 0 0;
        max-width: 68ch;
        color: var(--gv-muted);
      }
      .gv-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-end;
        color: var(--gv-muted);
        font-size: 0.86rem;
      }
      .gv-meta span {
        padding: 0.4rem 0.7rem;
        border: 1px solid var(--gv-line);
        border-radius: 999px;
        background: var(--gv-surface-strong);
      }
      .gv-shell__main {
        padding: 22px;
      }
      .gv-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 10px 14px;
        justify-content: space-between;
        padding: 16px 22px 20px;
        border-top: 1px solid var(--gv-line);
        color: var(--gv-muted);
        font-size: 0.88rem;
      }
      .gv-footer strong {
        color: var(--gv-text);
      }
      .gv-card {
        border: 1px solid var(--gv-line);
        border-radius: var(--gv-radius-lg);
        background: var(--gv-surface-strong);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
      }
      .gv-grid {
        display: grid;
        gap: 16px;
      }
      .gv-grid--2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .gv-grid--3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .gv-grid--4 {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .gv-prose p {
        margin: 0 0 0.95rem;
      }
      .gv-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .gv-chip {
        display: inline-flex;
        align-items: center;
        padding: 0.42rem 0.76rem;
        border-radius: 999px;
        border: 1px solid var(--gv-line);
        background: rgba(255, 255, 255, 0.26);
        color: var(--gv-text);
        font-size: 0.88rem;
      }
      .gv-section {
        padding: 18px;
      }
      .gv-section + .gv-section {
        margin-top: 16px;
      }
      .gv-section__title {
        margin: 0 0 0.6rem;
        font-family: var(--gv-font-display);
        font-size: 1.2rem;
      }
      .gv-callout {
        border-left: 4px solid var(--gv-accent);
        background: color-mix(in srgb, var(--gv-accent) 8%, var(--gv-surface-strong));
      }
      .gv-portrait-card {
        padding: 18px;
      }
      .gv-portrait-card--growth {
        border-left: 4px solid #d4833a;
        background: color-mix(in srgb, #d4833a 10%, var(--gv-surface-strong));
      }
      .gv-dim-confidence {
        display: flex;
        gap: 4px;
        margin-top: 10px;
      }
      .gv-dim-confidence span {
        flex: 1;
        min-height: 8px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.08);
      }
      .gv-dim-confidence span[data-on="true"] {
        background: linear-gradient(90deg, var(--gv-accent), color-mix(in srgb, var(--gv-accent) 30%, white));
      }
      .gv-wave {
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 6px;
        align-items: end;
        min-height: 88px;
      }
      .gv-wave span {
        height: 36px;
        border-radius: 999px;
        background: linear-gradient(180deg, color-mix(in srgb, var(--gv-accent) 85%, white), color-mix(in srgb, var(--gv-accent) 18%, transparent));
        opacity: 0.86;
      }
      .gv-wave span:nth-child(3n + 2) { height: 54px; }
      .gv-wave span:nth-child(4n + 1) { height: 72px; }
      .gv-wave span:nth-child(5n + 3) { height: 44px; }
      .gv-hero-panel {
        padding: 22px;
      }
      .gv-muted {
        color: var(--gv-muted);
      }
      .gv-outline {
        padding-left: 1rem;
        border-left: 1px solid var(--gv-line);
      }
      .gv-outline li {
        margin-bottom: 0.5rem;
      }
      .gv-scene {
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
      }
      .gv-scene__stage {
        min-height: 480px;
        border-radius: var(--gv-radius-xl);
        background:
          radial-gradient(circle at 22% 20%, color-mix(in srgb, var(--gv-accent) 22%, transparent), transparent 32%),
          radial-gradient(circle at 72% 34%, rgba(255, 255, 255, 0.12), transparent 28%),
          linear-gradient(135deg, rgba(9, 10, 15, 0.92), rgba(21, 24, 35, 0.92));
        border: 1px solid rgba(255, 255, 255, 0.12);
        position: relative;
        overflow: hidden;
        color: white;
      }
      .gv-scene__node {
        position: absolute;
        min-width: 140px;
        max-width: 220px;
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.10);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }
      .gv-scene__node strong {
        display: block;
        margin-bottom: 0.35rem;
      }
      .gv-scene__legend {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .gv-scene__legend span {
        padding: 0.38rem 0.68rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .gv-share-card {
        aspect-ratio: 1200 / 630;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: clamp(20px, 4vw, 42px);
        border-radius: 32px;
        background:
          radial-gradient(circle at top left, color-mix(in srgb, var(--gv-accent) 55%, white), transparent 40%),
          radial-gradient(circle at 80% 10%, rgba(255, 255, 255, 0.24), transparent 28%),
          linear-gradient(145deg, color-mix(in srgb, var(--gv-accent) 86%, #111), #0f1116);
        color: white;
        overflow: hidden;
      }
      .gv-share-card__headline {
        margin: 0;
        font-family: var(--gv-font-display);
        font-size: clamp(2rem, 5vw, 4.4rem);
        line-height: 0.96;
        letter-spacing: -0.05em;
      }
      .gv-share-card__excerpt {
        margin: 0;
        max-width: 42ch;
        font-size: clamp(1rem, 2.1vw, 1.45rem);
        color: rgba(255, 255, 255, 0.86);
      }
      .gv-quote-list {
        display: grid;
        gap: 10px;
      }
      .gv-quote {
        padding: 12px 14px;
        border-radius: 16px;
        border: 1px solid var(--gv-line);
        background: rgba(255, 255, 255, 0.45);
      }
      .gv-quote footer {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .gv-quote button {
        padding: 0.45rem 0.75rem;
        font-size: 0.84rem;
      }
      .gv-mermaid-fallback {
        margin-top: 12px;
        padding: 14px;
        border-radius: 16px;
        border: 1px dashed var(--gv-line);
        background: rgba(255, 255, 255, 0.4);
        overflow: auto;
        white-space: pre-wrap;
      }
      @media (max-width: 860px) {
        .gv-shell {
          width: min(100vw - 18px, 1160px);
          margin: 9px auto 18px;
          border-radius: 22px;
        }
        .gv-shell__main,
        .gv-shell__bar,
        .gv-footer {
          padding-left: 16px;
          padding-right: 16px;
        }
        .gv-grid--2,
        .gv-grid--3,
        .gv-grid--4,
        .gv-scene {
          grid-template-columns: 1fr;
        }
      }
    `,
    ...inlineStyles,
  ].join("\n");
}

function shellScript(): string {
  return `
    (() => {
      const postHeight = () => {
        try {
          const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
          window.parent?.postMessage({ type: "gestaltview:height", height }, "*");
        } catch (error) {
          console.warn("[codex-shell] height message failed", error);
        }
      };

      const renderMermaid = async () => {
        const targets = Array.from(document.querySelectorAll("[data-mermaid]"));
        if (!targets.length || !window.mermaid) {
          postHeight();
          return;
        }

        try {
          window.mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
          for (const [index, target] of targets.entries()) {
            const code = (target.textContent || "").trim();
            if (!code) continue;
            const id = \`gv-mermaid-\${index}-\${Date.now()}\`;
            const { svg } = await window.mermaid.render(id, code);
            target.innerHTML = svg;
            target.setAttribute("data-mermaid-rendered", "true");
            const fallback = target.parentElement?.querySelector(".gv-mermaid-fallback");
            if (fallback) {
              fallback.hidden = true;
            }
          }
        } catch (error) {
          console.warn("[codex-shell] mermaid rendering failed", error);
        } finally {
          postHeight();
        }
      };

      const start = () => {
        postHeight();
        renderMermaid();
        if (window.ResizeObserver) {
          const observer = new ResizeObserver(() => requestAnimationFrame(postHeight));
          observer.observe(document.body);
        }
      };

      window.addEventListener("load", start, { once: true });
      document.addEventListener("DOMContentLoaded", postHeight, { once: true });
      window.addEventListener("resize", () => requestAnimationFrame(postHeight));
      window.addEventListener("message", postHeight);
    })();
  `;
}

export function buildHtmlShell(opts: HtmlShellOptions): string {
  const accentColor = opts.accentColor ?? "#01696f";
  const renderedAt = new Date().toISOString();
  const metaTags = Object.entries(opts.meta ?? {})
    .map(([key, value]) => `<meta name="${safeAttr(key)}" content="${safeAttr(value)}" />`)
    .join("\n");
  const inlineScripts = opts.inlineScripts ?? [];
  const scriptTags = inlineScripts.map((script) => `<script>${script}</script>`).join("\n");
  const mermaidCdn = opts.mermaidDiagram && !opts.offline
    ? `<script defer src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light dark" />
  ${metaTags}
  <title>${safeText(opts.title)}</title>
  <link rel="preconnect" href="https://api.fontshare.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ${opts.offline ? "" : '<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f=satoshi@400,500,700&display=swap" />'}
  ${mermaidCdn}
  <style>${shellStyles(accentColor, Boolean(opts.offline), opts.inlineStyles)}</style>
</head>
<body>
  <main
    class="gv-shell"
    data-codex-artifact="${safeAttr(opts.meta?.artifactId ?? "")}"
    data-kind="${safeAttr(opts.kind)}"
    data-rendered-at="${safeAttr(renderedAt)}"
    data-offline="${opts.offline ? "true" : "false"}"
  >
    <section class="gv-shell__bar">
      <div class="gv-brand">
        <div class="gv-mark" aria-hidden="true"></div>
        <div>
          <div class="gv-kind">${safeText(opts.kind.replace(/_/g, " "))}</div>
          <h1 class="gv-title">${safeText(opts.title)}</h1>
          ${opts.subtitle ? `<p class="gv-subtitle">${safeText(opts.subtitle)}</p>` : ""}
        </div>
      </div>
      <div class="gv-meta">
        ${Object.entries(opts.meta ?? {}).map(([key, value]) => `<span><strong>${safeText(key)}</strong> ${safeText(value)}</span>`).join("")}
      </div>
    </section>
    <section class="gv-shell__main">
      ${opts.bodyContent}
    </section>
    <footer class="gv-footer">
      <span><strong>Rendered</strong> ${safeText(renderedAt)}</span>
      <span><strong>Kind</strong> ${safeText(opts.kind)}</span>
    </footer>
  </main>
  ${opts.mermaidDiagram && !opts.offline ? `<div hidden data-mermaid-template>${safeText(opts.mermaidDiagram)}</div>` : ""}
  <script>${shellScript()}</script>
  ${scriptTags}
</body>
</html>`;
}
