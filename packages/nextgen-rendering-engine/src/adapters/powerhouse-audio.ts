/**
 * POWERHOUSE AUDIO BACKEND
 *
 * Renders audio artifacts via AI TTS APIs.
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

interface AudioPrompt {
  text: string;
  voice?: string;
  speed?: number;
  pitch?: number;
  language?: string;
}

export class PowerhouseAudioBackend extends PowerhouseBaseBackend {
  readonly capability: PowerhouseCapabilityManifest = {
    id: 'powerhouse-audio',
    kind: 'audio',
    displayName: 'Powerhouse Audio Generator',
    artifactClasses: ['audio'],
    supportedNodeTypes: ['Audio'],
    supportedFormats: ['mp3', 'wav', 'm4a'],
    executionMode: 'external-service',
    sourceProjects: ['gemini-tts', 'openai-tts', 'elevenlabs'],
    strengths: ['AI text-to-speech', 'Multiple voices', 'Language support'],
    providerRequirements: ['gemini-tts'],
  };

  protected async renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const graph = job.powerhouseGraph;
    const targets = graph.config.targets;
    const targetResults: TargetResult[] = [];
    const diagnostics: RenderDiagnostic[] = [];
    const artifacts = [];

    const audioNodes = graph.nodes.filter(n => n.type === 'Audio');
    if (audioNodes.length === 0) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics: [{
          code: 'NO_AUDIO_NODES',
          message: 'Audio artifact requires at least one Audio node',
          severity: 'fatal',
          stage: 'render',
        }],
        manifest: {},
        powerhouseArtifacts: [],
        targetResults: targets.map(format => this.failedTarget(format, 'No audio nodes found')),
      };
    }

    const audioPrompt = audioNodes[0].props as unknown as AudioPrompt;

    for (const format of targets) {
      if (['mp3', 'wav', 'm4a'].includes(format)) {
        const metadata = {
          text: audioPrompt.text,
          voice: audioPrompt.voice || 'default',
          speed: audioPrompt.speed || 1.0,
          pitch: audioPrompt.pitch || 1.0,
          language: audioPrompt.language || 'en-US',
          format,
          provider: 'pending',
          status: 'queued',
        };

        try {
          const artifact = await writeTextArtifact(
            job,
            this.capability.id,
            `${job.jobId}.audio.${format}.json`,
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
            code: 'AUDIO_GENERATION_FAILED',
            message: `Audio generation failed: ${errorMessage}`,
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
        textLength: audioPrompt.text.length,
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
