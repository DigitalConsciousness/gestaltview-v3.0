import React, { useMemo } from "react";
import type { RenderingEngineProps } from "../types";
import { InteractiveMindMap } from "../mindmap/InteractiveMindMap";
import Html5Renderer from "./Html5Renderer";

function isHtmlDocument(content: string): boolean {
  const trimmed = content.trimStart();
  return /<!doctype html|<html[\s>]/i.test(trimmed);
}

export default function MindMapRenderer({ artifact, maxHeight }: RenderingEngineProps) {
  const title = artifact.title ?? "Mind Map";
  const shouldRenderHtml = useMemo(() => isHtmlDocument(artifact.content), [artifact.content]);

  if (shouldRenderHtml) {
    return (
      <div className="gv-renderer gv-renderer--mindmap">
        <Html5Renderer artifact={artifact} maxHeight={maxHeight} />
      </div>
    );
  }

  return (
    <InteractiveMindMap
      title={title}
      content={artifact.content}
      maxHeight={maxHeight}
    />
  );
}
