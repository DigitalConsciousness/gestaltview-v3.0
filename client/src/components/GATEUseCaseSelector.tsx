import { gateUseCases } from "@config/gateUseCases";
import { cn } from "@/lib/utils";

interface GATEUseCaseSelectorProps {
  value: string;
  onSelect: (slug: string) => void;
}

export default function GATEUseCaseSelector({
  value,
  onSelect,
}: GATEUseCaseSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {gateUseCases.map((useCase) => {
        const isActive = useCase.slug === value;

        return (
          <button
            key={useCase.slug}
            type="button"
            onClick={() => onSelect(useCase.slug)}
            className={cn(
              "rounded-[28px] border px-5 py-5 text-left transition-[border-color,background-color,box-shadow] duration-150",
              isActive
                ? "border-[rgba(255,60,172,0.3)] bg-[rgba(255,60,172,0.08)] shadow-[0_0_40px_rgba(255,60,172,0.08)]"
                : "border-[rgba(120,214,255,0.16)] bg-[rgba(8,12,18,0.75)] hover:border-[rgba(120,214,255,0.3)] hover:bg-[rgba(18,214,255,0.05)]"
            )}
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
              {useCase.recommendedTier.replace(/_/g, " ")}
            </p>
            <h3 className="mt-3 font-display text-xl font-bold uppercase tracking-[0.05em] text-white">
              {useCase.label}
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {useCase.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {useCase.defaultSurfaces.map((surface) => (
                <span
                  key={surface}
                  className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-300"
                >
                  {surface}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
