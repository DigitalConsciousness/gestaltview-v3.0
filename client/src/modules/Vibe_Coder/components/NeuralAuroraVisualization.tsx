// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Neural Aurora Visualization component
import type { VibeProfile } from '../lib/types';

interface Props {
  vibe: VibeProfile;
}

// Map vibe emotion scores to Neural Aurora gradient stops
function vibeToGradient(vibe: VibeProfile): string {
  const scores = vibe.emotionScores;
  const energy = scores.energy ?? 0;
  const joy = scores.joy ?? 0;
  const melancholy = scores.melancholy ?? 0;

  if (energy > 0.7) return 'from-orange-500/20 via-red-500/10 to-pink-500/20';
  if (joy > 0.7) return 'from-yellow-500/20 via-green-500/10 to-cyan-500/20';
  if (melancholy > 0.7) return 'from-blue-900/30 via-indigo-900/20 to-purple-900/30';
  return 'from-purple-500/15 via-pink-500/10 to-blue-500/15';
}

export default function NeuralAuroraVisualization({ vibe }: Props) {
  const gradient = vibeToGradient(vibe);

  return (
    <div
      className={`w-full h-24 rounded-2xl bg-gradient-to-r ${gradient} border border-white/5 flex items-center justify-center mb-2 transition-all duration-1000`}
    >
      <span className="text-white/30 text-xs tracking-widest uppercase">Neural Aurora</span>
    </div>
  );
}
