import { useEffect, useRef, useState } from "react";

import { CODEX_EXPORT_DEFAULT_HEIGHT } from "../artifactExport";

type HeightMessage = {
  type?: string;
  height?: number;
};

export function useIframeResize(resetKey: string, minHeight = CODEX_EXPORT_DEFAULT_HEIGHT) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    setHeight(minHeight);
  }, [minHeight, resetKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data as HeightMessage;
      if (data?.type !== "gestaltview:height" || typeof data.height !== "number") {
        return;
      }

      setHeight(Math.max(minHeight, Math.ceil(data.height)));
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [minHeight]);

  return {
    iframeRef,
    height,
  };
}
