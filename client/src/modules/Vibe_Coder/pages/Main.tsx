// © 2026 Keith Soyka — GestaltView
// Vibe Coder — Main page
import MusicInput from '../components/MusicInput';
import VibeAnalysisCard from '../components/VibeAnalysisCard';
import CreativeSuggestions from '../components/CreativeSuggestions';
import NeuralAuroraVisualization from '../components/NeuralAuroraVisualization';
import { useVibeStore } from '../store/vibeStore';

export default function VibeCoderMain() {
  const { vibe, isAnalyzing } = useVibeStore();

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Vibe Coder</h1>
          <p className="text-slate-400 mt-1">Explore your musical DNA and unlock your creative signature</p>
        </div>

        {/* Neural Aurora background visualization */}
        {vibe && <NeuralAuroraVisualization vibe={vibe} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Left: Music Input */}
          <div className="space-y-6">
            <MusicInput />
            {vibe && <CreativeSuggestions vibeId={vibe.vibeId} />}
          </div>

          {/* Right: Vibe Analysis */}
          <div>
            {isAnalyzing && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <div className="text-slate-400 text-sm">Analyzing your musical DNA...</div>
              </div>
            )}
            {vibe && !isAnalyzing && <VibeAnalysisCard vibe={vibe} />}
            {!vibe && !isAnalyzing && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                <p className="text-slate-500 text-sm italic">Enter a song to reveal your vibe profile...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
