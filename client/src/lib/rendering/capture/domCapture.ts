export type DomCaptureOptions = {
  backgroundColor?: string;
  fileName?: string;
  pixelRatio?: number;
  width?: number;
  height?: number;
  onDiagnostics?: (diagnostics: DomCaptureDiagnostics) => void;
};

export type DomCaptureRiskType = "external-image" | "external-stylesheet";

export type DomCaptureRiskWarning = {
  type: DomCaptureRiskType;
  url: string;
  message: string;
};

export type DomCaptureDiagnostics = {
  warnings: DomCaptureRiskWarning[];
};

const DEFAULT_BACKGROUND = "#020617";
const SERIALIZED_STYLE_PROPERTIES = [
  "align-items",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "border",
  "border-color",
  "border-radius",
  "border-style",
  "border-width",
  "bottom",
  "box-shadow",
  "box-sizing",
  "color",
  "column-gap",
  "display",
  "flex-direction",
  "flex-wrap",
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "gap",
  "grid-template-columns",
  "height",
  "justify-content",
  "left",
  "line-height",
  "margin",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "margin-top",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "object-fit",
  "opacity",
  "overflow",
  "padding",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "padding-top",
  "position",
  "right",
  "row-gap",
  "text-align",
  "text-transform",
  "top",
  "transform",
  "width",
  "white-space",
  "z-index",
];

export function sanitizeCaptureFileName(title: string | undefined, extension = "png"): string {
  const base = (title ?? "gestaltview-artifact")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "gestaltview-artifact"}.${extension.replace(/^\./, "")}`;
}

export function buildForeignObjectSvg(html: string, width: number, height: number, backgroundColor = DEFAULT_BACKGROUND): string {
  const safeWidth = Math.max(1, Math.ceil(width));
  const safeHeight = Math.max(1, Math.ceil(height));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="0 0 ${safeWidth} ${safeHeight}">`,
    `<rect width="100%" height="100%" fill="${escapeAttribute(backgroundColor)}"/>`,
    `<foreignObject width="100%" height="100%">`,
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${safeWidth}px;min-height:${safeHeight}px;background:${escapeAttribute(backgroundColor)};">`,
    html,
    "</div>",
    "</foreignObject>",
    "</svg>",
  ].join("");
}

export function analyzeCaptureMarkupRisks(html: string, baseOrigin?: string): DomCaptureDiagnostics {
  const warnings: DomCaptureRiskWarning[] = [];
  const imagePattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  const stylesheetPattern = /<link\b(?=[^>]*\brel=["']stylesheet["'])(?=[^>]*\bhref=["']([^"']+)["'])[^>]*>/gi;

  collectExternalUrls(html, imagePattern, baseOrigin).forEach((url) => {
    warnings.push({
      type: "external-image",
      url,
      message: "External image may be omitted from browser PNG capture.",
    });
  });

  collectExternalUrls(html, stylesheetPattern, baseOrigin).forEach((url) => {
    warnings.push({
      type: "external-stylesheet",
      url,
      message: "External stylesheet may be omitted from browser PNG capture.",
    });
  });

  return { warnings };
}

export function buildDomCaptureFailureMessage(
  error: unknown,
  diagnostics: DomCaptureDiagnostics & { userAgent?: string } = { warnings: [] },
): string {
  const reason = error instanceof Error ? error.message : "Unknown capture failure.";
  const browserHint = diagnostics.userAgent && /safari/i.test(diagnostics.userAgent) && !/chrome|chromium/i.test(diagnostics.userAgent)
    ? " Safari has stricter support for SVG foreignObject capture."
    : "";
  const warningHint = diagnostics.warnings.length
    ? ` Asset warnings: ${diagnostics.warnings.map((warning) => `${warning.message} ${warning.url}`).join(" ")}`
    : "";

  return `Artifact image export failed during browser SVG foreignObject capture.${browserHint} ${reason}${warningHint}`.trim();
}

export async function captureDomNodeAsPng(node: HTMLElement, options: DomCaptureOptions = {}): Promise<string> {
  assertBrowserCaptureSupport();

  const rect = node.getBoundingClientRect();
  const width = options.width ?? (rect.width || node.scrollWidth || node.offsetWidth);
  const height = options.height ?? (rect.height || node.scrollHeight || node.offsetHeight);
  const pixelRatio = options.pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);
  const clone = cloneNodeForCapture(node);
  const html = new XMLSerializer().serializeToString(clone);
  const diagnostics = analyzeCaptureMarkupRisks(html, window.location.origin);
  options.onDiagnostics?.(diagnostics);
  const svg = buildForeignObjectSvg(html, width, height, options.backgroundColor);
  const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  let image: HTMLImageElement;
  try {
    image = await loadImage(imageUrl);
  } catch (error) {
    throw new Error(buildDomCaptureFailureMessage(error, {
      ...diagnostics,
      userAgent: window.navigator.userAgent,
    }));
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * pixelRatio);
  canvas.height = Math.ceil(height * pixelRatio);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas 2D context is unavailable for artifact capture.");
  }

  context.fillStyle = options.backgroundColor ?? DEFAULT_BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(pixelRatio, pixelRatio);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/png");
}

export async function downloadCapturedDomNode(node: HTMLElement, options: DomCaptureOptions = {}): Promise<string> {
  const dataUrl = await captureDomNodeAsPng(node, options);
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = options.fileName ?? sanitizeCaptureFileName("gestaltview-artifact");
  anchor.rel = "noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  return dataUrl;
}

function assertBrowserCaptureSupport(): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Artifact image export is only available in a browser.");
  }
}

function cloneNodeForCapture(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement;
  inlineComputedStyles(node, clone);
  return clone;
}

function inlineComputedStyles(source: Element, clone: Element): void {
  if (source instanceof HTMLElement && clone instanceof HTMLElement) {
    const computed = window.getComputedStyle(source);
    const inline = SERIALIZED_STYLE_PROPERTIES
      .map((property) => `${property}:${computed.getPropertyValue(property)};`)
      .join("");

    clone.setAttribute("style", `${inline}${clone.getAttribute("style") ?? ""}`);
    clone.removeAttribute("data-capture-exclude");
  }

  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);

  sourceChildren.forEach((child, index) => {
    const clonedChild = cloneChildren[index];
    if (!clonedChild) return;

    if ((child as HTMLElement).dataset?.captureExclude === "true") {
      clonedChild.remove();
      return;
    }

    inlineComputedStyles(child, clonedChild);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Artifact capture image could not be loaded."));
    image.src = src;
  });
}

function collectExternalUrls(html: string, pattern: RegExp, baseOrigin?: string): string[] {
  const urls = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(html))) {
    const url = match[1];
    if (isExternalCaptureUrl(url, baseOrigin)) {
      urls.add(url);
    }
  }

  return Array.from(urls);
}

function isExternalCaptureUrl(url: string, baseOrigin?: string): boolean {
  if (!url || url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("#") || url.startsWith("/")) {
    return false;
  }

  try {
    const parsed = new URL(url, baseOrigin ?? "http://localhost");
    return parsed.origin !== (baseOrigin ?? parsed.origin);
  } catch {
    return false;
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
