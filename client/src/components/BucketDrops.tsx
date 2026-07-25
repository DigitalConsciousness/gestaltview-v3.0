// © 2026 Keith Soyka — GestaltView
// BucketDrops.tsx — Zero-friction capture entry. Feeds the shared Scaffold orb model.
// Every drop becomes a CaptureOrb with stage "raw" + origin "bucket_drop".
import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Lock, Unlock, Calendar, FileText, Music, Video, ArrowRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  appendSavedCapture,
  appendScaffoldQueue,
  createCaptureOrb,
  readSavedCaptures,
  writeSavedCaptures,
  removeSavedCapture,
  type CaptureOrb,
} from "@/components/Scaffold";
import {
  buildBucketDropCaptureContext,
  bucketDropRecordToOrb,
  createBucketDropOnServer,
  loadBucketDropsFromServer,
  mergeBucketDropOrbs,
  type BucketDropContentType,
  type BucketDropMeta,
  type BucketDropOrb,
} from "@/lib/bucketDrops";

// ─── Types ───────────────────────────────────────────────────────────────────

// ─── Helpers ─────────────────────────────────────────────────────────────────

function releaseSummary(meta: BucketDropMeta): string {
  if (meta.releaseDate) return `Release on ${new Date(meta.releaseDate).toLocaleDateString()}`;
  if (meta.releaseTrigger) return `Trigger: ${meta.releaseTrigger.replace(/_/g, " ")}`;
  return "Manual release";
}

function contentIcon(ct: BucketDropContentType) {
  if (ct === "audio") return Music;
  if (ct === "video") return Video;
  return FileText;
}

function isBucketDropOrb(orb: CaptureOrb): orb is BucketDropOrb {
  return orb.metadata?.bucketDrop != null;
}

function readBucketDropOrbs(): BucketDropOrb[] {
  return readSavedCaptures().filter(isBucketDropOrb);
}

