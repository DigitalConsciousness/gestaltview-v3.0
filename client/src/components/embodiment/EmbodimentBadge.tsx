import { cn } from "@/lib/utils";

interface EmbodimentBadgeProps {
  name: string;
  status?: string;
  className?: string;
}

const statusTone: Record<string, string> = {
  active: "bg-emerald-400",
  draft: "bg-slate-400",
  "founder-only": "bg-amber-400",
  experimental: "bg-cyan-400",
  archived: "bg-rose-400",
};

export function EmbodimentBadge({
  name,
  status = "active",
  className,
}: EmbodimentBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs text-white/84 backdrop-blur-md",
        className
      )}
    >
      <span
        className={cn("h-2 w-2 rounded-full", statusTone[status] ?? statusTone.active)}
      />
      <span className="font-medium tracking-[0.02em]">{name}</span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/44">
        {status}
      </span>
    </span>
  );
}

export default EmbodimentBadge;
