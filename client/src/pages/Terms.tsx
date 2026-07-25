import { useSEO } from "@/hooks/useSEO";
import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PublicPageFrame } from "@/components/PublicPageFrame";

const sections = [
  { title: 'Acceptance of Terms', content: 'By using the runtime, you agree to these terms. If not, stop using it.' },
  { title: 'Use of the Platform', content: 'Use it without trying to break it, scrape it, or point it at harm.' },
  { title: 'Intellectual Property', content: 'The runtime, its frameworks, and the supporting language are proprietary unless otherwise stated.' },
  { title: 'AI Outputs', content: 'Generated output can be useful and still wrong. Verify before acting on it.' },
  { title: 'Consulting Services', content: 'Any consulting work is governed by a separate agreement and scope.' },
  { title: 'Limitation of Liability', content: 'Use of the platform is at your own risk, within the limits of applicable law.' },
  { title: 'Changes to Terms', content: 'These terms may change. Continued use means you accepted the new version.' },
];

export default function Terms() {
  useSEO({
    title: 'Terms of Service — GestaltView',
    description: 'GestaltView terms of service: the basics for using the runtime and related services.',
    h1: 'Terms of Service',
    canonical: 'https://gestaltview-di-gsvw.vercel.app/terms',
  });
  return (
    <PublicPageFrame
      roomName="Terms"
      purpose="A plain-English version of the rules."
      status="public"
      title="Terms of Service, minus the fog machine."
      intro="These are the rules of use for the runtime and its related surfaces."
      secondaryAction={{ href: "/contact", label: "Contact" }}
      contentClassName="max-w-3xl"
    >
      <div className="space-y-6">
          {sections.map(s => (
            <GlassCard key={s.title} glow="teal" intensity="low" className="p-6">
              <h2 className="font-bold text-[#00E5FF] mb-2">{s.title}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{s.content}</p>
            </GlassCard>
          ))}
      </div>
    </PublicPageFrame>
  );
}
