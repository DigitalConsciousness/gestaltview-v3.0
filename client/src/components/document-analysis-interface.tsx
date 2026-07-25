import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, FileText, FileUp, Sparkles } from "lucide-react";

import UploadedDocumentPreview from "@/components/UploadedDocumentPreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  getLargeFileImportLimitBytes,
  isOverEntitlementLimit,
  largeFileImportLockText,
} from "@/lib/entitlements";
import { extractProfileUpload } from "@/lib/profileUploadIngestion";

type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

type DocumentRecord = {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  workspace_id?: string | null;
  analysis_status: AnalysisStatus;
  analysis_results?: {
    summary: string;
    key_points: string[];
    sentiment: string;
    topics: string[];
    word_count: number;
    reading_time: number;
  };
  raw_text?: string | null;
};

interface DocumentAnalysisInterfaceProps {
  userId: string;
  tier?: string | null;
  isAdmin?: boolean;
}

interface WorkspaceDocumentPayload {
  id: string;
  user_id: string;
  workspace_id: string | null;
  filename: string;
  file_size_bytes: number;
  file_type: string;
  analysis_status: AnalysisStatus;
  analysis_summary: string;
  key_points: string[];
  topics: string[];
  sentiment: string;
  word_count: number;
  reading_time_minutes: number;
  analysis_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  raw_text: string | null;
}

type WorkspaceRoom = {
  id: string;
  name: string;
};

function getDocumentStorageKey(userId: string): string {
  return `gv.documents.local.${userId}`;
}

function readLocalDocuments(userId: string): DocumentRecord[] {
  try {
    const raw = window.localStorage.getItem(getDocumentStorageKey(userId));
    return raw ? (JSON.parse(raw) as DocumentRecord[]) : [];
  } catch {
    return [];
  }
}

function writeLocalDocuments(userId: string, documents: DocumentRecord[]): void {
  try {
    window.localStorage.setItem(getDocumentStorageKey(userId), JSON.stringify(documents));
  } catch {
    // Ignore storage failures in private mode.
  }
}

function buildAnalysis(file: File, text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned ? cleaned.split(" ").length : Math.max(120, Math.round(file.size / 12));
  const topics = cleaned
    ? Array.from(
        new Set(
          cleaned
            .split(/[^A-Za-z0-9]+/)
            .filter((word) => word.length > 5)
            .slice(0, 6)
        )
      )
    : ["capture", "summary", "analysis"];

  return {
    summary:
      cleaned.slice(0, 220) || `Local analysis for ${file.name}: file ingested and ready for review.`,
    key_points: [
      "The file has been captured into the workspace.",
      "A review trail can be used to guide follow-up work.",
      "The analysis remains legible enough to act on.",
    ],
    sentiment: cleaned ? "neutral" : "unknown",
    topics,
    word_count: words,
    reading_time: Math.max(1, Math.round(words / 220)),
  };
}

function mapDocumentRow(row: WorkspaceDocumentPayload): DocumentRecord {
  return {
    id: row.id,
    filename: row.filename,
    file_size: row.file_size_bytes,
    file_type: row.file_type,
    upload_date: row.created_at,
    workspace_id: row.workspace_id,
    analysis_status: row.analysis_status,
    analysis_results: {
      summary: row.analysis_summary,
      key_points: row.key_points,
      sentiment: row.sentiment,
      topics: row.topics,
      word_count: row.word_count,
      reading_time: row.reading_time_minutes,
    },
    raw_text: row.raw_text,
  };
}

