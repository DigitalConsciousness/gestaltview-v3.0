import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import BlueprintGenerativeWorkbench from "@/components/BlueprintGenerativeWorkbench";

describe("creation corner intake controls", () => {
  it("renders file, paste, and voice intake controls in freeform mode", () => {
    const markup = renderToStaticMarkup(
      <BlueprintGenerativeWorkbench blueprint={null} blueprints={[]} onSelectBlueprint={() => void 0} />,
    );

    expect(markup).toContain("Upload file");
    expect(markup).toContain("Paste from clipboard");
    expect(markup).toContain("Record voice note");
  });
});
