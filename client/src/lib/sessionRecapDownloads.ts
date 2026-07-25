export type SessionRecapDownloadFormat = "html" | "txt" | "json";

export type SessionRecapDownloadArtifact = {
  id: string;
  title: string;
  content: string;
  metadata: {
    sessionLabel: string;
    captureCount: number;
    generatedAt: string;
    context?: string;
    surface: "forward";
    createdAt: string;
    updatedAt: string;
  };
};

export type SessionRecapDownloadPayload = {
  fileName: string;
  mimeType: string;
  content: string;
  label: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "session-recap";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlDocument(artifact: SessionRecapDownloadArtifact): string {
  const content = artifact.content.trim() || "<p>No recap content available.</p>";
  if (/<!doctype html/i.test(content) || /<html[\s>]/i.test(content)) {
    return content;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(artifact.title)}</title>
  </head>
  <body>
    ${content}
  </body>
</html>`;
}

export function sanitizeRecapHtmlForDownload(html: string, appOrigin = ""): string {
  const trimmed = html.trim();
  if (!trimmed) {
    return html;
  }

  const hasDoctype = /^<!doctype html>/i.test(trimmed);
  const origin = appOrigin || (typeof window !== "undefined" ? window.location.origin : "");

  const buildSafeLocalStoragePrelude = (originValue: string): string => [
    `window.__gvAppOrigin__ = ${JSON.stringify(originValue)};`,
    "window.__gvSafeLocalStorage__ = window.__gvSafeLocalStorage__ || (() => {",
    "  try {",
    "    return window.localStorage;",
    "  } catch {",
    "    return {",
    "      getItem() { return null; },",
    "      setItem() {},",
    "      removeItem() {},",
    "      clear() {},",
    "      key() { return null; },",
    "      get length() { return 0; },",
    "    };",
    "  }",
    "})();",
  ].join("\n");

  function rewriteDownloadInteractions(doc: Document, appOriginValue: string): boolean {
    let rewrote = false;
    const normalizedOrigin = appOriginValue.replace(/\/+$/, "");
    const returnHref = normalizedOrigin ? `${normalizedOrigin}/blackboard-room` : "#";

    const addDownloadStyles = () => {
      const style = doc.createElement("style");
      style.textContent = [
        "button[disabled], a[aria-disabled='true'], [data-gv-download-disabled='true'] {",
        "  pointer-events: none;",
        "  cursor: not-allowed;",
        "  opacity: 0.74;",
        "}",
        "button[disabled] { filter: grayscale(0.15); }",
      ].join("\n");
      doc.head?.appendChild(style);
    };

    const disableInteractiveElement = (element: HTMLElement, reason: string) => {
      const tagName = element.tagName.toLowerCase();
      for (const attrName of element.getAttributeNames()) {
        if (attrName.startsWith("on")) {
          element.removeAttribute(attrName);
        }
      }

      element.setAttribute("data-gv-download-disabled", "true");
      element.setAttribute("aria-disabled", "true");
      element.setAttribute("title", reason);

      if (tagName === "button") {
        (element as HTMLButtonElement).disabled = true;
        return;
      }

      if (tagName === "a") {
        element.setAttribute("href", "#");
        element.setAttribute("tabindex", "-1");
      }
    };

    const convertReturnLink = (element: HTMLElement) => {
      const text = (element.textContent || element.getAttribute("aria-label") || element.getAttribute("title") || "")
        .trim()
        .toLowerCase();
      if (!text.includes("return to blackboard room")) {
        return false;
      }

      const link = doc.createElement("a");
      for (const attrName of element.getAttributeNames()) {
        if (attrName.startsWith("on") || attrName === "href" || attrName === "role") {
          continue;
        }
        const value = element.getAttribute(attrName);
        if (value !== null) {
          link.setAttribute(attrName, value);
        }
      }
      link.className = element.className;
      link.textContent = element.textContent;
      link.href = returnHref;
      link.target = "_top";
      link.rel = "noopener noreferrer";
      link.setAttribute("data-gv-download-link", "true");
      element.replaceWith(link);
      return true;
    };

    for (const element of Array.from(doc.querySelectorAll<HTMLElement>("button, a, [role='button']"))) {
      if (convertReturnLink(element)) {
        rewrote = true;
        continue;
      }

      const text = (element.textContent || element.getAttribute("aria-label") || element.getAttribute("title") || "")
        .trim()
        .toLowerCase();
      const hasHandler = element.getAttributeNames().some((attrName) => attrName.startsWith("on"));
      const looksLikeAppAction =
        hasHandler ||
        text.includes("deeper discussion") ||
        text.includes("click on this question") ||
        text.includes("open in gestaltview") ||
        text.includes("return to blackboard room");

      if (!looksLikeAppAction) {
        continue;
      }

      rewrote = true;

      if (text.includes("return to blackboard room")) {
        continue;
      }

      disableInteractiveElement(
        element,
        "This action only works inside GestaltView. Open the recap in the app to continue interacting with it.",
      );
    }

    if (rewrote) {
      addDownloadStyles();
    }

    return rewrote;
  }

  if (typeof DOMParser === "undefined") {
    const rewritten = trimmed
      .replace(/\blocalStorage\b/g, "window.__gvSafeLocalStorage__")
      .replace(
        /<button([^>]*)>(Return to Blackboard Room)<\/button>/gi,
        `<a$1 href="${origin ? `${origin.replace(/\/+$/, "")}/blackboard-room` : "#"}" target="_top" rel="noopener noreferrer">$2</a>`,
      )
      .replace(
        /<button([^>]*)>([^<]*?(?:Click on this question to explore a deeper discussion|deeper discussion|Open in GestaltView)[^<]*)<\/button>/gi,
        `<button$1 type="button" disabled aria-disabled="true" data-gv-download-disabled="true">$2</button>`,
      )
      .replace(/\son[a-z]+="[^"]*"/gi, "");

    const body = hasDoctype ? rewritten.replace(/^<!doctype html>\s*/i, "") : rewritten;
    return `${hasDoctype ? "<!doctype html>\n" : ""}${body}`;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "text/html");
  const safePrelude = doc.createElement("script");
  safePrelude.textContent = buildSafeLocalStoragePrelude(origin);
  doc.head?.prepend(safePrelude);

  for (const script of Array.from(doc.scripts)) {
    if (script.textContent?.includes("localStorage")) {
      script.textContent = script.textContent.replace(/\blocalStorage\b/g, "window.__gvSafeLocalStorage__");
    }
  }

  for (const element of Array.from(doc.querySelectorAll<HTMLElement>("[onload], [onclick], [oninput], [onsubmit], [onmouseover], [onmouseenter], [onchange], [onkeyup], [onkeydown]"))) {
    for (const attrName of element.getAttributeNames()) {
      if (!attrName.startsWith("on")) {
        continue;
      }

      const attrValue = element.getAttribute(attrName);
      if (attrValue) {
        element.setAttribute(attrName, attrValue.replace(/\blocalStorage\b/g, "window.__gvSafeLocalStorage__"));
      }
    }
  }

  rewriteDownloadInteractions(doc, origin);

  const serialized = doc.documentElement.outerHTML;
  return `${hasDoctype ? "<!doctype html>\n" : ""}${serialized}`;
}

