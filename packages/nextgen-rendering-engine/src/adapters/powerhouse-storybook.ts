/**
 * POWERHOUSE STORYBOOK BACKEND
 *
 * Renders storybook artifacts: Visual narrative / comic layout with scene panels
 * and text overlays. Generates HTML with panel-based layout.
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

interface StoryScene {
  id: string;
  title?: string;
  narration?: string;
  dialogue?: Array<{ character: string; text: string }>;
  imageUrl?: string;
  imagePrompt?: string;
  layout?: 'full' | 'half' | 'third' | 'quarter';
}

interface StorybookData {
  title: string;
  scenes: StoryScene[];
  style?: 'comic' | 'graphic-novel' | 'picture-book' | 'storyboard';
  theme?: 'dark' | 'light' | 'sepia';
}

export class PowerhouseStorybookBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-storybook',
    kind: 'storybook',
    displayName: 'Powerhouse Storybook Creator',
    artifactClasses: ['storybook'],
    supportedNodeTypes: ['Storybook'],
    supportedFormats: ['html', 'pdf', 'png'],
    executionMode: 'in-process',
    sourceProjects: ['react'],
    strengths: ['Panel-based layout', 'Scene narration', 'Multiple styles'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const storyNodes = graph.nodes.filter(n => n.type === 'Storybook');
    if (storyNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_STORY_NODES',
          message: 'Storybook artifact requires at least one Storybook node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No storybook nodes found')),
      };
    }

    const storyData = storyNodes[0].props as unknown as StorybookData;

    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, storyData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.storybook.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, sceneCount: storyData.scenes.length },
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

    if (this.wantsTarget(job, 'pdf')) {
      targetResults.push(this.unsupportedTarget('pdf', 'PDF export requires Puppeteer (async path)'));
    }

    if (this.wantsTarget(job, 'png')) {
      targetResults.push(this.unsupportedTarget('png', 'PNG export requires Puppeteer (async path)'));
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
        sceneCount: storyData.scenes.length,
        style: storyData.style || 'comic',
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

  private renderToHtml(title: string, data: StorybookData): string {
    const escapedTitle = this.escapeHtml(title);
    const style = data.style || 'comic';
    const theme = data.theme || 'dark';

    const themeColors = {
      dark: { bg: '#0f0f11', surface: '#1a1a1e', border: '#2e2e38', text: '#e2e8f0', accent: '#818cf8', muted: '#94a3b8' },
      light: { bg: '#f8f9fa', surface: '#ffffff', border: '#dee2e6', text: '#212529', accent: '#4f46e5', muted: '#6c757d' },
      sepia: { bg: '#f5e6d3', surface: '#faf0e6', border: '#d4a574', text: '#3e2723', accent: '#8b4513', muted: '#795548' },
    };

    const colors = themeColors[theme] || themeColors.dark;

    const panelsHtml = data.scenes.map((scene, idx) => {
      const layoutWidth = {
        full: '100%',
        half: 'calc(50% - 0.5rem)',
        third: 'calc(33.33% - 0.67rem)',
        quarter: 'calc(25% - 0.75rem)',
      }[scene.layout || 'full'];

      const dialogueHtml = scene.dialogue?.map(d =>
        `<div class="dialogue"><strong>${this.escapeHtml(d.character)}:</strong> ${this.escapeHtml(d.text)}</div>`
      ).join('') || '';

      return `
        <div class="panel" style="width: ${layoutWidth};">
          <div class="panel-image" style="background: ${colors.surface};">
            ${scene.imageUrl
              ? `<img src="${this.escapeHtml(scene.imageUrl)}" alt="${this.escapeHtml(scene.title || `Scene ${idx + 1}`)}">`
              : `<div class="panel-placeholder">${scene.imagePrompt ? this.escapeHtml(scene.imagePrompt) : `Scene ${idx + 1}`}</div>`
            }
          </div>
          ${scene.title ? `<h3>${this.escapeHtml(scene.title)}</h3>` : ''}
          ${scene.narration ? `<p class="narration">${this.escapeHtml(scene.narration)}</p>` : ''}
          ${dialogueHtml}
        </div>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <style>
    :root {
      --gv-bg: ${colors.bg};
      --gv-surface: ${colors.surface};
      --gv-border: ${colors.border};
      --gv-text: ${colors.text};
      --gv-accent: ${colors.accent};
      --gv-muted: ${colors.muted};
    }
    * { box-sizing: border-box; }
    body {
      font-family: ${style === 'comic' ? "'Comic Sans MS', cursive" : 'system-ui, -apple-system, sans-serif'};
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
    }
    .cover {
      text-align: center;
      padding: 3rem 2rem;
      border-bottom: 3px solid var(--gv-border);
    }
    .cover h1 {
      color: var(--gv-accent);
      font-size: 2.5rem;
      margin: 0;
    }
    .cover .style-badge {
      display: inline-block;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 12px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      color: var(--gv-muted);
      margin-top: 0.5rem;
    }
    .story-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      padding: 2rem;
    }
    .panel {
      background: var(--gv-surface);
      border: 2px solid var(--gv-border);
      border-radius: 8px;
      overflow: hidden;
    }
    .panel-image {
      aspect-ratio: 16/9;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--gv-border);
    }
    .panel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .panel-placeholder {
      color: var(--gv-muted);
      font-style: italic;
      padding: 1rem;
      text-align: center;
    }
    .panel h3 {
      color: var(--gv-accent);
      margin: 0.75rem 1rem 0;
      font-size: 1rem;
    }
    .narration {
      margin: 0.5rem 1rem;
      font-style: italic;
      color: var(--gv-muted);
      line-height: 1.6;
    }
    .dialogue {
      margin: 0.25rem 1rem;
      padding: 0.5rem;
      background: var(--gv-bg);
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .dialogue strong {
      color: var(--gv-accent);
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${escapedTitle}</h1>
    <span class="style-badge">${this.escapeHtml(style)} · ${data.scenes.length} scenes</span>
  </div>
  <div class="story-grid">
    ${panelsHtml}
  </div>
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
