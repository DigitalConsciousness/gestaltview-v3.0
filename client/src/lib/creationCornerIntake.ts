export type CreationCornerUploadMaterial = {
  name: string;
  text: string;
  previewText?: string;
  previewHtml?: string;
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function uploadKindLabel(file: File): string {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "PDF";
  return "file";
}

export async function readCreationCornerUpload(file: File): Promise<CreationCornerUploadMaterial> {
  const isHtml = file.type === "text/html" || /\.html?$/i.test(file.name);
  const isText =
    file.type.startsWith("text/")
    || /\.(md|markdown|txt|json|csv|tsv|js|jsx|ts|tsx|css|xml|ya?ml)$/i.test(file.name);

  if (isHtml || isText) {
    const content = await file.text();
    return {
      name: file.name,
      text: isHtml ? stripHtml(content) : content,
      previewText: isHtml ? undefined : content,
      previewHtml: isHtml ? content : undefined,
    };
  }

  return {
    name: file.name,
    text: `[Uploaded ${uploadKindLabel(file)}: ${file.name}]`,
    previewText: undefined,
    previewHtml: undefined,
  };
}
