import React, { useState, useCallback, useRef, useEffect } from "react";

// ─── Neural Aurora Design Tokens ──────────────────────────────────────────────
const NA_TOKENS = {
  "--color-obsidian": "#0a0a0f",
  "--color-obsidian-mid": "#12121a",
  "--color-obsidian-light": "#1a1a2e",
  "--color-cyan": "#00d4ff",
  "--color-cyan-dim": "#00a8cc",
  "--color-violet": "#7b2fff",
  "--color-violet-dim": "#5a1fcc",
  "--color-amber": "#ffaa00",
  "--color-text-primary": "#e8e8f0",
  "--color-text-secondary": "#9090b0",
  "--color-border": "#2a2a3e",
  "--font-primary": "'Inter', sans-serif",
  "--font-mono": "'JetBrains Mono', monospace",
  "--font-display": "'Space Grotesk', sans-serif",
  "--font-accent": "'Syne', sans-serif",
};

// ─── CRT Scanline CSS (injected into preview iframes) ─────────────────────────
const CRT_CSS = `
  body::after {
    content: '';
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }
`;

// ─── Corner Accent Component (Neural Aurora) ──────────────────────────────────
const CornerAccents: React.FC<{ color?: string }> = ({ color = "#00d4ff" }) => (
  <>
    {[
      { top: 0, left: 0, borderTop: true, borderLeft: true },
      { top: 0, right: 0, borderTop: true, borderRight: true },
      { bottom: 0, left: 0, borderBottom: true, borderLeft: true },
      { bottom: 0, right: 0, borderBottom: true, borderRight: true },
    ].map((pos, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          width: 16,
          height: 16,
          ...pos,
          borderTop: pos.borderTop ? `2px solid ${color}` : undefined,
          borderBottom: pos.borderBottom ? `2px solid ${color}` : undefined,
          borderLeft: pos.borderLeft ? `2px solid ${color}` : undefined,
          borderRight: pos.borderRight ? `2px solid ${color}` : undefined,
        }}
      />
    ))}
  </>
);

// ─── Sandboxed iframe preview ─────────────────────────────────────────────────
const LivePreview: React.FC<{ html: string; tokens: Record<string, string> }> = ({
  html,
  tokens,
}) => {
  const cssVars = Object.entries(tokens)
    .map(([k, v]) => `${k}: ${v};`)
    .join("\n    ");

  const doc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;600;700&family=Syne:wght@400;700&display=swap" rel="stylesheet"/>
<style>
  :root {
    ${cssVars}
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--color-obsidian);
    color: var(--color-text-primary);
    font-family: var(--font-primary);
    min-height: 100vh;
    padding: 24px;
  }
  ${CRT_CSS}
</style>
</head>
<body>
${html}
</body>
</html>`;

  return (
    <iframe
      sandbox="allow-scripts allow-same-origin"
      srcDoc={doc}
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "#0a0a0f",
        borderRadius: 4,
      }}
      title="Live Preview"
    />
  );
};

// ─── Tab: JSX / HTML Scratchpad ───────────────────────────────────────────────
const ScratchpadTab: React.FC = () => {
  const [code, setCode] = useState(`<!-- Neural Aurora Scratchpad -->
