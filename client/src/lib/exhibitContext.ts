// © 2026 Keith Soyka — GestaltView

const EXHIBIT_CONTEXT_KEY = "gv-active-exhibit";

export interface ActiveExhibitContext {
  slug: string;
  title: string;
  codexScrollId: string;
  scopePrompt?: string;
  updatedAtIso: string;
}

export const setExhibitContext = (context: Omit<ActiveExhibitContext, "updatedAtIso">): void => {
  if (typeof window === "undefined") {
    return;
  }

  const payload: ActiveExhibitContext = {
    ...context,
    updatedAtIso: new Date().toISOString(),
  };

  window.localStorage.setItem(EXHIBIT_CONTEXT_KEY, JSON.stringify(payload));
};

export const getExhibitContext = (): ActiveExhibitContext | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(EXHIBIT_CONTEXT_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ActiveExhibitContext;
  } catch {
    window.localStorage.removeItem(EXHIBIT_CONTEXT_KEY);
    return null;
  }
};

export const clearExhibitContext = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(EXHIBIT_CONTEXT_KEY);
};

export { EXHIBIT_CONTEXT_KEY };
