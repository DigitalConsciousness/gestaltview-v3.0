// © 2026 Keith Soyka — GestaltView
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { ExhibitDefinition } from "@/data/exhibits";

export interface BillyDemoContextDescriptor {
  id: string;
  label: string;
  prompt: string;
}

interface ExhibitDemosProps {
  exhibit: ExhibitDefinition;
  colorHex: string;
  onActiveContextChange?: (context: BillyDemoContextDescriptor) => void;
}

interface DemoMessage {
  role: "user" | "assistant";
  text: string;
}

interface DemoCardProps {
  title: string;
  subtitle: string;
  body: string;
  colorHex: string;
}

const CONTEXT_BY_EXHIBIT: Partial<Record<ExhibitDefinition["slug"], BillyDemoContextDescriptor[]>> = {

  symbiocoder: [
    {
      id: "symbiocoder-architecture",
      label: "Architecture first",
      prompt: "Guide the user through architecture boundaries, service contracts, and first commit scope.",
    },
    {
      id: "symbiocoder-ship-slice",
      label: "Ship slice",
      prompt: "Return the smallest production-safe feature slice with explicit validation checks.",
    },
  ],
  "vibe-coder": [
    {
      id: "vibe-concept",
      label: "Concept signal",
      prompt: "Extract the concept signal without rewriting the user's original language.",
    },
    {
      id: "vibe-feedback",
      label: "Feedback loop",
      prompt: "Build a tight implementation-feedback loop that preserves creative momentum.",
    },
  ],
  "alzheimers-legacy": [
    {
      id: "alzheimers-caregiver",
      label: "Caregiver support",
      prompt: "Prioritize practical caregiver support with calm and dignity-preserving communication.",
    },
    {
      id: "alzheimers-memory",
      label: "Memory continuity",
      prompt: "Offer gentle memory continuity structures for family narratives and identity anchoring.",
    },
  ],
  "addiction-recovery": [
    {
      id: "recovery-grounding",
      label: "Immediate grounding",
      prompt: "Lead with immediate stabilization and concrete grounding steps.",
    },
    {
      id: "recovery-reflection",
      label: "Reflection lane",
      prompt: "Provide non-judgmental reflection prompts with harm-reduction framing.",
    },
  ],
  "ai-collab-engine": [
    {
      id: "collab-isolation",
      label: "Isolation lanes",
      prompt: "Explain independent model lanes and why isolation reduces confirmation bias.",
    },
    {
      id: "collab-convergence",
      label: "Convergence checks",
      prompt: "Explain how tribunal convergence scoring validates decision confidence.",
    },
  ],
  "adhd-powerup": [
    {
      id: "adhd-capture",
      label: "Capture first",
      prompt: "Preserve exact wording and convert raw thoughts into a capture-safe backlog.",
    },
    {
      id: "adhd-next-step",
      label: "One next step",
      prompt: "Return one realistic next step and one fallback action if energy drops.",
    },
  ],
  "creation-corner": [
    {
      id: "creation-seed",
      label: "Seed capture",
      prompt: "Capture the creation seed exactly and avoid compression during first pass.",
    },
    {
      id: "creation-weave",
      label: "Loom prompts",
      prompt: "Suggest gentle loom prompts that preserve nuance while adding shape.",
    },
  ],
  "interactive-tapestry": [
    {
      id: "tapestry-threading",
      label: "Thread mapping",
      prompt: "Map isolated fragments into thread groups with explicit relationships.",
    },
    {
      id: "tapestry-emergence",
      label: "Pattern emergence",
      prompt: "Describe emergent pattern and the next action that best preserves momentum.",
    },
  ],
  "insight-bot": [
    {
      id: "insight-retrieval",
      label: "Retrieval lens",
      prompt: "Prioritize relevance-ranked retrieval with confidence-aware language.",
    },
    {
      id: "insight-continuity",
      label: "Continuity",
      prompt: "Preserve context continuity while summarizing high-signal insights.",
    },
  ],
};

const DemoCard = ({ title, subtitle, body, colorHex }: DemoCardProps) => {
  return (
    <article
      className="rounded-xl border p-4"
      style={{ borderColor: `${colorHex}35`, background: "rgba(5,10,14,0.92)" }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: colorHex }}>
        {subtitle}
      </p>
      <h3 className="mt-1 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/75">{body}</p>
    </article>
  );
};

