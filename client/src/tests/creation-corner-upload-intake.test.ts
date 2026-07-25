import { describe, expect, it } from "vitest";

import { readCreationCornerUpload } from "@/lib/creationCornerIntake";

describe("Creation Corner uploaded-material intake", () => {
  it("uses the selected text file as synthesis material", async () => {
    const file = new File(["The uploaded source signal."], "source.md", {
      type: "text/markdown",
    });

    await expect(readCreationCornerUpload(file)).resolves.toEqual({
      name: "source.md",
      text: "The uploaded source signal.",
      previewText: "The uploaded source signal.",
      previewHtml: undefined,
    });
  });

  it("recognizes a selected binary file without pretending it contains text", async () => {
    const file = new File(["image-bytes"], "reference.png", { type: "image/png" });

    await expect(readCreationCornerUpload(file)).resolves.toMatchObject({
      name: "reference.png",
      text: "[Uploaded image: reference.png]",
      previewText: undefined,
    });
  });
});
