/**
 * GESTALTVIEW POWERHOUSE TYPE EXTENSIONS
 * 
 * Extends the existing nextgen-rendering-engine types with 17 artifact classes.
 * These types are additive — they don't replace existing contracts.
 */

import type { SceneNode, SceneEdge, RenderJob, RenderResult, RenderArtifact, RenderDiagnostic, BackendCapabilityManifest } from './types.js';

// ============================================================================
// ARTIFACT CLASS ENUM
// ============================================================================

export type ArtifactClass =
  | 'document'
  | 'slide'
  | 'chart'
  | 'mindmap'
  | 'image'
  | 'video'
  | 'audio'
  | 'wiki'
  | 'app'
  | 'component'
  | 'agent-studio'
  | 'storybook'
  | 'canvas'
  | 'pitch'
  | 'brand'
  | 'prompt'
  | 'table';

// ============================================================================
// EXTENDED NODE TYPES FOR POWERHOUSE ARTIFACTS
// ============================================================================

export type PowerhouseNodeType =
  | 'Slide'
  | 'MindMap'
  | 'Image'
  | 'Video'
  | 'Audio'
  | 'Wiki'
  | 'App'
  | 'Component'
  | 'AgentStudio'
  | 'Storybook'
  | 'Canvas'
  | 'Pitch'
  | 'Brand'
  | 'Prompt'
  | 'Table';

// ============================================================================
// EXTENDED EDGE TYPES FOR POWERHOUSE ARTIFACTS
// ============================================================================

export type PowerhouseEdgeType =
  | 'slides'        // Slide ordering
  | 'contains'      // Hierarchical containment (already exists, but explicit here)
  | 'references'    // Cross-reference between nodes
  | 'derives'       // Derivation relationship
  | 'links'         // Wiki-style linking
  | 'sequences';    // Temporal ordering (video, audio, storybook)

// ============================================================================
// POWERHOUSE SCENE GRAPH CONTRACT
// ============================================================================

export interface PowerhouseSceneGraph {
  schema: 'gsvw-render.v1';  // Powerhouse schema version
  artifactClass: ArtifactClass;
  title: string;
  description: string;
  nodes: PowerhouseNode[];
  edges: PowerhouseEdge[];
  templates: TemplateRef[];
  assets: AssetRef[];
  config: RenderConfig;
  provenance: ProvenanceEnvelope;
  metadata?: Record<string, unknown>;
}

export interface PowerhouseNode<TProps extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: PowerhouseNodeType | 'Document' | 'Markdown' | 'Diagram' | 'Chart';  // Allow existing types too
  name?: string;
  props: TProps;
  metadata?: Record<string, unknown>;
}

export interface PowerhouseEdge<TProps extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  type: PowerhouseEdgeType;
  from: string;
  to: string;
  props: TProps;
}

// ============================================================================
// TEMPLATE AND ASSET REFERENCES
// ============================================================================

export interface TemplateRef {
  templateId: string;
  version: string;
  source: 'blueprint' | 'skill' | 'style' | 'custom';
}

export interface AssetRef {
  assetId: string;
  type: 'image' | 'audio' | 'video' | 'document' | 'code';
  uri: string;
  mimeType?: string;
}

// ============================================================================
// RENDER CONFIGURATION
// ============================================================================

export interface RenderConfig {
  targets: OutputFormat[];
  syncTimeout: number;  // ms, default 30000
  asyncQueue: boolean;
  providerCascade: Provider[];
  storageBucket: string;  // 'codex-exports'
  quality?: 'draft' | 'standard' | 'high';
  publish?: {
    innerWorld?: boolean;
    externalScaffold?: boolean;
    gallery?: boolean;
  };
}

export type OutputFormat =
  | 'html' | 'markdown' | 'json' | 'txt' | 'yaml'
  | 'png' | 'jpg' | 'webp' | 'svg'
  | 'pdf' | 'pptx' | 'docx' | 'xlsx' | 'csv'
  | 'mp4' | 'webm' | 'mp3' | 'wav' | 'm4a'
  | 'react' | 'deployed-url';

export type Provider =
  | 'gemini-flash'
  | 'gemini-flash-image'
  | 'gemini-tts'
  | 'veo3'
  | 'dalle3'
  | 'ideogram'
  | 'claude-sonnet'
  | 'local';

// ============================================================================
// PROVENANCE AND CONSENT
// ============================================================================

export interface ProvenanceEnvelope {
  sourceType: 'generated_artifact' | 'codex_artifact' | 'created_artifact' | 'transcriptory' | 'capture_orb' | 'scene_graph';
  sourceIds: string[];
  consent: ConsentRecord;
  createdAt: string;
  createdBy: string;
}

export interface ConsentRecord {
  generation: boolean;
  storage: boolean;
  publication: boolean;
  derivative: boolean;
  mediaInference: boolean;
  timestamp: string;
}

// ============================================================================
// ORCHESTRATOR REQUEST/RESPONSE
// ============================================================================

export interface OrchestratorRequest {
  source: 'creation_corner' | 'blackboard_room' | 'capture_orb' | 'tribunal' | 'agent_trainer';
  sourceId: string;
  prompt: string;
  artifactClassHint?: ArtifactClass;
  formats?: OutputFormat[];
  consent: ConsentRecord;
  provenance: ProvenanceEnvelope;
  sceneGraph?: PowerhouseSceneGraph;
}

