import React, { useEffect, useMemo, useState } from "react";
import { normalizeMermaidSource } from "../markdown/analyzeMarkdown";
import { loadMermaid } from "./mermaidLoader";

type MermaidDiagramProps = {
  code: string;
  language?: string;
};

function sourceId(code: string): string {
  let hash = 0;
  for (let index = 0; index < code.length; index += 1) {
    hash = (hash << 5) - hash + code.charCodeAt(index);
    hash |= 0;
  }
  return `gv-mermaid-${Math.abs(hash)}`;
}

export function MermaidDiagram({ code, language = "mermaid" }: MermaidDiagramProps) {
  const normalizedSource = useMemo(() => normalizeMermaidSource(language, code), [code, language]);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setSvg(null);
    setError(null);

    loadMermaid()
      .then((mermaid) => mermaid.render(`${sourceId(normalizedSource)}-${Date.now()}`, normalizedSource))
      .then((result) => {
        if (!cancelled) {
          setSvg(result.svg);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Mermaid rendering failed.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [normalizedSource]);

  return (
    <figure className="my-5 overflow-hidden rounded-xl border border-cyan-200/18 bg-slate-950/72 shadow-[0_18px_50px_rgba(8,47,73,0.24)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <figcaption className="font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">Mermaid diagram</figcaption>
        <span className="rounded-full border border-cyan-100/15 bg-cyan-100/10 px-2 py-1 text-[11px] text-cyan-50/72">
          {svg ? "rendered" : error ? "source fallback" : "rendering"}
        </span>
      </div>
      {svg ? (
        <div className="gv-mermaid-diagram overflow-auto p-4" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <pre className="m-0 overflow-auto whitespace-pre-wrap p-4 text-xs leading-6 text-cyan-50/72">
          {error ? `Mermaid unavailable: ${error}\n\n` : ""}
          {normalizedSource}
        </pre>
      )}
    </figure>
  );
}
