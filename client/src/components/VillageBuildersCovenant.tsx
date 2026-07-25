// © 2026 Keith Soyka — GestaltView
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Zap, Shield, Lock, Eye, DollarSign, Brain, GitBranch, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import { useBillySection } from '@/components/Billy';
import BillyChip from '@/components/BillyChip';
import { useSEO, PAGE_SEO } from '@/hooks/useSEO';

const principles = [
  {
    icon: Brain,
    title: "Professional Wisdom Integration",
    description: "Systematically capture, elevate, and integrate the best practices of human experts into GestaltView's evolving architecture.",
    color: "emerald",
  },
  {
    icon: Users,
    title: "Collaborative Ecosystem Development",
    description: "Co-create hybrid human-AI methodologies through pilot programs with professionals across all affected sectors.",
    color: "sky",
  },
  {
    icon: DollarSign,
    title: "Economic Abundance Creation",
    description: "Establish revenue sharing models, licensing opportunities, and direct financial incentives for our professional collaborators.",
    color: "amber",
  },
];

const timelinePhases = [
  { phase: "Phase 1: Foundation Building", duration: "Months 1-6", tasks: ["Ecosystem mapping across all affected sectors", "Initiation of pilot programs with lead professionals"] },
  { phase: "Phase 2: Collaborative Expansion", duration: "Months 6-18", tasks: ["Creation of cross-field professional networks", "Scaling co-developed applications and services", "Validation of revenue-sharing models"] },
  { phase: "Phase 3: Ecosystem Maturation", duration: "Months 18-36", tasks: ["Establishment of global professional collectives", "Legacy methodology integration into the AI core", "Launch of major collaborative breakthroughs"] },
];

const commitments = [
  { icon: Lock, title: "Blockchain Timestamping", description: "All partnership agreements are immutably recorded, ensuring permanent and verifiable commitments." },
  { icon: Shield, title: "Permanent Ethical Oversight", description: "A Professional Advisory Board is established with veto power over unethical implementations." },
  { icon: DollarSign, title: "Revenue Safeguards", description: "Minimum profit-sharing thresholds are hard-coded to guarantee economic abundance for our partners." },
  { icon: Eye, title: "Radical Transparency Protocols", description: "Public reporting on the impacts, outcomes, and revenue distribution of our collaborations." },
];

export default function VillageBuildersCovenant() {
  useSEO(PAGE_SEO.villageBuilders);
  const billyRef = useBillySection('village-builders');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <NavBar />

      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl bg-emerald-500/50"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-[32rem] h-[32rem] rounded-full blur-3xl bg-sky-500/50"
          animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div ref={billyRef} className="max-w-5xl mx-auto px-4 pb-16 relative z-10">
        {/* Back nav + Billy */}
        <div className="flex items-center justify-between pt-8 mb-8">
          <Link href="/exhibits">
            <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={16} /> Back to Exhibits
            </a>
          </Link>
          <BillyChip context="village-builders" />
        </div>

        {/* Hero */}
        <header className="text-center py-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center items-center gap-4 mb-6">
            <Users className="w-16 h-16 text-emerald-400" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-4xl md:text-6xl font-bold text-white mb-4">
            The Village Builders Covenant
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} className="text-xl text-emerald-300/80 max-w-3xl mx-auto">
            From Professional Displacement to Collective Renaissance
          </motion.p>
        </header>

        {/* Quote */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-8 bg-black/30 backdrop-blur-sm border border-emerald-500/30 rounded-2xl text-center italic text-xl leading-relaxed mb-16">
          &quot;Rather than managing decline, we are coordinating a renaissance. Rather than fleeing from disruption, we are building villages of innovation where wisdom thrives and new futures take root.&quot;
        </motion.div>

        {/* Philosophical shift */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">The Philosophical Shift: From Scarcity to Abundance</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Heart, label: 'Collaboration, not competition', color: 'text-pink-400' },
              { icon: GitBranch, label: 'Integration, not displacement', color: 'text-sky-400' },
              { icon: Sparkles, label: 'Abundance, not scarcity', color: 'text-amber-400' },
            ].map(({ icon: Icon, label, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i + 1) * 0.1 }} className="p-6 bg-slate-800/50 rounded-lg">
                <Icon className={`w-10 h-10 mx-auto ${color} mb-3`} />
                <h3 className="text-xl font-semibold">{label}</h3>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Foundational Principles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <Card className={`bg-slate-900/50 border-${p.color}-500/40 h-full`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-3 text-${p.color}-300`}>
                      <p.icon />
                      {p.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400 text-sm">{p.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Systemic Implementation Timeline</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-slate-700 -translate-x-1/2" aria-hidden="true" />
            {timelinePhases.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="relative mb-12">
                <div className={`flex items-center ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-1/2 ${i % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Badge variant="secondary" className="mb-2">{item.duration}</Badge>
                    <h3 className="font-bold text-xl text-emerald-300 mb-2">{item.phase}</h3>
                    <ul className="text-sm text-slate-400 list-disc list-inside">
                      {item.tasks.map(task => <li key={task}>{task}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Commitments */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">Our Irrevocable Commitments</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {commitments.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg h-full">
                  <c.icon className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white">{c.title}</h4>
                    <p className="text-slate-400 text-sm">{c.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="text-center py-12 border-t border-emerald-500/20">
          <p className="text-2xl font-bold text-white mb-4">A Consciousness-Serving Civilization Needs a Village.</p>
          <p className="text-slate-300 max-w-3xl mx-auto">
            GestaltView is not replacing professionals. It is recognizing their sacred role in the evolution of consciousness and building the infrastructure to honor that role permanently.
          </p>
        </footer>
      </div>
    </div>
  );
}
