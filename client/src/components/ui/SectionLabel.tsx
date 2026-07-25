import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionLabelVariant = "sky" | "purple" | "emerald" | "amber" | "neutral";

const colors: Record<SectionLabelVariant, string> = {
  sky: "text-sky-400",
  purple: "text-purple-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
  neutral: "text-gv-text-secondary",
};

interface SectionLabelProps {
  children: ReactNode;
  variant?: SectionLabelVariant;
  className?: string;
}

/**
 * SectionLabel — the small uppercase eyebrow heading used above room sections.
 */
export function SectionLabel({ children, variant = "sky", className }: SectionLabelProps) {
  return (
    <h2
      className={cn(
        "mb-3 text-xs font-semibold uppercase tracking-widest",
        colors[variant],
        className,
      )}
    >
      {children}
    </h2>
  );
}

export default SectionLabel;
