// © 2026 Keith Soyka — GestaltView
// Symbio Coder — Suggestion Panel component
import { useState } from 'react';
import { useCoderStore } from '../store/coderStore';

type SuggestionType = 'explain' | 'optimize' | 'refactor';

export default function SuggestionPanel() {
  const { code, language, sessionId } = useCoderStore();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<SuggestionType | null>(null);

  async function requestSuggestion(type: SuggestionType) {
    if (!code.trim()) return;
    setLoading(true);
    setActiveType(type);
    setResult(null);
    try {
      const res = await fetch('/api/modules/symbio-coder/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code, language, suggestionType: type }),
      });
      const data = await res.json();
      setResult(data.response?.suggestion ?? 'No suggestion returned.');
    } catch {
      setResult('Error fetching suggestion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0D1117] border-t border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        {(['explain', 'optimize', 'refactor'] as SuggestionType[]).map((t) => (
          <button
            key={t}
            onClick={() => requestSuggestion(t)}
            disabled={loading}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-colors ${
              activeType === t && result
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            } disabled:opacity-40`}
          >
            {loading && activeType === t ? '...' : t}
          </button>
        ))}
      </div>
      {result && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <pre className="text-sm text-slate-200 whitespace-pre-wrap font-mono">{result}</pre>
        </div>
      )}
    </div>
  );
}
