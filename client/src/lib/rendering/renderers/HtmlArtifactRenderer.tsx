import { useMemo } from "react";

import type { ArtifactExportRetrievalMode } from "../artifactExport";
import { useIframeResize } from "../hooks/useIframeResize";

type HtmlArtifactRendererProps = {
  title: string;
  html?: string;
  signedUrl?: string;
  retrievalMode?: ArtifactExportRetrievalMode;
  mode?: "inline" | "fullscreen";
  minHeight?: number;
  className?: string;
  autoResize?: boolean;
  chrome?: boolean;
  /** Native iframe lazy-loading hint; useful for off-viewport thumbnails. */
  loading?: "eager" | "lazy";
};

const EMPTY_HTML = "<!doctype html><html><body></body></html>";

export default function HtmlArtifactRenderer({
  title,
  html,
  signedUrl,
  retrievalMode = "preview",
  mode = "inline",
  minHeight = 520,
  className,
  autoResize = true,
  chrome = true,
  loading,
}: HtmlArtifactRendererProps) {
  const sourceKey = useMemo(() => [title, retrievalMode, signedUrl ?? "", html ?? ""].join("|"), [
    title,
    retrievalMode,
    signedUrl,
    html,
  ]);
  const { iframeRef, height } = useIframeResize(sourceKey, minHeight);
  const useSrcDoc = retrievalMode === "persistent" && typeof html === "string";
  const srcDoc = html ?? EMPTY_HTML;
  const resolvedHeight = autoResize ? height : minHeight;

  return (
    <iframe
      ref={iframeRef}
      title={title}
      src={useSrcDoc ? undefined : signedUrl}
      srcDoc={useSrcDoc ? srcDoc : html ?? undefined}
      loading={loading}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      className={className}
      style={{
        width: "100%",
        height: mode === "fullscreen" ? "calc(100dvh - 10rem)" : `${resolvedHeight}px`,
        minHeight,
        border: chrome ? "1px solid rgba(255,255,255,0.08)" : "none",
        borderRadius: chrome ? "1rem" : 0,
        background: chrome ? "#05070b" : "transparent",
      }}
    />
  );
}
