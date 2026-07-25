import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import type { RenderProps } from '../types';

const WRAPPER = (content: string) => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #05070b; color: #e8e0f0; font-family: system-ui, sans-serif; }</style>
</head>
<body>${content}</body>
</html>`;

export function Html5Renderer({ artifact, mode, height, onInteraction }: RenderProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const resolvedHeight = height ?? (mode === 'compact' ? 360 : 640);

  const blobUrl = useMemo(() => {
    const blob = new Blob([WRAPPER(artifact.content)], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [artifact.content]);

  useEffect(() => () => URL.revokeObjectURL(blobUrl), [blobUrl]);

  const handleMessage = useCallback((e: MessageEvent) => {
    if (e.source === iframeRef.current?.contentWindow) {
      onInteraction?.({ type: 'message', payload: e.data });
    }
  }, [onInteraction]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      ref={iframeRef}
      title={artifact.title}
      src={blobUrl}
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
      allow="autoplay; camera; microphone"
      style={{
        width: '100%',
        height: resolvedHeight,
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        background: '#05070b',
      }}
    />
  );
}
