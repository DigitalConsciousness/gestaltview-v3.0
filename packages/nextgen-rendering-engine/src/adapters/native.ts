import { BaseBackend } from './base.js';
import type { BackendCapabilityManifest, RenderJob } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';

export class NativeBackend extends BaseBackend {
  readonly capability: BackendCapabilityManifest = {
    id: 'gestalt-native-backend', kind: 'native', displayName: 'GestaltView Native Render Core Facade',
    supportedNodeTypes: ['Scene3D','Mesh','Material','Light','Camera','Atmosphere','ExportRequest'], supportedFormats: ['json','exr-placeholder','png-placeholder'], executionMode: 'reference',
    sourceProjects: ['anki-3d-engine','vulkan-renderer','hybrid-rendering-engine','unreal-engine-sky-atmosphere'], strengths: ['Frame graph planning','PBR/clustered rendering handoff','Atmosphere module handoff']
  };
  protected async renderValidated(job: RenderJob) {
    const plan = { backend: this.capability.id, graphId: job.graph.graphId, passes: ['asset-resolve','visibility','cluster-lighting','pbr-shading','atmosphere','postprocess','export'], nativeNodes: job.graph.nodes.filter((node) => this.capability.supportedNodeTypes.includes(node.type)) };
    const artifact = await writeTextArtifact(job, this.capability.id, `${job.jobId}.native-framegraph.json`, JSON.stringify(plan, null, 2), 'json', { sourceProjects: this.capability.sourceProjects });
    return result(job, this.capability.id, [artifact], [], { capability: this.capability });
  }
}
