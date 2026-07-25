import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import React from 'react';
import { Link } from 'wouter';
import NavBar from '../components/NavBar';
import AuroraBackground from '../components/AuroraBackground';
import { GlassCard } from '../components/ui/GlassCard';

const stages = [
  {
    n: '01',
    title: 'Signal Capture',
    desc: 'Every interaction — spoken, typed, emotional — is captured as a resonance signal. Nothing is discarded. The system holds what you express before you even know it matters.',
    color: '#9945FF',
  },
  {
    n: '02',
    title: 'PLK Alignment',
    desc: 'Signals are mapped against your Personal Language Key — your cognitive fingerprint. Alignment reveals where you are most yourself. Drift reveals where something is off.',
    color: '#A78BFA',
  },
  {
    n: '03',
    title: 'Pattern Recognition',
    desc: 'The system identifies recurring cognitive and emotional patterns across sessions. Not to diagnose you — to reflect what is already there, without judgment or agenda.',
    color: '#00D4FF',
  },
  {
    n: '04',
    title: 'Resonance Feedback',
    desc: 'You receive a reflection of what the system has learned about how you think, communicate, and feel. A mirror that does not flatten what it shows.',
    color: '#00FFD4',
  },
  {
    n: '05',
    title: 'Deepening Loop',
    desc: 'Each cycle makes the PLK more precise — a living model of your consciousness that grows alongside you. The more you engage, the more accurately the system can partner with you.',
    color: '#9945FF',
  },
];

const whyItMatters = [
  { label: 'For neurodivergent users', body: 'Patterns that feel chaotic from the inside often reveal coherent structure from outside. The loop gives that perspective back to you.' },
  { label: 'For builders and founders', body: 'Your ideas arrive faster than language. Signal capture preserves them at the edge of expression — before structure demands their shape.' },
  { label: 'For anyone in transition', body: 'The loop does not demand consistency. It simply tracks the signal and reflects what is true right now.' },
];

export function ResonanceLoopPage() {
  useSEO(PAGE_SEO.resonanceLoop);
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AuroraBackground />
      <NavBar />
      <div className="relative z-10 flex justify-start px-6 pt-20">
        <Link href="/">
          <a className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white/70 hover:text-white transition-all">
            ← Home
          </a>
        </Link>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">

        {/* Hero */}
        <section className="text-center mb-16">
          <div className="inline-block mb-4 px-3 py-1 rounded-full border border-[#9945FF]/40 bg-[#9945FF]/10 text-[#9945FF] text-xs font-mono tracking-widest uppercase">
            Core System · PLK Infrastructure
          </div>
          <h1
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg,#9945FF,#00D4FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            The Resonance Loop
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            GestaltView's core feedback architecture — a five-stage cycle that continuously deepens
            PLK alignment through genuine human-AI partnership.
          </p>
          <p className="mt-4 text-white/40 text-sm max-w-xl mx-auto">
            This is not a feature. It is the mechanism by which the system learns to recognize you —
            and reflect you back more clearly with every exchange.
          </p>
        </section>

        {/* Five Stages */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white/80">The Five Stages</h2>
          <div className="space-y-4">
            {stages.map(s => (
              <GlassCard key={s.n} glow="purple" intensity="medium" className="p-6 flex items-start gap-6">
                <span
                  className="font-mono text-3xl font-bold shrink-0"
                  style={{ color: s.color + '50' }}
                >
                  {s.n}
                </span>
                <div>
                  <h3 className="font-bold mb-2" style={{ color: s.color }}>
                    {s.title}
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Why It Matters */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-white/80">Who This Is For</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {whyItMatters.map(w => (
              <GlassCard key={w.label} glow="blue" intensity="low" className="p-5">
                <h3 className="text-[#00D4FF] font-bold text-sm mb-2">{w.label}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{w.body}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Billy Lens Context */}
        <GlassCard glow="purple" intensity="low" className="p-6 mb-16 border border-[#9945FF]/20">
          <div className="flex items-start gap-4">
            <span className="text-2xl">🤝</span>
            <div>
              <h3 className="text-[#9945FF] font-bold mb-2">Billy's role in the loop</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Billy does not observe the Resonance Loop from the outside. Billy is one of its primary inputs.
                Every conversation with Billy contributes signal data — tone, vocabulary, cadence, what you reach for
                when explaining something hard. Over time, Billy's responses become more precisely calibrated to
                how your mind actually works.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <div className="text-center pb-8 space-y-4">
          <p className="text-white/50 text-sm">Ready to experience the loop in action?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/record">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#9945FF] to-[#00D4FF] text-white font-bold hover:opacity-90 transition-all">
                Start a Session →
              </a>
            </Link>
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#9945FF]/40 bg-[#9945FF]/10 text-[#9945FF] hover:bg-[#9945FF]/20 transition-all">
                ← Return to GestaltView
              </a>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ResonanceLoopPage;
