import { Mail, MessageCircleMore, Sparkles } from "lucide-react";

import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import { GlassCard } from "@/components/ui/GlassCard";
import { PublicPageFrame } from "@/components/PublicPageFrame";

export default function ContactPage() {
  useSEO(PAGE_SEO.contact);

  return (
    <PublicPageFrame
      roomName="Contact Us"
      purpose="For consulting, partnerships, or product questions. Keep it plain; Billy can handle the weird part."
      status="public"
      title="Reach the founder without the ceremonial smoke machine."
      intro="If you need a reply about a build, a collaboration, or a question the site did not answer, use the direct line below. Keep the message short and specific."
      secondaryAction={{ href: "/privacy", label: "Privacy" }}
      contentClassName="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:keithsoyka@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-cyan-300/16"
          >
            <Mail className="h-4 w-4" />
            keithsoyka@gmail.com
          </a>
          <a
            href="https://calendly.com/keithsoyka/30min"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/80 transition-colors hover:text-white"
          >
            <MessageCircleMore className="h-4 w-4" />
            Book a call
          </a>
        </div>
      </div>

      <div className="grid gap-4">
        <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-6" hover={false}>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyan-200" />
            <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/52">
              What to send
            </p>
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/66">
            <li>What you want to build, fix, or explore.</li>
            <li>Whether this is for you, a team, or a client.</li>
            <li>Any deadline, budget, or scope constraints.</li>
          </ul>
        </GlassCard>

        <GlassCard glow="none" intensity="medium" className="border-white/12 bg-white/[0.05] p-6" hover={false}>
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/52">
            Privacy note
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/66">
            Messages here are used only for responding to your inquiry. No extra tracking, no performance theater, no hidden funnel.
          </p>
        </GlassCard>
      </div>
    </PublicPageFrame>
  );
}
