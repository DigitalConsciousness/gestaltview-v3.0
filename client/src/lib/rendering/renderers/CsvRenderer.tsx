/**
 * CSV Renderer
 * Uses papaparse for robust parsing.
 * Renders a scrollable table with row/column count in the header.
 */

import React, { useMemo } from 'react';
import Papa from 'papaparse';
import type { RenderingEngineProps } from '../types';

export default function CsvRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const { data, meta, errors } = useMemo(() => {
    return Papa.parse<string[]>(artifact.content, { header: false, skipEmptyLines: true });
  }, [artifact.content]);

  const headers = data[0] ?? [];
  const rows = data.slice(1);

  return (
    <div className="gv-renderer gv-renderer--csv">
      <div className="gv-csv-meta">
        {rows.length} rows × {headers.length} columns
        {errors.length > 0 && <span className="gv-csv-error"> · {errors.length} parse warning(s)</span>}
      </div>
      <div style={{ maxHeight, overflowY: 'auto', overflowX: 'auto' }}>
        <table className="gv-csv-table">
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