function createBucketDropOrb(
  content: string,
  ct: BucketDropContentType,
  meta: BucketDropMeta,
): BucketDropOrb | null {
  const base = createCaptureOrb({
    text: content,
    source: "typed",
    type: ct === "audio" ? "audio" : ct === "video" ? "context" : "memory",
    action: "save",
    context: `For: ${meta.recipient}`,
    meaning: "Sealed message of love for the future",
    anchor: "bucket-drop",
  });
  if (!base) return null;
  return {
    ...base,
    metadata: {
      ...base.metadata,
      bucketDrop: meta,
    },
  } as BucketDropOrb;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BucketDrops() {
  const [, setLocation] = useLocation();
  const [drops, setDrops] = useState<BucketDropOrb[]>(() => readBucketDropOrbs());
  const [showCreate, setShowCreate] = useState(false);

  const refresh = useCallback(() => setDrops(readBucketDropOrbs()), []);

  useEffect(() => {
    let cancelled = false;

    const syncFromServer = async () => {
      const bucketDrops = await loadBucketDropsFromServer();
      if (cancelled || !bucketDrops) {
        return;
      }

      const hydrated = bucketDrops
        .map(bucketDropRecordToOrb)
        .filter((drop): drop is BucketDropOrb => drop != null);
      const merged = mergeBucketDropOrbs(readSavedCaptures(), hydrated);
      writeSavedCaptures(merged);
      if (!cancelled) {
        setDrops(merged.filter(isBucketDropOrb));
      }
    };

    void syncFromServer();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = useCallback(
    async (content: string, ct: BucketDropContentType, meta: BucketDropMeta) => {
      const orb = createBucketDropOrb(content, ct, meta);
      if (!orb) return;
      const captureContext = buildBucketDropCaptureContext(meta, ct, orb.id);
      appendSavedCapture({ ...orb, status: "saved" });
      void createBucketDropOnServer({
        id: orb.id,
        content: orb.text,
        rawText: orb.text,
        captureContext,
      });
      refresh();
      setShowCreate(false);
      toast.success("Drop sealed", {
        description: `For: ${meta.recipient}`,
        action: {
          label: "Open Blackboard",
          onClick: () => setLocation("/blackboard-room"),
        },
      });
    },
    [refresh, setLocation],
  );

  const handleSendToScaffold = useCallback(
    (orb: BucketDropOrb) => {
      appendScaffoldQueue({ ...orb, status: "pending" });
      refresh();
      toast.success("Sent to External Scaffold", {
        description: orb.title,
        action: { label: "Open scaffold", onClick: () => setLocation("/external-scaffold") },
      });
    },
    [refresh, setLocation],
  );

  const handleDelete = useCallback(
    (orbId: string) => {
      removeSavedCapture(orbId);
      refresh();
      toast.message("Drop removed");
    },
    [refresh],
  );

  const sealed = drops.filter((d) => d.metadata.bucketDrop.isSealed).length;
  const readyToRelease = drops.filter((d) => {
    const rd = d.metadata.bucketDrop.releaseDate;
    return rd && new Date(rd) <= new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Drops", value: drops.length, color: "text-emerald-400" },
          { label: "Sealed", value: sealed, color: "text-cyan-400" },
          { label: "Ready to Release", value: readyToRelease, color: "text-fuchsia-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.04] p-4 text-center">
            <p className={`text-2xl font-semibold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-white/48">{label}</p>
          </div>
        ))}
      </div>

      {/* Create button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/12 px-5 py-2.5 text-sm text-emerald-50 transition-colors hover:bg-emerald-300/18"
        >
          <Gift className="h-4 w-4" />
          Seal a new Drop
        </button>
      </div>

      {/* Drops grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {drops.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full rounded-[1.5rem] border border-white/10 bg-black/20 p-8 text-center text-sm text-white/40"
            >
              No drops yet. Seal something worth keeping.
            </motion.div>
          ) : (
            drops.map((drop) => (
              <DropCard
                key={drop.id}
                drop={drop}
                onSendToScaffold={handleSendToScaffold}
                onDelete={handleDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <CreateDropModal
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Drop Card ────────────────────────────────────────────────────────────────

function DropCard({
  drop,
  onSendToScaffold,
  onDelete,
}: {
  drop: BucketDropOrb;
  onSendToScaffold: (orb: BucketDropOrb) => void;
  onDelete: (id: string) => void;
}) {
  const meta = drop.metadata.bucketDrop;
  const Icon = contentIcon(
    (drop.type === "audio" ? "audio" : drop.type === "context" ? "video" : "text") as BucketDropContentType,
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] overflow-hidden"
    >
      {/* Header band */}
      <div
        className="p-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(18,214,255,0.14) 0%, rgba(191,0,255,0.10) 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/14 bg-black/30">
            {meta.isSealed ? (
              <Lock className="h-4 w-4 text-cyan-300" />
            ) : (
              <Unlock className="h-4 w-4 text-white/60" />
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">For: {meta.recipient}</p>
            <p className="text-xs text-white/52">
              {meta.isSealed ? "Sealed" : "Open"}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white/40" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/40">{drop.type}</span>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-white/70">{drop.text}</p>

        <div className="space-y-1 text-xs text-white/38">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            <span>{new Date(drop.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gift className="h-3 w-3" />
            <span>{releaseSummary(meta)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onSendToScaffold(drop)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
          >
            <ArrowRight className="h-3 w-3" />
            Send to Scaffold
          </button>
          <button
            type="button"
            onClick={() => onDelete(drop.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-rose-50 transition-colors hover:bg-rose-300/16"
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

function CreateDropModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (content: string, ct: BucketDropContentType, meta: BucketDropMeta) => void;
}) {
  const [content, setContent] = useState("");
  const [ct, setCt] = useState<BucketDropContentType>("text");
  const [recipient, setRecipient] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [releaseTrigger, setReleaseTrigger] = useState("");

  const valid = content.trim().length > 0 && recipient.trim().length > 0;

  return (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 16 }}
        className="w-full max-w-2xl rounded-[2rem] border border-white/12 bg-[#0A0F14] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-300/70">New Bucket Drop</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Seal something worth keeping.</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] p-2 text-white/50 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/48">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your message, recipe, story, or instructions..."
              rows={5}
              className="w-full resize-none rounded-[1.2rem] border border-white/10 bg-black/35 p-4 text-sm leading-relaxed text-white outline-none placeholder:text-white/28 focus:border-emerald-300/30"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/48">Recipient</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Who is this for?"
                className="w-full rounded-[1rem] border border-white/10 bg-black/35 p-3 text-sm text-white outline-none placeholder:text-white/28 focus:border-emerald-300/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/48">Content type</label>
              <select
                value={ct}
                onChange={(e) => setCt(e.target.value as BucketDropContentType)}
                className="w-full rounded-[1rem] border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-emerald-300/30"
              >
                <option value="text">Text / Message</option>
                <option value="audio">Audio Recording</option>
                <option value="video">Video Message</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/48">Release date (optional)</label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full rounded-[1rem] border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-emerald-300/30"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-white/48">Release trigger (optional)</label>
              <select
                value={releaseTrigger}
                onChange={(e) => setReleaseTrigger(e.target.value)}
                className="w-full rounded-[1rem] border border-white/10 bg-black/35 p-3 text-sm text-white outline-none focus:border-emerald-300/30"
              >
                <option value="">Choose trigger…</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="graduation">Graduation</option>
                <option value="wedding">Wedding</option>
                <option value="cooking_session">Cooking Session</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onCreate(content.trim(), ct, {
                recipient: recipient.trim(),
                releaseDate: releaseDate || undefined,
                releaseTrigger: releaseTrigger || undefined,
                isSealed: true,
              })
            }
            disabled={!valid}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/14 px-5 py-2.5 text-sm text-emerald-50 transition-colors hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Lock className="h-4 w-4" />
            Seal Drop
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
