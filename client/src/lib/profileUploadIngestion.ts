import { unzipSync } from "fflate";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";

export type ProfileUploadKind = "markdown" | "text" | "pdf" | "docx";

export interface ProfileUploadExtraction {
  kind: ProfileUploadKind;
  fileName: string;
  mimeType: string;
  text: string;
  pageCount?: number;
  wordCount: number;
}

const PDF_WORKER_SRC = pdfWorkerUrl;

if (typeof window !== "undefined" && GlobalWorkerOptions.workerSrc !== PDF_WORKER_SRC) {
  GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u00a0/g, " ");
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripXmlText(xml: string): string {
  return decodeXmlEntities(
    xml
      .replace(/<w:tab\/>/g, "\t")
      .replace(/<w:br\/>/g, "\n")
      .replace(/<\/w:p>/g, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

function extractWordCount(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function resolveKind(file: File): ProfileUploadKind {
  const lowerName = file.name.toLowerCase();
  const lowerMime = file.type.toLowerCase();

  if (lowerName.endsWith(".pdf") || lowerMime === "application/pdf") {
    return "pdf";
  }

  if (lowerName.endsWith(".docx") || lowerMime.includes("wordprocessingml")) {
    return "docx";
  }

  if (
    lowerName.endsWith(".md") ||
    lowerName.endsWith(".markdown") ||
    lowerMime.includes("markdown")
  ) {
    return "markdown";
  }

  return "text";
}

async function extractPdfText(file: File): Promise<{ text: string; pageCount: number }> {
  const buffer = await file.arrayBuffer();
  const task = getDocument({
    data: buffer,
    useWorkerFetch: false,
    stopAtErrors: true,
    isEvalSupported: false,
  });
  const document = await task.promise;
  const pages: string[] = [];

  for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
    const page = await document.getPage(pageIndex);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    pages.push(pageText);
    await page.cleanup?.();
  }

  await document.destroy();

  return { text: pages.join("\n\n"), pageCount: document.numPages };
}

function extractDocxText(bytes: Uint8Array): string {
  const archive = unzipSync(bytes);
  const documentXml = archive["word/document.xml"];

  if (!documentXml) {
    throw new Error("The DOCX file does not contain a readable document body.");
  }

  const xmlText = typeof documentXml === "string" ? documentXml : new TextDecoder().decode(documentXml);
  const text = stripXmlText(xmlText)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ");

  return text.trim();
}

export async function extractProfileUpload(file: File): Promise<ProfileUploadExtraction> {
  const kind = resolveKind(file);

  if (kind === "pdf") {
    const { text, pageCount } = await extractPdfText(file);
    const normalized = normalizeWhitespace(text).trim();
    return {
      kind,
      fileName: file.name,
      mimeType: file.type || "application/pdf",
      text: normalized,
      pageCount,
      wordCount: extractWordCount(normalized),
    };
  }

  if (kind === "docx") {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const normalized = normalizeWhitespace(extractDocxText(bytes)).trim();
    return {
      kind,
      fileName: file.name,
      mimeType: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      text: normalized,
      wordCount: extractWordCount(normalized),
    };
  }

  const normalized = normalizeWhitespace(await file.text()).trim();
  return {
    kind,
    fileName: file.name,
    mimeType: file.type || "text/plain",
    text: normalized,
    wordCount: extractWordCount(normalized),
  };
}

export function summarizeProfileUpload(extraction: ProfileUploadExtraction): string {
  const descriptor =
    extraction.kind === "pdf"
      ? `${extraction.pageCount ?? 1} page${(extraction.pageCount ?? 1) === 1 ? "" : "s"}`
      : extraction.kind === "docx"
        ? "document"
        : extraction.kind === "markdown"
          ? "markdown file"
          : "text file";

  return `${extraction.fileName} (${descriptor}, ${extraction.wordCount} words)`;
}
