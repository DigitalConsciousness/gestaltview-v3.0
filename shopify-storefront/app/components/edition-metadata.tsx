import type { StorefrontProduct } from "@/lib/storefront";

export function EditionMetadata({ edition }: { edition: NonNullable<StorefrontProduct["edition"]> }) {
  const rows = [
    ["Version", edition.version],
    ["Formats", edition.formats.join(" · ")],
    ["License", edition.license],
    ["Update policy", edition.updatePolicy],
  ];
  return (
    <dl className="edition-metadata">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
