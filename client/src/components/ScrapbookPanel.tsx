import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import BillyMarkdown from "@/components/BillyMarkdown";
import { uploadUserFileToServer } from "@/lib/fileStorage";
import {
  appendUserFile,
  createId,
  createUserFileRecord,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";
import {
  loadSanctuaryScrapbookFromServer,
  saveSanctuaryScrapbookItemToServer,
  type SanctuaryScrapbookRecord,
} from "@/lib/sanctuaryContent";

type ScrapbookItem = {
  id: string;
  fileId: string;
  name: string;
  caption: string;
  kind: "image" | "text" | "note" | "poem" | "binary";
  preview: string;
  mimeType: string;
  createdAt: string;
};

const SCRAPBOOK_STORAGE_KEY = "gv.sanctuary.scrapbook.v1";
const SCRAPBOOK_CAPTION_DEBOUNCE_MS = 500;

function readStoredItems(): ScrapbookItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SCRAPBOOK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScrapbookItem[]) : [];
  } catch {
    return [];
  }
}

function writeStoredItems(items: ScrapbookItem[]): void {
  try {
    window.localStorage.setItem(SCRAPBOOK_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage failures in private mode or restrictive environments.
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

function deriveKindFromNameAndMime(name: string, mimeType = ""): ScrapbookItem["kind"] {
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.startsWith("text/") || /\.(md|markdown|txt|poem|html|htm)$/i.test(name)) {
    if (/poem/i.test(name)) {
      return "poem";
    }
    if (/note/i.test(name)) {
      return "note";
    }
    return "text";
  }

  return "binary";
}

function createCaption(file: File, text: string): string {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
  if (firstLine) {
    return firstLine.length > 96 ? `${firstLine.slice(0, 93).trim()}…` : firstLine;
  }

  return file.name.replace(/\.[^.]+$/, "") || file.name;
}

function materializeScrapbookItem(record: SanctuaryScrapbookRecord): ScrapbookItem {
  const file = record.file;
  const name = file?.name ?? record.caption?.trim() ?? "Scrapbook item";
  const mimeType = file?.mimeType ?? "application/octet-stream";
  const kind = file ? deriveKindFromNameAndMime(file.name, file.mimeType) : "binary";
  const preview = file
    ? file.previewUrl ?? file.previewHtml ?? file.previewText ?? record.caption ?? name
    : record.caption ?? name;

  return {
    id: record.id,
    fileId: record.fileId ?? file?.id ?? "",
    name,
    caption: record.caption ?? "",
    kind,
    preview,
    mimeType,
    createdAt: record.createdAt,
  };
}

function fileToPreviewValue(file: UserFileRecord, kind: ScrapbookItem["kind"]): string {
  if (kind === "image") {
    return file.previewUrl ?? file.dataUrl ?? file.previewText ?? "";
  }

  return file.previewText ?? file.previewHtml ?? file.previewUrl ?? "";
}

function isMarkdownScrapbookItem(item: ScrapbookItem): boolean {
  return item.name.toLowerCase().endsWith(".md") || item.name.toLowerCase().endsWith(".markdown") || item.mimeType.toLowerCase().includes("markdown");
}

export default function ScrapbookPanel() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captionTimersRef = useRef<Record<string, number>>({});
  const latestCaptionRef = useRef<Record<string, string>>({});
  const initialItems = useMemo(() => readStoredItems(), []);
  const [items, setItems] = useState<ScrapbookItem[]>(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(initialItems[0]?.id ?? null);
  const selectedItem = useMemo(() => items.find((item) => item.id === selectedItemId) ?? items[0] ?? null, [items, selectedItemId]);

  useEffect(() => {
    writeStoredItems(items);
  }, [items]);

  useEffect(() => {
    return () => {
      Object.values(captionTimersRef.current).forEach((timerId) => window.clearTimeout(timerId));
      captionTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      if (!user?.id) {
        return;
      }

      const remoteItems = await loadSanctuaryScrapbookFromServer();
      if (cancelled || !remoteItems || remoteItems.length === 0) {
        return;
      }

      const nextItems = remoteItems.map(materializeScrapbookItem);
      const localItems = readStoredItems();
      if (localItems.length === 0) {
        setItems(nextItems);
        setSelectedItemId((current) => {
          if (current && nextItems.some((item) => item.id === current)) {
            return current;
          }
          return nextItems[0]?.id ?? null;
        });
        return;
      }

      const localIds = new Set(localItems.map((item) => item.id));
      const remoteOnlyItems = nextItems.filter((item) => !localIds.has(item.id));
      const mergedItems = [...remoteOnlyItems, ...localItems];

      if (mergedItems.length !== localItems.length) {
        setItems(mergedItems);
        setSelectedItemId((current) => {
          if (current && mergedItems.some((item) => item.id === current)) {
            return current;
          }
          return mergedItems[0]?.id ?? null;
        });
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const syncScrapbookItem = async (item: ScrapbookItem, caption: string) => {
    if (!user?.id) {
      return;
    }

    const remoteItem = await saveSanctuaryScrapbookItemToServer({
      itemId: item.id,
      fileId: item.fileId,
      caption: caption.trim() || null,
    });

    if (!remoteItem) {
      if (latestCaptionRef.current[item.id] === caption) {
        toast.error("Could not sync the scrapbook item. Your local copy was kept.");
      }
      return;
    }

    if (latestCaptionRef.current[item.id] !== caption) {
      return;
    }

    const nextItem = materializeScrapbookItem(remoteItem);
    setItems((current) => current.map((entry) => (entry.id === nextItem.id ? nextItem : entry)));
  };

  const scheduleCaptionSync = (item: ScrapbookItem, caption: string) => {
    if (captionTimersRef.current[item.id]) {
      window.clearTimeout(captionTimersRef.current[item.id]);
    }

    captionTimersRef.current[item.id] = window.setTimeout(() => {
      delete captionTimersRef.current[item.id];
      void syncScrapbookItem(item, caption);
    }, SCRAPBOOK_CAPTION_DEBOUNCE_MS);
  };

  const addItem = async (file: File) => {
    if (!user?.id) {
      toast.error("Sign in to add scrapbook items.");
      return;
    }

    const kind = deriveKindFromNameAndMime(file.name, file.type);
    const text = kind === "image" ? "" : await readFileAsText(file).catch(() => "");
    const preview = kind === "image" ? await readFileAsDataUrl(file) : text;
    const caption = createCaption(file, text || file.name);
    const fileRecord = createUserFileRecord({
      userId: user.id,
      file,
      roomOrigin: "blackboard",
      previewText: kind === "image" ? caption : text,
      previewHtml: kind === "image" ? undefined : text,
      dataUrl: kind === "image" ? preview : undefined,
      previewUrl: kind === "image" ? preview : undefined,
    });

    const uploadedFile = await uploadUserFileToServer({
      file: fileRecord,
      content: kind === "image" ? caption : text,
      base64DataUrl: kind === "image" ? preview : undefined,
    });
    const fileSynced = Boolean(uploadedFile);
    const persistedFile = uploadedFile ?? fileRecord;

    appendUserFile(persistedFile);

    const item: ScrapbookItem = {
      id: createId("scrapbook"),
      fileId: persistedFile.id,
      name: file.name,
      caption,
      kind,
      preview: fileToPreviewValue(persistedFile, kind),
      mimeType: file.type || "application/octet-stream",
      createdAt: new Date().toISOString(),
    };

    setItems((current) => [item, ...current].slice(0, 120));
    setSelectedItemId(item.id);

    if (fileSynced) {
      const remoteItem = await saveSanctuaryScrapbookItemToServer({
        itemId: item.id,
        fileId: persistedFile.id,
        caption: item.caption,
      });

      if (remoteItem) {
        const nextItem = materializeScrapbookItem(remoteItem);
        setItems((current) => current.map((entry) => (entry.id === nextItem.id ? nextItem : entry)));
      } else {
        toast.error("Saved the file, but the scrapbook copy couldn't sync.");
      }

      toast.success("Saved to File Explorer.");
    } else {
      toast.error("Could not sync the file to File Explorer. Kept a local copy.");
    }
  };

  const updateCaption = (itemId: string, caption: string) => {
    const currentItem = items.find((item) => item.id === itemId);
    latestCaptionRef.current[itemId] = caption;
    setItems((current) => current.map((item) => (item.id === itemId ? { ...item, caption } : item)));

    if (currentItem) {
      scheduleCaptionSync(currentItem, caption);
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gv-text-primary">Scrapbook</p>
          <p className="mt-1 text-xs text-gv-text-muted">Images, notes, and poems stay private.</p>
        </div>

        <button
          type="button"
          onClick={openPicker}
          className="inline-flex items-center gap-2 rounded-full border border-gv-aurora-emerald/25 bg-gv-aurora-emerald/10 px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-gv-aurora-emerald/14"
        >
          <ImagePlus className="h-4 w-4" />
          Add something
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.md,.markdown,.html,.htm,.poem"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) {
            return;
          }

          try {
            await addItem(file);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not add item.");
          }
        }}
      />

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.length > 0 ? (
          items.map((item) => {
            const active = item.id === selectedItem?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                className={`overflow-hidden rounded-[1.4rem] border p-3 text-left transition-all ${
                  active
                    ? "border-gv-aurora-cyan/30 bg-gv-bg-deep/90 shadow-[0_0_0_1px_rgba(6,182,212,0.15)]"
                    : "border-white/10 bg-gv-bg-deep/70 hover:border-white/20"
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-[1rem] border border-white/10 bg-black/30">
                  {item.kind === "image" ? (
                    <img src={item.preview} alt={item.caption || item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 py-5 text-sm leading-6 text-gv-text-secondary">
                      <p className="line-clamp-4">{item.preview || item.name}</p>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-sm font-semibold text-gv-text-primary">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-gv-text-muted">{item.caption}</p>
              </button>
            );
          })
        ) : (
          <div className="col-span-full rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-gv-text-muted">
            Add an image, note, or poem. It will stay in the Scrapbook and in File Explorer.
          </div>
        )}
      </div>

      {selectedItem ? (
        <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gv-text-primary">{selectedItem.name}</p>
              <p className="mt-1 text-xs text-gv-text-muted">{selectedItem.mimeType}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gv-text-secondary">
              {selectedItem.kind}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="overflow-hidden rounded-[1.25rem] border border-white/10 bg-gv-bg-deep/70">
              {selectedItem.kind === "image" ? (
                <img
                  src={selectedItem.preview}
                  alt={selectedItem.caption || selectedItem.name}
                  className="max-h-[420px] w-full object-contain"
                />
              ) : isMarkdownScrapbookItem(selectedItem) ? (
                <BillyMarkdown
                  content={selectedItem.preview}
                  className="max-h-[420px] overflow-auto p-4 text-sm leading-7 text-gv-text-secondary"
                />
              ) : (
                <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap p-4 text-sm leading-7 text-gv-text-secondary">
                  {selectedItem.preview}
                </pre>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.22em] text-gv-text-muted">
                Caption
                <input
                  value={selectedItem.caption}
                  onChange={(event) => updateCaption(selectedItem.id, event.target.value)}
                  className="mt-2 w-full rounded-full border border-white/10 bg-black/30 px-4 py-3 text-sm text-gv-text-primary outline-none transition-colors focus:border-gv-aurora-cyan/30"
                />
              </label>
              <div className="rounded-[1.1rem] border border-gv-aurora-emerald/20 bg-gv-aurora-emerald/10 p-4 text-sm leading-6 text-gv-text-secondary">
                The Scrapbook is private. The file is in File Explorer. The note stays here.
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gv-text-muted">
                <Sparkles className="h-3.5 w-3.5 text-gv-aurora-cyan" />
                Added {new Date(selectedItem.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
