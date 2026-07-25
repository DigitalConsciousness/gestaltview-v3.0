/**
 * POWERHOUSE ORCHESTRATOR
 *
 * Extends the existing GestaltRenderEngine to handle the 17 powerhouse artifact classes.
 * Routes requests to specialized powerhouse backends based on artifactClass.
 * Handles sync vs async execution paths.
 */

import type { RenderDiagnostic, RenderJob, RenderResult } from '../core/types.js';
import { result } from '../core/artifacts.js';
import type {
  ArtifactClass,
  OutputFormat,
  PowerhouseBackend,
  PowerhouseRenderJob,
  PowerhouseRenderResult,
  PowerhouseSceneGraph,
  TargetResult,
  UnsupportedTarget,
} from '../core/types-powerhouse.js';
import { validatePowerhouseSceneGraph } from '../core/validation-powerhouse.js';

export interface PowerhouseOrchestratorConfig {
  maxSyncTimeoutMs: number;
  maxAsyncTimeoutMs: number;
  enableAsyncQueue: boolean;
  storageBucket: string;
}

export interface PowerhouseOrchestratorResponse {
  jobId: string;
  syncResult?: PowerhouseRenderResult;
  asyncStatus: 'queued' | 'running' | 'completed' | 'failed';
  targets: TargetResult[];
  unsupported: UnsupportedTarget[];
  diagnostics: RenderDiagnostic[];
  pollingUrl?: string;
}

export class PowerhouseOrchestrator {
  private backends: Map<ArtifactClass, PowerhouseBackend> = new Map();

  constructor(
    private config: PowerhouseOrchestratorConfig,
    powerhouseBackends: PowerhouseBackend[] = [],
  ) {
    for (const backend of powerhouseBackends) {
      for (const artifactClass of backend.capability.artifactClasses) {
        this.backends.set(artifactClass, backend);
      }
    }
  }

  /**
   * Register a powerhouse backend for one or more artifact classes.
   */
  registerBackend(backend: PowerhouseBackend): void {
    for (const artifactClass of backend.capability.artifactClasses) {
      this.backends.set(artifactClass, backend);
    }
  }

  /**
   * Check if a backend is registered for the given artifact class.
   */
  hasBackend(artifactClass: ArtifactClass): boolean {
    return this.backends.has(artifactClass);
  }

  /**
   * Get the backend for a given artifact class.
   */
  getBackend(artifactClass: ArtifactClass): PowerhouseBackend | undefined {
    return this.backends.get(artifactClass);
  }

  /**
   * List all registered artifact classes.
   */
  listArtifactClasses(): ArtifactClass[] {
    return Array.from(this.backends.keys());
  }

  /**
   * Route a render request to the appropriate backend.
   * Handles sync vs async execution based on target formats and timeout.
   */
  async route(job: PowerhouseRenderJob): Promise<PowerhouseOrchestratorResponse> {
    const graph = job.powerhouseGraph;
    const artifactClass = graph.artifactClass;
    const targets = graph.config.targets;

    // Validate the scene graph
    const diagnostics = validatePowerhouseSceneGraph(graph);
    if (diagnostics.some(d => d.severity === 'fatal')) {
      return {
        jobId: job.jobId,
        asyncStatus: 'failed',
        targets: targets.map(format => ({ format, status: 'failed', error: 'Validation failed' })),
        unsupported: [],
        diagnostics,
      };
    }

    // Check if backend exists
    const backend = this.backends.get(artifactClass);
    if (!backend) {
      return {
        jobId: job.jobId,
        asyncStatus: 'failed',
        targets: targets.map(format => ({ format, status: 'unsupported', error: `No backend registered for ${artifactClass}` })),
        unsupported: targets.map(format => ({ format, reason: `No backend registered for ${artifactClass}` })),
        diagnostics: [{ code: 'NO_BACKEND', message: `No backend registered for ${artifactClass}`, severity: 'fatal', stage: 'route' }],
      };
    }

    // Determine sync vs async
    const isAsync = this.shouldUseAsync(targets, graph.config.syncTimeout);

    if (isAsync && this.config.enableAsyncQueue) {
      // Async path: enqueue and return job ID
      // TODO: Implement async queue integration with render_jobs table
      return {
        jobId: job.jobId,
        asyncStatus: 'queued',
        targets: targets.map(format => ({ format, status: 'failed', error: 'Async queue not yet implemented' })),
        unsupported: [],
        diagnostics: [{ code: 'ASYNC_NOT_IMPLEMENTED', message: 'Async queue not yet implemented', severity: 'warning', stage: 'route' }],
        pollingUrl: `/api/render/status/${job.jobId}`,
      };
    }

    // Sync path: execute immediately with timeout
    try {
      const syncResult = await this.executeWithTimeout(
        () => backend.render(job),
        this.config.maxSyncTimeoutMs,
      );

      return {
        jobId: job.jobId,
        syncResult,
        asyncStatus: 'completed',
        targets: syncResult.targetResults,
        unsupported: syncResult.targetResults
          .filter(t => t.status === 'unsupported')
          .map(t => ({ format: t.format, reason: t.error || 'Unsupported' })),
        diagnostics: syncResult.diagnostics,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        jobId: job.jobId,
        asyncStatus: 'failed',
        targets: targets.map(format => ({ format, status: 'failed', error: errorMessage })),
        unsupported: [],
        diagnostics: [{ code: 'RENDER_FAILED', message: errorMessage, severity: 'fatal', stage: 'render' }],
      };
    }
  }

  /**
   * Determine if a render should use async execution.
   */
  private shouldUseAsync(targets: OutputFormat[], requestedTimeout?: number): boolean {
    // If user explicitly requested sync timeout, respect it
    if (requestedTimeout !== undefined) {
      return false;
    }

    // Async formats that typically take longer
    const asyncFormats: OutputFormat[] = ['pdf', 'pptx', 'png', 'svg', 'mp4', 'mp3', 'webm'];
    return targets.some(t => asyncFormats.includes(t));
  }

  /**
   * Execute a function with a timeout.
   */
  private executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}

/**
 * Create a PowerhouseRenderJob from a PowerhouseSceneGraph.
 */
export function createPowerhouseRenderJob(
  graph: PowerhouseSceneGraph,
  jobId: string,
): PowerhouseRenderJob {
  return {
    jobId,
    graph: {
      schema: 'nextgen.scene-graph.v1',
      graphId: graph.artifactClass + '-' + jobId,
      nodes: graph.nodes.map(n => ({
        id: n.id,
        type: n.type as any, // Cast to existing NodeType
        props: n.props,
        metadata: n.metadata,
      })),
      edges: graph.edges.map(e => ({
        id: e.id,
        type: e.type as any, // Cast to existing EdgeType
        from: e.from,
        to: e.to,
        props: e.props,
      })),
      metadata: {
        powerhouse: true,
        artifactClass: graph.artifactClass,
      },
    },
    powerhouseGraph: graph,
    config: graph.config,
  };
}
