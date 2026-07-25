import { describe, expect, it } from "vitest";
import {
  analyzeCaptureMarkupRisks,
  buildDomCaptureFailureMessage,
  buildForeignObjectSvg,
  sanitizeCaptureFileName,
} from "@/lib/rendering/capture/domCapture";

describe("DOM capture export helpers", () => {
  it("sanitizes artifact titles into stable png filenames", () => {
    expect(sanitizeCaptureFileName("A Very Wild Artifact!!!")).toBe("a-very-wild-artifact.png");
    expect(sanitizeCaptureFileName("")).toBe("gestaltview-artifact.png");
    expect(sanitizeCaptureFileName("Flow Map", ".jpeg")).toBe("flow-map.jpeg");
  });

  it("wraps captured markup in a deterministic foreignObject SVG", () => {
    const svg = buildForeignObjectSvg("<section>Rendered</section>", 320.2, 120.1, "#111827");

    expect(svg).toContain('width="321"');
    expect(svg).toContain('height="121"');
    expect(svg).toContain("<foreignObject");
    expect(svg).toContain("<section>Rendered</section>");
    expect(svg).toContain('fill="#111827"');
  });

  it("reports external asset risks before browser capture", () => {
    const diagnostics = analyzeCaptureMarkupRisks(
      `<section>
        <img src="https://cdn.example.com/artifact.png" />
        <img src="data:image/png;base64,AAAA" />
        <link rel="stylesheet" href="https://cdn.example.com/card.css" />
        <link rel="stylesheet" href="/local.css" />
      </section>`,
      "https://gestaltview.local",
    );

    expect(diagnostics.warnings).toEqual([
      {
        type: "external-image",
        url: "https://cdn.example.com/artifact.png",
        message: "External image may be omitted from browser PNG capture.",
      },
      {
        type: "external-stylesheet",
        url: "https://cdn.example.com/card.css",
        message: "External stylesheet may be omitted from browser PNG capture.",
      },
    ]);
  });

  it("builds a clear foreignObject failure message for browser capture errors", () => {
    const message = buildDomCaptureFailureMessage(new Error("image decode failed"), {
      userAgent: "Version/17.0 Safari/605.1.15",
      warnings: [
        {
          type: "external-image",
          url: "https://cdn.example.com/artifact.png",
          message: "External image may be omitted from browser PNG capture.",
        },
      ],
    });

    expect(message).toContain("browser SVG foreignObject capture");
    expect(message).toContain("Safari");
    expect(message).toContain("image decode failed");
    expect(message).toContain("https://cdn.example.com/artifact.png");
  });
});
