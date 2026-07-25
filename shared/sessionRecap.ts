export type RecapVoiceId = "recap-di" | "billy" | "architect" | "curator";

export type RecapCaptureShape = {
  id: string;
  title: string;
  content?: string;
  type?: string;
  surface?: string;
  metadata?: {
    context?: string;
    createdAt?: string;
    tags?: string[];
  };
};

export type RecapMessageShape = {
  role: "user" | "assistant";
  content: string;
};

type RecapVoiceProfile = {
  label: string;
  tone: string;
};

const INTERNAL_WARNING_STRINGS = [
  "[flattening language detected]",
  "[canned fallback detected]",
];

const RECAP_VOICES: Record<RecapVoiceId, RecapVoiceProfile> = {
  "recap-di": {
    label: "Recap DI",
    tone: "neutral, evidence-first, warm without being sentimental",
  },
  billy: {
    label: "Billy",
    tone: "warm collaborator, grounded, present, and specific",
  },
  architect: {
    label: "The Architect",
    tone: "structured, precise, and good at naming the shape of work",
  },
  curator: {
    label: "The Curator",
    tone: "reflective, evidence-linked, and attentive to what deserves to be held",
  },
};

export const RECAP_VOICE_OPTIONS = (
  Object.entries(RECAP_VOICES) as Array<[RecapVoiceId, RecapVoiceProfile]>
).map(([id, voice]) => ({
  id,
  label: voice.label,
  description: voice.tone,
}));

export function normalizeRecapVoice(value?: string | null): RecapVoiceId {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw in RECAP_VOICES) {
    return raw as RecapVoiceId;
  }

  return "recap-di";
}

export function getRecapVoiceLabel(voiceId: RecapVoiceId): string {
  return RECAP_VOICES[voiceId].label;
}

export function buildRecapSystemPrompt(voiceId: RecapVoiceId): string {
  const voice = RECAP_VOICES[voiceId];

  return [
    `You are ${voice.label}, a GestaltView recap voice.`,
    `Tone: ${voice.tone}.`,
    "Write directly and characterfully.",
    "Do not open with reflective preambles or self-disclaimers.",
    "Keep the user centered as the protagonist of the session.",
    "Return exactly one self-contained HTML file.",
  ].join("\n");
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"');
}

