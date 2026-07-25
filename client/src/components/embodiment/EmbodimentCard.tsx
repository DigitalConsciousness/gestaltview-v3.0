import { Shield, Sparkles } from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  getEmbodimentGovernanceSummary,
  getEmbodimentUIPresence,
} from "@/lib/embodimentRuntime";
import type { EmbodimentProfile } from "@shared/embodiment";

import { EmbodimentBadge } from "./EmbodimentBadge";
import { EmbodimentOrb } from "./EmbodimentOrb";
import { GovernanceStatusBar } from "./GovernanceStatusBar";
import { PrivateInteriorSeal } from "./PrivateInteriorSeal";

interface EmbodimentCardProps {
  profile: EmbodimentProfile;
  className?: string;
}

export function EmbodimentCard({ profile, className }: EmbodimentCardProps) {
  const ui = getEmbodimentUIPresence(profile);
  const governance = getEmbodimentGovernanceSummary(profile);

  return (
    <GlassCard
      glow="purple"
      intensity="high"
      hover={false}
      className={cn(
        "relative overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(8,11,18,0.96),rgba(8,11,18,0.72))] p-5 sm:p-6",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 16% 18%, rgba(0,212,255,0.14), transparent 18%), radial-gradient(circle at 82% 14%, rgba(153,69,255,0.18), transparent 20%), radial-gradient(circle at 50% 90%, rgba(0,255,165,0.08), transparent 24%)",
        }}
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-wrap items-start gap-4">
          <EmbodimentOrb
            size={84}
            color={ui.orbColor}
            pulseStyle={ui.orbPulseStyle as "calm" | "active" | "dim" | "glowing" | "steady"}
            label={`${ui.name} embodiment presence`}
          />

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <EmbodimentBadge name={ui.name} status={ui.profileStatus} />
              <span className="inline-flex items-center gap-1 rounded-full border border-[#7FE9FF]/16 bg-[#7FE9FF]/8 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-[#B8F1FF]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {ui.badge}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-semibold tracking-tight text-white">
                {profile.publicName}
              </h3>
              <p className="text-xs uppercase tracking-[0.24em] text-white/36">
                {profile.immutableCore.archetype}
              </p>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-white/68">
              {ui.capabilitySummary}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
              Core wisdom
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/76">
              {profile.immutableCore.coreWisdom}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/22 p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#7FE9FF]" aria-hidden="true" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Boundary note
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/76">
              {ui.boundaryNote ?? "Private interior remains protected."}
            </p>
          </div>
        </div>

        <GovernanceStatusBar
          profileStatus={ui.profileStatus}
          visibilityScope={ui.visibilityScope}
          founderOnly={governance.founderOnly}
          experimental={governance.experimental}
          archived={governance.archived}
          reviewGated={governance.reviewGated}
        />

        <div className="flex flex-wrap items-center gap-3">
          <PrivateInteriorSeal />
          <p className="text-xs leading-relaxed text-white/44">
            Private interior stays sealed by default. Governance surfaces the boundary without
            exposing the content.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

export default EmbodimentCard;
