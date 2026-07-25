import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BillyWalkthrough from "@/components/BillyWalkthrough";

export type BillyTourMode = "default" | "new-year";

type BillyOnboardingPromptProps = {
  mode?: BillyTourMode;
  storageKey?: string;
  autoOpen?: boolean;
  openLabel?: string;
  className?: string;
  message?: string;
  onDismiss?: () => void;
};

const DEFAULT_STORAGE_KEY = "gestaltview.billy.onboarding.seen.v1";

export function BillyOnboardingPrompt({
  mode = "default",
  storageKey = DEFAULT_STORAGE_KEY,
  autoOpen = true,
  openLabel = "Open Billy tour",
  className,
  message,
  onDismiss,
}: BillyOnboardingPromptProps) {
  const [open, setOpen] = useState(false);

  const resolvedStorageKey = useMemo(() => `${storageKey}:${mode}`, [mode, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const seen = window.localStorage.getItem(resolvedStorageKey) === "1";
    if (autoOpen && !seen) {
      setOpen(true);
    }
  }, [autoOpen, resolvedStorageKey]);

  const markSeen = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(resolvedStorageKey, "1");
    }
  };

  if (message) {
    return (
      <div
        className={
          className ??
          "rounded-2xl border border-amber-200/15 bg-amber-200/[0.06] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200/70">
              Billy
            </p>
            <p className="whitespace-pre-line text-sm leading-6 text-white/70">
              {message}
            </p>
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/50 transition-colors hover:border-white/20 hover:text-white"
              aria-label="Dismiss Billy message"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
      >
        {openLabel}
      </button>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            markSeen();
          }
        }}
      >
        <DialogContent className="max-w-5xl border-white/12 bg-[linear-gradient(180deg,rgba(8,10,14,0.98),rgba(5,6,9,0.98))] p-0 text-white shadow-[0_30px_100px_rgba(0,0,0,0.7)]">
          <DialogHeader className="sr-only">
            <DialogTitle>Billy onboarding tour</DialogTitle>
            <DialogDescription>Optional guided tour of the platform.</DialogDescription>
          </DialogHeader>
          <BillyWalkthrough
            mode={mode}
            className="border-0 bg-transparent p-5 sm:p-6"
            ctaHref={mode === "new-year" ? "/sanctuary?tour=new-year" : "/sanctuary"}
            ctaLabel={mode === "new-year" ? "Start the seasonal tour" : "Enter Sanctuary"}
            subtitle={
              mode === "new-year"
                ? "A seasonal onboarding path for curious users and new arrivals."
                : "A short optional tour for first-time users and curious visitors."
            }
            steps={
              mode === "new-year"
                ? [
                    "Enter Sanctuary and set the tone for the year.",
                    "Open the Blackboard Room and drop in the first fragments you want to keep.",
                    "Move one capture into the Dynamic Inner World and inspect the surfaces.",
                    "Use Billy to verify metadata and display integrity without flattening uncertainty.",
                    "Approve only the captures you want to carry forward as scaffold artifacts.",
                  ]
                : [
                    "Start in Sanctuary to settle into the room.",
                    "Open the Blackboard Room and capture raw material without organizing it first.",
                    "Move one capture into the Dynamic Inner World and inspect where it landed.",
                    "Use Billy as a guide for capture integrity and platform orientation.",
                    "Send something to External Scaffold only when you want it compressed and approved.",
                  ]
            }
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BillyOnboardingPrompt;
