import { appFetchJson } from "@/lib/appFetch";
import type { UserFileRecord } from "@/lib/innerWorldFiles";

export type SanctuaryJournalRecord = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type SanctuaryScrapbookRecord = {
  id: string;
  userId: string;
  fileId: string | null;
  caption: string | null;
  createdAt: string;
  file: UserFileRecord | null;
};

export async function loadSanctuaryJournalFromServer(): Promise<SanctuaryJournalRecord | null> {
  const result = await appFetchJson<{ journal: SanctuaryJournalRecord | null }>("/api/sanctuary/journal", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.journal ?? null;
}

export async function saveSanctuaryJournalToServer(input: { content: string }): Promise<SanctuaryJournalRecord | null> {
  return saveSanctuaryJournalRecordToServer({ content: input.content });
}

export async function saveSanctuaryJournalRecordToServer(input: {
  journalId?: string;
  content: string;
}): Promise<SanctuaryJournalRecord | null> {
  const result = await appFetchJson<{ journal: SanctuaryJournalRecord | null }>("/api/sanctuary/journal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      journalId: input.journalId ?? null,
      content: input.content,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.journal ?? null;
}

export async function loadSanctuaryScrapbookFromServer(): Promise<SanctuaryScrapbookRecord[] | null> {
  const result = await appFetchJson<{ items: SanctuaryScrapbookRecord[] }>("/api/sanctuary/scrapbook", {
    timeoutMs: 15_000,
    retries: 0,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.items;
}

export async function saveSanctuaryScrapbookItemToServer(input: {
  itemId?: string;
  fileId: string;
  caption: string | null;
}): Promise<SanctuaryScrapbookRecord | null> {
  const result = await appFetchJson<{ item: SanctuaryScrapbookRecord | null }>("/api/sanctuary/scrapbook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemId: input.itemId ?? null,
      fileId: input.fileId,
      caption: input.caption,
    }),
    timeoutMs: 20_000,
    retryUnsafe: true,
  });

  if (!result.ok) {
    return null;
  }

  return result.data.item ?? null;
}
