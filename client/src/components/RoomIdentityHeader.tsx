import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

type RoomIdentityHeaderProps = {
  roomName: string;
  purpose: string;
  diName?: string;
  diArchetype?: string;
  diColor?: string;
  status?: string;
  onClick?: () => void;
  className?: string;
};

export function RoomIdentityHeader({
  roomName,
  purpose,
  diName = "Billy",
  diArchetype,
  diColor,
  status,
  onClick,
  className,
}: RoomIdentityHeaderProps) {
  const accentColor = diColor ? `var(${diColor})` : "var(--gv-aurora-cyan)";

  const containerClassName = cn(
    "flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md",
    onClick ? "w-full text-left transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20" : "",
    className,
  );

  const content = (
    <>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-white/52">
            {roomName}
          </p>
          {status ? (
            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-white/46">
              {status}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-tight text-white/66">{purpose}</p>
      </div>

      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/54">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full border"
          style={{
            borderColor: accentColor,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
          }}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" style={{ color: accentColor }} />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-white/88">{diName}</span>
          {diArchetype ? (
            <span className="block text-[10px] uppercase tracking-[0.16em] text-white/42">
              {diArchetype}
            </span>
          ) : null}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.7)]" />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={containerClassName}>
        {content}
      </button>
    );
  }

  return (
    <div className={containerClassName}>{content}</div>
  );
}

export default RoomIdentityHeader;
