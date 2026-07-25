import React from 'react';
import type { RenderProps } from '../types';
import HtmlArtifactRenderer from './HtmlArtifactRenderer';

export function HtmlRenderer({ artifact, mode }: RenderProps) {
  return (
    <HtmlArtifactRenderer
      title={artifact.title ?? 'HTML Artifact'}
      html={artifact.content}
      signedUrl={(artifact as any).signedUrl}
      retrievalMode={(artifact as any).retrievalMode ?? 'persistent'}
      mode={mode === 'fullscreen' ? 'fullscreen' : 'inline'}
      minHeight={mode === 'compact' ? 320 : 520}
      autoResize={true}
      chrome={true}
    />
  );
}