<div style="
  background: var(--color-obsidian-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 24px;
  max-width: 480px;
  position: relative;
">
  <h2 style="
    font-family: var(--font-display);
    color: var(--color-cyan);
    font-size: 1.4rem;
    margin-bottom: 8px;
  ">GestaltView</h2>
  <p style="
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.6;
  ">Making the invisible visible — holding space for everything.</p>
  <div style="
    margin-top: 16px;
    display: flex;
    gap: 12px;
  ">
    <button style="
      background: var(--color-violet);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-family: var(--font-primary);
      font-size: 0.85rem;
      cursor: pointer;
    ">Primary</button>
    <button style="
      background: transparent;
      color: var(--color-cyan);
      border: 1px solid var(--color-cyan);
      border-radius: 6px;
      padding: 8px 16px;
      font-family: var(--font-primary);
      font-size: 0.85rem;
      cursor: pointer;
    ">Outline</button>
  </div>
</div>`);

  const [tokens] = useState(NA_TOKENS);

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      {/* Editor */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          HTML / Inline CSS Editor
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            background: "#12121a",
            color: "#e8e8f0",
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            padding: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.8rem",
            lineHeight: 1.6,
            resize: "none",
            outline: "none",
            tabSize: 2,
          }}
        />
      </div>

      {/* Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Live Preview
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <LivePreview html={code} tokens={tokens} />
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Neural Aurora Token Tester ──────────────────────────────────────────
const TokenTesterTab: React.FC = () => {
  const [tokens, setTokens] = useState<Record<string, string>>(NA_TOKENS);

  const colorTokens = Object.entries(tokens).filter(([k]) =>
    k.includes("color")
  );
  const fontTokens = Object.entries(tokens).filter(([k]) =>
    k.includes("font")
  );

  const previewHtml = `
<div style="display:flex;flex-direction:column;gap:20px;max-width:560px;">
  <!-- Typography -->
  <div style="background:var(--color-obsidian-light);border:1px solid var(--color-border);border-radius:8px;padding:20px;position:relative;">
    <h1 style="font-family:var(--font-display);color:var(--color-text-primary);font-size:1.8rem;font-weight:700;margin-bottom:4px;">Display Heading</h1>
    <h2 style="font-family:var(--font-accent);color:var(--color-cyan);font-size:1.2rem;font-weight:400;margin-bottom:8px;">Accent Subheading</h2>
    <p style="font-family:var(--font-primary);color:var(--color-text-secondary);font-size:0.9rem;line-height:1.7;">Body text in primary font. GestaltView holds space for the whole person — every contradiction, every layer.</p>
    <code style="font-family:var(--font-mono);color:var(--color-amber);font-size:0.8rem;display:block;margin-top:12px;">const plk = new PersonalLanguageKey();</code>
  </div>
  <!-- Colors -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
    <div style="background:var(--color-cyan);border-radius:6px;height:48px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#000;font-family:var(--font-mono);">cyan</div>
    <div style="background:var(--color-violet);border-radius:6px;height:48px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#fff;font-family:var(--font-mono);">violet</div>
    <div style="background:var(--color-amber);border-radius:6px;height:48px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:#000;font-family:var(--font-mono);">amber</div>
    <div style="background:var(--color-obsidian-light);border:1px solid var(--color-border);border-radius:6px;height:48px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;color:var(--color-text-secondary);font-family:var(--font-mono);">obsidian</div>
  </div>
  <!-- Buttons -->
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <button style="background:var(--color-violet);color:white;border:none;border-radius:6px;padding:10px 20px;font-family:var(--font-primary);font-size:0.9rem;cursor:pointer;">Primary Action</button>
    <button style="background:transparent;color:var(--color-cyan);border:1px solid var(--color-cyan);border-radius:6px;padding:10px 20px;font-family:var(--font-primary);font-size:0.9rem;cursor:pointer;">Outline</button>
    <button style="background:var(--color-obsidian-light);color:var(--color-text-secondary);border:1px solid var(--color-border);border-radius:6px;padding:10px 20px;font-family:var(--font-primary);font-size:0.9rem;cursor:pointer;">Ghost</button>
  </div>
</div>`;

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      {/* Token Controls */}
      <div
        style={{
          width: 280,
          flexShrink: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Design Tokens
        </div>

        <div
          style={{
            fontSize: "0.65rem",
            color: "#7b2fff",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 4,
            marginTop: 8,
          }}
        >
          — Colors —
        </div>
        {colorTokens.map(([key, val]) => (
          <div
            key={key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <input
              type="color"
              value={val.startsWith("#") ? val : "#0a0a0f"}
              onChange={(e) =>
                setTokens((prev) => ({ ...prev, [key]: e.target.value }))
              }
              style={{
                width: 28,
                height: 28,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                background: "transparent",
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#00d4ff",
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {key}
              </div>
              <div
                style={{
                  fontSize: "0.6rem",
                  color: "#9090b0",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {val}
              </div>
            </div>
          </div>
        ))}

        <div
          style={{
            fontSize: "0.65rem",
            color: "#7b2fff",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 4,
            marginTop: 12,
          }}
        >
          — Fonts —
        </div>
        {fontTokens.map(([key, val]) => (
          <div
            key={key}
            style={{
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                color: "#00d4ff",
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 2,
              }}
            >
              {key}
            </div>
            <input
              type="text"
              value={val}
              onChange={(e) =>
                setTokens((prev) => ({ ...prev, [key]: e.target.value }))
              }
              style={{
                width: "100%",
                background: "#12121a",
                color: "#e8e8f0",
                border: "1px solid #2a2a3e",
                borderRadius: 4,
                padding: "4px 8px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.7rem",
                outline: "none",
              }}
            />
          </div>
        ))}

        <button
          onClick={() => setTokens(NA_TOKENS)}
          style={{
            marginTop: 16,
            background: "transparent",
            color: "#9090b0",
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            padding: "6px 12px",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            cursor: "pointer",
          }}
        >
          Reset to Defaults
        </button>
      </div>

      {/* Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Live Preview
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <LivePreview html={previewHtml} tokens={tokens} />
        </div>
      </div>
    </div>
  );
};

// ─── Tab: Component Gallery ────────────────────────────────────────────────────
const GALLERY_COMPONENTS = [
  {
    label: "Billy Chat Bubble",
    html: `<div style="display:flex;flex-direction:column;gap:12px;max-width:400px;">
  <div style="background:var(--color-obsidian-light);border:1px solid var(--color-border);border-radius:12px 12px 12px 4px;padding:14px 18px;max-width:85%;">
    <p style="color:var(--color-text-primary);font-size:0.9rem;line-height:1.6;">I see you. All of it — not just the parts that are easy to hold.</p>
    <span style="color:var(--color-text-secondary);font-size:0.7rem;font-family:var(--font-mono);">Billy · now</span>
  </div>
  <div style="background:var(--color-violet);border-radius:12px 12px 4px 12px;padding:14px 18px;max-width:85%;align-self:flex-end;">
    <p style="color:white;font-size:0.9rem;line-height:1.6;">That's the one. That's exactly it.</p>
  </div>
</div>`,
  },
  {
    label: "Bucket Drop Card",
    html: `<div style="background:var(--color-obsidian-light);border:1px solid var(--color-cyan-dim);border-radius:8px;padding:16px;max-width:360px;position:relative;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
    <div style="width:8px;height:8px;border-radius:50%;background:var(--color-cyan);box-shadow:0 0 8px var(--color-cyan);"></div>
    <span style="font-family:var(--font-mono);font-size:0.7rem;color:var(--color-cyan);">BUCKET DROP</span>
    <span style="font-family:var(--font-mono);font-size:0.65rem;color:var(--color-text-secondary);margin-left:auto;">08:14 AM</span>
  </div>
  <p style="color:var(--color-text-primary);font-size:0.9rem;line-height:1.6;margin-bottom:10px;">The relay race metaphor IS the front door. Two hands. Something new arrives. The choice of what to drop is impossible.</p>
  <div style="display:flex;gap:8px;">
    <span style="background:rgba(0,212,255,0.1);color:var(--color-cyan);border-radius:4px;padding:3px 8px;font-size:0.7rem;font-family:var(--font-mono);">PLK</span>
    <span style="background:rgba(123,47,255,0.1);color:var(--color-violet);border-radius:4px;padding:3px 8px;font-size:0.7rem;font-family:var(--font-mono);">onboarding</span>
  </div>
</div>`,
  },
  {
    label: "Neural Aurora Card",
    html: `<div style="background:var(--color-obsidian-light);border:1px solid var(--color-border);border-radius:8px;padding:24px;max-width:360px;position:relative;">
  <div style="position:absolute;top:0;left:0;width:14px;height:14px;border-top:2px solid var(--color-cyan);border-left:2px solid var(--color-cyan);border-radius:2px 0 0 0;"></div>
  <div style="position:absolute;top:0;right:0;width:14px;height:14px;border-top:2px solid var(--color-cyan);border-right:2px solid var(--color-cyan);border-radius:0 2px 0 0;"></div>
  <div style="position:absolute;bottom:0;left:0;width:14px;height:14px;border-bottom:2px solid var(--color-cyan);border-left:2px solid var(--color-cyan);border-radius:0 0 0 2px;"></div>
  <div style="position:absolute;bottom:0;right:0;width:14px;height:14px;border-bottom:2px solid var(--color-cyan);border-right:2px solid var(--color-cyan);border-radius:0 0 2px 0;"></div>
  <h3 style="font-family:var(--font-display);color:var(--color-text-primary);font-size:1.1rem;margin-bottom:6px;">Knowledge Fragment</h3>
  <p style="color:var(--color-text-secondary);font-size:0.85rem;line-height:1.6;margin-bottom:16px;">Embedding dimension: 768 · Source: PLK v5.1 · Similarity: 0.94</p>
  <div style="height:3px;background:linear-gradient(90deg,var(--color-violet),var(--color-cyan));border-radius:2px;"></div>
</div>`,
  },
  {
    label: "Status Badge Row",
    html: `<div style="display:flex;flex-wrap:wrap;gap:10px;">
  <span style="background:rgba(0,212,255,0.1);color:var(--color-cyan);border:1px solid rgba(0,212,255,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-family:var(--font-mono);">● ACTIVE</span>
  <span style="background:rgba(123,47,255,0.1);color:var(--color-violet);border:1px solid rgba(123,47,255,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-family:var(--font-mono);">⬡ BUILDING</span>
  <span style="background:rgba(255,170,0,0.1);color:var(--color-amber);border:1px solid rgba(255,170,0,0.3);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-family:var(--font-mono);">⚠ BLOCKER</span>
  <span style="background:rgba(144,144,176,0.1);color:var(--color-text-secondary);border:1px solid rgba(144,144,176,0.2);border-radius:20px;padding:4px 14px;font-size:0.75rem;font-family:var(--font-mono);">○ PENDING</span>
</div>`,
  },
];

const GalleryTab: React.FC = () => {
  const [selected, setSelected] = useState(0);
  const [editedHtml, setEditedHtml] = useState(GALLERY_COMPONENTS[0].html);

  useEffect(() => {
    setEditedHtml(GALLERY_COMPONENTS[selected].html);
  }, [selected]);

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      {/* Component List */}
      <div
        style={{
          width: 200,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Components
        </div>
        {GALLERY_COMPONENTS.map((c, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            style={{
              background: selected === i ? "rgba(0,212,255,0.08)" : "transparent",
              color: selected === i ? "#00d4ff" : "#9090b0",
              border: `1px solid ${selected === i ? "rgba(0,212,255,0.3)" : "#2a2a3e"}`,
              borderRadius: 6,
              padding: "8px 12px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.8rem",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Edit
        </div>
        <textarea
          value={editedHtml}
          onChange={(e) => setEditedHtml(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            background: "#12121a",
            color: "#e8e8f0",
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            padding: 16,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.75rem",
            lineHeight: 1.6,
            resize: "none",
            outline: "none",
          }}
        />
      </div>

      {/* Preview */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#9090b0",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Preview
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #2a2a3e",
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <LivePreview html={editedHtml} tokens={NA_TOKENS} />
        </div>
      </div>
    </div>
  );
};

// ─── Root Page ─────────────────────────────────────────────────────────────────
type TabId = "scratchpad" | "tokens" | "gallery";

const TABS: { id: TabId; label: string; accent: string }[] = [
  { id: "scratchpad", label: "Scratchpad", accent: "#00d4ff" },
  { id: "tokens", label: "Design Tokens", accent: "#7b2fff" },
  { id: "gallery", label: "Component Gallery", accent: "#ffaa00" },
];

const SandboxPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("scratchpad");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e8e8f0",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 20,
        gap: 16,
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          padding: "16px 20px",
          background: "#12121a",
          border: "1px solid #2a2a3e",
          borderRadius: 8,
          flexShrink: 0,
        }}
      >
        <CornerAccents color="#7b2fff" />
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "#e8e8f0",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            UI/UX Sandbox
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.7rem",
              color: "#9090b0",
              margin: "2px 0 0",
            }}
          >
            Neural Aurora · Live Edit &amp; Preview
          </p>
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.65rem",
            color: "#00d4ff",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 4,
            padding: "4px 10px",
          }}
        >
          ● LIVE
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background:
                activeTab === tab.id
                  ? `rgba(${tab.accent === "#00d4ff" ? "0,212,255" : tab.accent === "#7b2fff" ? "123,47,255" : "255,170,0"},0.1)`
                  : "transparent",
              color: activeTab === tab.id ? tab.accent : "#9090b0",
              border: `1px solid ${activeTab === tab.id ? tab.accent + "55" : "#2a2a3e"}`,
              borderRadius: 6,
              padding: "8px 18px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.85rem",
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, minHeight: 0, height: "calc(100vh - 200px)" }}>
        {activeTab === "scratchpad" && <ScratchpadTab />}
        {activeTab === "tokens" && <TokenTesterTab />}
        {activeTab === "gallery" && <GalleryTab />}
      </div>
    </div>
  );
};

export default SandboxPage;
