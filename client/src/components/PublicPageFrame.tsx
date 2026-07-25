import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

import AuroraBackground from "@/components/AuroraBackground";
import { RoomIdentityHeader } from "@/components/RoomIdentityHeader";
import { cn } from "@/lib/utils";
import { readUserSurfaceSettings } from "@/lib/userSurfaceSettings";

type PublicPageFrameProps = {
  roomName: string;
  purpose: string;
  status?: string;
  title: string;
  intro: string;
  secondaryAction?: {
    href: string;
    label: string;
  };
  children: ReactNode;
  contentClassName?: string;
};

export function PublicPageFrame({
  roomName,
  purpose,
  status,
  title,
  intro,
  secondaryAction,
  children,
  contentClassName,
}: PublicPageFrameProps) {
  const [lowBandwidthMode, setLowBandwidthMode] = useState(() => {
    const settings = readUserSurfaceSettings();
    return settings.lowBandwidthMode || !settings.motionHints;
  });

  useEffect(() => {
    const syncSurfaceSettings = () => {
      const settings = readUserSurfaceSettings();
      setLowBandwidthMode(settings.lowBandwidthMode || !settings.motionHints);
    };

    syncSurfaceSettings();
    window.addEventListener("storage", syncSurfaceSettings);
    window.addEventListener("gestaltview:settings:surface", syncSurfaceSettings);
    return () => {
      window.removeEventListener("storage", syncSurfaceSettings);
      window.removeEventListener("gestaltview:settings:surface", syncSurfaceSettings);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070B] text-white operation-render-shell">
      {!lowBandwidthMode ? <AuroraBackground /> : null}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Home
            </a>
          </Link>
          {secondaryAction ? (
            <Link href={secondaryAction.href}>
              <a className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:text-white">
                {secondaryAction.label}
              </a>
            </Link>
          ) : null}
        </div>

        <section className="mt-14 space-y-6">
          <RoomIdentityHeader roomName={roomName} purpose={purpose} status={status} />
          <div className="operation-render-surface-active space-y-4 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <h1 className="max-w-3xl font-gv-hero text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-white/68">{intro}</p>
          </div>
        </section>

        <div className={cn("mt-8", contentClassName)}>{children}</div>
      </div>
    </main>
  );
}

export default PublicPageFrame;
