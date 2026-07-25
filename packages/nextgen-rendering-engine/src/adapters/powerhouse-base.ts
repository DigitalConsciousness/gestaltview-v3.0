/**
 * POWERHOUSE BASE BACKEND
 *
 * Abstract base class for all 17 powerhouse artifact backends.
 * Follows the same pattern as the existing BaseBackend but for PowerhouseSceneGraph.
 */

import type { RenderDiagnostic, RenderJob, RenderResult } from '../core/types.js';
import { result } from '../core/artifacts.js';
import { validatePowerhouseSceneGraph } from '../core/validation-powerhouse.js';
import type {
  ArtifactClass,
  OutputFormat,
  PowerhouseBackend,
  PowerhouseCapabilityManifest,
  PowerhouseRenderJob,
  PowerhouseRenderResult,
  TargetResult,
} from '../core/types-powerhouse.js';

export abstract class PowerhouseBaseBackend implements PowerhouseBackend {
  abstract readonly capability: PowerhouseCapabilityManifest;

  canRender(job: PowerhouseRenderJob): boolean {
    return this.capability.artifactClasses.includes(job.powerhouseGraph.artifactClass);
  }

  async render(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult> {
    const diagnostics = validatePowerhouseSceneGraph(job.powerhouseGraph);
    if (diagnostics.some(d => d.severity === 'fatal')) {
      return {
        ok: false,
        jobId: job.jobId,
        artifacts: [],
        diagnostics,
        manifest: { capability: this.capability },
        powerhouseArtifacts: [],
        targetResults: job.powerhouseGraph.config.targets.map(format => ({
          format,
          status: 'failed' as const,
          error: 'Validation failed',
        })),
      };
    }
    return this.renderValidated(job);
  }

  protected abstract renderValidated(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult>;

  /**
   * Helper: build a target result for a successfully rendered format.
   */
  protected successTarget(
    format: OutputFormat,
    uri: string,
    bytes: number,
  ): TargetResult {
    return { format, status: 'success', uri, bytes };
  }

  /**
   * Helper: build a target result for a failed format.
   */
  protected failedTarget(format: OutputFormat, error: string): TargetResult {
    return { format, status: 'failed', error };
  }

  /**
   * Helper: build a target result for an unsupported format.
   */
  protected unsupportedTarget(format: OutputFormat, reason: string): TargetResult {
    return { format, status: 'unsupported', error: reason };
  }

  /**
   * Helper: check if a format is in the requested targets.
   */
  protected wantsTarget(job: PowerhouseRenderJob, format: OutputFormat): boolean {
    return job.powerhouseGraph.config.targets.includes(format);
  }
}
