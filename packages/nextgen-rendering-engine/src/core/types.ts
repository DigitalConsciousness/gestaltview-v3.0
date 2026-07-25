export type NodeType =
  | "Scene3D" | "Mesh" | "Material" | "Light" | "Camera" | "Atmosphere"
  | "Document" | "Markdown" | "Diagram" | "Chart" | "DOMSnapshot"
  | "VideoTrack" | "AgentArtifact" | "ExportRequest"
  | "Slide" | "MindMap" | "Image" | "Video" | "Audio" | "Wiki"
  | "App" | "Component" | "AgentStudio" | "Storybook" | "Canvas"
  | "Pitch" | "Brand" | "Prompt" | "Table";

export type EdgeType =
  | "contains"
  | "referencesAsset"
  | "rendersTo"
  | "derivedFrom"
  | "controls"
  | "annotates"
  | "composes";
export type Severity = "fatal" | "retryable" | "warning";
export type BackendKind =
  | "native" | "web" | "document" | "diagram" | "orchestration"
  | "slide" | "mindmap" | "image" | "video" | "audio" | "wiki"
  | "app" | "component" | "agent-studio" | "storybook" | "canvas"
  | "pitch" | "brand" | "prompt" | "table" | "chart";

export interface SceneNode<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  type: NodeType;
  name?: string;
  props: TProps;
  metadata?: Record<string, unknown>;
}

export interface SceneEdge<
  TProps extends Record<string, unknown> = Record<string, unknown>,
> {
  id: string;
  type: EdgeType;
  from: string;
  to: string;
  props: TProps;
}

export interface SceneGraph {
  schema: "nextgen.scene-graph.v1";
  graphId: string;
  nodes: SceneNode[];
  edges: SceneEdge[];
  metadata?: Record<string, unknown>;
}

export interface ExportTarget {
  format: "png" | "jpg" | "svg" | "pdf" | "html" | "json" | "webm" | "mp4" | string;
  uri: string;
  width?: number;
  height?: number;
  quality?: number;
  required?: boolean;
}

export type RenderJobState =
  | "queued"
  | "validating"
  | "rendering"
  | "storing"
  | "ready"
  | "failed"
  | "cancelled";

export interface RenderJob {
  jobId: string;
  graph: SceneGraph;
  targets?: ExportTarget[];
  preferredBackends?: BackendKind[];
  outputDirectory?: string;
  metadata?: Record<string, unknown>;
}

export interface ArtifactSourceRef {
  sourceFamily:
    | "generated_artifact"
    | "codex_artifact"
    | "created_artifact"
    | "transcriptory"
    | "capture_orb"
    | "scene_graph"
    | string;
  sourceId: string;
  userId: string;
  workspaceId?: string;
  lifecycleState: string;
  provenanceRefs?: string[];
}

export interface RenderTarget {
  format: string;
  mimeType: string;
  width?: number;
  height?: number;
  quality?: number;
  destinationIntent: "preview" | "export" | "gallery" | "archive" | string;
  required: boolean;
}

export interface RenderArtifact {
  uri: string;
  format: string;
  backend: string;
  bytes?: number;
  metadata?: Record<string, unknown>;
  storageBucket?: string;
  storagePath?: string;
  mimeType?: string;
  hash?: string;
  targetStatus?: "success" | "failed" | "unsupported" | "partial";
}

export interface RenderDiagnostic {
  code: string;
  message: string;
  severity: Severity;
  stage: string;
  details?: Record<string, unknown>;
}

export interface RenderResult {
  ok: boolean;
  jobId: string;
  artifacts: RenderArtifact[];
  diagnostics: RenderDiagnostic[];
  manifest: Record<string, unknown>;
}

export interface BackendCapabilityManifest {
  id: string;
  kind: BackendKind;
  displayName: string;
  supportedNodeTypes: NodeType[];
  supportedFormats: string[];
  executionMode: "in-process" | "subprocess" | "external-service" | "reference";
  sourceProjects: string[];
  strengths: string[];
}

export interface RenderBackend {
  readonly capability: BackendCapabilityManifest;
  canRender(job: RenderJob): boolean;
  render(job: RenderJob): Promise<RenderResult>;
}

export interface ArtifactSink {
  readonly kind: string;
  store(bytes: Uint8Array | string, metadata: SinkMetadata): Promise<RenderArtifact>;
}

export interface SinkMetadata {
  jobId: string;
  graphId: string;
  userId: string;
  format: string;
  mimeType: string;
  backend: string;
  filename: string;
  metadata?: Record<string, unknown>;
}
