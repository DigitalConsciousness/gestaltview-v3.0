import { FileText } from "lucide-react";
import UploadedDocumentPreview from "@/components/UploadedDocumentPreview";
import type { UserFileRecord } from "@/lib/innerWorldFiles";

type Props = {
  file: UserFileRecord;
  className?: string;
};

export default function FilePreview({ file, className }: Props) {
  return (
    <div className={className}>
      <UploadedDocumentPreview
        name={file.name}
        mimeType={file.mimeType}
        kind={file.kind}
        previewText={file.previewText}
        previewHtml={file.previewHtml}
        previewUrl={file.previewUrl}
        dataUrl={file.dataUrl}
        showHeader={false}
      />
      <FileText className="sr-only" aria-hidden="true" />
    </div>
  );
}