export function buildSessionRecapDownloadPayload(
  artifact: SessionRecapDownloadArtifact,
  format: SessionRecapDownloadFormat,
  appOrigin = "",
): SessionRecapDownloadPayload {
  const baseName = `${slugify(artifact.metadata.sessionLabel || artifact.title)}-recap`;

  if (format === "json") {
    return {
      fileName: `${baseName}.json`,
      mimeType: "application/json;charset=utf-8",
      label: "JSON metadata",
      content: JSON.stringify(
        {
          id: artifact.id,
          title: artifact.title,
          sessionLabel: artifact.metadata.sessionLabel,
          captureCount: artifact.metadata.captureCount,
          generatedAt: artifact.metadata.generatedAt,
          context: artifact.metadata.context,
          html: artifact.content,
        },
        null,
        2,
      ),
    };
  }

  if (format === "txt") {
    return {
      fileName: `${baseName}.txt`,
      mimeType: "text/plain;charset=utf-8",
      label: "plain text",
      content: [
        `Title: ${artifact.title}`,
        `Session: ${artifact.metadata.sessionLabel}`,
        `Captures: ${artifact.metadata.captureCount}`,
        `Generated: ${artifact.metadata.generatedAt}`,
        artifact.metadata.context ? `Context: ${artifact.metadata.context}` : "",
        "",
        stripHtml(artifact.content) || "No recap content available.",
      ].filter(Boolean).join("\n"),
    };
  }

  return {
    fileName: `${baseName}.html`,
    mimeType: "text/html;charset=utf-8",
    label: "HTML",
    content: sanitizeRecapHtmlForDownload(buildHtmlDocument(artifact), appOrigin),
  };
}

export function downloadSessionRecapArtifact(
  artifact: SessionRecapDownloadArtifact,
  format: SessionRecapDownloadFormat,
  appOrigin = "",
): SessionRecapDownloadPayload {
  const payload = buildSessionRecapDownloadPayload(artifact, format, appOrigin);
  const blob = new Blob([payload.content], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return payload;
}
