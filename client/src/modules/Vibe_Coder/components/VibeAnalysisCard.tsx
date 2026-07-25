// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Vibe Analysis Card component
import type { VibeProfile } from '../lib/types';

interface Props {
  vibe: VibeProfile;
}

export default function VibeAnalysisCard({ vibe }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Your Vibe Profile</h2>
        <span className="text-xs text-slate-500">{vibe.song} — {vibe.artist || 'Unknown'}</span>
      </div>

      {/* Emotion scores */}
      <div className="space-y-3 mb-6">
        {Object.entries(vibe.emotionScores).map(([emotion, score = 0]) => (
          <div key={emotion}>
            <div className="flex justify-between text-xs text-slate-400 mb-1 capitalize">
              <span>{emotion}</span>
              <span>{Math.round(score * 100)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                style={{ width: `${score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Personality dimensions */}
      {vibe.personalityDimensions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Personality Resonance</h3>
          <div className="flex flex-wrap gap-2">
            {vibe.personalityDimensions.map((dim) => (
              <span
                key={dim}
                className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
              >
                {dim}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Core narrative */}
      {vibe.coreNarrative && (
        <p className="text-slate-300 text-sm italic border-t border-white/10 pt-4">
          "{vibe.coreNarrative}"
        </p>
      )}
    </div>
  );
}
