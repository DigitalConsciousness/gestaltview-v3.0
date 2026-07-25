import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CreationCornerIntakeControls } from "@/components/creation-corner/CreationCornerIntakeControls";

describe("creation corner intake controls", () => {
  it("renders file, paste, and create controls", () => {
    const markup = renderToStaticMarkup(
      createElement(CreationCornerIntakeControls, {
        onPasteFromClipboard: () => void 0,
        onUploadFile: () => void 0,
        onCreateBlueprint: () => void 0,
      }),
    );

    expect(markup).toContain("Upload file");
    expect(markup).toContain("Paste from clipboard");
    expect(markup).toContain("Create blueprint");
  });
});
