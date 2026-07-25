'use client';

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { buildMuseumRecapPrompt } from "@/prompts/buildMuseumRecapPrompt";
import { useLLMRouter } from "@/hooks/useLLMRouter";
import type { InnerWorldCapture } from "@/components/Scaffold";

interface RecapPanelProps {
  captures: InnerWorldCapture[];
  surfaceLabel: string;
}

export function RecapPanel({ captures, surfaceLabel }: RecapPanelProps) {
  const [recap, setRecap] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const { route, loading } = useLLMRouter();

  useEffect(() => {
    setRecap(null);
    setError(null);
    setLocalLoading(false);
  }, [surfaceLabel, captures.length]);

  async function handleGenerate() {
    if (captures.length === 0) return;

    setLocalLoading(true);
    setError(null);

    try {
      const prompt = buildMuseumRecapPrompt({
        roomName: surfaceLabel,
        exhibitSummaries: captures.map((capture) => ({
          title: capture.title,
          summary: [capture.text, capture.metadata.context, capture.metadata.meaning]
            .filter(Boolean)
            .join(" "),
          sourceNotes: [
            { title: "Created", pointer: capture.createdAt },
            { title: "Surface", pointer: capture.surface },
            ...(capture.tags.slice(0, 3).map((tag) => ({ title: "Tag", pointer: tag })) ?? []),
          ],
        })),
      });
      const result = await route({ prompt, maxTokens: 300 });
      setRecap(result.text.trim());
    } catch {
      setError("Could not generate recap. Try again.");
    } finally {
      setLocalLoading(false);
    }
  }

  const isLoading = loading || localLoading;
  const emptyState = !recap && !error && !isLoading && captures.length === 0;
  return (
    <div className="space-y-3 rounded-[1.15rem] border border-white/10 bg-black/22 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Curator Recap - {surfaceLabel}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading || captures.length === 0}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-40"
        >
          {isLoading ? "Generating…" : "Generate Recap"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {recap ? (
          <motion.div
            key={recap}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-h-[20rem] overflow-y-auto pr-1"
          >
            <p className="text-sm leading-relaxed text-white/75">
              {recap}
            </p>
          </motion.div>
        ) : null}
        {error ? (
          <motion.p
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400/80"
          >
            {error}
          </motion.p>
        ) : null}
        {emptyState ? (
          <p className="text-sm italic text-white/30">No captures on this surface yet.</p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
