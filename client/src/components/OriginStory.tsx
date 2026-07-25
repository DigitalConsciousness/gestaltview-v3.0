import React from "react";
import { BookOpen, Clock3, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { GlassCard } from "@/components/ui/GlassCard";
import { PAGE_SEO, useSEO } from "@/hooks/useSEO";
import {
  formatOriginEventDate,
  ORIGIN_EVENTS,
  ORIGIN_EVENTS_VERSION,
  ORIGIN_STORY_MARKDOWN,
} from "@/lib/originStoryContent";
import { cn } from "@/lib/utils";
import FloatingEmbers from "@/components/FloatingEmbers";
import FogOverlay from "@/components/FogOverlay";

const markdownComponents = {
  h1: ({ className, ...props }: React.ComponentProps<"h1">) => (
    <h1 className={cn("mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl", className)} {...props} />
  ),
  h2: ({ className, ...props }: React.ComponentProps<"h2">) => (
    <h2 className={cn("mt-8 mb-3 text-2xl font-semibold tracking-tight text-white", className)} {...props} />
  ),
  h3: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("mt-6 mb-2 text-lg font-semibold text-cyan-100", className)} {...props} />
  ),
  p: ({ className, ...props }: React.ComponentProps<"p">) => (
    <p className={cn("mb-4 leading-7 text-white/72", className)} {...props} />
  ),
  li: ({ className, ...props }: React.ComponentProps<"li">) => (
    <li className={cn("mb-2 leading-7 text-white/72", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className={cn("my-5 border-l-2 border-cyan-300/20 bg-cyan-300/[0.05] px-4 py-3 text-white/78", className)}
      {...props}
    />
  ),
  a: ({ className, ...props }: React.ComponentProps<"a">) => (
    <a
      className={cn("text-cyan-200 underline decoration-cyan-300/30 underline-offset-4 hover:text-white", className)}
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  sup: ({ className, ...props }: React.ComponentProps<"sup">) => (
    <sup className={cn("text-cyan-200", className)} {...props} />
  ),
  table: ({ className, ...props }: React.ComponentProps<"table">) => (
    <div className="my-5 overflow-x-auto rounded-[1.1rem] border border-white/10 bg-black/28">
      <table className={cn("min-w-full border-collapse text-left text-sm", className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: React.ComponentProps<"th">) => (
    <th className={cn("border-b border-white/10 bg-white/[0.04] px-3 py-2 font-medium text-white/88", className)} {...props} />
  ),
  td: ({ className, ...props }: React.ComponentProps<"td">) => (
    <td className={cn("border-b border-white/8 px-3 py-2 align-top text-white/72", className)} {...props} />
  ),
};

function OriginTimeline() {
  return (
    <div className="grid gap-4">
      {ORIGIN_EVENTS.map((event) => (
        <GlassCard key={`${event.date}-${event.title}`} glow="cyan" intensity="low" hover={false} className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/55">
                {formatOriginEventDate(event.date)}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{event.title}</h3>
            </div>
            {event.evidence_link ? (
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/44">
                Evidence: {event.evidence_link}
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-6 text-white/68">{event.description}</p>
        </GlassCard>
      ))}
    </div>
  );
}

function LittleThingsMatter() {
  return (
    <GlassCard glow="electricPurple" intensity="medium" hover={false} className="p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-violet-100/65">Little Things Matter</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Bucket Drops and the PLK</h3>
      <div className="mt-4 space-y-4 text-sm leading-6 text-white/70">
        <div>
          <p className="font-semibold text-cyan-100">Bucket Drops</p>
          <p>Catch the spark before it cools. The first version of the idea gets to exist without being polished into oblivion.</p>
        </div>
        <div>
          <p className="font-semibold text-cyan-100">Personal Language Key</p>
          <p>Keep the user's language in the room. Meaning should survive the round trip instead of being translated into a generic summary.</p>
        </div>
      </div>
      <div className="mt-5 rounded-[1.1rem] border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/52">
        GestaltView was built to protect the small things that help the large things make sense.
      </div>
    </GlassCard>
  );
}

export function OriginStory() {
  useSEO(PAGE_SEO.origin);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <FloatingEmbers />
      <FogOverlay />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(0,229,255,0.11), transparent 26%), radial-gradient(circle at 85% 10%, rgba(176,38,255,0.11), transparent 28%), radial-gradient(circle at 50% 80%, rgba(255,215,0,0.05), transparent 30%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72 transition-colors hover:border-white/20 hover:text-white"
          >
            Home
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/44">
            <Sparkles className="size-3.5 text-cyan-200" />
            Version {ORIGIN_EVENTS_VERSION}
          </div>
        </header>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-100/58">Foundational narrative</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                GestaltView began as a way to hold the work without losing the person inside it.
              </h1>
              <p className="max-w-3xl text-base leading-7 text-white/68 sm:text-lg">
                The origin story is the background music of the runtime. It explains why the system cares about evidence, sequence, language, and the little details that keep a story true.
              </p>
            </div>

            <GlassCard glow="cyan" intensity="high" hover={false} className="p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/12">
                  <BookOpen className="size-4 text-cyan-100" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/58">Narrative</p>
                  <div className="prose prose-invert prose-p:mb-4 prose-li:my-0 prose-headings:scroll-mt-24 mt-4 max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                      {ORIGIN_STORY_MARKDOWN}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <aside className="space-y-6">
            <LittleThingsMatter />

            <GlassCard glow="teal" intensity="medium" hover={false} className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/55">What this page is for</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-white/70">
                <p>It gives new collaborators the human context behind the runtime.</p>
                <p>It links the practical evidence work to the methods the platform still uses.</p>
                <p>It keeps the story available in the app, not only in the docs archive.</p>
              </div>
            </GlassCard>
          </aside>
        </section>

        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <Clock3 className="size-4 text-cyan-200" />
            <h2 className="text-xl font-semibold text-white">Origin timeline</h2>
          </div>
          <OriginTimeline />
        </section>
      </div>
    </main>
  );
}

export default OriginStory;
