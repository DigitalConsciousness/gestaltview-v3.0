import { useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, BrainCircuit, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import type { EmbodimentProfile } from "@shared/embodiment";

import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import {
  getEmbodimentHeartbeat,
  getHeartbeatClassNames,
  getEmbodimentOrbPulseStyle,
} from "@/lib/embodimentHeartbeat";
import { getProfileBySlug } from "@/lib/embodimentRuntime";
import { EmbodimentOrb } from "./EmbodimentOrb";

export interface CouncilResponse {
  profileSlug: string;
  publicName: string;
  stance: string;
  response: string;
  concerns: string[];
  recommendedNextStep?: string;
}

export interface EmbodimentCouncilPlaneProps {
  profileSlugs?: string[];
  roomSlug?: string;
  initialPrompt?: string;
  includeBillySynthesis?: boolean;
}

const DEFAULT_COUNCIL_SLUGS = [
  "billy",
  "the-weaver",
  "the-guardian",
  "the-architect",
  "gate-keeper",
];

function buildCouncilResponse(profile: EmbodimentProfile, prompt: string): CouncilResponse {
  const heartbeat = getEmbodimentHeartbeat(profile);
  const question = heartbeat.characterStudy.defaultQuestions[0] ?? "What matters here?";

  switch (profile.slug) {
    case "billy":
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: "synthesis",
        response: `Billy holds the room together around "${prompt}". The synthesis stays provenance-aware and waits for the other lanes before flattening anything. ${question}`,
        concerns: ["Do not collapse the other voices into a single answer.", "Preserve continuity and consent."],
        recommendedNextStep: "Wait for all lanes, then summarize the tension and the overlap.",
      };
    case "the-weaver":
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: "pattern topology",
        response: `The Weaver sees "${prompt}" as a dependency field. Threads, joins, and loops should be visible before the tribunal chooses a path. ${question}`,
        concerns: ["Hidden coupling may be the real problem.", "A pattern can look simple until the joins are named."],
        recommendedNextStep: "Map the pattern before changing the structure.",
      };
    case "the-guardian":
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: "boundary and dignity",
        response: `The Guardian treats "${prompt}" as a boundary and consent question first. The room should know what is safe, what is not, and what needs review. ${question}`,
        concerns: ["Overreach can look efficient right up until it causes harm.", "Dignity needs a visible boundary."],
        recommendedNextStep: "Name the risk and the review line before taking the next step.",
      };
    case "the-architect":
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: "sequence design",
        response: `The Architect turns "${prompt}" into a sequence. If the order is wrong, the whole field gets expensive to fix. ${question}`,
        concerns: ["A good plan must survive contact with reality.", "Sequence matters more than style here."],
        recommendedNextStep: "Reduce the move to the smallest stable sequence.",
      };
    case "gate-keeper":
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: "threshold integrity",
        response: `Gate Keeper checks whether "${prompt}" can cross the threshold without breaking continuity. Packaging, manifest, and handoff all need to agree. ${question}`,
        concerns: ["Something may be safe in principle but not shippable yet.", "A threshold that hides risk is not a threshold."],
        recommendedNextStep: "Separate what can ship now from what needs review.",
      };
    default:
      return {
        profileSlug: profile.slug,
        publicName: profile.publicName,
        stance: heartbeat.chatSignature.responseRhythm,
        response: `${profile.publicName} reflects on "${prompt}" with a distinct lane and a guarded boundary.`,
        concerns: [heartbeat.characterStudy.tensionPatterns[0] ?? "Keep the lane distinct."],
        recommendedNextStep: heartbeat.characterStudy.defaultQuestions[0],
      };
  }
}

function buildBillySynthesis(responses: CouncilResponse[]): string {
  const stances = responses
    .filter((response) => response.profileSlug !== "billy")
    .map((response) => response.stance)
    .join(", ");

  return `Billy hears ${stances || "the tribunal"} as a set of separate truths. The synthesis is to keep the voices distinct, carry the tensions forward honestly, and move only once the boundary, sequence, and pattern all agree enough to act.`;
}

