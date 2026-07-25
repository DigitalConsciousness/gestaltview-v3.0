import { useSEO } from "@/hooks/useSEO";
import React from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PublicPageFrame } from "@/components/PublicPageFrame";

const sections = [
  { title: 'What We Collect', content: 'Only what you voluntarily put into the runtime, plus the metadata required to keep it retrievable.' },
  { title: 'How We Use It', content: 'To keep the rooms coherent, the files available, and the responses grounded in what you actually shared.' },
  { title: 'No-Extraction Pledge', content: 'Your inner material is not treated like ad inventory. It is handled as yours.' },
  { title: 'Data Retention', content: 'You can delete or request removal of your stored data through the normal support path.' },
  { title: 'Third-Party Services', content: 'Some infrastructure lives with providers such as Vercel and Supabase. We keep exposure minimal where those systems are used.' },
  { title: 'Contact', content: 'For privacy questions, use the contact page.' },
];

export default function PrivacyPage() {
  useSEO({
    title: 'Privacy Policy — GestaltView',
    description: 'GestaltView privacy policy: what is collected, how it is used, and how to get support or removal.',
    h1: 'Privacy Policy',
    canonical: 'https://gestaltview-di-gsvw.vercel.app/privacy',
  });
  return (
    <PublicPageFrame
      roomName="Privacy"
      purpose="What we keep, why we keep it, and how you can ask for it to be removed."
      status="public"
      title="Privacy, without the costume jewelry."
      intro="This page is the plain version."
      secondaryAction={{ href: "/contact", label: "Contact" }}
      contentClassName="max-w-3xl"
    >
      <div className="space-y-6">
          {sections.map(s => (
            <GlassCard key={s.title} glow="cyan" intensity="low" className="p-6">
              <h2 className="font-bold text-[#00FFD4] mb-2">{s.title}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{s.content}</p>
            </GlassCard>
          ))}
      </div>
    </PublicPageFrame>
  );
}
