import { useCallback, useEffect, useMemo, useState } from "react";

import { PERSONAS, getPersonaBySlug, type Persona } from "@/data/personas";

export const ACTIVE_DI_STORAGE_KEY = "gv_active_di";
export const ACTIVE_DI_EVENT = "gestaltview:active-di-changed";

const PERSONA_PRESENCE_COLORS: Record<string, string> = {
  "--gv-primary": "#7c3aed",
  "--gv-aurora-amber": "#f59e0b",
  "--gv-aurora-cyan": "#06b6d4",
  "--gv-aurora-emerald": "#10b981",
  "--gv-aurora-indigo": "#6366f1",
  "--gv-aurora-rose": "#f43f5e",
};

function hasBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readActiveDIPersonaSlug(): string {
  if (!hasBrowserStorage()) {
    return "billy";
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_DI_STORAGE_KEY)?.trim();
    return getPersonaBySlug(raw ?? "")?.slug ?? "billy";
  } catch {
    return "billy";
  }
}

export function setActiveDIPersonaSlug(slug: string): void {
  const resolvedSlug = getPersonaBySlug(slug)?.slug ?? "billy";

  if (!hasBrowserStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(ACTIVE_DI_STORAGE_KEY, resolvedSlug);
    window.dispatchEvent(
      new CustomEvent(ACTIVE_DI_EVENT, {
        detail: { slug: resolvedSlug },
      }),
    );
  } catch {
    // Ignore storage failures in private mode or locked-down contexts.
  }
}

export function resolvePersonaPresenceColor(persona: Persona | null | undefined): string {
  if (!persona) {
    return "#06b6d4";
  }

  const fallbackColor = persona.slug === "billy" ? "#f59e0b" : "#06b6d4";
  return PERSONA_PRESENCE_COLORS[persona.auroraColor] ?? fallbackColor;
}

export function useActiveDI() {
  const [activeSlug, setActiveSlug] = useState<string>(() => readActiveDIPersonaSlug());

  useEffect(() => {
    if (!hasBrowserStorage()) {
      return;
    }

    const syncFromStorage = () => {
      setActiveSlug(readActiveDIPersonaSlug());
    };

    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      const nextSlug = customEvent.detail?.slug?.trim();
      if (nextSlug) {
        setActiveSlug(getPersonaBySlug(nextSlug)?.slug ?? "billy");
        return;
      }

      syncFromStorage();
    };

    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(ACTIVE_DI_EVENT, handleCustomEvent as EventListener);

    syncFromStorage();

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(ACTIVE_DI_EVENT, handleCustomEvent as EventListener);
    };
  }, []);

  const activePersona = useMemo(() => getPersonaBySlug(activeSlug) ?? PERSONAS[0], [activeSlug]);

  const setActivePersonaSlug = useCallback((slug: string) => {
    setActiveDIPersonaSlug(slug);
    setActiveSlug(getPersonaBySlug(slug)?.slug ?? "billy");
  }, []);

  return {
    activePersona,
    activeSlug: activePersona.slug,
    availablePersonas: PERSONAS,
    presenceColor: resolvePersonaPresenceColor(activePersona),
    setActivePersonaSlug,
  };
}
