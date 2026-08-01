import { BookOpenCheck, FileArchive, RefreshCcw, ShieldCheck } from "lucide-react";

import type { StorefrontEdition } from "@shared/storefront/contracts";

export function EditionMetadata({ edition }: { edition: StorefrontEdition }) {
  const rows = [
    { icon: BookOpenCheck, label: "Version", value: edition.version },
    { icon: FileArchive, label: "Formats", value: edition.formats.join(" · ") },
    { icon: ShieldCheck, label: "License", value: edition.license },
    { icon: RefreshCcw, label: "Update policy", value: edition.updatePolicy },
  ];
  return (
    <dl className="grid gap-px overflow-hidden border border-cyan-100/10 bg-cyan-100/10 sm:grid-cols-2">
      {rows.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-[#080c12] p-4">
          <dt className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200/65">
            <Icon aria-hidden="true" className="h-3.5 w-3.5" /> {label}
          </dt>
          <dd className="mt-2 text-sm leading-6 text-slate-200">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