export function cleanRecapHtml(rawHtml: string): string {
  return rawHtml
    .trim()
    .replace(/^```html\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/\[(flattening language detected|canned fallback detected)\]/gi, "")
    .trim();
}

export function stripRecapHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function truncateText(value: string, limit: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }

  return `${trimmed.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

function formatCaptureEvidence(capture: RecapCaptureShape, index: number): string {
  const pieces = [`Capture ${index + 1}: ${capture.title}`];
  if (capture.id) {
    pieces.push(`id ${capture.id}`);
  }
  if (capture.surface) {
    pieces.push(`surface ${capture.surface}`);
  }
  if (capture.type) {
    pieces.push(`type ${capture.type}`);
  }
  return pieces.join(" · ");
}

function buildCaptureSentence(capture: RecapCaptureShape, index: number): string {
  const content = capture.content ? truncateText(capture.content, 180) : "This capture carried a thread the session kept returning to.";
  return `${index + 1}. ${capture.title}: ${content}`;
}

function buildConversationSignal(conversationHistory: RecapMessageShape[]): string {
  const recentUserMessage = [...conversationHistory].reverse().find((message) => message.role === "user");
  const recentAssistantMessage = [...conversationHistory].reverse().find((message) => message.role === "assistant");

  if (recentUserMessage && recentAssistantMessage) {
    return `The thread tightened around the exchange between “${truncateText(recentUserMessage.content, 120)}” and “${truncateText(recentAssistantMessage.content, 120)}”.`;
  }

  if (recentUserMessage) {
    return `The clearest question still humming in the room was “${truncateText(recentUserMessage.content, 140)}”.`;
  }

  if (recentAssistantMessage) {
    return `The most recent reflection still carries weight: “${truncateText(recentAssistantMessage.content, 140)}”.`;
  }

  return "The conversation stayed light enough that the captures had to carry the shape of the session on their own.";
}

function buildSignatureSentence(voiceId: RecapVoiceId, captures: RecapCaptureShape[], conversationHistory: RecapMessageShape[]): string {
  const suffix = captures.length > 0
    ? ` across ${captures.length} capture${captures.length === 1 ? "" : "s"}`
    : " without captures to lean on";

  if (voiceId === "billy") {
    return `Billy noticed the work getting clearer as it moved${suffix}, with just enough honesty to keep the next step visible.`;
  }

  if (voiceId === "architect") {
    return `The Architect noticed a session that settled into a cleaner structure${suffix}, with the edges of the next move finally in view.`;
  }

  if (voiceId === "curator") {
    return `The Curator noticed the parts worth preserving${suffix}, especially where the conversation and the captures started to echo each other.`;
  }

  if (conversationHistory.length > 0) {
    return `The recap voice noticed a session that moved from exploration toward shape${suffix}.`;
  }

  return `The recap voice noticed a compact session arc${suffix}, with enough signal to hold onto the next time through.`;
}

function buildTimelineMarkup(captures: RecapCaptureShape[]): string {
  if (captures.length === 0) {
    return `
      <div class="recap-timeline recap-timeline--empty">
        <div class="recap-timeline__marker recap-timeline__marker--empty"></div>
        <p>No capture timestamps were available, so this arc is shown as a quiet starting point.</p>
      </div>
    `;
  }

  return `
    <div class="recap-timeline">
      ${captures.map((capture, index) => `
        <article class="recap-timeline__item">
          <div class="recap-timeline__marker" aria-hidden="true">${index + 1}</div>
          <div class="recap-timeline__body">
            <strong>${escapeHtml(capture.title)}</strong>
            <span>${escapeHtml(capture.metadata?.createdAt || `Capture ${index + 1}`)}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

export function buildRecapFallbackHtml(
  captures: RecapCaptureShape[],
  conversationHistory: RecapMessageShape[] = [],
  sessionLabel = "",
  voiceId: RecapVoiceId = "recap-di",
): string {
  const label = sessionLabel.trim() || "Untitled Session";
  const captureCount = captures.length;
  const conversationCount = conversationHistory.length;
  const captureSummary = captures.slice(0, 3).map((capture, index) => buildCaptureSentence(capture, index));
  const worthHolding = captures.slice(0, 3);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());

  const whatWeBuilt = captureSummary.length > 0
    ? captureSummary
    : ["No captures were available, so the session's main build is the shared understanding that was formed in conversation."];

  const whatEmerged = [
    buildConversationSignal(conversationHistory),
    captureCount > 1
      ? `The capture set suggests a pattern of ${captures.slice(0, 2).map((capture) => capture.title).join(" and ")} arriving as a pair of signals rather than isolated notes.`
      : "The thread is still small, but it already points toward the next thing the room wanted to hold still long enough to see.",
  ];

  const whatsStillInMotion = conversationCount > 0
    ? [
        "A follow-up pass could turn the latest question into a tighter decision or a more focused next action.",
        "There is still room to turn the most recent exchange into a stronger artifact boundary.",
      ]
    : [
        "The next pass should gather a little more conversation so the arc has more shape around it.",
      ];

  const holdingItems = worthHolding.length > 0
    ? worthHolding
    : [{
        id: "conversation-signal",
        title: "Conversation signal",
        content: "The session did not surface captures, but the choice to recap it still says the thread mattered.",
        metadata: { context: "Fallback recap generated from available session context." },
      }];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(label)} · Recap</title>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap");
    :root {
      color-scheme: dark;
      --bg: #0a0a0f;
      --panel: rgba(14, 16, 28, 0.88);
      --panel-strong: rgba(18, 21, 38, 0.95);
      --cyan: #12D6FF;
      --violet: #BF00FF;
      --text: rgba(255, 255, 255, 0.92);
      --muted: rgba(255, 255, 255, 0.66);
      --line: rgba(255, 255, 255, 0.12);
      --shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top left, rgba(18, 214, 255, 0.16), transparent 34%),
        radial-gradient(circle at top right, rgba(191, 0, 255, 0.18), transparent 28%),
        linear-gradient(180deg, #0a0a0f 0%, #0d1020 100%);
      color: var(--text);
      font-family: "DM Sans", system-ui, sans-serif;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
      background-size: 44px 44px;
      mask-image: linear-gradient(180deg, rgba(0,0,0,0.45), transparent 80%);
    }
    main {
      position: relative;
      width: min(1120px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 32px 0 48px;
    }
    .hero, .section, .footer {
      border: 1px solid var(--line);
      border-radius: 28px;
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
      box-shadow: var(--shadow);
      backdrop-filter: blur(16px);
    }
    .hero {
      padding: 28px;
      margin-bottom: 18px;
    }
    .eyebrow, .kicker, .meta, .timeline-label, .signature {
      font-family: "Space Mono", ui-monospace, monospace;
    }
    .eyebrow {
      margin: 0 0 12px;
      font-size: 11px;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.52);
    }
    h1, h2, h3 {
      margin: 0;
      line-height: 1.05;
    }
    h1 {
      font-size: clamp(2.4rem, 4vw, 4.5rem);
      max-width: 12ch;
    }
    .lede {
      margin: 14px 0 0;
      max-width: 68ch;
      color: var(--muted);
      font-size: 1.02rem;
      line-height: 1.6;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 12px;
      margin-top: 22px;
    }
    .meta-card {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      background: rgba(0, 0, 0, 0.2);
      padding: 14px 16px;
    }
    .meta-card .meta {
      display: block;
      font-size: 10px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.54);
      margin-bottom: 8px;
    }
    .meta-card strong {
      display: block;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
    }
    .section {
      padding: 24px 28px;
      margin-top: 18px;
    }
    .section h2 {
      font-size: 1.35rem;
      margin-bottom: 12px;
    }
    .section p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
    }
    .summary-list {
      display: grid;
      gap: 12px;
      margin: 16px 0 0;
      padding: 0;
      list-style: none;
    }
    .summary-list li {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      padding: 14px 16px;
      background: rgba(0, 0, 0, 0.18);
      line-height: 1.6;
    }
    .summary-list strong {
      color: rgba(255, 255, 255, 0.92);
    }
    .recap-timeline {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }
    .recap-timeline__item {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 14px;
      align-items: start;
    }
    .recap-timeline__marker {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid rgba(18, 214, 255, 0.22);
      background: linear-gradient(180deg, rgba(18, 214, 255, 0.18), rgba(191, 0, 255, 0.12));
      color: white;
      font-family: "Space Mono", ui-monospace, monospace;
      font-size: 0.8rem;
    }
    .recap-timeline__body {
      padding-top: 4px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding-bottom: 14px;
    }
    .recap-timeline__body strong {
      display: block;
      font-size: 1rem;
    }
    .recap-timeline__body span {
      display: block;
      margin-top: 4px;
      font-family: "Space Mono", ui-monospace, monospace;
      font-size: 0.76rem;
      color: rgba(255,255,255,0.54);
    }
    .holding-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
      margin-top: 16px;
    }
    details.holding-card {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.2);
      padding: 14px 16px;
      transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
    }
    details.holding-card[open] {
      background: rgba(255,255,255,0.04);
      border-color: rgba(18, 214, 255, 0.2);
    }
    details.holding-card:hover {
      transform: translateY(-1px);
    }
    details.holding-card summary {
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      font-weight: 700;
    }
    details.holding-card summary::-webkit-details-marker {
      display: none;
    }
    .holding-copy {
      margin-top: 12px;
      color: var(--muted);
      line-height: 1.7;
    }
    .evidence {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.08);
      font-family: "Space Mono", ui-monospace, monospace;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.58);
    }
    .signature {
      margin-top: 16px;
      color: rgba(255,255,255,0.72);
      font-size: 0.82rem;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .footer {
      margin-top: 18px;
      padding: 18px 22px;
      color: rgba(255,255,255,0.55);
      font-size: 0.92rem;
      line-height: 1.7;
    }
    @media (max-width: 700px) {
      main {
        width: min(100vw - 20px, 1120px);
        padding: 16px 0 28px;
      }
      .hero, .section, .footer {
        border-radius: 22px;
      }
      .hero, .section {
        padding: 20px;
      }
      .recap-timeline__item {
        grid-template-columns: 38px 1fr;
      }
      .recap-timeline__marker {
        width: 38px;
        height: 38px;
      }
      details.holding-card summary {
        flex-direction: column;
      }
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <p class="eyebrow">Session Recap · ${escapeHtml(voiceId)}</p>
      <h1>${escapeHtml(label)}</h1>
      <p class="lede">Generated on ${escapeHtml(dateLabel)} from ${captureCount} capture${captureCount === 1 ? "" : "s"} and ${conversationCount} conversation turn${conversationCount === 1 ? "" : "s"}. This is the resilient fallback recap, built to keep the session readable even when the live provider path is unavailable.</p>
      <div class="meta-grid">
        <div class="meta-card">
          <span class="meta">Session label</span>
          <strong>${escapeHtml(label)}</strong>
        </div>
        <div class="meta-card">
          <span class="meta">Capture count</span>
          <strong>${captureCount}</strong>
        </div>
        <div class="meta-card">
          <span class="meta">Conversation turns</span>
          <strong>${conversationCount}</strong>
        </div>
        <div class="meta-card">
          <span class="meta">Recap voice</span>
          <strong>${escapeHtml(getRecapVoiceLabel(voiceId))}</strong>
        </div>
      </div>
    </section>

    <section class="section">
      <h2>What we built</h2>
      <ul class="summary-list">
        ${whatWeBuilt.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>What emerged</h2>
      <p>${escapeHtml(whatEmerged[0])}</p>
      <ul class="summary-list">
        ${whatEmerged.slice(1).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section class="section">
      <h2>What's still in motion</h2>
      <ul class="summary-list">
        ${whatsStillInMotion.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      <div class="timeline-label" style="margin-top: 18px;">Session arc</div>
      ${buildTimelineMarkup(captures)}
    </section>

    <section class="section">
      <h2>Worth holding</h2>
      <div class="holding-grid">
        ${holdingItems.map((capture, index) => {
          const title = capture.title || `Moment ${index + 1}`;
          const evidence = formatCaptureEvidence(capture, index);
          const content = capture.content ? truncateText(capture.content, 240) : "This moment stayed resonant even without a long written trail.";
          return `
            <details class="holding-card"${index === 0 ? " open" : ""}>
              <summary>
                <span>${escapeHtml(title)}</span>
                <span class="kicker">${escapeHtml(truncateText(content, 96))}</span>
              </summary>
              <div class="holding-copy">${escapeHtml(content)}</div>
              <div class="evidence">Evidence: ${escapeHtml(evidence)}${capture.metadata?.context ? ` · ${escapeHtml(capture.metadata.context)}` : ""}</div>
            </details>
          `;
        }).join("")}
      </div>
      <p class="signature">${escapeHtml(buildSignatureSentence(voiceId, captures, conversationHistory))}</p>
    </section>

    <section class="footer">
      This fallback recap was rendered locally from the session context so the artifact stays usable even if the live HTML generator is unavailable.
    </section>
  </main>
</body>
</html>`;
}

export function validateRecapHtml(html: string): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const normalized = normalizeText(html);
  const text = normalizeText(stripRecapHtml(html));

  if (!/<html[\s>]/i.test(html) && !/<!doctype html/i.test(html)) {
    errors.push("missing_html_shell");
  }

  if (!/<body[\s>]/i.test(html)) {
    errors.push("missing_body");
  }

  for (const section of [
    "what we built",
    "what emerged",
    "what's still in motion",
    "worth holding",
  ]) {
    if (!text.includes(section)) {
      errors.push(`missing_section:${section}`);
    }
  }

  if (
    /(^|\n)\s*#{1,6}\s/.test(stripRecapHtml(html)) ||
    /(^|\n)\s*[-*+]\s+/.test(stripRecapHtml(html)) ||
    /(^|\n)\s*\d+\.\s+/.test(stripRecapHtml(html)) ||
    /```/.test(html)
  ) {
    errors.push("contains_raw_markdown");
  }

  if (INTERNAL_WARNING_STRINGS.some((warning) => normalized.includes(warning))) {
    errors.push("contains_internal_warning");
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function buildRecapPrompt(
  captures: RecapCaptureShape[],
  conversationHistory: RecapMessageShape[] = [],
  sessionLabel = "",
  attemptNote = "",
): string {
  const captureBlock = captures
    .map((capture, index) => {
      const lines = [
        `[${index + 1}] ${capture.title}`,
        capture.type ? `  Type: ${capture.type}` : null,
        capture.surface ? `  Surface: ${capture.surface}` : null,
        capture.metadata?.context ? `  Context: ${capture.metadata.context}` : null,
        capture.content
          ? `  Content: ${capture.content.slice(0, 400)}${capture.content.length > 400 ? "…" : ""}`
          : null,
        capture.metadata?.createdAt ? `  Captured: ${capture.metadata.createdAt}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return lines;
    })
    .join("\n\n");

  const conversationBlock =
    conversationHistory.length > 0
      ? conversationHistory
          .slice(-20)
          .map((message) => `${message.role === "user" ? "User" : "Billy"}: ${message.content.slice(0, 300)}`)
          .join("\n")
      : "(No conversation history provided)";

  return [
    "You are the selected GestaltView recap voice for this session.",
    "",
    "Write directly and characterfully. Do not open with reflective preambles like \"what I'm hearing is\" or with self-disclaimers about being a conversational embodiment. Keep the user centered as the protagonist of the session.",
    "",
    `SESSION LABEL: ${sessionLabel || "Untitled Session"}`,
    "",
    `CAPTURES FROM THIS SESSION (${captures.length} total):`,
    captureBlock || "(No captures)",
    "",
    "RECENT CONVERSATION EXCERPT:",
    conversationBlock,
    "",
    "─────────────────────────────────────────────────────────────",
    "GENERATE a single self-contained HTML file that serves as this session's living recap.",
    "",
    "REQUIREMENTS:",
    "1. Neural Aurora aesthetic: obsidian background (#0a0a0f), cyan (#12D6FF), violet (#BF00FF), warm white text. Subtle glows, no harsh contrast.",
    "2. Warm, not clinical. This is a personal artifact, not a report. Write in the selected voice with honesty, groundedness, and presence.",
    "3. SECTIONS TO INCLUDE (adapt based on what actually happened):",
    "   - Session header: label, date, capture count",
    "   - \"What we built\" — concrete artifacts, decisions made, things completed",
    "   - \"What emerged\" — patterns Billy noticed, connections between captures, insights that surfaced",
    "   - \"What's still in motion\" — threads that didn't resolve, open questions worth returning to",
    "   - \"Worth holding\" — 2–3 fragments or moments the selected voice thinks deserve to survive into the museum",
    "4. Make it INTERACTIVE: expandable sections, hover states, smooth scroll. At minimum, each \"Worth holding\" card should be clickable/expandable. Any app-specific interaction must degrade gracefully outside GestaltView and must not depend on localStorage, parent window access, or sandbox exceptions.",
    "5. Each significant claim and each \"Worth holding\" moment should include a compact evidence drill-down or disclosure that points back to the relevant capture title or id.",
    "6. Do not leave markdown syntax in the output. Convert headings, emphasis, lists, and callouts into real HTML elements rather than raw markdown text.",
    "7. Include a subtle timeline bar showing the arc of the session if timestamps are available.",
    "8. Typography: use Google Fonts — 'Space Mono' for labels/mono, 'DM Sans' for body. Load via @import.",
    "9. NO external JS frameworks. Vanilla HTML/CSS/JS only. Must be self-contained.",
    "10. Max ~400 lines. Tight, beautiful, not bloated.",
    "11. End with a small signature sentence in the selected voice — one honest sentence about what it noticed about this session.",
    "",
    "TONE: Warm collaborator reflecting on shared work. Not a productivity summary. Not a report. A companion piece the user will actually want to return to.",
    "",
    "Return ONLY the complete HTML. No preamble, no explanation, no markdown fences.",
    attemptNote ? "" : null,
    attemptNote || null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");
}
