import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import React from 'react';
import { Link } from 'wouter';
import NavBar from '../components/NavBar';
import AuroraBackground from '../components/AuroraBackground';
import { GlassCard } from '../components/ui/GlassCard';

const principles = [
  { icon: '🛡️', title: 'Constitutional Invariants', description: 'Non-negotiable ethical constraints baked into every layer of the GestaltView architecture. No override. No exceptions.' },
  { icon: '⚖️', title: 'Tribunal Governance', description: 'Every significant AI output passes through a multi-perspective review process before reaching the user.' },
  { icon: '🚫', title: 'No-Extraction Pledge', description: 'GestaltView never sells, mines, or monetizes user consciousness data. Your inner life is not a product.' },
  { icon: '🧠', title: 'Cognitive Justice', description: 'Neurodivergent minds deserve AI that amplifies — not normalises — their cognitive style.' },
  { icon: '🌱', title: 'Regenerative AI', description: 'Systems designed to leave users more capable, not more dependent.' },
  { icon: '🔍', title: 'Radical Transparency', description: 'Users always know when and how AI is shaping their experience. No hidden nudges.' },
];

export default function EthicsFrameworkPage() {
  useSEO(PAGE_SEO.ethics);
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AuroraBackground />
      <NavBar />
      <div className="relative z-10 flex justify-start px-6 pt-20">
        <Link href="/"><a className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white/70 hover:text-white transition-all">← Home</a></Link>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ background: 'linear-gradient(135deg,#00FFD4,#9945FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ethics Framework
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">GestaltView is built on the principle that AI should serve human consciousness — not extract from it.</p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {principles.map(p => (
            <GlassCard key={p.title} glow="cyan" intensity="medium" className="p-6">
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-[#00FFD4] mb-2">{p.title}</h3>
              <p className="text-sm text-white/70">{p.description}</p>
            </GlassCard>
          ))}
        </div>
        <div className="text-center pb-8">
          <Link href="/"><a className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#00FFD4]/40 bg-[#00FFD4]/10 text-[#00FFD4] hover:bg-[#00FFD4]/20 transition-all">← Return to GestaltView</a></Link>
        </div>
      </div>
    </div>
  );
}
