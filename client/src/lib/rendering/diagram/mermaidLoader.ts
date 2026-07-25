type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

declare global {
  interface Window {
    mermaid?: MermaidApi;
  }
}

const MERMAID_CDN_URL = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";

let mermaidPromise: Promise<MermaidApi> | null = null;

function appendMermaidScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-gv-mermaid]");

    if (existing) {
      if (window.mermaid) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Mermaid script failed to load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = MERMAID_CDN_URL;
    script.async = true;
    script.dataset.gvMermaid = "true";
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Mermaid script failed to load.")), { once: true });
    document.head.appendChild(script);
  });
}

export function loadMermaid(): Promise<MermaidApi> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.reject(new Error("Mermaid rendering is browser-only."));
  }

  if (window.mermaid) {
    return Promise.resolve(window.mermaid);
  }

  mermaidPromise ??= appendMermaidScript().then(() => {
    if (!window.mermaid) {
      throw new Error("Mermaid did not attach to window.");
    }

    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "dark",
      suppressErrorRendering: true,
    });

    return window.mermaid;
  });

  return mermaidPromise;
}
