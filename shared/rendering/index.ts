/**
 * shared/rendering/index.ts
 *
 * Central registry for all GestaltView artifact renderers.
 * Consumers (API routes, client helpers) call `getRenderer(kind)` to
 * obtain the correct renderer for a given artifact kind, then call
 * `renderer.render(content, format)` to produce a RenderedArtifact.
 *
 * `SUPPORTED_ARTIFACT_KINDS` is exported so API routes can surface
 * valid values to callers.
 */

export type { Renderer, RenderedArtifact } from './types.js';

export { MarkdownRenderer } from './markdown.js';
export { PdfRenderer } from './pdf.js';
export { SlideRenderer } from './slides.js';
export { AudioRenderer } from './audio.js';
export { MindMapRenderer } from './mindmap.js';
export type { MindMapNode, MindMapInput, ReactFlowNode, ReactFlowEdge, ReactFlowGraph } from './mindmap.js';

import { MarkdownRenderer } from './markdown.js';
import { PdfRenderer } from './pdf.js';
import { SlideRenderer } from './slides.js';
import { AudioRenderer } from './audio.js';
import { MindMapRenderer } from './mindmap.js';
import type { Renderer } from './types.js';

// ─── Renderer registry ──────────────────────────────────────────────────────
//
// Maps every artifact kind string to the renderer instance that handles it.
// Extend this map when new renderers are added.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RENDERERS = new Map<string, Renderer<any>>([
  ['markdown',          new MarkdownRenderer()],
  ['report_document',   new MarkdownRenderer()],
  ['session_recap',     new MarkdownRenderer()],
  ['blueprint',         new MarkdownRenderer()],
  ['spatial_scene',     new MarkdownRenderer()],
  ['pdf',               new PdfRenderer()],
  ['slides',            new SlideRenderer()],
  ['slide_deck',        new SlideRenderer()],
  ['audio',             new AudioRenderer()],
  ['audio_narration',   new AudioRenderer()],
  ['mindmap',           new MindMapRenderer()],
  ['mind_map',          new MindMapRenderer()],
  ['knowledge_graph',   new MindMapRenderer()],
]);

/**
 * All artifact kinds recognised by the rendering pipeline.
 * Surfaced by API routes so clients can validate before calling.
 */
export const SUPPORTED_ARTIFACT_KINDS: string[] = Array.from(RENDERERS.keys());

/**
 * Returns the renderer for the given artifact kind, or null if none
 * is registered.  Kind lookup is case-insensitive and trims whitespace.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getRenderer(kind: string): Renderer<any> | null {
  return RENDERERS.get(kind.trim().toLowerCase()) ?? null;
}

/**
 * CodexArtifactRenderer: high-level entry point used by the Codex
 * pipeline.  It picks the right renderer based on artifactKind and
 * returns the HTML representation for live preview.
 *
 * Falls back to MarkdownRenderer for unknown kinds so the preview
 * never hard-blocks.
 */
export class CodexArtifactRenderer {
  async renderToHtml(artifactKind: string, content: string): Promise<string> {
    const renderer = getRenderer(artifactKind) ?? new MarkdownRenderer();
    const artifact = await renderer.render(content as never, 'html');
    return typeof artifact.data === 'string'
      ? artifact.data
      : artifact.data.toString('utf-8');
  }
}
