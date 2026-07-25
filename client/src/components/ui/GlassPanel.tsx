import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type GlassPanelVariant =
  | "default"
  | "sky"
  | "purple"
  | "emerald"
  | "amber"
  | "void";

const variantStyles: Record<GlassPanelVariant, string> = {
  default: "border-white/10 bg-white/[0.03] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
  sky: "border-sky-500/20 bg-sky-500/[0.04] shadow-[0_0_20px_rgba(14,165,233,0.08)]",
  purple: "border-purple-500/20 bg-purple-500/[0.04] shadow-[0_0_20px_rgba(168,85,247,0.08)]",
  emerald: "border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.08)]",
  amber: "border-amber-500/20 bg-amber-500/[0.04] shadow-[0_0_20px_rgba(251,191,36,0.08)]",
  void: "border-white/5 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
};

interface GlassPanelProps {
  children: ReactNode;
  variant?: GlassPanelVariant;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

/**
 * GlassPanel — the shared glassmorphic surface for GestaltView room pages.
 * Additive to the existing GlassCard; use this for section-level containers
 * where a variant-tinted, optionally-glowing panel is desired.
 */
export function GlassPanel({
  children,
  variant = "default",
  className,
  hover = false,
  glow = false,
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border backdrop-blur-sm transition-all duration-300",
        variantStyles[variant],
        hover && "hover:border-white/20 hover:bg-white/[0.05]",
        glow &&
          variant !== "default" &&
          variant !== "void" &&
          "hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default GlassPanel;