const SymbioCoderDemo = ({ colorHex }: { colorHex: string }) => {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {
      role: "assistant",
      text: "SymbioCoder lens online. Share a build target and I will return architecture + first ship slice.",
    },
  ]);
  const [input, setInput] = useState<string>("");

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const response =
      "Proposed implementation track: (1) define user-intent contract, (2) ship minimum component shell, (3) integrate route + fallback envelope, (4) validate type/build path, (5) instrument polish pass.";

    setMessages((previous) => [...previous, { role: "user", text: trimmed }, { role: "assistant", text: response }]);
    setInput("");
  };

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">SymbioCoder Demo</p>
      <div className="mt-4 max-h-[300px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/30 p-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
              {message.role === "user" ? "Builder" : "SymbioCoder"}
            </p>
            <p
              className="mt-1 inline-block max-w-[95%] rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: message.role === "user" ? `${colorHex}70` : "rgba(255,255,255,0.14)",
                color: message.role === "user" ? colorHex : "rgba(255,255,255,0.84)",
                background: message.role === "user" ? `${colorHex}14` : "rgba(0,0,0,0.34)",
              }}
            >
              {message.text}
            </p>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={2}
          className="w-full resize-none rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm text-white outline-none"
          placeholder="Describe what you want to build..."
        />
        <button
          type="submit"
          className="rounded-xl border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
          style={{ borderColor: `${colorHex}80`, color: colorHex, background: `${colorHex}12` }}
        >
          Synthesize
        </button>
      </form>
    </section>
  );
};

const VibeCoderDemo = ({ colorHex }: { colorHex: string }) => {
  const vibeLanes = ["Concept signal", "Creative constraint", "First build slice", "Tight feedback loop"];

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Vibe Coder Demo</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {vibeLanes.map((lane, index) => (
          <DemoCard
            key={lane}
            title={lane}
            subtitle={`lane 0${index + 1}`}
            body="This lane transforms emotional intent into implementation clarity without collapsing your original language signal."
            colorHex={colorHex}
          />
        ))}
      </div>
    </section>
  );
};

const ADHDPowerUpDemo = ({ colorHex }: { colorHex: string }) => {
  const [drops, setDrops] = useState<string[]>([]);
  const [draft, setDraft] = useState<string>("");

  const captureDrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    setDrops((previous) => [trimmed, ...previous]);
    setDraft("");
  };

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">External Scaffold Of You</p>
      <p className="mt-2 text-sm text-white/75">Lightning-bolt capture first. Prioritize later. No thought compression.</p>
      <form onSubmit={captureDrop} className="mt-4 flex flex-col gap-3">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm text-white outline-none"
          placeholder="Drop the thought exactly as it arrived..."
        />
        <button
          type="submit"
          className="w-fit rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
          style={{ borderColor: `${colorHex}80`, color: colorHex }}
        >
          Capture
        </button>
      </form>
      <ul className="mt-4 space-y-2">
        {drops.map((drop, index) => (
          <li key={`${drop.slice(0, 24)}-${index}`} className="rounded-lg border border-white/15 bg-black/25 p-3 text-sm text-white/80">
            {drop}
          </li>
        ))}
      </ul>
    </section>
  );
};

const RecoverySupportDemo = ({ colorHex, label }: { colorHex: string; label: string }) => {
  const anchors = [
    "Breathe in for four, out for six.",
    "Name three concrete facts in your immediate environment.",
    "Text one trusted person with your current location.",
  ];

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{label}</p>
      <div className="mt-4 rounded-xl border border-[#F87171]/45 bg-[#F87171]/10 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#F87171]">Never Look Away resources</p>
        <ul className="mt-2 space-y-1 text-sm text-white/85">
          <li>• US & Canada crisis support: call or text 988.</li>
          <li>• If immediate danger is present, call emergency services now.</li>
          <li>• Ask a trusted person to stay with you through this moment.</li>
        </ul>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {anchors.map((anchor, index) => (
          <DemoCard key={anchor} title={`Grounding Step ${index + 1}`} subtitle="stabilization" body={anchor} colorHex={colorHex} />
        ))}
      </div>
    </section>
  );
};

const AICollabMapDemo = ({ colorHex }: { colorHex: string }) => {
  const nodes = [
    { id: "Mirror", detail: "Intent capture" },
    { id: "Architect", detail: "Constraint encoding" },
    { id: "Witness", detail: "Synthesis scoring" },
    { id: "Guardian", detail: "Evidence check" },
  ];

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">AI Collab Engine Demo</p>
      <p className="mt-2 text-sm text-white/75">Tribunal-map preview adapted from the glow-up collaboration concepts.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {nodes.map((node) => (
          <DemoCard key={node.id} title={node.id} subtitle="tribunal node" body={node.detail} colorHex={colorHex} />
        ))}
      </div>
    </section>
  );
};

const CreationCornerDemo = ({ colorHex }: { colorHex: string }) => {
  const [seed, setSeed] = useState<string>("");
  const [output, setOutput] = useState<string>("");

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Creation Corner Demo</p>
      <textarea
        value={seed}
        onChange={(event) => setSeed(event.target.value)}
        rows={3}
        className="mt-4 w-full resize-none rounded-xl border border-white/20 bg-black/35 px-3 py-2 text-sm text-white outline-none"
        placeholder="Drop a creation seed..."
      />
      <button
        type="button"
        onClick={() => {
          const trimmed = seed.trim();
          if (!trimmed) return;
          setOutput(`Seed captured: ${trimmed}\n\nLoom output:\n- Core signal\n- Emotional voltage\n- Next build motion`);
        }}
        className="mt-3 rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.2em]"
        style={{ borderColor: `${colorHex}80`, color: colorHex }}
      >
        Weave Seed
      </button>
      {output && <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/15 bg-black/30 p-3 text-sm text-white/80">{output}</pre>}
    </section>
  );
};

