import React from "react";
import { Film, PlayCircle } from "lucide-react";
import type { RenderProps } from "../types";
import { describeVideoArtifact, resolveVideoSource } from "./videoHelpers";

export function VideoRenderer({ artifact, mode, height, onInteraction }: RenderProps) {
  const resolvedHeight = height ?? (mode === 'compact' ? 240 : 480);
  const src = resolveVideoSource(artifact);
  return (
    <div className="overflow-hidden rounded-[1.35rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,10,18,0.96),rgba(2,4,12,0.88))] shadow-[0_0_42px_rgba(82,126,255,0.16)]">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/60">
          <Film className="h-3.5 w-3.5 text-cyan-200/80" />
          Moving picture
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/50">
          <PlayCircle className="h-3.5 w-3.5 text-fuchsia-200/80" />
          {describeVideoArtifact(artifact)}
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05), transparent 22%), radial-gradient(circle at 50% 16%, rgba(18,214,255,0.16), transparent 36%), radial-gradient(circle at 82% 22%, rgba(191,0,255,0.10), transparent 28%)",
            mixBlendMode: "screen",
          }}
        />
        <video
          controls
          playsInline
          preload="metadata"
          src={src}
          style={{ width: "100%", maxHeight: resolvedHeight, display: "block", background: "#000" }}
          onPlay={() => onInteraction?.({ type: "play" })}
          onPause={() => onInteraction?.({ type: "pause" })}
        >
          Your browser does not support HTML5 video.
        </video>
      </div>
    </div>
  );
}
