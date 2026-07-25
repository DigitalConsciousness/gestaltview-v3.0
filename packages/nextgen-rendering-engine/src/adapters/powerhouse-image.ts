/**
 * POWERHOUSE IMAGE BACKEND
 *
 * Renders image artifacts using AI generation APIs.
 * Async-only backend that generates images via configured providers.
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

interface ImagePrompt {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  style?: 'photorealistic' | 'illustration' | 'abstract' | 'minimal' | 'detailed';
  seed?: number;
}

export class PowerhouseImageBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-image',
    kind: 'image',
    displayName: 'Powerhouse Image Generator',
    artifactClasses: ['image'],
    supportedNodeTypes: ['Image'],
    supportedFormats: ['png', 'jpg', 'webp'],
    executionMode: 'external-service',
    sourceProjects: ['gemini-flash-image', 'dalle3', 'ideogram'],
    strengths: ['AI image generation', 'Multiple providers', 'Style control'],
    providerRequirements: ['gemini-flash-image', 'dalle3', 'ideogram'],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const imageNodes = graph.nodes.filter(n => n.type === 'Image');
    if (imageNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_IMAGE_NODES',
          message: 'Image artifact requires at least one Image node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No image nodes found')),
      };
    }

    const imagePrompt = imageNodes[0].props as unknown as ImagePrompt;

    // All image formats are async (require external API)
    for (const format of targets) {
      if (['png', 'jpg', 'webp'].includes(format)) {
        try {
          // In production, this would call the actual image generation API
          // For now, we create a placeholder metadata file
          const metadata = {
            prompt: imagePrompt.prompt,
            negativePrompt: imagePrompt.negativePrompt,
            width: imagePrompt.width || 1024,
            height: imagePrompt.height || 1024,
            style: imagePrompt.style || 'photorealistic',
            seed: imagePrompt.seed || Math.floor(Math.random() * 1000000),
            format,
            provider: 'pending',
            status: 'queued',
          };

          const artifact = await writeTextArtifact(
            job,
            this.capability.id,
            `${job.jobId}.image.${format}.json`,
            JSON.stringify(metadata, null, 2),
            format,
            { artifactClass: graph.artifactClass, format },
          );
          artifacts.push(artifact);
          targetResults.push(this.successTarget(format as any, artifact.uri, artifact.bytes || 0));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          targetResults.push(this.failedTarget(format as any, errorMessage));
          diagnostics.push({
            code: 'IMAGE_GENERATION_FAILED',
            message: `Image generation failed: ${errorMessage}`,
            severity: 'fatal',
            stage: 'render',
          });
        }
      } else {
        targetResults.push(this.unsupportedTarget(format as any, `Unsupported format: ${format}`));
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
        prompt: imagePrompt.prompt,
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
}
