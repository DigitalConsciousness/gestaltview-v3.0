import React from "react";
import { MermaidDiagram } from "../diagram/MermaidDiagram";
import type { RenderProps } from "../types";

export function DiagramRenderer({ artifact }: RenderProps) {
  const language = artifact.format === "diagram" ? "mermaid" : artifact.format ?? artifact.language ?? "mermaid";

  return (
    <section className="gv-renderer gv-renderer--diagram">
      <MermaidDiagram code={artifact.content} language={language} />
    </section>
  );
}

