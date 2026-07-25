import { ArrowRight, Sparkles } from "lucide-react";
import BillyAvatar from "@/components/BillyAvatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  BILLY_DEFAULT_TOUR_STEPS,
  BILLY_NEW_YEAR_TOUR_STEPS,
} from "@/lib/billy-runtime-guide";

type BillyWalkthroughMode = "default" | "new-year";

type BillyWalkthroughProps = {
  className?: string;
  mode?: BillyWalkthroughMode;
  title?: string;
  subtitle?: string;
  steps?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  compact?: boolean;
};

export default function BillyWalkthrough({
  className,
  mode = "default",
  title,
  subtitle,
  steps,
  ctaLabel = "Open Billy Live",
  ctaHref = "/billy",
  compact = false,
}: BillyWalkthroughProps) {
  const resolvedTitle =
    title ?? (mode === "new-year" ? "Billy New Year walkthrough" : "Billy onboarding walkthrough");
  const resolvedSubtitle =
    subtitle ??
    (mode === "new-year"
      ? "A quick tour for the curious, the returning, or anyone starting the year with a clean capture ritual."
      : "A short optional tour for new users and curious visitors who want the platform shape before they explore.");
  const resolvedSteps = steps ?? (mode === "new-year" ? BILLY_NEW_YEAR_TOUR_STEPS : BILLY_DEFAULT_TOUR_STEPS);

  return (
    <GlassCard
      glow="none"
      intensity="medium"
      hover={false}
      className={cn("border-white/12 bg-white/[0.05] p-5 sm:p-6", className)}
    >
      <div className={compact ? "grid gap-4" : "grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-start"}>
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-amber-200/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-amber-50/80">
            <Sparkles className="h-3.5 w-3.5" />
            Optional tour
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white">{resolvedTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/62">{resolvedSubtitle}</p>
          </div>

          <div className="flex items-center gap-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
            <BillyAvatar size="md" glow animate className="shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Billy stays embodied in the room, not reduced to a node.</p>
              <p className="mt-1 text-sm leading-relaxed text-white/58">
                He helps check capture integrity and platform orientation, but he does not become a scaffold node, artifact, or hidden organizer.
              </p>
            </div>
          </div>

          {ctaHref ? (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/18 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition-colors hover:bg-cyan-300/16"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4 sm:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">Walkthrough</p>
          <div className="mt-4 grid gap-3">
            {resolvedSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-[1rem] border border-white/8 bg-white/[0.03] p-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[10px] text-white/62">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-white/62">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
