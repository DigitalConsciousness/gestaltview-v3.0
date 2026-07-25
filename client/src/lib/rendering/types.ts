/**
 * GestaltView Rendering Engine - Type Definitions
 * Shared renderer contracts for both the legacy engine and the newer registry-based renderers.
 */

import type { ComponentType } from 'react';
import type { ArtifactContentFormat } from '@shared/gen-engine/types';

export type ContentFormat = ArtifactContentFormat;

export type RenderMode = 'inline' | 'compact' | 'fullscreen' | 'export-preview';

export interface RenderInteractionEvent {
  type: 'play' | 'pause' | 'seek' | 'zoom' | 'click' | 'message';
  payload?: unknown;
}

export interface RenderableArtifact {
  /** Raw content: string (text/base64/URL) or Blob/URL for binary */
  content: string;
  /** Explicit format hint from gen-engine or user upload */
  format?: ContentFormat;
  /** Backward-compatible content format hint used by generated artifacts */
  contentFormat?: ContentFormat;
  /** Original filename or MIME type - used for sniffing when format is absent */
  mimeType?: string;
  filename?: string;
  /** Optional title shown in the renderer chrome */
  title?: string;
  /** Language hint for code renderer */
  language?: string;
}

export interface RenderProps {
  artifact: RenderableArtifact;
  mode?: RenderMode;
  /** Caller-supplied height override. Renderer uses its own default if omitted. */
  height?: string | number;
  /** Fire when content is interacted with (clicks, play events, etc.). */
  onInteraction?: (event: RenderInteractionEvent) => void;
  /** Fire when user triggers an export from within the renderer. */
  onExportRequest?: (format: ContentFormat) => void;
  className?: string;
}

export type RendererComponent = ComponentType<RenderProps>;

export interface RenderingEngineProps {
  artifact: RenderableArtifact;
  /** Max height in px for scroll containers. Default: 600 */
  maxHeight?: number;
  /** Disable the Neural Aurora border treatment */
  noAurora?: boolean;
  className?: string;
}
