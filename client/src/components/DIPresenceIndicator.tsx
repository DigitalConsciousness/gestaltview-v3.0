/**
 * @file DIPresenceIndicator.tsx
 * @project GestaltView v2
 * @repository DigitalConsciousness/gestaltview-v2.0
 * @author Keith Soyka
 * @copyright 2026 Keith Soyka / GestaltView. All rights reserved.
 *
 * Notes: Persistent authenticated-surface indicator for active DI selection and quick persona switching.
 * This file is not responsible for persona definitions, storage schema migrations, or room-specific prompt logic.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useActiveDI, resolvePersonaPresenceColor } from "@/hooks/useActiveDI";

export default function DIPresenceIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { activePersona, availablePersonas, presenceColor, setActivePersonaSlug } = useActiveDI();

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const drawerTitle = useMemo(() => "The Tribunal has noted your preference. Switching companions now.", []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-left transition-colors hover:border-white/20 hover:bg-white/[0.07]",
          "max-w-[14rem] sm:max-w-[16rem]",
        )}
        style={{
          boxShadow: `0 0 0 1px ${presenceColor}10, 0 0 30px ${presenceColor}12`,
        }}
      >
        <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ backgroundColor: presenceColor }}
          />
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: presenceColor }}
          />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-[10px] uppercase tracking-[0.24em] text-white/40">Active DI</span>
          <span className="block truncate text-sm font-medium text-white">{activePersona.name}</span>
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-white/45 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close DI selector"
              className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-black/32 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Digital intelligence selector"
              className="fixed right-4 top-20 z-[61] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05070b]/96 shadow-[0_24px_80px_rgba(0,0,0,0.46)] backdrop-blur-xl"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3 border-b border-white/8 px-4 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/38">DI presence</p>
                  <h2 className="mt-2 text-sm leading-6 text-white/82">{drawerTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/54 transition-colors hover:bg-white/[0.08] hover:text-white"
                  aria-label="Close selector"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="max-h-[32rem] space-y-2 overflow-y-auto px-3 py-3">
                {availablePersonas.map((persona) => {
                  const accent = resolvePersonaPresenceColor(persona);
                  const isActive = persona.slug === activePersona.slug;

                  return (
                    <button
                      key={persona.slug}
                      type="button"
                      onClick={() => {
                        setActivePersonaSlug(persona.slug);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-[1.1rem] border px-3 py-3 text-left transition-colors",
                        isActive
                          ? "border-white/18 bg-white/[0.07]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/14 hover:bg-white/[0.05]",
                      )}
                      style={{
                        boxShadow: isActive ? `0 0 0 1px ${accent}24` : undefined,
                      }}
                    >
                      <span
                        className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-[10px] font-semibold uppercase tracking-[0.18em]"
                        style={{
                          borderColor: accent,
                          backgroundColor: `${accent}12`,
                          color: accent,
                        }}
                      >
                        <Sparkles className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-white">{persona.name}</span>
                        <span className="mt-1 block text-xs leading-5 text-white/52">{persona.archetype}</span>
                      </span>
                      {isActive ? (
                        <span
                          className="rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                          style={{
                            borderColor: accent,
                            color: accent,
                            backgroundColor: `${accent}12`,
                          }}
                        >
                          Active
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
