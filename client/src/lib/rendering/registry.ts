import type { ArtifactContentFormat } from '@shared/gen-engine/types';
import type { RendererComponent } from './types';

import { MarkdownRenderer }  from './renderers/markdown';
import { HtmlRenderer }      from './renderers/html';
import { Html5Renderer }     from './renderers/html5';
import { ReactRenderer }     from './renderers/react-component';
import { PdfRenderer }       from './renderers/pdf';
import { CsvRenderer }       from './renderers/csv';
import { XmlRenderer }       from './renderers/xml';
import { ImageRenderer }     from './renderers/image';
import { AudioRenderer }     from './renderers/audio';
import { VideoRenderer }     from './renderers/video';
import { JsonRenderer }      from './renderers/json';
import { CodeRenderer }      from './renderers/code';
import { DiagramRenderer }   from './renderers/DiagramRenderer';
import { GraphRenderer }     from './renderers/GraphRenderer';
import MindMapRenderer       from './renderers/MindMapRenderer';
import { TextRenderer }      from './renderers/text';
import { YamlRenderer }      from './renderers/yaml';
import { NotebookRenderer }  from './renderers/notebook';

export const FORMAT_REGISTRY: Record<ArtifactContentFormat, RendererComponent> = {
  markdown: MarkdownRenderer,
  html:     HtmlRenderer,
  html5:    Html5Renderer,
  react:    ReactRenderer,
  pdf:      PdfRenderer,
  csv:      CsvRenderer,
  xml:      XmlRenderer,
  image:    ImageRenderer,
  audio:    AudioRenderer,
  video:    VideoRenderer,
  json:     JsonRenderer,
  code:     CodeRenderer,
  python:   CodeRenderer,
  mermaid:  DiagramRenderer,
  diagram:  DiagramRenderer,
  graph:    GraphRenderer,
  workflow: GraphRenderer,
  text:     TextRenderer,
  mindmap:  MindMapRenderer,
  yaml:     YamlRenderer,
  notebook: NotebookRenderer,
};

export function getRenderer(format: ArtifactContentFormat): RendererComponent {
  return FORMAT_REGISTRY[format] ?? TextRenderer;
}
