import { BaseBackend } from './base.js';
import type { BackendCapabilityManifest, RenderJob } from '../core/types.js';
import { result, writeTextArtifact } from '../core/artifacts.js';

export class WebBackend extends BaseBackend {
  readonly capability: BackendCapabilityManifest = {
    id: 'gestalt-web-backend', kind: 'web', displayName: 'GestaltView Web Renderer',
    supportedNodeTypes: ['DOMSnapshot','VideoTrack','Chart','Scene3D','ExportRequest'], supportedFormats: ['html','json','png-placeholder','webm-placeholder'], executionMode: 'in-process',
    sourceProjects: ['pixijs','react-three-fiber','html-video'], strengths: ['Browser render-shell manifests','Timeline metadata','Web canvas integration points']
  };
  protected async renderValidated(job: RenderJob) {
    const shell = { renderer: this.capability.id, graphId: job.graph.graphId, sceneNodes: job.graph.nodes.filter((node) => ['DOMSnapshot','VideoTrack','Chart','Scene3D'].includes(node.type)), timelineReady: true };
    const artifact = await writeTextArtifact(job, this.capability.id, `${job.jobId}.web-render-shell.json`, JSON.stringify(shell, null, 2), 'json', { sourceProjects: this.capability.sourceProjects });
    return result(job, this.capability.id, [artifact], [], { capability: this.capability });
  }
}