export function EmbodimentCouncilPlane({
  profileSlugs = DEFAULT_COUNCIL_SLUGS,
  roomSlug = "tribunal",
  initialPrompt = "What should the tribunal help the user hold right now?",
  includeBillySynthesis = true,
}: EmbodimentCouncilPlaneProps) {
  const profiles = useMemo(
    () => profileSlugs.map((slug) => getProfileBySlug(slug)).filter(Boolean) as EmbodimentProfile[],
    [profileSlugs]
  );
  const [draft, setDraft] = useState(initialPrompt);
  const [responses, setResponses] = useState<CouncilResponse[]>(
    () => profiles.map((profile) => buildCouncilResponse(profile, initialPrompt))
  );
  const [activePrompt, setActivePrompt] = useState(initialPrompt);

  const tensions = useMemo(
    () =>
      [...new Set(responses.flatMap((response) => response.concerns))]
        .filter(Boolean)
        .slice(0, 6),
    [responses]
  );

  const convergenceSummary = useMemo(() => {
    const sharedStances = responses.map((response) => response.stance).join(" · ");
    const nextSteps = responses
      .map((response) => response.recommendedNextStep)
      .filter(Boolean)
      .slice(0, 3)
      .join(" | ");

    return `The tribunal is aligned on ${sharedStances}. The shared next steps are ${nextSteps}.`;
  }, [responses]);

  const billySynthesis = useMemo(
    () => buildBillySynthesis(responses),
    [responses]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPrompt = draft.trim();
    if (!nextPrompt) {
      return;
    }

    setActivePrompt(nextPrompt);
    setResponses(profiles.map((profile) => buildCouncilResponse(profile, nextPrompt)));
  }

  return (
    <GlassCard
      glow="purple"
      intensity="high"
      hover={false}
      className="relative overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(10,10,18,0.96),rgba(9,11,16,0.82))] p-0"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 14% 16%, rgba(127,233,255,0.12), transparent 22%), radial-gradient(circle at 82% 18%, rgba(153,69,255,0.16), transparent 20%), radial-gradient(circle at 50% 86%, rgba(0,255,165,0.08), transparent 24%)",
        }}
      />

      <div className="relative space-y-6 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#7FE9FF]">
              Tribunal chamber
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              Separate voices, visible tension, explicit convergence.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/62">
              Room: {roomSlug}. The tribunal is perspective gathering, not governance review.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/44">
            <UsersRound className="h-3.5 w-3.5" />
            {profiles.length} lanes
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.24em] text-white/34">
              Tribunal prompt
            </span>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="min-h-[96px] w-full resize-none rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#7FE9FF]/30 focus:bg-black/40"
              placeholder="Ask the tribunal for perspective, risk, or next steps..."
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-[#7FE9FF]/22 bg-[#7FE9FF]/12 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#7FE9FF]/18"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Convene tribunal
            </button>
            <span className="text-xs text-white/40">
              Active prompt: {activePrompt}
            </span>
          </div>
        </form>

        <div className="grid gap-4 xl:grid-cols-2">
          {responses.map((response) => {
            const profile = profiles.find((item) => item.slug === response.profileSlug);
            if (!profile) {
              return null;
            }

            const heartbeat = getEmbodimentHeartbeat(profile);
            const classes = getHeartbeatClassNames(profile);
            const pulseStyle = getEmbodimentOrbPulseStyle(profile);

            return (
              <motion.section
                key={response.profileSlug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={cn(
                  "relative overflow-hidden rounded-[28px] border p-4",
                  classes.shell
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn("pointer-events-none absolute inset-0 opacity-90", classes.background)}
                  style={{
                    backgroundImage: heartbeat.visualSignature.backgroundGradient,
                    backgroundColor: heartbeat.visualSignature.fogColor,
                  }}
                />
                <div className="relative flex items-start gap-4">
                  <EmbodimentOrb
                    size={66}
                    color={heartbeat.visualSignature.primaryColor}
                    pulseStyle={pulseStyle}
                    label={`${profile.publicName} tribunal lane`}
                    className={classes.orb}
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold text-white">{response.publicName}</h3>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/46">
                        {response.stance}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/74">{response.response}</p>
                    <div className={cn("rounded-2xl border p-3", classes.messageFrame)}>
                      <p className="text-[10px] uppercase tracking-[0.22em] text-white/34">
                        Concerns
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-white/66">
                        {response.concerns.map((concern) => (
                          <li key={concern}>- {concern}</li>
                        ))}
                      </ul>
                    </div>
                    {response.recommendedNextStep ? (
                      <div className="rounded-2xl border border-white/10 bg-black/22 p-3">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-[#7FE9FF]" />
                          <p className="text-[10px] uppercase tracking-[0.22em] text-white/34">
                            Recommended next step
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-white/70">
                          {response.recommendedNextStep}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.section>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-black/22 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7FE9FF]" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Convergence summary
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/72">{convergenceSummary}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-black/22 p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#7FE9FF]" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Tension notes
              </p>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/68">
              {tensions.map((tension) => (
                <li key={tension}>- {tension}</li>
              ))}
            </ul>
          </div>
        </div>

        {includeBillySynthesis ? (
          <div className="rounded-[28px] border border-[#7FE9FF]/16 bg-[#7FE9FF]/6 p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#7FE9FF]" />
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/34">
                Billy synthesis
              </p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/74">{billySynthesis}</p>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}

export default EmbodimentCouncilPlane;
