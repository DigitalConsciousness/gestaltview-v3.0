import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

interface PrivateInteriorSealProps {
  className?: string;
  label?: string;
}

export function PrivateInteriorSeal({
  className,
  label = "Private interior protected",
}: PrivateInteriorSealProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-white/72 backdrop-blur-md",
        className
      )}
      aria-label={label}
    >
      <ShieldAlert className="h-3.5 w-3.5 text-[#7FE9FF]" aria-hidden="true" />
      <span className="font-mono uppercase tracking-[0.18em] text-white/48">
        Protected
      </span>
      <span className="font-medium text-white/82">{label}</span>
    </div>
  );
}

export default PrivateInteriorSeal;
