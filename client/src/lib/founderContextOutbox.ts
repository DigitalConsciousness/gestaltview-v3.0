export interface FounderContextOutboxPayload {
  currentState: string;
  sessionThread: string;
  modePreference: "synthesis" | "chat";
  confirmedAdult: boolean;
  plkSnapshot: Record<string, unknown>;
}

export interface FounderContextOutboxEntry {
  id: string;
  idempotencyKey: string;
  payload: FounderContextOutboxPayload;
  createdAt: string;
  attempts: number;
}

const DB_NAME = "gestaltview-founder-context";
const DB_VERSION = 1;
const STORE_NAME = "outbox";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `founder-context-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openOutboxDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Failed to open founder outbox."));
    request.onsuccess = () => resolve(request.result);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openOutboxDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = action(store);

        request.onerror = () => reject(request.error ?? new Error("Founder outbox request failed."));
        request.onsuccess = () => resolve(request.result);
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error ?? new Error("Founder outbox transaction failed."));
        };
      })
  );
}

export async function queueFounderContextWrite(
  payload: FounderContextOutboxPayload
): Promise<FounderContextOutboxEntry> {
  const id = createId();
  const entry: FounderContextOutboxEntry = {
    id,
    idempotencyKey: id,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  await withStore("readwrite", (store) => store.put(entry));
  return entry;
}

export async function listFounderContextOutbox(): Promise<FounderContextOutboxEntry[]> {
  const entries = await withStore("readonly", (store) => store.getAll());
  return entries.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function countFounderContextOutbox(): Promise<number> {
  return withStore("readonly", (store) => store.count());
}

async function deleteFounderContextOutboxEntry(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

async function updateFounderContextOutboxEntry(entry: FounderContextOutboxEntry): Promise<void> {
  await withStore("readwrite", (store) => store.put(entry));
}

export async function flushFounderContextOutbox(
  send: (entry: FounderContextOutboxEntry) => Promise<boolean>
): Promise<{ synced: number; remaining: number }> {
  const entries = await listFounderContextOutbox();
  let synced = 0;

  for (const entry of entries) {
    const sent = await send(entry);
    if (!sent) {
      await updateFounderContextOutboxEntry({
        ...entry,
        attempts: entry.attempts + 1,
      });
      break;
    }

    await deleteFounderContextOutboxEntry(entry.id);
    synced += 1;
  }

  return {
    synced,
    remaining: await countFounderContextOutbox(),
  };
}
