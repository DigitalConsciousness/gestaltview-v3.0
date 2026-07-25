import {
  TRAINER_EMBODIMENT_OPTIONS,
  type TrainerEmbodimentSlug,
} from "@shared/agent-trainer/embodiment";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EmbodimentSelectorProps {
  value: TrainerEmbodimentSlug;
  onValueChange: (value: TrainerEmbodimentSlug) => void;
  label?: string;
  showDetails?: boolean;
  className?: string;
  triggerClassName?: string;
  detailsClassName?: string;
  labelClassName?: string;
}

export default function EmbodimentSelector({
  value,
  onValueChange,
  label = "Embodiment",
  showDetails = true,
  className,
  triggerClassName,
  detailsClassName,
  labelClassName,
}: EmbodimentSelectorProps) {
  const selectedEmbodiment =
    TRAINER_EMBODIMENT_OPTIONS.find((option) => option.slug === value) ??
    TRAINER_EMBODIMENT_OPTIONS[0];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <p
          className={cn(
            "text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400",
            labelClassName
          )}
        >
          {label}
        </p>
        <Select
          value={value}
          onValueChange={(next) => onValueChange(next as TrainerEmbodimentSlug)}
        >
          <SelectTrigger
            className={cn(
              "w-full border-white/10 bg-white/[0.04] text-left text-sm text-white",
              triggerClassName
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[rgba(8,13,26,0.98)] text-white">
            {TRAINER_EMBODIMENT_OPTIONS.map((option) => (
              <SelectItem
                key={option.slug}
                value={option.slug}
                className="focus:bg-white/[0.08] focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showDetails ? (
        <div
          className={cn(
            "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2",
            detailsClassName
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {selectedEmbodiment.label}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
              {selectedEmbodiment.archetype}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-300">
            {selectedEmbodiment.summary}
          </p>
        </div>
      ) : null}
    </div>
  );
}
