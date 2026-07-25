import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Router } from "wouter";

import ExternalScaffoldPage from "@/pages/ExternalScaffoldPage";

function testLocationHook(): [string, (path: string, ...args: any[]) => void] {
  return ["/external-scaffold", () => void 0];
}

describe("external scaffold module safety", () => {
  it("imports and renders the restored scaffold surface with its core controls", () => {
    const markup = renderToStaticMarkup(
      <Router hook={testLocationHook}>
        <ExternalScaffoldPage />
      </Router>,
    );

    expect(markup).toContain("External Scaffold of You");
    expect(markup).toContain("Queue as orb");
    expect(markup).toContain("Load demo captures");
    expect(markup).toContain("Clear local scaffold");
  });
});
