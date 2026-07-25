import type { BackendCapabilityManifest, RenderBackend, RenderJob, RenderResult } from '../core/types.js';
import { validateSceneGraph } from '../core/validation.js';
import { result } from '../core/artifacts.js';

export abstract class BaseBackend implements RenderBackend {
  abstract readonly capability: BackendCapabilityManifest;

  canRender(job: RenderJob): boolean {
    const requested = new Set(job.graph.nodes.map((node) => node.type));
    return [...requested].some((nodeType) => this.capability.supportedNodeTypes.includes(nodeType));
  }

  async render(job: RenderJob): Promise<RenderResult> {
    const diagnostics = validateSceneGraph(job.graph);
    if (diagnostics.length) return result(job, this.capability.id, [], diagnostics, { capability: this.capability });
    return this.renderValidated(job);
  }

  protected abstract renderValidated(job: RenderJob): Promise<RenderResult>;
}
