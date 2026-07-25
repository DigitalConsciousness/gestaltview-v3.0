import { describe, expect, it } from "vitest";

import { sanitizeRecapHtmlForDownload } from "@/components/SessionRecapGenerator";
import { buildSessionRecapDownloadPayload } from "@/lib/sessionRecapDownloads";

describe("session recap download sanitization", () => {
  it("rewrites app-only actions into safe download interactions", () => {
    const html = `
      <!doctype html>
      <html>
        <head></head>
        <body>
          <script>localStorage.setItem('gv', '1')</script>
          <button onclick="localStorage.setItem('gv', '1')">Return to Blackboard Room</button>
          <button onclick="window.location.reload()">Click on this question to explore a deeper discussion.</button>
        </body>
      </html>
    `;

    const sanitized = sanitizeRecapHtmlForDownload(html, "https://gestaltview.test");

    expect(sanitized).toContain('href="https://gestaltview.test/blackboard-room"');
    expect(sanitized).toContain("window.__gvSafeLocalStorage__");
    expect(sanitized).toContain('data-gv-download-disabled="true"');
    expect(sanitized).not.toContain("localStorage.setItem");
    expect(sanitized).not.toContain("window.location.reload");
    expect(sanitized.match(/<!doctype html>/gi)).toHaveLength(1);
  });

  it("builds recap payloads for html, text, and json downloads", () => {
    const artifact = {
      id: "recap-1",
      title: "Blackboard Room · Recap",
      content: "<article><h1>Recap</h1><p>We built something real.</p></article>",
      metadata: {
        sessionLabel: "Blackboard Room",
        captureCount: 3,
        generatedAt: "2026-06-18T00:00:00.000Z",
        context: "Generated recap for: Blackboard Room",
        surface: "forward" as const,
        createdAt: "2026-06-18T00:00:00.000Z",
        updatedAt: "2026-06-18T00:00:00.000Z",
      },
    };

    const html = buildSessionRecapDownloadPayload(artifact, "html", "https://gestaltview.test");
    const text = buildSessionRecapDownloadPayload(artifact, "txt");
    const json = buildSessionRecapDownloadPayload(artifact, "json");

    expect(html.fileName).toBe("blackboard-room-recap.html");
    expect(html.content).toContain("We built something real.");

    expect(text.fileName).toBe("blackboard-room-recap.txt");
    expect(text.content).toContain("Captures: 3");

    expect(json.fileName).toBe("blackboard-room-recap.json");
    expect(JSON.parse(json.content)).toMatchObject({
      sessionLabel: "Blackboard Room",
      captureCount: 3,
    });
  });
});
