/**
 * POWERHOUSE WIKI BACKEND
 *
 * Renders wiki artifacts: Multi-page documentation with linking and navigation.
 * Extends document backend with wiki-specific features.
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

interface WikiPage {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  relatedPages?: string[];
}

interface WikiData {
  pages: WikiPage[];
  homePage?: string;
  navigation?: Array<{ label: string; pageId: string }>;
}

export class PowerhouseWikiBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-wiki',
    kind: 'wiki',
    displayName: 'Powerhouse Wiki Renderer',
    artifactClasses: ['wiki'],
    supportedNodeTypes: ['Wiki'],
    supportedFormats: ['html', 'markdown', 'json'],
    executionMode: 'in-process',
    sourceProjects: ['remark', 'marked'],
    strengths: ['Multi-page documentation', 'Internal linking', 'Navigation'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const wikiNodes = graph.nodes.filter(n => n.type === 'Wiki');
    if (wikiNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_WIKI_NODES',
          message: 'Wiki artifact requires at least one Wiki node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No wiki nodes found')),
      };
    }

    const wikiData = wikiNodes[0].props as unknown as WikiData;

    // Render HTML (sync preview)
    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, wikiData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.wiki.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass, pageCount: wikiData.pages.length },
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
        const markdown = this.renderToMarkdown(wikiData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.wiki.md`,
          markdown,
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
        const jsonContent = JSON.stringify(wikiData, null, 2);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.wiki.json`,
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

    const fatal = diagnostics.some(d => d.severity === 'fatal');

    return {
      ok: !fatal,
      jobId: job.jobId,
      artifacts,
      diagnostics,
      manifest: {
        capability: this.capability,
        artifactClass: graph.artifactClass,
        pageCount: wikiData.pages.length,
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

  private renderToHtml(title: string, data: WikiData): string {
    const escapedTitle = this.escapeHtml(title);
    const homePageId = data.homePage || data.pages[0]?.id;
    
    const navHtml = (data.navigation || data.pages.map(p => ({ label: p.title, pageId: p.id })))
      .map(item => `<li><a href="#page-${item.pageId}" class="nav-link" data-page="${item.pageId}">${this.escapeHtml(item.label)}</a></li>`)
      .join('');

    const pagesHtml = data.pages.map(page => {
      const tagsHtml = page.tags?.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('') || '';
      const relatedHtml = page.relatedPages?.map(id => {
        const related = data.pages.find(p => p.id === id);
        return related ? `<a href="#page-${id}" class="related-link">${this.escapeHtml(related.title)}</a>` : '';
      }).join(', ') || '';

      return `
        <div class="wiki-page" id="page-${page.id}" style="display: none;">
          <h2>${this.escapeHtml(page.title)}</h2>
          <div class="page-content">${page.content}</div>
          ${tagsHtml ? `<div class="tags">${tagsHtml}</div>` : ''}
          ${relatedHtml ? `<div class="related">Related: ${relatedHtml}</div>` : ''}
        </div>`;
    }).join('');

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
    }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 250px;
      background: var(--gv-surface);
      border-right: 1px solid var(--gv-border);
      padding: 1rem;
      overflow-y: auto;
    }
    .sidebar h1 {
      color: var(--gv-accent);
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .sidebar ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .sidebar li {
      margin-bottom: 0.5rem;
    }
    .nav-link {
      color: var(--gv-text);
      text-decoration: none;
      padding: 0.5rem;
      display: block;
      border-radius: 4px;
      transition: background 0.2s;
    }
    .nav-link:hover, .nav-link.active {
      background: #1e1e2a;
      color: var(--gv-accent);
    }
    .content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
    .wiki-page h2 {
      color: var(--gv-accent);
      border-bottom: 2px solid var(--gv-border);
      padding-bottom: 0.5rem;
    }
    .tags {
      margin-top: 1rem;
    }
    .tag {
      display: inline-block;
      background: #1e1e2a;
      border: 1px solid var(--gv-border);
      border-radius: 12px;
      padding: 0.25rem 0.75rem;
      font-size: 0.875rem;
      margin-right: 0.5rem;
    }
    .related {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--gv-border);
      color: var(--gv-muted);
    }
    .related-link {
      color: var(--gv-accent);
      text-decoration: none;
    }
    .related-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="sidebar">
    <h1>${escapedTitle}</h1>
    <ul>${navHtml}</ul>
  </div>
  <div class="content">
    ${pagesHtml}
  </div>
  <script>
    function showPage(pageId) {
      document.querySelectorAll('.wiki-page').forEach(page => {
        page.style.display = 'none';
      });
      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.style.display = 'block';
      }
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
          link.classList.add('active');
        }
      });
    }

    document.querySelectorAll('.nav-link, .related-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page || link.getAttribute('href').replace('#page-', '');
        showPage(pageId);
        history.pushState(null, '', '#page-' + pageId);
      });
    });

    // Show home page or first page
    const homePage = '${homePageId}';
    showPage(homePage);
  </script>
</body>
</html>`;
  }

  private renderToMarkdown(data: WikiData): string {
    return data.pages.map(page => {
      const tags = page.tags?.map(tag => `\`${tag}\``).join(' ') || '';
      const related = page.relatedPages?.map(id => {
        const related = data.pages.find(p => p.id === id);
        return related ? `[${related.title}](#${id})` : '';
      }).join(', ') || '';

      return `# ${page.title}

${page.content}

${tags ? `**Tags:** ${tags}` : ''}
${related ? `**Related:** ${related}` : ''}

---

`;
    }).join('\n');
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
