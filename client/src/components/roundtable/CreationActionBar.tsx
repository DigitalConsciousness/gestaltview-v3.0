import { type ReactNode } from "react";
import { Copy, Globe, LayoutGrid, Save, Sparkles, Vote } from "lucide-react";

export interface CreationActionBarProps {
  content: string;
  label?: string;
  onScaffold: () => void;
  onInnerWorld: () => void;
  onCreationCorner: () => void;
  onTribunal: () => void;
  onSave: () => void;
  onShare: () => void;
}

function ActionButton({
  icon,
  label,
  onClick,
  tone,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] transition-all hover:scale-[1.01]"
      style={{
        borderColor: `${tone}33`,
        background: `${tone}12`,
        color: tone,
      }}
    >
      <span className="opacity-90">{icon}</span>
      {label}
    </button>
  );
}

export default function CreationActionBar({
  onScaffold,
  onInnerWorld,
  onCreationCorner,
  onTribunal,
  onSave,
  onShare,
}: CreationActionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
      <ActionButton icon={<LayoutGrid className="size-3.5" />} label="Scaffold" onClick={onScaffold} tone="#00D4FF" />
      <ActionButton icon={<Sparkles className="size-3.5" />} label="Inner World" onClick={onInnerWorld} tone="#8B5CF6" />
      <ActionButton icon={<Globe className="size-3.5" />} label="Creation Corner" onClick={onCreationCorner} tone="#34D399" />
      <ActionButton icon={<Vote className="size-3.5" />} label="Tribunal" onClick={onTribunal} tone="#F472B6" />
      <ActionButton icon={<Save className="size-3.5" />} label="Save" onClick={onSave} tone="#FBBF24" />
      <ActionButton icon={<Copy className="size-3.5" />} label="Share" onClick={onShare} tone="#A78BFA" />
    </div>
  );
}
