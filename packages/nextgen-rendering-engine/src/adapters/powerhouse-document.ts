/**
 * POWERHOUSE DOCUMENT BACKEND
 *
 * Renders document artifacts: Enhanced Markdown, HTML, JSON, TXT.
 * Supports sync preview (HTML) and async export (PDF, DOCX).
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

export class PowerhouseDocumentBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-document',
    kind: 'document',
    displayName: 'Powerhouse Document Renderer',
    artifactClasses: ['document', 'wiki', 'prompt'],
    supportedNodeTypes: ['Document', 'Markdown'],
    supportedFormats: ['html', 'markdown', 'json', 'txt'],
    executionMode: 'in-process',
    sourceProjects: ['remark', 'marked'],
    strengths: ['Enhanced Markdown rendering', 'Multi-format export', 'Live preview'],
    providerRequirements: ['gemini-flash', 'claude-sonnet'],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    // Collect content from Document/Markdown nodes
    const contentParts: string[] = [];
    for (const node of graph.nodes) {
      if (node.type === 'Document' || node.type === 'Markdown') {
        const source = String(node.props.source ?? node.props.content ?? '');
        if (source.trim()) {
          contentParts.push(source);
        }
      }
    }

    const fullContent = contentParts.join('\n\n');

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, fullContent);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.document.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, nodeCount: graph.nodes.length },
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

    // Render Markdown (sync)
    if (this.wantsTarget(job, 'markdown')) {
      try {
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.document.md`,
          fullContent,
          'markdown',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('markdown', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('markdown', errorMessage));
      }
    }

    // Render JSON (sync)
    if (this.wantsTarget(job, 'json')) {
      try {
        const jsonData = {
          title: graph.title,
          description: graph.description,
          content: fullContent,
          nodes: graph.nodes,
          metadata: graph.metadata,
        };
        const jsonContent = JSON.stringify(jsonData, null, 2);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.document.json`,
          jsonContent,
          'json',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('json', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('json', errorMessage));
      }
    }

    // Render TXT (sync)
    if (this.wantsTarget(job, 'txt')) {
      try {
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.document.txt`,
          fullContent,
          'txt',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('txt', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('txt', errorMessage));
      }
    }

    // PDF export (async - requires Puppeteer, not implemented in this backend)
    if (this.wantsTarget(job, 'pdf')) {
      targetResults.push(this.unsupportedTarget('pdf', 'PDF export requires Puppeteer backend (async path)'));
    }

    // DOCX export (async - requires docx library, not implemented)
    if (this.wantsTarget(job, 'docx')) {
      targetResults.push(this.unsupportedTarget('docx', 'DOCX export requires docx library (async path)'));
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
        nodeCount: graph.nodes.length,
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

  private renderToHtml(title: string, markdownContent: string): string {
    // Simple HTML rendering - in production, use remark/marked
    const escapedTitle = this.escapeHtml(title);
    const escapedContent = this.escapeHtml(markdownContent);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapedTitle}</title>
  <style>
    :root {
      --gv-bg: #0f0f11;
      --gv-surface: #1a1a1e;
      --gv-border: #2e2e38;
      --gv-text: #e2e8f0;
      --gv-muted: #94a3b8;
      --gv-accent: #818cf8;
      --gv-radius: 8px;
    }
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 2rem clamp(1rem, 5vw, 4rem);
      background: var(--gv-bg);
      color: var(--gv-text);
      line-height: 1.7;
      max-width: 860px;
      margin-inline: auto;
    }
    h1 {
      color: var(--gv-accent);
      border-bottom: 2px solid var(--gv-border);
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    .content {
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: var(--gv-radius);
      padding: 2rem;
    }
    pre {
      background: #1e1e2a;
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
    }
    code {
      background: #1e1e2a;
      border-radius: 4px;
      padding: 0.1em 0.4em;
      font-size: 0.875em;
    }
    blockquote {
      border-left: 3px solid var(--gv-accent);
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      background: var(--gv-surface);
      color: var(--gv-muted);
    }
  </style>
</head>
<body>
  <h1>${escapedTitle}</h1>
  <div class="content">
    <pre>${escapedContent}</pre>
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
