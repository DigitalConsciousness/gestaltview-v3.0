/**
 * POWERHOUSE PITCH DECK BACKEND
 *
 * Renders pitch deck artifacts: Investor-ready presentations with financial
 * templates, market sizing, and narrative structure. Extends slide backend
 * with pitch-specific slide types.
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

interface PitchSlide {
  type: 'title' | 'problem' | 'solution' | 'market' | 'product' | 'traction' | 'business-model' | 'team' | 'financials' | 'ask' | 'custom';
  title: string;
  content: string;
  data?: Record<string, any>;
}

interface PitchDeckData {
  companyName: string;
  tagline?: string;
  slides: PitchSlide[];
  theme?: 'dark' | 'light' | 'minimal';
  accentColor?: string;
}

export class PowerhousePitchBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-pitch',
    kind: 'pitch',
    displayName: 'Powerhouse Pitch Deck Builder',
    artifactClasses: ['pitch'],
    supportedNodeTypes: ['Pitch'],
    supportedFormats: ['html', 'pptx', 'pdf'],
    executionMode: 'in-process',
    sourceProjects: ['reveal.js', 'pptxgenjs'],
    strengths: ['Investor pitch templates', 'Financial slide types', 'Narrative structure'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const pitchNodes = graph.nodes.filter(n => n.type === 'Pitch');
    if (pitchNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_PITCH_NODES',
          message: 'Pitch artifact requires at least one Pitch node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No pitch nodes found')),
      };
    }

    const pitchData = pitchNodes[0].props as unknown as PitchDeckData;

    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, pitchData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.pitch.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, slideCount: pitchData.slides.length },
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

    if (this.wantsTarget(job, 'pptx')) {
      targetResults.push(this.unsupportedTarget('pptx', 'PPTX export requires pptxgenjs (async path)'));
    }

    if (this.wantsTarget(job, 'pdf')) {
      targetResults.push(this.unsupportedTarget('pdf', 'PDF export requires Puppeteer (async path)'));
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
        companyName: pitchData.companyName,
        slideCount: pitchData.slides.length,
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

  private renderToHtml(title: string, data: PitchDeckData): string {
    const escapedTitle = this.escapeHtml(title);
    const accent = data.accentColor || '#818cf8';
    const theme = data.theme || 'dark';

    const bg = theme === 'light' ? '#ffffff' : '#0f0f11';
    const surface = theme === 'light' ? '#f8f9fa' : '#1a1a1e';
    const text = theme === 'light' ? '#212529' : '#e2e8f0';
    const muted = theme === 'light' ? '#6c757d' : '#94a3b8';
    const border = theme === 'light' ? '#dee2e6' : '#2e2e38';

    const slidesHtml = data.slides.map((slide, idx) => {
      const typeIcon = {
        title: '🏠', problem: '⚡', solution: '💡', market: '📊',
        product: '🔧', traction: '📈', 'business-model': '💰',
        team: '👥', financials: '📋', ask: '🎯', custom: '📄',
      }[slide.type] || '📄';

      return `
        <section class="slide" data-type="${slide.type}">
          <div class="slide-header">
            <span class="slide-number">${idx + 1}</span>
            <span class="slide-type">${typeIcon} ${this.escapeHtml(slide.type)}</span>
          </div>
          <h2>${this.escapeHtml(slide.title)}</h2>
          <div class="slide-content">${slide.content}</div>
        </section>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/theme/black.css">
  <style>
    :root {
      --r-background-color: ${bg};
      --r-main-color: ${text};
      --r-heading-color: ${accent};
      --accent: ${accent};
    }
    .reveal .slides section {
      text-align: left;
      padding: 2rem;
    }
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 0.75rem;
      color: ${muted};
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .slide-number {
      background: ${surface};
      border: 1px solid ${border};
      border-radius: 12px;
      padding: 0.25rem 0.75rem;
    }
    .reveal h2 {
      color: ${accent};
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    .slide-content {
      font-size: 1rem;
      line-height: 1.8;
    }
    .reveal .slide-number {
      color: ${muted};
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h1 style="color: ${accent}; font-size: 2.5rem;">${this.escapeHtml(data.companyName)}</h1>
        ${data.tagline ? `<p style="color: ${muted}; font-size: 1.25rem;">${this.escapeHtml(data.tagline)}</p>` : ''}
      </section>
      ${slidesHtml}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.0.0/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      slideNumber: true,
      transition: 'slide',
      width: 1280,
      height: 720,
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
