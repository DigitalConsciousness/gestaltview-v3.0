/**
 * GestaltView Rendering Engine - Top-level component
 * Routes to the correct renderer based on resolved format.
 */

import React from 'react';
import { resolveFormat } from './dispatch';
import { getRenderer } from './registry';
import { RendererErrorBoundary } from './RendererErrorBoundary';
import type { RenderProps, RenderingEngineProps } from './types';

export function RenderingEngine({ artifact, maxHeight = 600, noAurora = false, className = '' }: RenderingEngineProps) {
  const format = resolveFormat(artifact);
  const Renderer = getRenderer(format);
  const rendererProps: RenderProps = {
    artifact,
    mode: 'inline',
    height: maxHeight,
    className,
  };

  const wrapperClass = [
    'gv-rendering-engine',
    noAurora ? '' : 'gv-aurora-border',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass} data-format={format}>
      <RendererErrorBoundary format={format} title={artifact.title}>
        <Renderer {...rendererProps} />
      </RendererErrorBoundary>
    </div>
  );
}
