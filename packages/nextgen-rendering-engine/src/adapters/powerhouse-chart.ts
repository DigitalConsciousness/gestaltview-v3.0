/**
 * POWERHOUSE CHART BACKEND
 *
 * Renders chart artifacts: Bar, Line, Pie, Area, Scatter, Radar.
 * Uses Chart.js for rendering with sync HTML preview and async PNG/SVG export.
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

interface ChartData {
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
  title?: string;
  options?: Record<string, any>;
}

export class PowerhouseChartBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-chart',
    kind: 'chart',
    displayName: 'Powerhouse Chart Renderer',
    artifactClasses: ['chart'],
    supportedNodeTypes: ['Chart'],
    supportedFormats: ['html', 'png', 'svg'],
    executionMode: 'in-process',
    sourceProjects: ['chart.js', 'echarts'],
    strengths: ['Chart.js rendering', 'Multiple chart types', 'Interactive preview'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    // Collect chart data from nodes
    const chartNodes = graph.nodes.filter(n => n.type === 'Chart');
    if (chartNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_CHART_NODES',
          message: 'Chart artifact requires at least one Chart node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No chart nodes found')),
      };
    }

    const chartData = chartNodes.map(node => node.props as unknown as ChartData);

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, chartData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.chart.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, chartCount: chartData.length },
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

    // PNG export (async - requires canvas/Puppeteer)
    if (this.wantsTarget(job, 'png')) {
      targetResults.push(this.unsupportedTarget('png', 'PNG export requires canvas/Puppeteer (async path)'));
    }

    // SVG export (async - requires chart.js-node-canvas)
    if (this.wantsTarget(job, 'svg')) {
      targetResults.push(this.unsupportedTarget('svg', 'SVG export requires chart.js-node-canvas (async path)'));
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
        chartCount: chartData.length,
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

  private renderToHtml(title: string, charts: ChartData[]): string {
    const escapedTitle = this.escapeHtml(title);
    const chartConfigs = charts.map((chart, idx) => this.buildChartConfig(chart, idx)).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
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
    }
    h1 {
      color: var(--gv-accent);
      margin-bottom: 2rem;
    }
    .chart-container {
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      max-width: 800px;
    }
    canvas {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  ${chartConfigs}
  <script>
    ${charts.map((chart, idx) => this.buildChartScript(chart, idx)).join('\n')}
  </script>
</body>
</html>`;
  }

  private buildChartConfig(chart: ChartData, index: number): string {
    return `<div class="chart-container">
  <canvas id="chart-${index}"></canvas>
</div>`;
  }

  private buildChartScript(chart: ChartData, index: number): string {
    const config = {
      type: chart.chartType,
      data: {
        labels: chart.labels,
        datasets: chart.datasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: { color: '#e2e8f0' },
          },
          title: {
            display: !!chart.title,
            text: chart.title || '',
            color: '#818cf8',
          },
        },
        scales: {
          x: {
            ticks: { color: '#94a3b8' },
            grid: { color: '#2e2e38' },
          },
          y: {
            ticks: { color: '#94a3b8' },
            grid: { color: '#2e2e38' },
          },
        },
        ...chart.options,
      },
    };

    return `new Chart(document.getElementById('chart-${index}'), ${JSON.stringify(config, null, 2)});`;
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
