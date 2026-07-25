import { Renderer, RenderedArtifact } from './types';
import { escapeHtml, renderMarkdown } from '../codex/templates/renderers/index.js';

/**
 * MarkdownRenderer converts Markdown into HTML or a JSON AST.
 *
 * Enhancement strategy (progressive enhancement):
 *  1. If the `remark` + `remark-html` package chain is available at
 *     runtime (installed via npm), use the full remark → rehype pipeline
 *     with Mermaid diagram support.
 *  2. If those packages are absent (e.g. edge runtime constraints),
 *     fall back to the existing `renderMarkdown()` from the codex
 *     templates, keeping the renderer functional in all environments.
 *
 * To unlock the full pipeline:
 *   npm install --save remark remark-parse remark-html remark-gfm
 *
 * Mermaid diagrams in fenced ```mermaid blocks are converted to
 * self-rendering <div class="mermaid"> nodes; the Mermaid CDN script
 * is injected once into the <head>.
 */
export class MarkdownRenderer implements Renderer<string> {
  public readonly kind = 'markdown';

  public formats(): string[] {
    return ['html', 'json'];
  }

  public async render(input: string, format: string): Promise<RenderedArtifact> {
    if (format === 'html') {
      const { body, hasMermaid } = await this.processMarkdown(input);
      return {
        format: 'html',
        data: this.wrapHtmlDocument(body, hasMermaid),
      };
    }
    if (format === 'json') {
      // Return a lightweight JSON AST-like structure.
      // If remark-parse is available, swap this for a real Unist AST.
      return {
        format: 'json',
        data: JSON.stringify({ type: 'markdown', content: input, length: input.length }, null, 2),
      };
    }
    throw new Error(`MarkdownRenderer does not support format: ${format}`);
  }

  // ─── Markdown processing ───────────────────────────────────────────────

  private async processMarkdown(input: string): Promise<{ body: string; hasMermaid: boolean }> {
    // Pre-process: extract fenced mermaid blocks before passing to marked/remark
    // so they survive HTML conversion as <div class="mermaid">.
    const { src, hasMermaid } = this.liftMermaidBlocks(input);

    // Attempt dynamic import of remark pipeline (not required at build time).
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [{ unified }, remarkParse, remarkGfm, remarkHtml] = await Promise.all([
        import('unified' as any),
        import('remark-parse' as any),
        import('remark-gfm' as any),
        import('remark-html' as any),
      ]);

      const file = await unified()
        .use(remarkParse.default ?? remarkParse)
        .use(remarkGfm.default ?? remarkGfm)
        .use(remarkHtml.default ?? remarkHtml, { sanitize: false })
        .process(src);

      return { body: String(file), hasMermaid };
    } catch {
      // Fallback: use existing codex renderMarkdown utility
      const body = renderMarkdown(src) || `<pre>${escapeHtml(src)}</pre>`;
      return { body, hasMermaid };
    }
  }

  /**
   * Replace fenced ```mermaid blocks with <div class="mermaid"> so
   * the Mermaid CDN script can pick them up on load.
   */
  private liftMermaidBlocks(input: string): { src: string; hasMermaid: boolean } {
    let hasMermaid = false;
    const src = input.replace(/```mermaid\r?\n([\s\S]*?)```/g, (_match, diagram) => {
      hasMermaid = true;
      return `<div class="mermaid">\n${diagram.trim()}\n</div>`;
    });
    return { src, hasMermaid };
  }

  // ─── HTML document shell ────────────────────────────────────────────

  private wrapHtmlDocument(body: string, hasMermaid: boolean): string {
    const mermaidHead = hasMermaid
      ? `  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <script>mermaid.initialize({ startOnLoad: true, theme: 'dark' });</script>`
      : '';

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Markdown Preview</title>
  <style>
    /* GestaltView design token baseline */
    :root {
      --gv-bg:        #0f0f11;
      --gv-surface:   #1a1a1e;
      --gv-border:    #2e2e38;
      --gv-text:      #e2e8f0;
      --gv-muted:     #94a3b8;
      --gv-accent:    #818cf8;
      --gv-accent-2:  #34d399;
      --gv-code-bg:   #1e1e2a;
      --gv-radius:    8px;
      --gv-font-mono: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 2rem clamp(1rem, 5vw, 4rem);
      background: var(--gv-bg);
      color: var(--gv-text);
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-size: 1rem;
      line-height: 1.7;
      max-width: 860px;
      margin-inline: auto;
    }
    h1, h2, h3, h4, h5, h6 {
      color: var(--gv-text);
      font-weight: 700;
      line-height: 1.25;
      margin-top: 2rem;
      margin-bottom: 0.5rem;
    }
    h1 { font-size: 2rem; border-bottom: 1px solid var(--gv-border); padding-bottom: 0.4rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.2rem; color: var(--gv-accent); }
    p  { margin: 0.75rem 0; }
    a  { color: var(--gv-accent); text-decoration: underline; text-underline-offset: 3px; }
    a:hover { color: var(--gv-accent-2); }
    code {
      font-family: var(--gv-font-mono);
      font-size: 0.875em;
      background: var(--gv-code-bg);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      padding: 0.1em 0.4em;
    }
    pre {
      background: var(--gv-code-bg);
      border: 1px solid var(--gv-border);
      border-radius: var(--gv-radius);
      padding: 1.25rem;
      overflow-x: auto;
    }
    pre code { background: none; border: none; padding: 0; font-size: 0.875rem; }
    blockquote {
      border-left: 3px solid var(--gv-accent);
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: var(--gv-surface);
      border-radius: 0 var(--gv-radius) var(--gv-radius) 0;
      color: var(--gv-muted);
    }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid var(--gv-border); padding: 0.5rem 0.75rem; }
    th { background: var(--gv-surface); color: var(--gv-accent); font-weight: 600; }
    tr:nth-child(even) td { background: var(--gv-surface); }
    hr { border: none; border-top: 1px solid var(--gv-border); margin: 2rem 0; }
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.25rem 0; }
    img { max-width: 100%; border-radius: var(--gv-radius); }
    .mermaid { background: var(--gv-surface); border-radius: var(--gv-radius); padding: 1rem; margin: 1rem 0; }
    .mermaid svg { max-width: 100%; height: auto; }
  </style>
${mermaidHead}
</head>
<body>
${body}
</body>
</html>`;
  }
}
