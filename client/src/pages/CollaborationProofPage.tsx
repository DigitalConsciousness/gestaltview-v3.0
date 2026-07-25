import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import { Link } from 'wouter';
import NavBar from '../components/NavBar';
import AuroraBackground from '../components/AuroraBackground';

export default function CollaborationProofPage() {
  useSEO(PAGE_SEO.collaborationProof);
  return (
    <div className="relative min-h-screen text-white overflow-x-hidden">
      <AuroraBackground />
      <NavBar />
      <div className="relative z-10 flex justify-start px-6 pt-20">
        <Link href="/"><a className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-sm text-white/70 hover:text-white transition-all">← Home</a></Link>
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ background: 'linear-gradient(135deg,#00D4FF,#9945FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Collaboration Proof
        </h1>
        <p className="text-lg text-white/70 mb-8">Blockchain-timestamped, auditable proof of GestaltView's AI-Human Consciousness Symbiosis breakthroughs.</p>
        <Link href="/"><a className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-all">← Return to GestaltView</a></Link>
      </div>
    </div>
  );
}
