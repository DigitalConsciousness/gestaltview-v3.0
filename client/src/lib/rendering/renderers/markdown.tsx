import React from 'react';
import { EnhancedMarkdownRenderer } from '../markdown/EnhancedMarkdownRenderer';
import type { RenderProps } from '../types';

export function MarkdownRenderer({ artifact, mode }: RenderProps) {
  return (
    <EnhancedMarkdownRenderer content={artifact.content} mode={mode} />
  );
}
