import React, { useEffect, useRef, useState } from 'react';
import type { RenderProps } from '../types';

const navBtnStyle: React.CSSProperties = {
  padding: '6px 14px',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

export function PdfRenderer({ artifact, mode, height }: RenderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const resolvedHeight = height ?? (mode === 'compact' ? 480 : 800);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://unpkg.com/pdfjs-dist/build/pdf.worker.min.js';
        const doc = await pdfjsLib.getDocument(artifact.content).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
        }
      } catch (err) {
        console.error('[PdfRenderer]', err);
      }
    })();
    return () => { cancelled = true; };
  }, [artifact.content]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    (async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport }).promise;
    })();
  }, [pdfDoc, currentPage]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxHeight: resolvedHeight,
          objectFit: 'contain',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      />
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={navBtnStyle}
          >
            ← Prev
          </button>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', alignSelf: 'center' }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={navBtnStyle}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
