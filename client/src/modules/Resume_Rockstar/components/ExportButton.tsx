// © 2026 Keith Soyka — GestaltView
// Resume Rockstar — Export Button component
import { useState } from 'react';

interface Props {
  resumeId: string;
}

type ExportFormat = 'markdown' | 'json' | 'pdf';

export default function ExportButton({ resumeId }: Props) {
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('markdown');

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch('/api/modules/resume-rockstar/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId, format }),
      });
      const data = await res.json();
      if (data.response?.downloadUrl) {
        window.open(data.response.downloadUrl, '_blank');
      } else if (data.response?.content) {
        const blob = new Blob([data.response.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume.${format === 'markdown' ? 'md' : format}`;
        a.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as ExportFormat)}
        className="bg-white/10 border border-white/20 text-slate-300 text-sm rounded-lg px-3 py-2 outline-none"
      >
        <option value="markdown">Markdown</option>
        <option value="json">JSON</option>
        <option value="pdf">PDF</option>
      </select>
      <button
        onClick={handleExport}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
      >
        {loading ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
}
