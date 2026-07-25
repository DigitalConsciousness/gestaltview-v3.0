/**
 * POWERHOUSE APP BACKEND
 *
 * Renders app artifacts: Interactive React applications with live preview.
 * Generates standalone HTML with embedded React components.
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

interface AppComponent {
  name: string;
  code: string;
  props?: Record<string, any>;
}

interface AppData {
  components: AppComponent[];
  mainComponent: string;
  dependencies?: Record<string, string>;
  styles?: string;
}

export class PowerhouseAppBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-app',
    kind: 'app',
    displayName: 'Powerhouse App Builder',
    artifactClasses: ['app', 'component'],
    supportedNodeTypes: ['App', 'Component'],
    supportedFormats: ['html', 'react'],
    executionMode: 'in-process',
    sourceProjects: ['react', 'sandpack'],
    strengths: ['Interactive React apps', 'Live preview', 'Component isolation'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const appNodes = graph.nodes.filter(n => n.type === 'App' || n.type === 'Component');
    if (appNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_APP_NODES',
          message: 'App artifact requires at least one App or Component node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No app nodes found')),
      };
    }

    const appData = appNodes[0].props as unknown as AppData;

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, appData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.app.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, componentCount: appData.components.length },
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

    // Render React (sync - exports component code)
    if (this.wantsTarget(job, 'react')) {
      try {
        const reactCode = this.renderToReact(appData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.app.jsx`,
          reactCode,
          'react',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('react', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('react', errorMessage));
      }
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
        componentCount: appData.components.length,
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

  private renderToHtml(title: string, data: AppData): string {
    const escapedTitle = this.escapeHtml(title);
    const componentsCode = data.components.map(c => c.code).join('\n\n');
    const mainComponent = data.components.find(c => c.name === data.mainComponent);
    const mainCode = mainComponent ? mainComponent.code : data.components[0]?.code || '';
    const styles = data.styles || '';

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
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
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
    }
    #root {
      min-height: 100vh;
    }
    ${styles}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${componentsCode}

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(${data.mainComponent || data.components[0]?.name || 'App'}));
  </script>
</body>
</html>`;
  }

  private renderToReact(data: AppData): string {
    const imports = ['import React from "react";'];
    const components = data.components.map(c => c.code).join('\n\n');
    const mainExport = `export default ${data.mainComponent || data.components[0]?.name || 'App'};`;

    return `${imports.join('\n')}

${components}

${mainExport}
`;
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
