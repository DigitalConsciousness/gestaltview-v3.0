import { BaseBackend } from './base.js';
import type { BackendCapabilityManifest, RenderJob, RenderResult, RenderDiagnostic } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';

export class DiagramBackend extends BaseBackend {
  readonly capability: BackendCapabilityManifest = {
    id: 'gestalt-diagram-backend',
    kind: 'diagram',
    displayName: 'GestaltView Diagram Renderer',
    supportedNodeTypes: ['Diagram','Document','ExportRequest'],
    supportedFormats: ['svg','mmd','json'],
    executionMode: 'in-process',
    sourceProjects: ['mermaid','xyflow'],
    strengths: ['Mermaid-to-SVG via mermaid-cli (node API, no CDN)','Graph/flow export contract','Truthful placeholder when rendering unavailable']
  };

  protected async renderValidated(job: RenderJob): Promise<RenderResult> {
    const diagrams = job.graph.nodes.filter((node) => node.type === 'Diagram');
    const artifacts = [];
    const diagnostics: RenderDiagnostic[] = [];

    for (const diagram of diagrams) {
      const source = String(diagram.props.source ?? 'flowchart LR\n  Missing[Missing source]');
      const diagramType = String(diagram.props.diagramType ?? 'flowchart');
      const label = diagram.name ?? diagram.id;

      // Always export the .mmd source
      artifacts.push(await writeTextArtifact(
        job, this.capability.id,
        `${job.jobId}.${diagram.id}.mmd`,
        source, 'mmd',
        { diagramType },
      ));

      // Try deterministic Mermaid-to-SVG via Node API (no CDN script in artifact)
      let svgRendered = false;
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mermaidModule = await import('mermaid' as any);
        const mermaid = mermaidModule.default ?? mermaidModule;

        // Initialize mermaid in node mode (no browser DOM)
        if (typeof mermaid.initialize === 'function') {
          mermaid.initialize({ startOnLoad: false, theme: 'dark' });
        }

        if (typeof mermaid.render === 'function') {
          const { svg } = await mermaid.render(`${diagram.id}-svg`, source);
          if (svg && typeof svg === 'string' && svg.includes('<svg')) {
            artifacts.push(await writeTextArtifact(
              job, this.capability.id,
              `${job.jobId}.${diagram.id}.svg`,
              svg, 'svg',
              { diagramType, sourceProject: 'mermaid-node', generatedDeterministically: true },
            ));
            svgRendered = true;
          }
        }
      } catch {
        // Mermaid module unavailable or render failed — fall back to placeholder
      }

      if (!svgRendered) {
        // Truthful placeholder: this is NOT a real SVG, it's a diagram representation
        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="240" viewBox="0 0 960 240">
  <rect width="100%" height="100%" fill="#101827"/>
  <text x="32" y="48" fill="#9ee2ff" font-family="monospace" font-size="14" font-weight="bold">DIAGRAM PLACEHOLDER</text>
  <text x="32" y="72" fill="#818cf8" font-family="monospace" font-size="12">${escapeXml(label)} · ${escapeXml(diagramType)}</text>
  <text x="32" y="96" fill="#94a3b8" font-family="monospace" font-size="11">Install "mermaid" npm package for deterministic SVG rendering.</text>
  <text x="32" y="120" fill="#64748b" font-family="monospace" font-size="10">Source preserved in .mmd companion artifact.</text>
</svg>`;

        artifacts.push(await writeTextArtifact(
          job, this.capability.id,
          `${job.jobId}.${diagram.id}.svg`,
          placeholderSvg, 'svg',
          { diagramType, isPlaceholder: true, sourceProject: 'none' },
        ));

        diagnostics.push({
          code: 'MERMAID_UNAVAILABLE',
          message: `Mermaid node API not available for diagram ${diagram.id}. SVG is a truthful placeholder; .mmd source preserved.`,
          severity: 'warning',
          stage: 'rendering',
          details: { diagramId: diagram.id, diagramType },
        });
      }
    }

    return result(job, this.capability.id, artifacts, diagnostics, {
      capability: this.capability,
      diagramCount: diagrams.length,
    });
  }
}

function escapeXml(value: string): string {
  return value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
