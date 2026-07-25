import React from 'react';
import type { RenderProps } from '../types';
import { CodeRenderer } from './code';
import { EnhancedMarkdownRenderer } from '../markdown/EnhancedMarkdownRenderer';

type NotebookCell = {
  cell_type: 'code' | 'markdown' | 'raw';
  source: string | string[];
  outputs?: NotebookOutput[];
  execution_count?: number | null;
};

type NotebookOutput = {
  output_type: string;
  text?: string | string[];
  data?: Record<string, string | string[]>;
  traceback?: string[];
};

function joinSource(source: string | string[]): string {
  return Array.isArray(source) ? source.join('') : source;
}

function renderOutput(output: NotebookOutput, idx: number) {
  if (output.output_type === 'error') {
    const tb = (output.traceback ?? []).join('\n').replace(/\x1b\[[0-9;]*m/g, '');
    return (
      <pre key={idx} style={{
        background: '#1a0a0a',
        color: '#e06c75',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '0.78rem',
        overflowX: 'auto',
        margin: '6px 0 0',
        border: '1px solid rgba(224,108,117,0.2)',
      }}>
        {tb}
      </pre>
    );
  }

  const text =
    output.text
      ? joinSource(output.text)
      : output.data?.['text/plain']
      ? joinSource(output.data['text/plain'])
      : null;

  if (!text) return null;

  return (
    <pre key={idx} style={{
      background: '#0a0d12',
      color: 'rgba(200,210,230,0.75)',
      borderRadius: '8px',
      padding: '8px 14px',
      fontSize: '0.78rem',
      overflowX: 'auto',
      margin: '6px 0 0',
      border: '1px solid rgba(255,255,255,0.05)',
    }}>
      {text}
    </pre>
  );
}

/**
 * NotebookRenderer — renders Jupyter .ipynb notebooks cell-by-cell.
 * Markdown cells → EnhancedMarkdownRenderer
 * Code cells     → CodeRenderer + outputs
 * Raw cells      → plain pre block
 * Corpus source: GestaltView_Corpus_-_Knowledge_Repository/notebooks_(ipynb)/
 */
export function NotebookRenderer({ artifact, mode }: RenderProps) {
  let cells: NotebookCell[] = [];

  try {
    const parsed = JSON.parse(artifact.content);
    cells = parsed.cells ?? [];
  } catch {
    return (
      <div style={{ color: '#e06c75', padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
        ⚠️ Could not parse notebook JSON.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
      {cells.map((cell, i) => {
        const src = joinSource(cell.source);

        if (cell.cell_type === 'markdown') {
          return (
            <div key={i} style={{
              padding: '4px 2px',
              borderLeft: '2px solid rgba(97,175,239,0.25)',
              paddingLeft: '12px',
            }}>
              <EnhancedMarkdownRenderer content={src} mode={mode} />
            </div>
          );
        }

        if (cell.cell_type === 'code') {
          return (
            <div key={i}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
                opacity: 0.4,
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                color: 'rgba(255,255,255,0.6)',
              }}>
                In [{cell.execution_count ?? ' '}]:
              </div>
              <CodeRenderer
                artifact={{ ...artifact, content: src, format: 'python' as any }}
                mode={mode}
              />
              {(cell.outputs ?? []).map((o, oi) => renderOutput(o, oi))}
            </div>
          );
        }

        // raw cell
        return (
          <pre key={i} style={{
            background: '#0d0f14',
            color: 'rgba(200,210,230,0.6)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '0.8rem',
            overflowX: 'auto',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            {src}
          </pre>
        );
      })}
    </div>
  );
}
