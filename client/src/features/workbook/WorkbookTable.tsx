import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import type { OpsWorkbookItem } from "@shared/workbook/schemas";

export function WorkbookTable(props: {
  items: OpsWorkbookItem[];
  savingItemId: string | null;
  onSave: (
    itemId: string,
    patch: {
      label: string;
      category?: string | null;
      status?: string | null;
      priority?: string | null;
      phase?: string | null;
      notes?: string | null;
      linkRef?: string | null;
    }
  ) => Promise<unknown>;
}) {
  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        label: string;
        category: string;
        status: string;
        priority: string;
        phase: string;
        notes: string;
        linkRef: string;
      }
    >
  >({});

  useEffect(() => {
    const nextDrafts = Object.fromEntries(
      props.items.map((item) => [
        item.id,
        {
          label: item.label,
          category: item.category ?? "",
          status: item.status ?? "",
          priority: item.priority ?? "",
          phase: item.phase ?? "",
          notes: item.notes ?? "",
          linkRef: item.linkRef ?? "",
        },
      ])
    );
    setDrafts(nextDrafts);
  }, [props.items]);

  return (
    <ScrollArea className="h-[520px] rounded-2xl border border-slate-700/50 bg-slate-950/40">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-800 hover:bg-transparent">
            <TableHead className="text-slate-300">Label</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
            <TableHead className="text-slate-300">Priority</TableHead>
            <TableHead className="text-slate-300">Phase</TableHead>
            <TableHead className="text-slate-300">Notes</TableHead>
            <TableHead className="text-slate-300">Link</TableHead>
            <TableHead className="text-right text-slate-300">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.items.map((item) => {
            const draft = drafts[item.id];
            if (!draft) {
              return null;
            }

            return (
              <TableRow key={item.id} className="border-slate-800 align-top hover:bg-transparent">
                <TableCell className="min-w-[220px]">
                  <Input
                    value={draft.label}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], label: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60"
                  />
                </TableCell>
                <TableCell className="min-w-[140px]">
                  <Input
                    value={draft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], status: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60"
                  />
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Input
                    value={draft.priority}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], priority: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60"
                  />
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Input
                    value={draft.phase}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], phase: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60"
                  />
                </TableCell>
                <TableCell className="min-w-[240px]">
                  <Textarea
                    rows={3}
                    value={draft.notes}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], notes: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60 text-sm"
                  />
                </TableCell>
                <TableCell className="min-w-[180px]">
                  <Input
                    value={draft.linkRef}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [item.id]: { ...current[item.id], linkRef: event.target.value },
                      }))
                    }
                    className="border-slate-700 bg-slate-900/60"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    disabled={props.savingItemId === item.id}
                    onClick={() =>
                      void props.onSave(item.id, {
                        label: draft.label,
                        category: draft.category || null,
                        status: draft.status || null,
                        priority: draft.priority || null,
                        phase: draft.phase || null,
                        notes: draft.notes || null,
                        linkRef: draft.linkRef || null,
                      })
                    }
                  >
                    {props.savingItemId === item.id ? "Saving..." : "Save"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
