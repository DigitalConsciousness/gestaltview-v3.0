import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import UploadedDocumentPreview from "@/components/UploadedDocumentPreview";

describe("UploadedDocumentPreview", () => {
  it("renders markdown content as a document body", () => {
    const markup = renderToStaticMarkup(
      createElement(UploadedDocumentPreview, {
        name: "founder-notes.md",
        mimeType: "text/markdown",
        kind: "markdown",
        previewText: "# Founder Notes\n\n- one\n- two",
      }),
    );

    expect(markup).toContain("Founder Notes");
    expect(markup).toContain("<ul");
  });

  it("renders pdf text fallback when no embedded source is available", () => {
    const markup = renderToStaticMarkup(
      createElement(UploadedDocumentPreview, {
        name: "founder-profile.pdf",
        mimeType: "application/pdf",
        kind: "pdf",
        previewText: "Extracted profile text from the uploaded PDF.",
      }),
    );

    expect(markup).toContain("Extracted profile text from the uploaded PDF.");
    expect(markup).toContain("PDF");
  });
});