export default function DocumentAnalysisInterface({ userId, tier, isAdmin = false }: DocumentAnalysisInterfaceProps) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceRoom[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editFilename, setEditFilename] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editWorkspaceId, setEditWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspaces() {
      setIsWorkspaceLoading(true);

      try {
        const response = await fetch("/api/workspaces", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Workspace load failed (${response.status})`);
        }

        const payload = (await response.json()) as { workspaces?: WorkspaceRoom[] };
        const nextWorkspaces = Array.isArray(payload.workspaces) ? payload.workspaces : [];
        if (cancelled) return;

        setWorkspaces(nextWorkspaces);
        setSelectedWorkspaceId(nextWorkspaces[0]?.id ?? null);
      } catch {
        if (!cancelled) {
          setWorkspaces([]);
          setSelectedWorkspaceId(null);
        }
      } finally {
        if (!cancelled) {
          setIsWorkspaceLoading(false);
        }
      }
    }

    void loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/documents", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`Document load failed (${response.status})`);
        }

        const payload = (await response.json()) as { documents?: WorkspaceDocumentPayload[] };
        const nextDocuments = Array.isArray(payload.documents) ? payload.documents.map(mapDocumentRow) : [];
        if (cancelled) return;

        setDocuments(nextDocuments);
        setSelectedDocumentId(nextDocuments[0]?.id ?? null);
        writeLocalDocuments(userId, nextDocuments);
      } catch {
        if (cancelled) return;

        const local = readLocalDocuments(userId);
        setDocuments(local);
        setSelectedDocumentId(local[0]?.id ?? null);
        setError("Document storage is unavailable; uploads will stay local to the browser.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const selectedDocument = useMemo(
    () => documents.find((document) => document.id === selectedDocumentId) ?? documents[0] ?? null,
    [documents, selectedDocumentId]
  );

  useEffect(() => {
    if (!selectedDocument) {
      setEditFilename("");
      setEditSummary("");
      setEditWorkspaceId(null);
      return;
    }

    setEditFilename(selectedDocument.filename);
    setEditSummary(selectedDocument.analysis_results?.summary ?? "");
    setEditWorkspaceId(selectedDocument.workspace_id ?? null);
  }, [selectedDocument]);

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) {
      return;
    }

    const fileLimitBytes = isAdmin ? Number.POSITIVE_INFINITY : getLargeFileImportLimitBytes(tier);
    const oversizedFile = fileList.find((file) => isOverEntitlementLimit(file.size, fileLimitBytes));
    if (oversizedFile) {
      setError(`${oversizedFile.name} is too large. ${largeFileImportLockText(tier)}`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    for (const file of fileList) {
      const extraction = await extractProfileUpload(file);
      const text = extraction.text;
      const analysis = buildAnalysis(file, text);

      try {
        const response = await fetch("/api/documents", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            fileSizeBytes: file.size,
            fileType: extraction.mimeType || file.type || "application/octet-stream",
            rawText: text || null,
            workspaceId: selectedWorkspaceId,
            analysisStatus: "completed",
            analysisSummary: analysis.summary,
            keyPoints: analysis.key_points,
            topics: analysis.topics,
            sentiment: analysis.sentiment,
            wordCount: analysis.word_count,
            readingTimeMinutes: analysis.reading_time,
            analysisPayload: analysis,
          }),
        });

        if (!response.ok) {
          if (response.status === 413) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string };
            setError(payload.message ?? largeFileImportLockText(tier));
            continue;
          }
          throw new Error(`Document create failed (${response.status})`);
        }

        const payload = (await response.json()) as { document?: WorkspaceDocumentPayload };
        const created = payload.document ? mapDocumentRow(payload.document) : null;
        if (created) {
          setDocuments((current) => {
            const next = [created, ...current.filter((document) => document.id !== created.id)];
            writeLocalDocuments(userId, next);
            return next;
          });
          setSelectedDocumentId(created.id);
        }
      } catch {
        const nextDocument: DocumentRecord = {
          id: `${userId}-${crypto.randomUUID()}`,
          filename: file.name,
          file_size: file.size,
          file_type: extraction.mimeType || file.type || "application/octet-stream",
          upload_date: new Date().toISOString(),
          workspace_id: selectedWorkspaceId,
          analysis_status: "completed",
          analysis_results: analysis,
          raw_text: text || null,
        };

        setDocuments((current) => {
          const next = [nextDocument, ...current];
          writeLocalDocuments(userId, next);
          return next;
        });
        setSelectedDocumentId(nextDocument.id);
        setError("Document storage is unavailable; uploads were kept locally.");
      }
    }

    setIsAnalyzing(false);
  };

  const saveDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    const trimmedFilename = editFilename.trim();
    if (!trimmedFilename) {
      setError("Document filename is required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/documents", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: selectedDocument.id,
          filename: trimmedFilename,
          workspaceId: editWorkspaceId,
          analysisSummary: editSummary,
        }),
      });

      if (!response.ok) {
        throw new Error(`Document update failed (${response.status})`);
      }

      const payload = (await response.json()) as { document?: WorkspaceDocumentPayload };
      if (payload.document) {
        const updated = mapDocumentRow(payload.document);
        setDocuments((current) => {
          const next = current.map((document) => (document.id === updated.id ? updated : document));
          writeLocalDocuments(userId, next);
          return next;
        });
        setSelectedDocumentId(updated.id);
      }
    } catch {
      const updated: DocumentRecord = {
        ...selectedDocument,
        filename: trimmedFilename,
        workspace_id: editWorkspaceId,
        analysis_results: {
          ...(selectedDocument.analysis_results ?? buildAnalysis(new File([""], trimmedFilename), "")),
          summary: editSummary,
        },
      };
      setDocuments((current) => {
        const next = current.map((document) => (document.id === selectedDocument.id ? updated : document));
        writeLocalDocuments(userId, next);
        return next;
      });
      setError("Document storage is unavailable; changes were kept locally.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteDocument = async () => {
    if (!selectedDocument) {
      return;
    }

    if (!window.confirm(`Delete document "${selectedDocument.filename}"?`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/documents", {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          id: selectedDocument.id,
          workspaceId: selectedDocument.workspace_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Document delete failed (${response.status})`);
      }

      setDocuments((current) => {
        const next = current.filter((document) => document.id !== selectedDocument.id);
        setSelectedDocumentId(next[0]?.id ?? null);
        writeLocalDocuments(userId, next);
        return next;
      });
    } catch {
      setDocuments((current) => {
        const next = current.filter((document) => document.id !== selectedDocument.id);
        setSelectedDocumentId(next[0]?.id ?? null);
        writeLocalDocuments(userId, next);
        return next;
      });
      setError("Document storage is unavailable; the document was removed locally.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
      <GlassCard glow="cyan" intensity="high" className="p-5 md:p-6" hover={false}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">Documents</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Upload a file for local analysis</h2>
          </div>
          <Badge className="border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#D7FBFF]">
            {documents.length} loaded
          </Badge>
        </div>

        <label
          className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center transition-colors hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/6"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleFiles(event.dataTransfer.files);
          }}
        >
          <FileUp className="h-10 w-10 text-[#00E5FF]" />
          <p className="mt-4 text-lg font-semibold text-white">Drop a file here or click to browse</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55">
            Document analysis is local-first here. Text files produce a richer summary; other files still produce a useful placeholder analysis.
          </p>
          <input
            type="file"
            className="hidden"
            onChange={(event) => {
              void handleFiles(event.target.files ?? []);
              event.currentTarget.value = "";
            }}
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <label className="min-w-[220px] flex-1 space-y-2">
            <span className="text-xs uppercase tracking-[0.24em] text-white/35">Target workspace</span>
            <select
              value={selectedWorkspaceId ?? ""}
              onChange={(event) => setSelectedWorkspaceId(event.target.value || null)}
              disabled={isWorkspaceLoading}
              className="h-10 w-full rounded-full border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
            >
              <option value="">{isWorkspaceLoading ? "Loading workspaces..." : "No workspace"}</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            onClick={() => {
              const demo = new File(["GestaltView keeps the language intact while turning it into action."], "demo-note.txt", {
                type: "text/plain",
              });
              void handleFiles([demo]);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Load demo file
          </Button>
          <p className="self-center text-xs uppercase tracking-[0.22em] text-white/40">
            {isAnalyzing ? "Analyzing…" : "Ready"}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {error ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          ) : null}
          {isLoading ? (
            <p className="text-sm text-white/55">Loading saved documents…</p>
          ) : documents.length === 0 ? (
            <p className="text-sm text-white/55">No documents loaded yet.</p>
          ) : (
            documents.map((document) => (
              <Card
                key={document.id}
                className={`cursor-pointer border transition-colors ${
                  selectedDocument?.id === document.id
                    ? "border-[#00E5FF]/30 bg-[#00E5FF]/8"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
                onClick={() => setSelectedDocumentId(document.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{document.filename}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">
                        {(document.file_size / 1024).toFixed(1)} KB • {document.file_type || "unknown type"}
                      </p>
                      {document.workspace_id ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                          {workspaces.find((workspace) => workspace.id === document.workspace_id)?.name ?? "Selected workspace"}
                        </p>
                      ) : null}
                    </div>
                    <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-100">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      done
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard glow="none" intensity="medium" className="p-5 md:p-6" hover={false}>
        {selectedDocument ? (
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00E5FF]">Analysis</p>
                <h3 className="mt-2 text-3xl font-semibold text-white">{selectedDocument.filename}</h3>
                <p className="mt-2 text-sm text-white/55">
                  Uploaded {new Date(selectedDocument.upload_date).toLocaleString()}
                </p>
              </div>
              <Badge className="border border-[#00E5FF]/25 bg-[#00E5FF]/10 text-[#D7FBFF]">
                {selectedDocument.analysis_results?.reading_time ?? 1} min read
              </Badge>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Summary</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {selectedDocument.analysis_results?.summary ?? "No analysis available."}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">Rendered document</p>
              <UploadedDocumentPreview
                name={selectedDocument.filename}
                mimeType={selectedDocument.file_type}
                previewText={selectedDocument.raw_text ?? selectedDocument.analysis_results?.summary ?? ""}
                className="mt-3"
              />
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Edit document</p>
                <Badge className="border border-white/10 bg-white/[0.04] text-white/60">persisted</Badge>
              </div>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Filename</span>
                <input
                  value={editFilename}
                  onChange={(event) => setEditFilename(event.target.value)}
                  className="h-10 w-full rounded-full border border-white/10 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-white/25"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Workspace</span>
                <select
                  value={editWorkspaceId ?? ""}
                  onChange={(event) => setEditWorkspaceId(event.target.value || null)}
                  className="h-10 w-full rounded-full border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
                >
                  <option value="">No workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-white/35">Summary</span>
                <textarea
                  value={editSummary}
                  onChange={(event) => setEditSummary(event.target.value)}
                  rows={4}
                  className="min-h-[6rem] rounded-[1.25rem] border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => void saveDocument()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void deleteDocument()}
                  disabled={isDeleting}
                  variant="destructive"
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-100"
                >
                  {isDeleting ? "Deleting..." : "Delete document"}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Key points</p>
                <ul className="mt-3 space-y-2 text-sm text-white/65">
                  {(selectedDocument.analysis_results?.key_points ?? []).map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </GlassCard>
              <GlassCard glow="none" intensity="low" className="p-4" hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Topics</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedDocument.analysis_results?.topics ?? []).map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/65"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/workspaces"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition-colors hover:border-[#00E5FF]/25 hover:text-white"
              >
                Workspaces
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/voice"
                className="inline-flex items-center gap-2 rounded-full border border-[#00E5FF]/25 bg-[#00E5FF]/12 px-4 py-2 text-sm font-semibold text-white"
              >
                Voice capture
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-white/55">Upload a document to inspect the analysis.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
