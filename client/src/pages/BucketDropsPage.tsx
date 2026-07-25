// © 2026 Keith Soyka — GestaltView
import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useBillySection } from "@/components/Billy";
import BillyChip from "@/components/BillyChip";
import { useSEO, PAGE_SEO } from "@/hooks/useSEO";
import BucketDrops from "@/components/BucketDrops";

export default function BucketDropsPage() {
  useSEO(PAGE_SEO.bucketDrops);
  const billyRef = useBillySection("bucket-drops");

  return (
    <div
      className="relative min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at 18% 22%, rgba(18,214,255,0.09), transparent 28%), radial-gradient(circle at 80% 12%, rgba(191,0,255,0.10), transparent 26%), #030304",
      }}
    >
      {/* Ambient grid layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div ref={billyRef} className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6">
        {/* Nav row */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/sanctuary">
            <a className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Sanctuary
            </a>
          </Link>
          <BillyChip context="bucket-drops" />
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10">
              <Gift className="h-7 w-7 text-emerald-400" />
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-emerald-300/70">
            Bucket Drops
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Sealed messages of love for the future.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/58">
            Zero friction. Drop something now — it can be routed to Blackboard, External Scaffold,
            or the Inner World any time after.
          </p>
        </motion.div>

        {/* Room links */}
        <div className="mb-8 flex flex-wrap gap-2">
          {[
            { href: "/blackboard-room", label: "Blackboard Room" },
            { href: "/external-scaffold", label: "External Scaffold" },
            { href: "/dynamic-inner-world", label: "Dynamic Inner World" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}>
              <a className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/58 transition-colors hover:text-white">
                {label}
              </a>
            </Link>
          ))}
        </div>

        <BucketDrops />
      </div>
    </div>
  );
}
