import { useMemo, useState } from "react";
import { ChevronRight, Filter, FolderOpen, Grid2x2, Search, Trash2, Pin, ArrowUpRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fileKindLabel,
  formatFileRecordSize,
  roomOriginLabel,
  type FileRoomOrigin,
  type UserFileKind,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";

type Props = {
  files: UserFileRecord[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
  onOpenInBlackboardRoom: (file: UserFileRecord) => void;
  onPinToInnerWorld: (file: UserFileRecord) => void;
  onDeleteFile: (fileId: string) => void;
  onCopyShareLink?: (file: UserFileRecord) => void | Promise<void>;
  className?: string;
};

const ORIGIN_OPTIONS: (FileRoomOrigin | "all")[] = ["all", "blackboard", "creation_corner", "dynamic_inner_world", "external_scaffold", "unknown"];

export default function FileExplorer({
  files,
  selectedFileId,
  onSelectFile,
  onOpenInBlackboardRoom,
  onPinToInnerWorld,
  onDeleteFile,
  onCopyShareLink,
  className,
}: Props) {
  const [query, setQuery] = useState("");
  const [originFilter, setOriginFilter] = useState<FileRoomOrigin | "all">("all");
  const [kindFilter, setKindFilter] = useState<UserFileKind | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? files[0] ?? null,
    [files, selectedFileId],
  );

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    files.forEach((file) => {
      file.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [files]);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return files.filter((file) => {
      if (originFilter !== "all" && file.roomOrigin !== originFilter) {
        return false;
      }

      if (kindFilter !== "all" && file.kind !== kindFilter) {
        return false;
      }

      if (tagFilter && !file.tags.includes(tagFilter)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchable = [file.name, file.mimeType, file.roomOrigin, file.kind, ...file.tags].join(" ").toLowerCase();
      return searchable.includes(normalizedQuery);
    });
  }, [files, kindFilter, originFilter, query, tagFilter]);

  const kinds = useMemo(() => {
    const counts = new Map<UserFileKind, number>();
    files.forEach((file) => {
      counts.set(file.kind, (counts.get(file.kind) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [files]);

  return (
    <section className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#12D6FF]">Library</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Files arranged like a living collection.</h3>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/56">
            Search, sort, and pin from a shelf that stays readable without turning into a utility maze.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/52">
          {filteredFiles.length} files
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="space-y-4 rounded-[1.35rem] border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
            <Search className="h-4 w-4 text-white/42" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search files"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/42">
              <FolderOpen className="h-3.5 w-3.5" />
              Rooms
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {ORIGIN_OPTIONS.map((origin) => {
                const active = originFilter === origin;
                return (
                  <button
                    key={origin}
                    type="button"
                    onClick={() => setOriginFilter(origin)}
                    className={cn(
                      "rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                      active ? "border-cyan-200/30 bg-cyan-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white",
                    )}
                  >
                    {origin === "all" ? "All" : roomOriginLabel(origin)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/42">
              <Grid2x2 className="h-3.5 w-3.5" />
              Types
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setKindFilter("all")}
                className={cn(
                  "rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                  kindFilter === "all" ? "border-fuchsia-200/30 bg-fuchsia-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white",
                )}
              >
                All
              </button>
              {kinds.map(([kind, count]) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setKindFilter(kind)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                    kindFilter === kind ? "border-fuchsia-200/30 bg-fuchsia-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white",
                  )}
                >
                  {fileKindLabel(kind)} · {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/42">
              <Filter className="h-3.5 w-3.5" />
              Tags
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTagFilter(null)}
                className={cn(
                  "rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                  tagFilter === null ? "border-emerald-200/30 bg-emerald-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white",
                )}
              >
                All tags
              </button>
              {tags.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tag)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition-colors",
                    tagFilter === tag ? "border-emerald-200/30 bg-emerald-200/10 text-white" : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white",
                  )}
                >
                  {tag} · {count}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-3">
          {selectedFile ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,214,255,0.08),rgba(255,255,255,0.03))] p-4 shadow-[0_0_32px_rgba(18,214,255,0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-100/72">Selected shelf piece</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">{selectedFile.name}</h4>
                  <p className="mt-1 text-sm text-white/56">
                    {roomOriginLabel(selectedFile.roomOrigin)} · {fileKindLabel(selectedFile.kind)}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/52">
                  {formatFileRecordSize(selectedFile)}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFile.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-white/48">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {filteredFiles.length === 0 ? (
            <div className="rounded-[1.35rem] border border-white/10 bg-black/20 p-4 text-sm text-white/52">
              No files match the current filters.
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredFiles.map((file) => {
              const selected = file.id === selectedFileId;
              return (
                <article
                  key={file.id}
                  className={cn(
                    "rounded-[1.35rem] border p-4 transition-all",
                    selected
                      ? "border-cyan-200/40 bg-cyan-200/10 shadow-[0_0_36px_rgba(18,214,255,0.12)]"
                      : "border-white/10 bg-white/[0.03] hover:border-white/18",
                  )}
                >
                  <button type="button" onClick={() => onSelectFile(file.id)} className="block w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold text-white">{file.name}</p>
                          <p className="mt-1 text-xs text-white/46">
                            {roomOriginLabel(file.roomOrigin)} · {fileKindLabel(file.kind)}
                          </p>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-white/34" />
                      </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-white/44">
                      <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{formatFileRecordSize(file)}</span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{file.mimeType}</span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {file.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white/45">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenInBlackboardRoom(file)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Open in room
                    </button>
                    <button
                      type="button"
                      onClick={() => onPinToInnerWorld(file)}
                      className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-50 transition-colors hover:bg-fuchsia-300/16"
                    >
                      <Pin className="h-3.5 w-3.5" />
                      Pin to Inner World
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteFile(file.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-rose-50 transition-colors hover:bg-rose-300/16"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                    {onCopyShareLink ? (
                      <button
                        type="button"
                        onClick={() => void onCopyShareLink(file)}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
