import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { Link } from "wouter";
import type { CaptureBlueprint } from "./Scaffold";

type BlueprintLibraryProps = {
  blueprints: CaptureBlueprint[];
  selectedId?: string | null;
  onSelect: (blueprint: CaptureBlueprint) => void;
  onDelete?: (blueprint: CaptureBlueprint) => void;
};

function previewFromBlueprint(blueprint: CaptureBlueprint): string {
  return (
    blueprint.summary ||
    blueprint.outputs.markdown.split(/\r?\n/).find((line) => line.trim().length > 0) ||
    "No preview yet."
  );
}

export default function BlueprintLibrary({ blueprints, selectedId, onSelect, onDelete }: BlueprintLibraryProps) {
  if (blueprints.length === 0) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
        <div className="rounded-[1.5rem] border border-gv-aurora-amber/20 bg-gv-aurora-amber/10 p-5">
          <p className="max-w-2xl text-sm leading-6 text-gv-text-secondary">
            Bring me whatever you have. A photo, a thought, a list, three words. We&apos;ll figure out what to make.
          </p>
          <div className="mt-4">
            <Link href="/blackboard-room">
              <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:border-white/20 hover:bg-white/[0.08]">
                Go to Blackboard Room
                <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-end gap-3">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-gv-text-muted">
          {blueprints.length} items
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {blueprints.map((blueprint) => {
          const active = blueprint.id === selectedId;
          return (
            <article
              key={blueprint.id}
              className={`rounded-[1.35rem] border p-4 text-left transition-colors ${
                active
                  ? "border-gv-aurora-cyan/30 bg-gv-bg-deep/90"
                  : "border-white/10 bg-gv-bg-deep/70 hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gv-text-primary">{blueprint.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gv-text-muted">{blueprint.status}</p>
                </div>
                <FileText className="mt-0.5 h-4 w-4 text-gv-aurora-cyan" />
              </div>

              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gv-text-secondary">{previewFromBlueprint(blueprint)}</p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-xs text-gv-text-muted">
                  {new Date(blueprint.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect(blueprint)}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-gv-text-primary transition-colors hover:border-gv-aurora-cyan/30 hover:bg-gv-aurora-cyan/10"
                  >
                    Open
                  </button>
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(blueprint)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-300/20 bg-rose-300/10 text-rose-100 transition-colors hover:bg-rose-300/16"
                      aria-label={`Delete ${blueprint.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
