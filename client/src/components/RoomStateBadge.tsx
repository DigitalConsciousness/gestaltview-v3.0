import { getRoomState } from "@/lib/roomState";

type RoomStateBadgeProps = {
  slug: string;
  className?: string;
};

export default function RoomStateBadge({ slug, className }: RoomStateBadgeProps) {
  if (import.meta.env.PROD) {
    return null;
  }

  const state = getRoomState(slug);

  if (!state) {
    return null;
  }

  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-white/52",
        className ?? "",
      ].join(" ")}
      title={state.notes}
    >
      <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[9px] tracking-[0.18em] text-white/70">
        {state.stability}
      </span>
      <span>{state.label}</span>
    </div>
  );
}
