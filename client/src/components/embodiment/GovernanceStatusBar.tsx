import { cn } from "@/lib/utils";

interface GovernanceStatusBarProps {
  profileStatus: string;
  visibilityScope: string;
  founderOnly: boolean;
  experimental: boolean;
  archived: boolean;
  reviewGated?: boolean;
  className?: string;
}

const stepLabels = [
  { key: "active", label: "active" },
  { key: "draft", label: "draft" },
  { key: "founder-only", label: "founder-only" },
  { key: "experimental", label: "experimental" },
  { key: "archived", label: "archived" },
] as const;

export function GovernanceStatusBar({
  profileStatus,
  visibilityScope,
  founderOnly,
  experimental,
  archived,
  reviewGated = false,
  className,
}: GovernanceStatusBarProps) {
  const activeKey = archived
    ? "archived"
    : experimental
      ? "experimental"
      : founderOnly || visibilityScope === "founder-only"
        ? "founder-only"
        : profileStatus === "draft"
          ? "draft"
          : "active";

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-md",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {stepLabels.map((step) => {
          const isActive = step.key === activeKey;
          return (
            <span
              key={step.key}
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] transition-colors",
                isActive
                  ? "border-[#7FE9FF]/35 bg-[#7FE9FF]/12 text-white"
                  : "border-white/10 bg-black/20 text-white/42"
              )}
            >
              <span
                className={cn(
                  "mr-1.5 h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-[#7FE9FF]" : "bg-white/20"
                )}
              />
              {step.label}
            </span>
          );
        })}
        {reviewGated ? (
          <span className="ml-auto text-[10px] uppercase tracking-[0.22em] text-amber-300/90">
            Review gated
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default GovernanceStatusBar;
