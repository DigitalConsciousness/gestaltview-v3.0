import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import OriginRoute from "@/routes/origin";
import { ORIGIN_EVENTS, ORIGIN_EVENTS_VERSION } from "@/lib/originStoryContent";

describe("origin story route", () => {
  it("renders the origin story surface and the timeline data", () => {
    const markup = renderToStaticMarkup(createElement(OriginRoute));

    expect(markup).toContain("Origin Story");
    expect(markup).toContain("Origin timeline");
    expect(ORIGIN_EVENTS_VERSION).toBeGreaterThan(0);
    expect(ORIGIN_EVENTS.length).toBeGreaterThan(0);
    expect(ORIGIN_EVENTS[0]).toHaveProperty("title");
  });
});
