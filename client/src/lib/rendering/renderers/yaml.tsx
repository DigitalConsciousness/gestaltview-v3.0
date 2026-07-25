import React from 'react';
import type { RenderProps } from '../types';
import { CodeRenderer } from './code';

/**
 * YamlRenderer — renders YAML artifacts using the CodeRenderer.
 * Displayed with monospace styling and copy button.
 * Corpus source: GestaltView_Corpus_-_Knowledge_Repository/yaml/
 */
export function YamlRenderer({ artifact, mode }: RenderProps) {
  return (
    <CodeRenderer
      artifact={{ ...artifact, format: 'yaml' as any }}
      mode={mode}
    />
  );
}
