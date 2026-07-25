import { type ReactNode } from "react";
import { Link } from "wouter";
import RoomStateBadge from "@/components/RoomStateBadge";
import { cn } from "@/lib/utils";

interface RoomHeaderBarProps {
  roomSlug: string;
  diName?: string;
  diReady?: boolean;
  onDiToggle?: () => void;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

/**
 * RoomHeaderBar — the consistent header shell for GestaltView room pages.
 * Provides back-nav, dev-only room-state badge, an optional action slot, and
 * an optional DI presence toggle. Visual-only; owns no page logic.
 */
export function RoomHeaderBar({
  roomSlug,
  diName,
  diReady,
  onDiToggle,
  actions,
  backHref = "/",
  backLabel = "— Home",
  className,
}: RoomHeaderBarProps) {
  return (
    <header className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={backHref}>
          <a className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-gv-text-secondary transition-colors hover:border-sky-500/30 hover:text-gv-text-primary">
            {backLabel}
          </a>
        </Link>
        <RoomStateBadge slug={roomSlug} />
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {diName && onDiToggle && (
          <button
            type="button"
            onClick={onDiToggle}
            className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 transition-colors hover:bg-purple-500/20"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-purple-400"
              style={{ animation: diReady ? "pulse 2s infinite" : "none" }}
            />
            {diName}
          </button>
        )}
      </div>
    </header>
  );
}

export default RoomHeaderBar;