const InteractiveTapestryDemo = ({ colorHex }: { colorHex: string }) => {
  const threads = ["Memory", "Pattern", "Evidence", "Intent", "Emergence"];
  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Interactive Tapestry Demo</p>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        {threads.map((thread, index) => (
          <div
            key={thread}
            className="rounded-lg border p-3 text-center"
            style={{ borderColor: `${colorHex}50`, background: `rgba(0,0,0,${0.2 + index * 0.06})` }}
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Thread {index + 1}</p>
            <p className="mt-2 text-sm text-white/85">{thread}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

const InsightBotDemo = ({ colorHex }: { colorHex: string }) => {
  const insightRows = [
    "Most recent signal: recurring collaboration themes.",
    "Confidence lane: documented / timestamp-confirmed evidence only.",
    "Suggested action: open Codex scroll for doctrine alignment.",
  ];

  return (
    <section className="rounded-2xl border p-5" style={{ borderColor: `${colorHex}35` }}>
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Insight-Bot Demo</p>
      <ul className="mt-4 space-y-2">
        {insightRows.map((row) => (
          <li key={row} className="rounded-lg border border-white/15 bg-black/25 p-3 text-sm text-white/80">
            {row}
          </li>
        ))}
      </ul>
    </section>
  );
};

const ExhibitDemos = ({ exhibit, colorHex, onActiveContextChange }: ExhibitDemosProps) => {
  const contextDescriptors = useMemo<BillyDemoContextDescriptor[]>(() => {
    return CONTEXT_BY_EXHIBIT[exhibit.slug] ?? [];
  }, [exhibit.slug]);

  const [activeContextId, setActiveContextId] = useState<string>(contextDescriptors[0]?.id ?? "");

  useEffect(() => {
    setActiveContextId(contextDescriptors[0]?.id ?? "");
  }, [contextDescriptors]);

  const activeContext = useMemo<BillyDemoContextDescriptor | null>(() => {
    if (!contextDescriptors.length) return null;
    return contextDescriptors.find((context) => context.id === activeContextId) ?? contextDescriptors[0];
  }, [activeContextId, contextDescriptors]);

  useEffect(() => {
    if (activeContext && onActiveContextChange) {
      onActiveContextChange(activeContext);
    }
  }, [activeContext, onActiveContextChange]);

  const content = useMemo(() => {
    switch (exhibit.slug) {
      case "symbiocoder":
        return <SymbioCoderDemo colorHex={colorHex} />;
      case "vibe-coder":
        return <VibeCoderDemo colorHex={colorHex} />;
      case "adhd-powerup":
        return <ADHDPowerUpDemo colorHex={colorHex} />;
      case "addiction-recovery":
        return <RecoverySupportDemo colorHex={colorHex} label="For Life's Hard Parts: Pull String" />;
      case "alzheimers-legacy":
        return <RecoverySupportDemo colorHex={colorHex} label="Memory Continuity" />;
      case "ai-collab-engine":
        return <AICollabMapDemo colorHex={colorHex} />;
      case "creation-corner":
        return <CreationCornerDemo colorHex={colorHex} />;
      case "interactive-tapestry":
        return <InteractiveTapestryDemo colorHex={colorHex} />;
      case "insight-bot":
        return <InsightBotDemo colorHex={colorHex} />;
      default:
        return null;
    }
  }, [exhibit.slug, colorHex]);

  if (!content) {
    return null;
  }

  return (
    <>
      {contextDescriptors.length > 0 && (
        <section className="mb-4 rounded-2xl border p-4" style={{ borderColor: `${colorHex}35`, background: "rgba(5,10,14,0.75)" }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">Billy Steward Focus</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {contextDescriptors.map((context) => {
              const isActive = context.id === activeContext?.id;
              return (
                <button
                  key={context.id}
                  type="button"
                  onClick={() => setActiveContextId(context.id)}
                  className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em]"
                  style={{
                    borderColor: isActive ? `${colorHex}90` : "rgba(255,255,255,0.22)",
                    color: isActive ? colorHex : "rgba(255,255,255,0.72)",
                    background: isActive ? `${colorHex}18` : "rgba(0,0,0,0.24)",
                  }}
                >
                  {context.label}
                </button>
              );
            })}
          </div>
          {activeContext && <p className="mt-3 text-xs text-white/70">{activeContext.prompt}</p>}
        </section>
      )}
      {content}
    </>
  );
};

export default ExhibitDemos;
