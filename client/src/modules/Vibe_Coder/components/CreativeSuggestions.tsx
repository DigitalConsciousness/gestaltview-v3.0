// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Creative Suggestions component
import { useState, useEffect } from 'react';

interface Suggestion {
  prompt: string;
  action: string;
}

interface Props {
  vibeId: string;
}

export default function CreativeSuggestions({ vibeId }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vibeId) return;
    setLoading(true);
    fetch(`/api/modules/vibe-coder/suggestions?vibeId=${vibeId}`)
      .then((r) => r.json())
      .then((data) => setSuggestions(data.response?.suggestions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [vibeId]);

  if (loading) {
    return <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-500 text-sm">Loading suggestions...</div>;
  }

  if (!suggestions.length) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-3">Creative Explorations</h3>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
            <span className="text-purple-400 text-lg leading-none mt-0.5">✦</span>
            <div>
              <p className="text-slate-200 text-sm">{s.prompt}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
