import { ChevronLeft, PanelLeftClose, PanelLeftOpen, Send } from "lucide-react";
import { TRIBUNAL_STANCE_OPTIONS, type TribunalParticipantSummary, type TribunalStance } from "@shared/roundtable/types";
import type { TrainerEmbodimentSlug } from "@shared/agent-trainer/embodiment";

export interface VoiceSidebarProps {
  open: boolean;
  collapsed: boolean;
  participants: TribunalParticipantSummary[];
  selectedSlugs: Set<TrainerEmbodimentSlug>;
  moods: Record<string, string>;
  responseCounts: Record<string, number>;
  stances: Record<string, TribunalStance>;
  onToggleOpen: () => void;
  onToggleCollapsed: () => void;
  onSelectParticipant: (slug: TrainerEmbodimentSlug) => void;
  onAddressParticipant: (slug: TrainerEmbodimentSlug) => void;
  onStanceChange: (slug: TrainerEmbodimentSlug, stance: TribunalStance) => void;
}

export default function VoiceSidebar({
  open,
  collapsed,
  participants,
  selectedSlugs,
  moods,
  responseCounts,
  stances,
  onToggleOpen,
  onToggleCollapsed,
  onSelectParticipant,
  onAddressParticipant,
  onStanceChange,
}: VoiceSidebarProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleOpen}
        className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-black/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_24px_rgba(0,212,255,0.16)] md:hidden"
      >
        VOICES
      </button>

      <aside
        className={[
          "relative z-20 flex flex-col border-r border-cyan-300/10 bg-black/50 backdrop-blur-md",
          "transition-all duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[72px]" : "md:w-[280px]",
          "fixed inset-y-[64px] left-0 w-[88vw] max-w-[320px] md:static md:inset-auto",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-200/70">Voice Sidebar</p>
            <p className="mt-1 text-xs text-white/45">Address a voice or change its lens.</p>
          </div>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors hover:border-cyan-200/25 hover:text-cyan-100"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-3">
          {participants.map((participant) => {
            const active = selectedSlugs.has(participant.slug);
            const mood = moods[participant.slug] ?? "idle";
            const stance = stances[participant.slug] ?? "custom";

            return (
              <section
                key={participant.slug}
                className={[
                  "rounded-2xl border p-3 transition-all",
                  active ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.03]",
                ].join(" ")}
                style={{ boxShadow: active ? `0 0 28px ${participant.color}18` : undefined }}
              >
                <button
                  type="button"
                  onClick={() => onSelectParticipant(participant.slug)}
                  className="flex w-full items-start gap-3 text-left"
                >
                  <div
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-full border"
                    style={{
                      borderColor: participant.color,
                      background: mood === "speaking" ? participant.color : `${participant.color}22`,
                      boxShadow: `0 0 14px ${participant.color}22`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-mono text-[11px] uppercase tracking-[0.18em] text-white/90">
                        {participant.label}
                      </p>
                      <span className="rounded-full border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em] text-white/45">
                        {mood}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/45">
                      {responseCounts[participant.slug] ?? 0} responses
                    </p>
                  </div>
                </button>

                {!collapsed ? (
                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => onAddressParticipant(participant.slug)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-100/6 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/85 transition-colors hover:border-cyan-200/25 hover:bg-cyan-100/10"
                    >
                      <Send className="size-3.5" />
                      Address this DI
                    </button>

                    <label className="block">
                      <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">
                        Stance
                      </span>
                      <select
                        value={stance}
                        onChange={(event) => onStanceChange(participant.slug, event.target.value as TribunalStance)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-2.5 py-2 text-xs text-white/80 outline-none transition-colors focus:border-cyan-200/30"
                      >
                        {TRIBUNAL_STANCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <div className="border-t border-white/10 px-3 py-3">
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 transition-colors hover:border-cyan-200/25 hover:text-cyan-100 md:hidden"
          >
            <ChevronLeft className="size-3.5" />
            Close Voices
          </button>
          <p className="mt-2 text-[10px] leading-5 text-white/35">
            The tribunal can respond in any lane. Mentions such as @Billy will trigger follow-up turns.
          </p>
        </div>
      </aside>
    </>
  );
}
