/**
 * POWERHOUSE CANVAS BACKEND
 *
 * Renders canvas artifacts: HTML5 Canvas, p5.js, Three.js sketches.
 * Generates interactive HTML with embedded canvas code.
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

interface CanvasSketch {
  type: 'canvas2d' | 'p5js' | 'threejs';
  code: string;
  width?: number;
  height?: number;
  interactive?: boolean;
}

export class PowerhouseCanvasBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-canvas',
    kind: 'canvas',
    displayName: 'Powerhouse Canvas Renderer',
    artifactClasses: ['canvas'],
    supportedNodeTypes: ['Canvas'],
    supportedFormats: ['html', 'png', 'mp4'],
    executionMode: 'in-process',
    sourceProjects: ['p5.js', 'three.js', 'canvas-api'],
    strengths: ['HTML5 Canvas', 'p5.js sketches', 'Three.js 3D'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const canvasNodes = graph.nodes.filter(n => n.type === 'Canvas');
    if (canvasNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_CANVAS_NODES',
          message: 'Canvas artifact requires at least one Canvas node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No canvas nodes found')),
      };
    }

    const canvasSketch = canvasNodes[0].props as unknown as CanvasSketch;

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, canvasSketch);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.canvas.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, sketchType: canvasSketch.type },
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

    // PNG export (async - requires Puppeteer)
    if (this.wantsTarget(job, 'png')) {
      targetResults.push(this.unsupportedTarget('png', 'PNG export requires Puppeteer (async path)'));
    }

    // MP4 export (async - requires video recording)
    if (this.wantsTarget(job, 'mp4')) {
      targetResults.push(this.unsupportedTarget('mp4', 'MP4 export requires video recording (async path)'));
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
        sketchType: canvasSketch.type,
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

  private renderToHtml(title: string, sketch: CanvasSketch): string {
    const escapedTitle = this.escapeHtml(title);
    const width = sketch.width || 800;
    const height = sketch.height || 600;

    let libraries = '';
    let initCode = '';

    if (sketch.type === 'p5js') {
      libraries = '<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>';
      initCode = sketch.code;
    } else if (sketch.type === 'threejs') {
      libraries = '<script src="https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.min.js"></script>';
      initCode = sketch.code;
    } else {
      // canvas2d
      initCode = `
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ${sketch.code}
      `;
    }

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  ${libraries}
  <style>
    :root {
      --gv-bg: #0f0f11;
      --gv-surface: #1a1a1e;
      --gv-border: #2e2e38;
      --gv-text: #e2e8f0;
      --gv-accent: #818cf8;
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 2rem;
      background: var(--gv-bg);
      color: var(--gv-text);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    h1 {
      color: var(--gv-accent);
      margin-bottom: 1rem;
    }
    canvas {
      border: 1px solid var(--gv-border);
      border-radius: 8px;
      background: #000;
    }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  ${sketch.type === 'p5js' ? '<div id="p5-container"></div>' : `<canvas id="canvas" width="${width}" height="${height}"></canvas>`}
  <script>
    ${initCode}
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
