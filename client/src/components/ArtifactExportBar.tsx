// client/src/components/ArtifactExportBar.tsx
import React, { useState } from 'react';
import type { GeneratedArtifact, ArtifactExportFormat } from '../../../shared/gen-engine/types';

interface ArtifactExportBarProps {
  artifact: GeneratedArtifact;
  apiBase?: string;
}

const EXPORT_OPTIONS: { label: string; format: ArtifactExportFormat }[] = [
  { label: 'Markdown', format: 'markdown' },
  { label: 'HTML', format: 'html' },
  { label: 'JSON', format: 'json' },
  { label: 'Text', format: 'text' },
];

export function ArtifactExportBar({ artifact, apiBase = '/api/gen-engine' }: ArtifactExportBarProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(format: ArtifactExportFormat) {
    setExporting(format);
    try {
      const res = await fetch(`${apiBase}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact, format }),
      });

      if (format === 'html') {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${artifact.title.replace(/\s+/g, '-').toLowerCase()}.html`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const data = await res.json();
        const blob = new Blob([data.content], { type: data.mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(null);
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
      {EXPORT_OPTIONS.map(({ label, format }) => (
        <button
          key={format}
          onClick={() => handleExport(format)}
          disabled={exporting === format}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.15)',
            background: exporting === format ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: 'rgba(255,255,255,0.72)',
            cursor: exporting === format ? 'wait' : 'pointer',
            fontSize: '0.8rem',
          }}
        >
          {exporting === format ? '...' : `↓ ${label}`}
        </button>
      ))}
    </div>
  );
}
