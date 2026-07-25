import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HtmlArtifactRenderer } from "@/lib/rendering";

export type ArtifactContentType = "image" | "text" | "html";

export type ArtifactScreenModel = {
  id: string;
  title: string;
  contentType: ArtifactContentType;
  contentRef?: string | null;
  contentHtml?: string | null;
  summary?: string | null;
  createdAt?: string | null;
};

type ArtifactScreenProps = {
  artifact: ArtifactScreenModel;
  onClick?: (artifact: ArtifactScreenModel) => void;
  className?: string;
};

function isHtmlString(value: string | null | undefined): boolean {
  return Boolean(value && /<\/?[a-z][\s\S]*>/i.test(value));
}

export default function ArtifactScreen({ artifact, onClick, className }: ArtifactScreenProps) {
  const reducedMotion = useReducedMotion();
  const src = artifact.contentRef ?? artifact.contentHtml ?? "";
  const html = artifact.contentType === "html" ? (isHtmlString(src) ? src : artifact.contentHtml ?? src) : "";

  const title = useMemo(() => artifact.title || "Untitled artifact", [artifact.title]);

  return (
    <button
      type="button"
      onClick={() => onClick?.(artifact)}
      className={`group relative overflow-hidden rounded-[1.4rem] border border-white/10 bg-gv-bg-deep/80 text-left transition-transform duration-300 hover:-translate-y-0.5 hover:border-white/20 ${className ?? ""}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.14),_transparent_42%),radial-gradient(circle_at_80%_0%,_rgba(99,102,241,0.09),_transparent_30%)]" />

      <div className="relative flex min-h-[260px] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gv-text-primary">{title}</p>
            <p className="mt-1 text-xs text-gv-text-muted">{artifact.contentType}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-gv-text-muted">
            Open
          </div>
        </div>

        <div className="relative flex-1">
          {artifact.contentType === "image" ? (
            <motion.img
              src={src}
              alt={title}
              className="h-full w-full object-cover"
              initial={false}
              animate={
                reducedMotion
                  ? { scale: 1 }
                  : {
                      scale: [1, 1.08, 1.02, 1],
                      x: [0, 8, -6, 0],
                      y: [0, -10, 6, 0],
                    }
              }
              transition={reducedMotion ? undefined : { duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          ) : artifact.contentType === "html" ? (
            <HtmlArtifactRenderer
              title={title}
              html={html}
              retrievalMode="persistent"
              minHeight={220}
              autoResize={false}
              chrome={false}
              className="h-full min-h-[220px] w-full"
            />
          ) : isHtmlString(src) ? (
            // Safety net: contentType slipped through as "text" but src contains HTML markup.
            // Render it through the shared HTML renderer rather than leaking raw tags as visible text.
            <HtmlArtifactRenderer
              title={title}
              html={src}
              retrievalMode="persistent"
              minHeight={220}
              autoResize={false}
              chrome={false}
              className="h-full min-h-[220px] w-full"
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-stretch p-4">
              <motion.div
                className="max-h-[220px] w-full overflow-y-auto overscroll-contain rounded-[1rem] border border-white/8 bg-black/35 p-4"
                initial={false}
                animate={reducedMotion ? { y: 0 } : { y: [0, -14, 0] }}
                transition={reducedMotion ? undefined : { duration: 42, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <p className="whitespace-pre-wrap text-sm leading-7 text-gv-text-secondary">
                  {src || "No text available yet."}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
