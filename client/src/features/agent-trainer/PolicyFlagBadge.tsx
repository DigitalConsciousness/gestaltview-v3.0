import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { TrainerPolicyFlag } from "@shared/agent-trainer/schemas";

export function PolicyFlagBadge({ flag }: { flag: TrainerPolicyFlag }) {
  const blocking = flag.severity === "blocking";

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 border",
        blocking
          ? "border-rose-500/40 bg-rose-500/10 text-rose-100"
          : "border-amber-500/40 bg-amber-500/10 text-amber-100",
        flag.resolved && "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      )}
    >
      {flag.resolved ? (
        <ShieldAlert className="size-3" />
      ) : (
        <AlertTriangle className="size-3" />
      )}
      {flag.flag}
      {flag.resolved ? " resolved" : ` ${flag.severity}`}
    </Badge>
  );
}
