/**
 * POWERHOUSE COMPONENT BACKEND
 *
 * Renders component artifacts: Isolated React components with props panel and live preview.
 * Extends the app backend with component-specific features.
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

interface ComponentData {
  name: string;
  code: string;
  props?: Record<string, { type: string; default?: any; description?: string }>;
  variants?: Array<{ name: string; props: Record<string, any> }>;
  styles?: string;
}

export class PowerhouseComponentBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-component',
    kind: 'component',
    displayName: 'Powerhouse Component Builder',
    artifactClasses: ['component'],
    supportedNodeTypes: ['Component'],
    supportedFormats: ['html', 'react'],
    executionMode: 'in-process',
    sourceProjects: ['react', 'sandpack'],
    strengths: ['Isolated component sandbox', 'Props panel', 'Variant preview'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const componentNodes = graph.nodes.filter(n => n.type === 'Component');
    if (componentNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_COMPONENT_NODES',
          message: 'Component artifact requires at least one Component node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No component nodes found')),
      };
    }

    const componentData = componentNodes[0].props as unknown as ComponentData;

    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, componentData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.component.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, componentName: componentData.name },
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

    if (this.wantsTarget(job, 'react')) {
      try {
        const reactCode = this.renderToReact(componentData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.component.tsx`,
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
        componentName: componentData.name,
        variantCount: componentData.variants?.length || 0,
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

  private renderToHtml(title: string, data: ComponentData): string {
    const escapedTitle = this.escapeHtml(title);
    const escapedName = this.escapeHtml(data.name);
    const propsJson = JSON.stringify(data.props || {}, null, 2);
    const variantsJson = JSON.stringify(data.variants || [], null, 2);
    const styles = data.styles || '';

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle} — ${escapedName}</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    :root {
      --gv-bg: #0f0f11;
      --gv-surface: #1a1a1e;
      --gv-border: #2e2e38;
      --gv-text: #e2e8f0;
      --gv-muted: #94a3b8;
      --gv-accent: #818cf8;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
      display: grid;
      grid-template-columns: 1fr 300px;
      min-height: 100vh;
    }
    .preview-panel {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .preview-panel h1 {
      color: var(--gv-accent);
      font-size: 1.25rem;
      margin: 0;
    }
    .preview-frame {
      flex: 1;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 8px;
      padding: 2rem;
      overflow: auto;
    }
    .controls-panel {
      background: var(--gv-surface);
      border-left: 1px solid var(--gv-border);
      padding: 1rem;
      overflow-y: auto;
    }
    .controls-panel h2 {
      color: var(--gv-accent);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 1rem 0 0.5rem;
    }
    .prop-row {
      margin-bottom: 0.75rem;
    }
    .prop-row label {
      display: block;
      color: var(--gv-muted);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
    }
    .prop-row input, .prop-row select {
      width: 100%;
      padding: 0.5rem;
      background: var(--gv-bg);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text);
    }
    .variant-btn {
      display: block;
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background: var(--gv-bg);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text);
      cursor: pointer;
      text-align: left;
    }
    .variant-btn:hover, .variant-btn.active {
      border-color: var(--gv-accent);
      color: var(--gv-accent);
    }
    ${styles}
  </style>
</head>
<body>
  <div class="preview-panel">
    <h1>${escapedName}</h1>
    <div class="preview-frame" id="preview"></div>
  </div>
  <div class="controls-panel">
    <h2>Props</h2>
    <div id="propsPanel"></div>
    <h2>Variants</h2>
    <div id="variantsPanel"></div>
  </div>
  <script type="text/babel">
    ${data.code}

    const propDefs = ${propsJson};
    const variants = ${variantsJson};

    // Build props editor
    const propsPanel = document.getElementById('propsPanel');
    const currentProps = {};

    Object.entries(propDefs).forEach(([key, def]) => {
      currentProps[key] = def.default;
      const row = document.createElement('div');
      row.className = 'prop-row';
      const label = document.createElement('label');
      label.textContent = key + ' (' + def.type + ')';
      if (def.description) label.title = def.description;
      row.appendChild(label);

      const input = document.createElement('input');
      input.value = JSON.stringify(def.default ?? '');
      input.addEventListener('input', (e) => {
        try {
          currentProps[key] = JSON.parse(e.target.value);
        } catch {
          currentProps[key] = e.target.value;
        }
        renderPreview();
      });
      row.appendChild(input);
      propsPanel.appendChild(row);
    });

    // Build variants panel
    const variantsPanel = document.getElementById('variantsPanel');
    variants.forEach((variant, idx) => {
      const btn = document.createElement('button');
      btn.className = 'variant-btn';
      btn.textContent = variant.name;
      btn.addEventListener('click', () => {
        Object.assign(currentProps, variant.props);
        document.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPreview();
      });
      variantsPanel.appendChild(btn);
    });

    function renderPreview() {
      const root = ReactDOM.createRoot(document.getElementById('preview'));
      root.render(React.createElement(${data.name}, currentProps));
    }

    renderPreview();
  </script>
</body>
</html>`;
  }

  private renderToReact(data: ComponentData): string {
    return `import React from 'react';

${data.code}

export default ${data.name};
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
