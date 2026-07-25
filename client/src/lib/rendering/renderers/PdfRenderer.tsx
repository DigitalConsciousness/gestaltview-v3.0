/**
 * PDF Renderer
 * Lazy-imports pdfjs-dist to keep initial bundle clean.
 * Renders pages to <canvas> elements — mobile-aware page scaling.
 * Accepts: base64 string, data URI, or URL.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { RenderingEngineProps } from '../types';

function toUint8Array(content: string): Uint8Array {
  const base64 = content.includes(',') ? content.split(',')[1] : content;
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

export default function PdfRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

        const isUrl = artifact.content.startsWith('http') || artifact.content.startsWith('blob:');
        const src = isUrl ? { url: artifact.content } : { data: toUint8Array(artifact.content) };
        const pdf = await pdfjs.getDocument(src).promise;

        if (!containerRef.current || cancelled) return;
        containerRef.current.innerHTML = '';

        const containerWidth = containerRef.current.offsetWidth || 360;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const scale = containerWidth / viewport.width;
          const scaled = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = scaled.width;
          canvas.height = scaled.height;
          canvas.style.display = 'block';
          canvas.style.marginBottom = '8px';

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport: scaled }).promise;
          if (!cancelled && containerRef.current) containerRef.current.appendChild(canvas);
        }
        if (!cancelled) setLoading(false);
      } catch (e: any) {
        if (!cancelled) { setError(e?.message ?? 'PDF render failed'); setLoading(false); }
      }
    })();
    return () => { cancelled = true; };
  }, [artifact.content]);

  return (
    <div
      className="gv-renderer gv-renderer--pdf"
      style={{ maxHeight, overflowY: 'auto' }}
    >
      {loading && !error && <div className="gv-render-loading">Loading PDF…</div>}
      {error && <div className="gv-render-error">{error}</div>}
      <div ref={containerRef} />
    </div>
  );
}
