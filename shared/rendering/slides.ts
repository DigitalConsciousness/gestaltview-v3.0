import { Renderer, RenderedArtifact } from './types';

/**
 * SlideRenderer converts a Markdown deck (Slidev / Reveal.js syntax)
 * into a self-contained interactive HTML presentation using Reveal.js
 * loaded from CDN.  Slides are delimited by `---` in the input.
 *
 * Supported formats:
 *  - html : full Reveal.js presentation (renderable in <iframe srcDoc>)
 *  - pdf  : stub — real PDF export requires Puppeteer + decktape; falls
 *            back to HTML bytes until headless export is wired up
 *  - png  : stub — same fallback
 */
export class SlideRenderer implements Renderer<string> {
  public readonly kind = 'slides';

  private readonly REVEAL_VERSION = '5.1.0';

  public formats(): string[] {
    return ['html', 'pdf', 'png'];
  }

  public async render(input: string, format: string): Promise<RenderedArtifact> {
    switch (format) {
      case 'html': {
        return { format: 'html', data: this.buildRevealHtml(input) };
      }
      case 'pdf':
      case 'png': {
        // Stub: return the Reveal.js HTML bytes.  To produce a real PDF,
        // pipe this HTML through Puppeteer + decktape:
        //   await decktape reveal --size 1920x1080 file.html out.pdf
        return { format, data: Buffer.from(this.buildRevealHtml(input), 'utf-8') };
      }
      default:
        throw new Error(`SlideRenderer does not support format: ${format}`);
    }
  }

  private buildRevealHtml(markdown: string): string {
    const slides = markdown.split(/^---+$/m);
    const sections = slides
      .map((slide) => slide.trim())
      .filter(Boolean)
      .map((slide) => `<section data-markdown><textarea data-template>\n${slide}\n</textarea></section>`)
      .join('\n');

    const v = this.REVEAL_VERSION;
    const cdn = `https://cdn.jsdelivr.net/npm/reveal.js@${v}`;

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slide Deck</title>
  <link rel="stylesheet" href="${cdn}/dist/reveal.css">
  <link rel="stylesheet" href="${cdn}/dist/theme/black.css">
  <link rel="stylesheet" href="${cdn}/plugin/highlight/monokai.css">
  <style>
    :root { --r-background-color: #0f0f11; --r-heading-color: #e2e8f0; --r-main-color: #cbd5e1; }
    .reveal .slides section { text-align: left; }
    .reveal h1, .reveal h2 { font-size: 1.6em; font-weight: 700; }
    .reveal pre code { max-height: 400px; }
    .slide-number { bottom: 12px !important; right: 12px !important; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${sections}
    </div>
  </div>
  <script src="${cdn}/dist/reveal.js"></script>
  <script src="${cdn}/plugin/markdown/markdown.js"></script>
  <script src="${cdn}/plugin/highlight/highlight.js"></script>
  <script src="${cdn}/plugin/notes/notes.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      slideNumber: true,
      transition: 'slide',
      backgroundTransition: 'fade',
      plugins: [ RevealMarkdown, RevealHighlight, RevealNotes ]
    });
  </script>
</body>
</html>`;
  }
}
