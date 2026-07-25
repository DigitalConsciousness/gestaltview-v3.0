// client/src/components/ProvenanceDisclosure.tsx
import React, { useState } from 'react';
import type { ProvenanceEnvelope } from '../../../shared/gen-engine/types';

interface Props { provenance: ProvenanceEnvelope; }

export function ProvenanceDisclosure({ provenance }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
      >
        {open ? '▾' : '▸'} Provenance
      </button>
      {open && (
        <div
          style={{
            marginTop: '6px',
            paddingLeft: '12px',
            borderLeft: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div>Engine: {provenance.engineVersion}</div>
          <div>Transform: {provenance.transformType}</div>
          <div>Generated: {new Date(provenance.generatedAt).toLocaleString()}</div>
          <div>
            Artifact hash:{' '}
            <code style={{ fontSize: '0.7rem' }}>{provenance.artifactHash.slice(0, 12)}…</code>
          </div>
          {provenance.sourceCaptureIds.length > 0 && (
            <div>
              Sources: {provenance.sourceCaptureIds.length} capture
              {provenance.sourceCaptureIds.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
