import { TextEncoder } from "node:util";
import { zipSync } from "fflate";
import { describe, expect, it } from "vitest";

import { extractProfileUpload, summarizeProfileUpload } from "@/lib/profileUploadIngestion";

function createFile(name: string, content: string | Uint8Array, type: string): File {
  return new File([content], name, { type });
}

function buildSimplePdf(text: string): Uint8Array {
  const encoder = new TextEncoder();
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n",
    `4 0 obj\n<< /Length ${encoder.encode(`BT /F1 18 Tf 72 180 Td (${text}) Tj ET`).length} >>\nstream\nBT /F1 18 Tf 72 180 Td (${text}) Tj ET\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(encoder.encode(body).length);
    body += object;
  }

  const xrefStart = encoder.encode(body).length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    body += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return encoder.encode(body);
}

describe("profile upload ingestion", () => {
  it("extracts markdown text and reports a readable summary", async () => {
    const file = createFile(
      "Keith_Profile.md",
      "# Keith\n\nFounder-as-algorithm profile upload.",
      "text/markdown",
    );

    const extraction = await extractProfileUpload(file);

    expect(extraction.kind).toBe("markdown");
    expect(extraction.text).toContain("Founder-as-algorithm profile upload.");
    expect(summarizeProfileUpload(extraction)).toContain("markdown file");
  });

  it("extracts docx text from the uploaded archive", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p><w:r><w:t>Founder profile upload for GestaltView.</w:t></w:r></w:p>
          <w:p><w:r><w:t>Context framing should stay visible.</w:t></w:r></w:p>
        </w:body>
      </w:document>`;

    const archive = zipSync({
      "word/document.xml": new TextEncoder().encode(xml),
    });

    const file = createFile(
      "Keith_Profile.docx",
      archive,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );

    const extraction = await extractProfileUpload(file);

    expect(extraction.kind).toBe("docx");
    expect(extraction.text).toContain("Founder profile upload for GestaltView.");
    expect(extraction.text).toContain("Context framing should stay visible.");
    expect(summarizeProfileUpload(extraction)).toContain("document");
  });

  it("extracts text from a valid pdf upload", async () => {
    const file = createFile("Keith_Profile.pdf", buildSimplePdf("Founder's profile is live."), "application/pdf");

    const extraction = await extractProfileUpload(file);

    expect(extraction.kind).toBe("pdf");
    expect(extraction.text).toMatch(/Founder[’']s profile is live\./);
    expect(extraction.pageCount).toBe(1);
    expect(summarizeProfileUpload(extraction)).toContain("page");
  });
});
