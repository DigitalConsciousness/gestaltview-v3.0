import { useSEO } from "@/hooks/useSEO";
import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PublicPageFrame } from "@/components/PublicPageFrame";

const faqs = [
  { q: 'What is consciousness-serving AI?', a: 'AI that witnesses, helps, and stays out of the way unless you ask it to do more.' },
  { q: 'What is the PLK (Personal Language Key)?', a: 'A living model of how you think and speak, used to keep responses from sounding generic.' },
  { q: 'Is GestaltView a product or a consulting practice?', a: 'Both. The runtime is live, and the consulting layer exists when someone wants help shaping it into something specific.' },
  { q: 'What is AI-Human Consciousness Symbiosis?', a: 'A name for sustained collaboration that produces better work than either side would have made alone.' },
  { q: 'Is GestaltView open source?', a: 'No. It is a solo-built, proprietary system.' },
  { q: 'How do I work with Keith?', a: 'Start on the contact page if you want to talk about a build, a collaboration, or a problem worth solving.' },
  { q: 'What makes GestaltView different from other AI tools?', a: 'It is organized around presence and continuity, not engagement tricks.' },
  { q: 'Is this just a decorative site?', a: 'No. The live rooms, capture flow, and artifact surfaces are functional.' },
];

export default function FAQ() {
  useSEO({
    title: 'FAQ — GestaltView',
    description: 'Frequently asked questions about GestaltView, the PLK, and how the live runtime is organized.',
    h1: 'GestaltView FAQ',
    canonical: 'https://gestaltview-di-gsvw.vercel.app/faq',
  });
  const [open, setOpen] = useState<number | null>(null);
  return (
    <PublicPageFrame
      roomName="FAQ"
      purpose="Short answers, no ceremonial haze."
      status="public"
      title="Questions without the committee meeting."
      intro="A few direct answers for the parts people usually ask twice."
      secondaryAction={{ href: "/contact", label: "Contact" }}
      contentClassName="max-w-3xl"
    >
      <div className="space-y-3">
          {faqs.map((item, i) => (
            <GlassCard key={i} glow="blue" intensity="low" className="p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left p-5 flex justify-between items-start gap-4"
              >
                <span className="font-medium text-white/90">{item.q}</span>
                <span className="text-[#00D4FF] text-xl shrink-0">{open === i ? '−' : '+'}</span>
              </button>
              {open === i && <div className="px-5 pb-5 text-white/60 text-sm leading-relaxed border-t border-white/5 pt-3">{item.a}</div>}
            </GlassCard>
          ))}
      </div>
    </PublicPageFrame>
  );
}
