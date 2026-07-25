import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { downloadMassExodusArchive } from "@/lib/massExodus";

type MassExodusButtonProps = {
  sourceSurface: "profile" | "settings";
};

export default function MassExodusButton({ sourceSurface }: MassExodusButtonProps) {
  const { user, profile, tier, isAdmin, isLoading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting || isLoading) {
      return;
    }

    setIsExporting(true);
    toast.message("Gathering your export.");

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });

      const summary = await downloadMassExodusArchive({
        user,
        profile,
        tier,
        isAdmin,
        sourceSurface,
      });

      toast.success(`Exported ${summary.recordCount} records across ${summary.fileCount} files.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || isLoading}
      title="Export journals, scrapbook items, blueprints, artifacts, and insights as a ZIP."
      className="inline-flex items-center gap-2 rounded-full border border-[#7fe9ff]/20 bg-[#7fe9ff]/10 px-4 py-2.5 text-sm text-white transition-colors hover:border-[#7fe9ff]/30 hover:bg-[#7fe9ff]/15 disabled:cursor-wait disabled:opacity-60"
      aria-busy={isExporting || isLoading}
    >
      <Download className="size-4 text-[#7fe9ff]" />
      {isExporting ? "Preparing export..." : "Export everything"}
    </button>
  );
}
