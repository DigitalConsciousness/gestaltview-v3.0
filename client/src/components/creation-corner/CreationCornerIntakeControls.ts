import { createElement } from "react";

type CreationCornerIntakeControlsProps = {
  onPasteFromClipboard: () => void;
  onUploadFile: () => void;
  onCreateBlueprint: () => void;
  isBusy?: boolean;
};

export function CreationCornerIntakeControls({
  onPasteFromClipboard,
  onUploadFile,
  onCreateBlueprint,
  isBusy = false,
}: CreationCornerIntakeControlsProps) {
  return createElement(
    "div",
    { className: "flex flex-wrap items-center gap-3" },
    createElement(
      "button",
      {
        type: "button",
        onClick: onPasteFromClipboard,
        disabled: isBusy,
        className:
          "inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-white/[0.08] disabled:opacity-50",
      },
      "Paste from clipboard",
    ),
    createElement(
      "button",
      {
        type: "button",
        onClick: onUploadFile,
        disabled: isBusy,
        className:
          "inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-gv-text-primary transition-colors hover:bg-white/[0.08] disabled:opacity-50",
      },
      "Upload file",
    ),
    createElement(
      "button",
      {
        type: "button",
        onClick: onCreateBlueprint,
        disabled: isBusy,
        className:
          "inline-flex min-h-10 items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-50 transition-colors hover:bg-cyan-300/14 disabled:opacity-50",
      },
      "Create blueprint",
    ),
  );
}
