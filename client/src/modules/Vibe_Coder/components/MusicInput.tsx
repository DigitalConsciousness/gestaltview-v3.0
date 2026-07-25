// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Music Input component
import { useState } from 'react';
import { useVibeStore } from '../store/vibeStore';

export default function MusicInput() {
  const { analyzeVibe } = useVibeStore();
  const [song, setSong] = useState('');
  const [artist, setArtist] = useState('');

  async function handleAnalyze() {
    if (!song.trim()) return;
    await analyzeVibe(song.trim(), artist.trim());
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">What's your vibe?</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Song Title *</label>
          <input
            value={song}
            onChange={(e) => setSong(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="e.g. Bohemian Rhapsody"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Artist (optional)</label>
          <input
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Queen"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 outline-none text-sm"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={!song.trim()}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-40 text-white font-medium rounded-xl transition-all text-sm"
        >
          Analyze Vibe
        </button>
      </div>
    </div>
  );
}
