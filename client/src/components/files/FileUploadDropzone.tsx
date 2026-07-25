import { ReactNode, useCallback, useMemo, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  description?: string;
  onFiles: (files: File[]) => void;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
};

export default function FileUploadDropzone({
  label = "Drop a file to render it inline",
  description = "Markdown, PDF, HTML, and text files surface immediately. Larger binary files stay linked and previewable.",
  onFiles,
  onClick,
  className,
  children,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length > 0) {
        onFiles(files);
      }
    },
    [onFiles],
  );

  const openPicker = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const baseClasses = useMemo(
    () =>
      cn(
        "group relative overflow-hidden rounded-[1.5rem] border border-dashed p-4 transition-all",
        isDragging
          ? "border-cyan-200/45 bg-cyan-200/10 shadow-[0_0_36px_rgba(18,214,255,0.16)]"
          : "border-white/12 bg-white/[0.03] hover:border-cyan-200/25 hover:bg-cyan-200/6",
        className,
      ),
    [className, isDragging],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
      className={baseClasses}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(18,214,255,0.10),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(191,0,255,0.10),transparent_26%)] opacity-80" />
      <div className="relative flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/28 text-cyan-100">
          <UploadCloud className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-sm leading-relaxed text-white/58">{description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}
