/**
 * POWERHOUSE PROMPT BACKEND
 *
 * Renders prompt artifacts: Agent prompt engineering workspace with version
 * history, test runner, and structured output. Generates Markdown, JSON, YAML.
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

interface PromptData {
  name: string;
  description?: string;
  systemPrompt: string;
  userPrompt?: string;
  variables?: Record<string, { type: string; default?: string; description?: string }>;
  tests?: Array<{
    name: string;
    input: string;
    expectedBehavior: string;
  }>;
  version?: string;
  tags?: string[];
}

export class PowerhousePromptBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-prompt',
    kind: 'prompt',
    displayName: 'Powerhouse Prompt Engineering Workspace',
    artifactClasses: ['prompt'],
    supportedNodeTypes: ['Prompt'],
    supportedFormats: ['markdown', 'json', 'yaml'],
    executionMode: 'in-process',
    sourceProjects: [],
    strengths: ['Prompt versioning', 'Test runner', 'Variable substitution'],
    providerRequirements: [],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const promptNodes = graph.nodes.filter(n => n.type === 'Prompt');
    if (promptNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_PROMPT_NODES',
          message: 'Prompt artifact requires at least one Prompt node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No prompt nodes found')),
      };
    }

    const promptData = promptNodes[0].props as unknown as PromptData;

    if (this.wantsTarget(job, 'markdown')) {
      try {
        const md = this.renderToMarkdown(promptData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.prompt.md`,
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

    if (this.wantsTarget(job, 'json')) {
      try {
        const jsonContent = JSON.stringify(promptData, null, 2);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.prompt.json`,
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

    if (this.wantsTarget(job, 'yaml')) {
      try {
        const yaml = this.renderToYaml(promptData);
        const artifact = await writeTextArtifact(
          job,
          this.capability.id,
          `${job.jobId}.prompt.yaml`,
          yaml,
          'yaml',
          { artifactClass: graph.artifactClass },
        );
        artifacts.push(artifact);
        targetResults.push(this.successTarget('yaml', artifact.uri, artifact.bytes || 0));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        targetResults.push(this.failedTarget('yaml', errorMessage));
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
        promptName: promptData.name,
        version: promptData.version || '1.0.0',
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

  private renderToMarkdown(data: PromptData): string {
    const sections: string[] = [];
    sections.push(`# ${data.name}`);
    if (data.description) sections.push(`\n${data.description}\n`);
    if (data.version) sections.push(`**Version:** ${data.version}`);
    if (data.tags?.length) sections.push(`**Tags:** ${data.tags.join(', ')}`);

    sections.push('\n## System Prompt\n');
    sections.push('```');
    sections.push(data.systemPrompt);
    sections.push('```');

    if (data.userPrompt) {
      sections.push('\n## User Prompt\n');
      sections.push('```');
      sections.push(data.userPrompt);
      sections.push('```');
    }

    if (data.variables && Object.keys(data.variables).length > 0) {
      sections.push('\n## Variables\n');
      sections.push('| Name | Type | Default | Description |');
      sections.push('|------|------|---------|-------------|');
      for (const [name, def] of Object.entries(data.variables)) {
        sections.push(`| \`${name}\` | ${def.type} | ${def.default || '—'} | ${def.description || '—'} |`);
      }
    }

    if (data.tests?.length) {
      sections.push('\n## Tests\n');
      for (const test of data.tests) {
        sections.push(`### ${test.name}`);
        sections.push(`**Input:** \`${test.input}\``);
        sections.push(`**Expected:** ${test.expectedBehavior}\n`);
      }
    }

    return sections.join('\n');
  }

  private renderToYaml(data: PromptData): string {
    const lines: string[] = [];
    lines.push(`name: "${this.escapeYaml(data.name)}"`);
    if (data.description) lines.push(`description: "${this.escapeYaml(data.description)}"`);
    if (data.version) lines.push(`version: "${data.version}"`);
    if (data.tags?.length) {
      lines.push('tags:');
      data.tags.forEach(t => lines.push(`  - "${this.escapeYaml(t)}"`));
    }

    lines.push('system_prompt: |');
    data.systemPrompt.split('\n').forEach(line => lines.push(`  ${line}`));

    if (data.userPrompt) {
      lines.push('user_prompt: |');
      data.userPrompt.split('\n').forEach(line => lines.push(`  ${line}`));
    }

    if (data.variables && Object.keys(data.variables).length > 0) {
      lines.push('variables:');
      for (const [name, def] of Object.entries(data.variables)) {
        lines.push(`  ${name}:`);
        lines.push(`    type: "${def.type}"`);
        if (def.default) lines.push(`    default: "${this.escapeYaml(def.default)}"`);
        if (def.description) lines.push(`    description: "${this.escapeYaml(def.description)}"`);
      }
    }

    if (data.tests?.length) {
      lines.push('tests:');
      for (const test of data.tests) {
        lines.push(`  - name: "${this.escapeYaml(test.name)}"`);
        lines.push(`    input: "${this.escapeYaml(test.input)}"`);
        lines.push(`    expected_behavior: "${this.escapeYaml(test.expectedBehavior)}"`);
      }
    }

    return lines.join('\n');
  }

  private escapeYaml(value: string): string {
    return value.replaceAll('"', '\\"');
  }
}
