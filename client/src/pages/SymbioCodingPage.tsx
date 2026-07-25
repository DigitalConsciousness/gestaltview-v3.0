import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import React, { useState } from 'react';
import { Link } from 'wouter';
import NavBar from '../components/NavBar';
import AuroraBackground from '../components/AuroraBackground';
import { GlassCard } from '../components/ui/GlassCard';
import { VoiceMicButton } from '../components/VoiceMicButton';

const SYMBIOCODER_URL = 'https://symbiocoder.gestaltview.app';

const features = [
  { icon: '🧠', title: 'PLK-Calibrated Output', desc: 'Responses adapt to your cognitive fingerprint — your vocabulary, abstraction level, and reasoning style.' },
  { icon: '🎤', title: 'Voice-to-Code', desc: 'Think out loud. SymbioCoder transcribes, interprets, and generates — no reformatting required.' },
  { icon: '🔄', title: '8-Persona Tribunal', desc: 'Multiple AI reasoning modes evaluate your request from different angles before responding.' },
  { icon: '🛡️', title: 'Privacy-First Local Mode', desc: 'Run entirely on your machine with Ollama. No cloud. No telemetry. Your code stays yours.' },
];

export default function SymbioCodingPage() {
  useSEO(PAGE_SEO.symbiocoder);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);

  const handleLaunch = () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    // Store the seed thought in sessionStorage so the live app can pick it up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('symbiocoder_seed', input.trim());
    }
    setLaunched(true);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AuroraBackground />
      <NavBar />
      <div className="relative z-10 flex justify-start px-6 pt-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white/70 hover:text-white transition-all"
        >
          ← Home
        </Link>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

        {/* Hero */}
        <section className="text-center mb-12">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-mono tracking-widest uppercase">
            Live Demo · Consciousness-Aware Coding
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg,#00D4FF,#9945FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SymbioCoder
          </h1>
          <p className="text-xl text-[#00FFD4] mb-2">Voice-enabled, context-aware AI coding partner</p>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            Calibrated to your PLK — amplifies your cognitive style instead of flattening it.
            Built for neurodivergent builders who think faster than they can type.
          </p>
        </section>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {features.map(f => (
            <GlassCard key={f.title} glow="cyan" intensity="low" className="p-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="text-[#00D4FF] font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </GlassCard>
          ))}
        </div>

        {/* Seed + Launch */}
        {!launched ? (
          <GlassCard glow="blue" intensity="high" hover={false} className="p-8 mb-8">
            <h2 className="text-white font-bold mb-2">Start with a seed thought</h2>
            <p className="text-white/50 text-sm mb-4">
              Describe what you’re building, a bug you’re stuck on, or an idea at the edge of language.
              Your input will be passed directly into SymbioCoder to start the session.
            </p>
            <div className="flex items-start gap-3 mb-4">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleLaunch(); }}
                placeholder="What are you building? What's the thing you can't quite explain yet?"
                rows={4}
                className="flex-1 p-4 bg-black/60 border border-[#00D4FF]/40 rounded-lg text-white resize-none focus:outline-none focus:border-[#00D4FF] text-sm"
              />
              <VoiceMicButton
                theme="teal"
                size={40}
                onTranscript={t => setInput(p => p ? p + ' ' + t : t)}
              />
            </div>
            <button
              onClick={handleLaunch}
              disabled={loading || !input.trim()}
              className={`w-full py-3 rounded-lg font-bold transition-all ${
                loading
                  ? 'bg-[#00D4FF]/30 cursor-wait animate-pulse text-white/60'
                  : 'bg-gradient-to-r from-[#00D4FF] to-[#9945FF] hover:opacity-90 text-white'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {loading ? '●●● Preparing…' : '⚡ Launch SymbioCoder'}
            </button>
            <p className="text-center text-white/30 text-xs mt-3">
              Cmd/Ctrl + Enter to launch · Voice input supported
            </p>
          </GlassCard>
        ) : (
          <GlassCard glow="cyan" intensity="medium" hover={false} className="p-8 mb-8 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h2 className="text-[#00FFD4] font-bold text-xl mb-3">Your session is ready</h2>
            <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
              Your seed thought has been saved. Open SymbioCoder to begin — it will load your context automatically.
            </p>
            <a
              href={SYMBIOCODER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#9945FF] text-white font-bold text-lg hover:opacity-90 transition-all mb-4"
            >
              Open SymbioCoder →
            </a>
            <p className="text-white/30 text-xs mt-2">
              Opens in a new tab · Seed: “{input.length > 60 ? input.slice(0, 60) + '…' : input}”
            </p>
            <button
              onClick={() => { setLaunched(false); setInput(''); }}
              className="mt-4 text-white/40 text-xs hover:text-white/70 transition-all"
            >
              ← Try a different seed
            </button>
          </GlassCard>
        )}

        {/* Availability Note */}
        <GlassCard glow="purple" intensity="low" className="p-5 mb-12 border border-[#9945FF]/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">🛠️</span>
            <div>
              <h3 className="text-[#9945FF] font-bold text-sm mb-1">About SymbioCoder</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                SymbioCoder is a standalone application — a full FastAPI + Next.js stack with
                multi-provider LLM routing (OpenAI, Claude, Ollama), an 8-persona Tribunal engine,
                and voice-to-code pipeline. The full application runs at{' '}
                <a href={SYMBIOCODER_URL} target="_blank" rel="noopener noreferrer" className="text-[#00D4FF] underline hover:text-[#00FFD4]">
                  symbiocoder.gestaltview.app
                </a>.
                Local installation instructions are available in the SymbioCoder repository.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="text-center pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all"
          >
            ← Return to GestaltView
          </Link>
        </div>

      </div>
    </div>
  );
}
