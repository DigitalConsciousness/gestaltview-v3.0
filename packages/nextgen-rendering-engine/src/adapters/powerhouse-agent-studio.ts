/**
 * POWERHOUSE AGENT STUDIO BACKEND
 *
 * Renders agent-studio artifacts: Visual agent builder with persona, skills,
 * memories, and prompt editor. Generates JSON config + interactive HTML preview.
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

interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  icon?: string;
  persona?: {
    voice: string;
    tone: string;
    values: string[];
  };
  skills?: string[];
  memories?: string[];
  tools?: string[];
  model?: string;
}

export class PowerhouseAgentStudioBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-agent-studio',
    kind: 'agent-studio',
    displayName: 'Powerhouse Agent Studio',
    artifactClasses: ['agent-studio'],
    supportedNodeTypes: ['AgentStudio'],
    supportedFormats: ['json', 'markdown', 'html'],
    executionMode: 'in-process',
    sourceProjects: ['react'],
    strengths: ['Visual agent builder', 'Persona editor', 'Prompt engineering'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const studioNodes = graph.nodes.filter(n => n.type === 'AgentStudio');
    if (studioNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_STUDIO_NODES',
          message: 'Agent Studio artifact requires at least one AgentStudio node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No agent studio nodes found')),
      };
    }

    const agentConfig = studioNodes[0].props as unknown as AgentConfig;

    if (this.wantsTarget(job, 'json')) {
      try {
        const jsonContent = JSON.stringify(agentConfig, null, 2);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.agent-studio.json`,
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

    if (this.wantsTarget(job, 'markdown')) {
      try {
        const md = this.renderToMarkdown(agentConfig);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.agent-studio.md`,
          md,
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

    if (this.wantsTarget(job, 'html')) {
      try {
        const html = this.renderToHtml(graph.title, agentConfig);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.agent-studio.html`,
          html,
          'html',
          { artifactClass: graph.artifactClass },
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

    const fatal = diagnostics.some(d => d.severity === 'fatal');

    return {
      ok: !fatal,
      jobId: job.jobId,
      artifacts,
      diagnostics,
      manifest: {
        capability: this.capability,
        artifactClass: graph.artifactClass,
        agentName: agentConfig.name,
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

  private renderToMarkdown(config: AgentConfig): string {
    const sections: string[] = [];
    sections.push(`# ${config.name}`);
    sections.push(`\n${config.description}\n`);

    if (config.persona) {
      sections.push('## Persona');
      sections.push(`- **Voice:** ${config.persona.voice}`);
      sections.push(`- **Tone:** ${config.persona.tone}`);
      if (config.persona.values.length) {
        sections.push(`- **Values:** ${config.persona.values.join(', ')}`);
      }
    }

    sections.push('\n## System Prompt');
    sections.push(`\n\`\`\`\n${config.systemPrompt}\n\`\`\`\n`);

    if (config.skills?.length) {
      sections.push('## Skills');
      config.skills.forEach(s => sections.push(`- ${s}`));
    }

    if (config.memories?.length) {
      sections.push('\n## Memories');
      config.memories.forEach(m => sections.push(`- ${m}`));
    }

    if (config.tools?.length) {
      sections.push('\n## Tools');
      config.tools.forEach(t => sections.push(`- ${t}`));
    }

    if (config.model) {
      sections.push(`\n## Model\n${config.model}`);
    }

    return sections.join('\n');
  }

  private renderToHtml(title: string, config: AgentConfig): string {
    const escapedTitle = this.escapeHtml(title);
    const escapedName = this.escapeHtml(config.name);
    const configJson = JSON.stringify(config, null, 2);

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
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      background: var(--gv-bg);
      color: var(--gv-text);
    }
    .header {
      background: var(--gv-surface);
      border-bottom: 1px solid var(--gv-border);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header .icon {
      font-size: 2rem;
    }
    .header h1 {
      color: var(--gv-accent);
      margin: 0;
      font-size: 1.5rem;
    }
    .header .description {
      color: var(--gv-muted);
      font-size: 0.875rem;
    }
    .layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--gv-border);
      min-height: calc(100vh - 80px);
    }
    .panel {
      background: var(--gv-bg);
      padding: 1.5rem;
      overflow-y: auto;
    }
    .panel h2 {
      color: var(--gv-accent);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 1rem;
    }
    .field {
      margin-bottom: 1rem;
    }
    .field label {
      display: block;
      color: var(--gv-muted);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .field input, .field textarea, .field select {
      width: 100%;
      padding: 0.5rem;
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text);
      font-family: inherit;
    }
    .field textarea {
      min-height: 200px;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .chip {
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 12px;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
    }
    pre {
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="icon">${config.icon || '🤖'}</span>
    <div>
      <h1>${escapedName}</h1>
      <div class="description">${this.escapeHtml(config.description)}</div>
    </div>
  </div>
  <div class="layout">
    <div class="panel">
      <h2>Configuration</h2>
      <div class="field">
        <label>Name</label>
        <input type="text" value="${escapedName}" readonly>
      </div>
      <div class="field">
        <label>Description</label>
        <input type="text" value="${this.escapeHtml(config.description)}" readonly>
      </div>
      <div class="field">
        <label>Model</label>
        <input type="text" value="${this.escapeHtml(config.model || 'default')}" readonly>
      </div>
      <div class="field">
        <label>System Prompt</label>
        <textarea readonly>${this.escapeHtml(config.systemPrompt)}</textarea>
      </div>
    </div>
    <div class="panel">
      <h2>Persona</h2>
      ${config.persona ? `
        <div class="field"><label>Voice</label><input type="text" value="${this.escapeHtml(config.persona.voice)}" readonly></div>
        <div class="field"><label>Tone</label><input type="text" value="${this.escapeHtml(config.persona.tone)}" readonly></div>
        <div class="field"><label>Values</label><div class="chip-list">${config.persona.values.map(v => `<span class="chip">${this.escapeHtml(v)}</span>`).join('')}</div></div>
      ` : '<p style="color: var(--gv-muted)">No persona configured</p>'}

      <h2>Skills</h2>
      ${config.skills?.length ? `<div class="chip-list">${config.skills.map(s => `<span class="chip">${this.escapeHtml(s)}</span>`).join('')}</div>` : '<p style="color: var(--gv-muted)">No skills configured</p>'}

      <h2>Tools</h2>
      ${config.tools?.length ? `<div class="chip-list">${config.tools.map(t => `<span class="chip">${this.escapeHtml(t)}</span>`).join('')}</div>` : '<p style="color: var(--gv-muted)">No tools configured</p>'}

      <h2>JSON Config</h2>
      <pre>${this.escapeHtml(configJson)}</pre>
    </div>
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
