// Generic types for the rendering compatibility layer used by the spec bundle.

export type RenderedArtifact = {
  /**
   * File extension or MIME subtype.  Examples: 'html', 'pdf', 'png'.
   */
  format: string;
  /**
   * The rendered output.  Strings represent textual formats (HTML,
   * Markdown, Mermaid), Buffers represent binary formats (PDF, images,
   * audio).  In a real implementation this may be a stream.
   */
  data: Buffer | string;
  /**
   * Optional filename hint for saving the artifact.  This is not used by
   * the API directly but can be sent to the client for downloads.
   */
  filename?: string;
};

/**
 * Base interface for all renderers.  Renderers convert a typed input into
 * one or more supported output formats.  The input type varies by
 * renderer; for example Markdown renderers accept strings, whereas
 * mindmap renderers accept an object.  Implementations should throw
 * when asked to render an unsupported format.
 */
export interface Renderer<TInput> {
  /** Unique identifier for diagnostics. */
  kind: string;
  /** List of supported formats (file extensions). */
  formats(): string[];
  /** Render the input into the given format. */
  render(input: TInput, format: string): Promise<RenderedArtifact>;
}
