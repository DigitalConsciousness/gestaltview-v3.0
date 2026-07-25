/**
 * POWERHOUSE SLIDE BACKEND
 *
 * Renders slide artifacts: HTML presentations with Reveal.js.
 * Supports sync HTML preview and async PDF/PPTX export.
 */

import type { RenderDiagnostic } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';
import { PowerhouseBaseBackend } from './powerhouse-base.js';
import type {
  PowerhouseCapabilityManifest,
  PowerhouseRenderJob,
  PowerhouseRenderResult,
  TargetResult,
} from '../core/types-powerhouse.js';

interface Slide {
  title: string;
  content: string;
  notes?: string;
  background?: string;
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
}

interface SlideDeckData {
  slides: Slide[];
  theme?: 'black' | 'white' | 'league' | 'beige' | 'sky' | 'night' | 'serif' | 'simple' | 'solarized' | 'blood' | 'moon';
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
}

export class PowerhouseSlideBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-slide',
    kind: 'slide',
    displayName: 'Powerhouse Slide Renderer',
    artifactClasses: ['slide', 'pitch'],
    supportedNodeTypes: ['Slide'],
    supportedFormats: ['html', 'pdf', 'pptx'],
    executionMode: 'in-process',
    sourceProjects: ['reveal.js', 'pptxgenjs'],
    strengths: ['Reveal.js presentations', 'Multiple themes', 'Speaker notes'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const slideNodes = graph.nodes.filter(n => n.type === 'Slide');
    if (slideNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_SLIDE_NODES',
          message: 'Slide artifact requires at least one Slide node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No slide nodes found')),
      };
    }

    const slideData = slideNodes[0].props as unknown as SlideDeckData;

    // Render HTML (sync preview with Reveal.js)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, slideData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.slide.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, slideCount: slideData.slides.length },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('html', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('html', errorMessage));
        diagnostics.push({
          code: 'HTML_RENDER_FAILED',
          message: `HTML rendering failed: ${errorMessage}`,
          severity: 'fatal',
          stage: 'render',
        });
      }
    }

    // PDF export (async - requires Puppeteer)
    if (this.wantsTarget(job, 'pdf')) {
      targetResults.push(this.unsupportedTarget('pdf', 'PDF export requires Puppeteer (async path)'));
    }

    // PPTX export (async - requires pptxgenjs)
    if (this.wantsTarget(job, 'pptx')) {
      targetResults.push(this.unsupportedTarget('pptx', 'PPTX export requires pptxgenjs (async path)'));
    }

    const fatal = diagnostics.some(d => d.severity === 'fatal');

    return {
      ok: !fatal,
      jobId: job.jobId,
      artifacts,
      diagnostics,
      manifest: {
        capability: this.capability,
        artifactClass: graph.artifactClass,
        slideCount: slideData.slides.length,
        targetCount: targetResults.length,
      },
      powerhouseArtifacts: artifacts.map(a => ({
        ...a,
        artifactClass: graph.artifactClass,
        provenance: graph.provenance,
      })),
      targetResults,
    };
  }

  private renderToHtml(title: string, data: SlideDeckData): string {
    const escapedTitle = this.escapeHtml(title);
    const theme = data.theme || 'black';
    const transition = data.transition || 'slide';
    
    const slidesHtml = data.slides.map(slide => {
      const notesHtml = slide.notes ? `<aside class="notes">${this.escapeHtml(slide.notes)}</aside>` : '';
      const bgStyle = slide.background ? `data-background-color="${slide.background}"` : '';
      const slideTransition = slide.transition ? `data-transition="${slide.transition}"` : '';
      
      return `
        <section ${bgStyle} ${slideTransition}>
          <h2>${this.escapeHtml(slide.title)}</h2>
          <div class="slide-content">${slide.content}</div>
          ${notesHtml}
        </section>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/theme/${theme}.css">
  <style>
    .reveal {
      font-family: system-ui, -apple-system, sans-serif;
    }
    .reveal h1, .reveal h2, .reveal h3 {
      color: #818cf8;
    }
    .reveal .slide-content {
      text-align: left;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1>${escapedTitle}</h1>
      </section>
      ${slidesHtml}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      transition: '${transition}',
      slideNumber: true,
      showNotes: false,
    });
  </script>
</body>
</html>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
}