export interface OrchestratorResponse {
  jobId: string;
  syncResult?: SyncArtifact;
  asyncStatus: RenderStatus;
  targets: TargetResult[];
  unsupported: UnsupportedTarget[];
  diagnostics: TargetDiagnostic[];
  pollingUrl: string;
  estimatedCompletion?: number;  // seconds
}

export interface SyncArtifact {
  format: OutputFormat;
  content: string | Uint8Array;
  mimeType: string;
  bytes: number;
}

export type RenderStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TargetResult {
  format: OutputFormat;
  status: 'success' | 'failed' | 'unsupported' | 'partial';
  uri?: string;
  bytes?: number;
  error?: string;
}

export interface UnsupportedTarget {
  format: OutputFormat;
  reason: string;
  alternative?: OutputFormat;
}

export interface TargetDiagnostic {
  format: OutputFormat;
  phase: 'enqueue' | 'render' | 'persist' | 'publish';
  status: 'success' | 'failed' | 'warning';
  message?: string;
  duration?: number;  // ms
}

// ============================================================================
// POWERHOUSE BACKEND INTERFACE
// ============================================================================

export interface PowerhouseBackend {
  readonly capability: PowerhouseCapabilityManifest;
  canRender(job: PowerhouseRenderJob): boolean;
  render(job: PowerhouseRenderJob): Promise<PowerhouseRenderResult>;
}

export interface PowerhouseCapabilityManifest extends BackendCapabilityManifest {
  artifactClasses: ArtifactClass[];
  supportedFormats: OutputFormat[];
  providerRequirements: Provider[];
}

export interface PowerhouseRenderJob extends RenderJob {
  powerhouseGraph: PowerhouseSceneGraph;
  config: RenderConfig;
}

export interface PowerhouseRenderResult extends RenderResult {
  powerhouseArtifacts: PowerhouseArtifact[];
  targetResults: TargetResult[];
}

export interface PowerhouseArtifact extends RenderArtifact {
  artifactClass: ArtifactClass;
  provenance: ProvenanceEnvelope;
}

// ============================================================================
// FREE-FIRST PROVIDER CASCADE
// ============================================================================

export interface ProviderConfig {
  provider: Provider;
  costPerRequest: number;  // cents, 0 = free
  rateLimitPerMinute: number;
  supportedFormats: OutputFormat[];
  supportedClasses: ArtifactClass[];
  requiresKey: boolean;
  keyEnv?: string;
}

export const FREE_FIRST_PROVIDERS: ProviderConfig[] = [
  {
    provider: 'gemini-flash',
    costPerRequest: 0,
    rateLimitPerMinute: 15,
    supportedFormats: ['html', 'markdown', 'json', 'txt'],
    supportedClasses: ['document', 'wiki', 'prompt', 'table'],
    requiresKey: true,
    keyEnv: 'GEMINI_API_KEY',
  },
  {
    provider: 'gemini-flash-image',
    costPerRequest: 0,
    rateLimitPerMinute: 10,
    supportedFormats: ['png', 'jpg', 'webp'],
    supportedClasses: ['image', 'brand'],
    requiresKey: true,
    keyEnv: 'GEMINI_API_KEY',
  },
  {
    provider: 'gemini-tts',
    costPerRequest: 0,
    rateLimitPerMinute: 20,
    supportedFormats: ['mp3', 'wav', 'm4a'],
    supportedClasses: ['audio'],
    requiresKey: true,
    keyEnv: 'GEMINI_API_KEY',
  },
  {
    provider: 'veo3',
    costPerRequest: 0,
    rateLimitPerMinute: 2,
    supportedFormats: ['mp4', 'webm'],
    supportedClasses: ['video', 'canvas'],
    requiresKey: true,
    keyEnv: 'GEMINI_API_KEY',
  },
  {
    provider: 'dalle3',
    costPerRequest: 4,
    rateLimitPerMinute: 5,
    supportedFormats: ['png', 'jpg', 'webp'],
    supportedClasses: ['image', 'brand'],
    requiresKey: true,
    keyEnv: 'OPENAI_API_KEY',
  },
  {
    provider: 'ideogram',
    costPerRequest: 1,
    rateLimitPerMinute: 10,
    supportedFormats: ['png', 'jpg'],
    supportedClasses: ['image', 'brand'],
    requiresKey: true,
    keyEnv: 'IDEOGRAM_API_KEY',
  },
  {
    provider: 'claude-sonnet',
    costPerRequest: 3,
    rateLimitPerMinute: 10,
    supportedFormats: ['html', 'markdown', 'json', 'txt'],
    supportedClasses: ['document', 'wiki', 'prompt', 'table'],
    requiresKey: true,
    keyEnv: 'ANTHROPIC_API_KEY',
  },
];

// ============================================================================
// ACCEPTANCE CRITERIA
// ============================================================================

export interface AcceptanceCriteria {
  artifactClass: ArtifactClass;
  generation: {
    syncTimeout: number;  // ms
    asyncTimeout: number;  // ms
  };
  preview: {
    rendersInCreationCorner: boolean;
    interactive: boolean;
  };
  export: {
    formats: OutputFormat[];
    validOutput: boolean;
  };
  persist: {
    writesToDb: boolean;
    writesToStorage: boolean;
    appearsInGallery: boolean;
  };
  publish: {
    innerWorld: boolean;
    externalScaffold: boolean;
  };
  provenance: {
    fullSourceTrace: boolean;
  };
  consent: {
    respectsAllFlags: boolean;
  };
  failureIsolation: {
    oneFormatFailsOthersSucceed: boolean;
  };
  unsupportedHonesty: {
    returnsUnsupportedWithReason: boolean;
  };
}
