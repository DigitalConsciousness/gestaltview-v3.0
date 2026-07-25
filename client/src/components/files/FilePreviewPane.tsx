import { useMemo } from "react";
import { ArrowUpRight, Link2, Layers3, Pin, FileText, Download, X } from "lucide-react";
import FilePreview from "@/components/FilePreview";
import { cn } from "@/lib/utils";
import {
  fileReferenceToken,
  formatFileRecordSize,
  getFileInsertText,
  type UserFileRecord,
} from "@/lib/innerWorldFiles";

type Props = {
  file: UserFileRecord | null;
  className?: string;
  onInsertIntoCapture?: (text: string) => void;
  onLinkIntoCapture?: (reference: string) => void;
  onPinToInnerWorld?: (file: UserFileRecord) => void;
  onOpenInBlackboardRoom?: (file: UserFileRecord) => void;
  onCopyShareLink?: (file: UserFileRecord) => void | Promise<void>;
  onClose?: () => void;
};

export default function FilePreviewPane({
  file,
  className,
  onInsertIntoCapture,
  onLinkIntoCapture,
  onPinToInnerWorld,
  onOpenInBlackboardRoom,
  onCopyShareLink,
  onClose,
}: Props) {
  const insertText = useMemo(() => (file ? getFileInsertText(file) : ""), [file]);

  if (!file) {
    return (
      <section className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-sm text-white/52", className)}>
        No file selected. Drop or choose a file to preview it here.
      </section>
    );
  }

  return (
    <section className={cn("rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">{file.kind}</p>
          <h3 className="mt-2 break-words text-xl font-semibold text-white">{file.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Close
            </button>
          ) : null}
          <Layers3 className="mt-1 h-5 w-5 text-cyan-100" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-white/45">
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{file.roomOrigin.replaceAll("_", " ")}</span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{formatFileRecordSize(file)}</span>
        <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">{file.mimeType}</span>
      </div>

      <div className="mt-4 space-y-4">
        <FilePreview file={file} className="bg-transparent p-0" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onInsertIntoCapture ? (
          <button
            type="button"
            onClick={() => onInsertIntoCapture(insertText)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
          >
            <FileText className="h-3.5 w-3.5" />
            Load into capture
          </button>
        ) : null}
        {onLinkIntoCapture ? (
          <button
            type="button"
            onClick={() => onLinkIntoCapture(fileReferenceToken(file))}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
          >
            <Link2 className="h-3.5 w-3.5" />
            Link into capture
          </button>
        ) : null}
        {onPinToInnerWorld ? (
          <button
            type="button"
            onClick={() => onPinToInnerWorld(file)}
            className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-fuchsia-50 transition-colors hover:bg-fuchsia-300/16"
          >
            <Pin className="h-3.5 w-3.5" />
            Pin to Inner World
          </button>
        ) : null}
        {onOpenInBlackboardRoom ? (
          <button
            type="button"
            onClick={() => onOpenInBlackboardRoom(file)}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Open in Blackboard Room
          </button>
        ) : null}
        {file.previewUrl || file.dataUrl ? (
          <a
            href={file.previewUrl ?? file.dataUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-white/62 transition-colors hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
        ) : null}
        {onCopyShareLink ? (
          <button
            type="button"
            onClick={() => void onCopyShareLink(file)}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-cyan-50 transition-colors hover:bg-cyan-300/16"
          >
            <Link2 className="h-3.5 w-3.5" />
            Copy share link
          </button>
        ) : null}
      </div>
    </section>
  );
}
