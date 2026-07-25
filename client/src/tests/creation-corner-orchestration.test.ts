import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { OrchestrationRail } from "@/components/creation-corner/OrchestrationRail";

describe("Creation Corner orchestration rail", () => {
  it("renders worker status cards and the gate state", () => {
    const markup = renderToStaticMarkup(
      createElement(OrchestrationRail, {
        gateState: "auto",
        workers: [
          { id: "intake", status: "done", label: "Intake", summary: "Normalized", dependsOn: [] },
          {
            id: "presentation",
            status: "running",
            label: "Presentation",
            summary: "Packaging the result",
            dependsOn: ["intake"],
          },
        ],
      }),
    );

    expect(markup).toContain("Intake");
    expect(markup).toContain("Presentation");
    expect(markup).toContain("auto");
  });
});
