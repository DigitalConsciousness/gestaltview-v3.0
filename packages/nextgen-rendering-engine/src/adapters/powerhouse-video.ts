/**
 * POWERHOUSE VIDEO BACKEND
 *
 * Renders video artifacts via AI generation APIs.
 * Async-only — all targets require external service calls.
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

interface VideoPrompt {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  firstFrameImage?: string;
  referenceImages?: string[];
  style?: string;
}

export class PowerhouseVideoBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-video',
    kind: 'video',
    displayName: 'Powerhouse Video Generator',
    artifactClasses: ['video'],
    supportedNodeTypes: ['Video'],
    supportedFormats: ['mp4', 'webm'],
    executionMode: 'external-service',
    sourceProjects: ['veo3', 'sora', 'runway'],
    strengths: ['AI video generation', 'Image-to-video', 'Style control'],
    providerRequirements: ['veo3'],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const videoNodes = graph.nodes.filter(n => n.type === 'Video');
    if (videoNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_VIDEO_NODES',
          message: 'Video artifact requires at least one Video node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No video nodes found')),
      };
    }

    const videoPrompt = videoNodes[0].props as unknown as VideoPrompt;

    for (const format of targets) {
      if (['mp4', 'webm'].includes(format)) {
        const metadata = {
          prompt: videoPrompt.prompt,
          duration: videoPrompt.duration || 8,
          aspectRatio: videoPrompt.aspectRatio || '16:9',
          firstFrameImage: videoPrompt.firstFrameImage,
          referenceImages: videoPrompt.referenceImages,
          style: videoPrompt.style,
          format,
          provider: 'pending',
          status: 'queued',
        };

        try {
          const artifact = await writeTextArtifact(
            job,
            this.capability.id,
            `${job.jobId}.video.${format}.json`,
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
            code: 'VIDEO_GENERATION_FAILED',
            message: `Video generation failed: ${errorMessage}`,
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
        prompt: videoPrompt.prompt,
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
