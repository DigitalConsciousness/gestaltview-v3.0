import type { TribunalParticipantSummary } from "@shared/roundtable/types";

export interface MentionAutocompleteProps {
  query: string;
  participants: TribunalParticipantSummary[];
  onPick: (participant: TribunalParticipantSummary) => void;
}

export default function MentionAutocomplete({
  query,
  participants,
  onPick,
}: MentionAutocompleteProps) {
  const normalized = query.trim().replace(/^@/, "").toLowerCase();
  const options = participants.filter((participant) => {
    const haystack = `${participant.label} ${participant.slug}`.toLowerCase();
    return !normalized || haystack.includes(normalized);
  });

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-2xl border border-cyan-300/15 bg-black/95 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
      <div className="border-b border-white/10 px-3 py-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-100/55">Mention Autocomplete</p>
      </div>
      <div className="max-h-56 overflow-y-auto p-2">
        {options.slice(0, 8).map((participant) => (
          <button
            key={participant.slug}
            type="button"
            onClick={() => onPick(participant)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors hover:bg-cyan-300/10"
          >
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/90">
                @{participant.label}
              </p>
              <p className="mt-0.5 text-xs text-white/45">{participant.slug}</p>
            </div>
            <span className="text-xs text-cyan-100/55">Insert</span>
          </button>
        ))}
      </div>
    </div>
  );
}

