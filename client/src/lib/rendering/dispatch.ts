/**
 * GestaltView Rendering Engine — Format Dispatcher
 * Resolves a ContentFormat from explicit hint, MIME type, or filename extension.
 */

import type { ContentFormat, RenderableArtifact } from './types';

const MIME_MAP: Record<string, ContentFormat> = {
  'text/markdown': 'markdown',
  'text/x-markdown': 'markdown',
  'text/html': 'html',
  'application/xhtml+xml': 'html',
  'application/pdf': 'pdf',
  'text/x-python': 'python',
  'application/x-python': 'python',
  'text/python': 'python',
  'application/python': 'python',
  'text/vnd.mermaid': 'mermaid',
  'application/vnd.mermaid': 'mermaid',
  'text/mermaid': 'mermaid',
  'application/vnd.gestaltview.graph+json': 'graph',
  'application/graph+json': 'graph',
  'text/csv': 'csv',
  'application/csv': 'csv',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/json': 'json',
  'text/plain': 'text',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/webm': 'audio',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  // yaml
  'text/yaml': 'yaml',
  'application/yaml': 'yaml',
  'text/x-yaml': 'yaml',
  // notebook
  'application/x-ipynb+json': 'notebook',
};

const EXT_MAP: Record<string, ContentFormat> = {
  md: 'markdown',
  markdown: 'markdown',
  html: 'html',
  htm: 'html',
  pdf: 'pdf',
  py: 'python',
  pyw: 'python',
  mmd: 'mermaid',
  mermaid: 'mermaid',
  graph: 'graph',
  gvgraph: 'graph',
  csv: 'csv',
  xml: 'xml',
  json: 'json',
  txt: 'text',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  mp4: 'video',
  webm: 'video',
  // yaml — dedicated renderer
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'code',
  // notebook
  ipynb: 'notebook',
  // code extensions → code renderer
  ts: 'code',
  tsx: 'code',
  js: 'code',
  jsx: 'code',
  sql: 'code',
  sh: 'code',
  css: 'code',
  scss: 'code',
};

export function resolveFormat(artifact: RenderableArtifact): ContentFormat {
  if (artifact.format) return artifact.format;
  if (artifact.contentFormat) return artifact.contentFormat;

  if (artifact.mimeType) {
    const base = artifact.mimeType.split(';')[0].trim().toLowerCase();
    if (MIME_MAP[base]) return MIME_MAP[base];
  }

  // Content sniffing runs before filename extensions so a .txt file
  // with a Python shebang still resolves to the right renderer.
  const c = artifact.content.trimStart();
  if (c.startsWith('<!DOCTYPE html') || c.startsWith('<html')) return 'html';
  if (c.startsWith('#!/usr/bin/env python') || c.startsWith('#!/usr/bin/python')) return 'python';
  if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|journey|gantt|pie|mindmap|timeline)\b/.test(c)) return 'mermaid';
  if (/^[^\n]+?\s*(?:->|-->|=>)\s*[^\n]+/m.test(c)) return 'graph';
  // notebook sniff — ipynb always starts with {"cells": or {"nbformat"
  if (c.startsWith('{') && (
    c.includes('"cells"') || c.includes('"nbformat"')
  )) return 'notebook';
  if (c.startsWith('{') || c.startsWith('[')) return 'json';
  if (c.startsWith('<')) return 'xml';
  if (c.startsWith('#') || c.startsWith('**') || c.includes('\n## ')) return 'markdown';

  if (artifact.filename) {
    const ext = artifact.filename.split('.').pop()?.toLowerCase() ?? '';
    if (EXT_MAP[ext]) return EXT_MAP[ext];
  }

  return 'text';
}
