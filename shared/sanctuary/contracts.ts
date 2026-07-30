export type SanctuarySyncState =
  "local_only" | "syncing" | "synced" | "conflict";

export type SanctuaryConflict<T> = {
  sourceRef: string;
  local: T;
  remote: T;
  detectedAt: string;
};

export type SanctuaryVersionedRecord = {
  id: string;
  updatedAt: string;
};

export function mergeSanctuaryRecords<T extends SanctuaryVersionedRecord>(
  local: readonly T[],
  remote: readonly T[],
): {
  records: T[];
  conflicts: Array<SanctuaryConflict<T>>;
} {
  const records = new Map<string, T>();
  const conflicts: Array<SanctuaryConflict<T>> = [];

  for (const record of remote) records.set(record.id, record);
  for (const localRecord of local) {
    const remoteRecord = records.get(localRecord.id);
    if (!remoteRecord) {
      records.set(localRecord.id, localRecord);
      continue;
    }
    if (JSON.stringify(localRecord) === JSON.stringify(remoteRecord)) continue;

    const localTime = Date.parse(localRecord.updatedAt);
    const remoteTime = Date.parse(remoteRecord.updatedAt);
    conflicts.push({
      sourceRef: localRecord.id,
      local: localRecord,
      remote: remoteRecord,
      detectedAt: new Date().toISOString(),
    });
    records.set(
      localRecord.id,
      Number.isFinite(localTime) && localTime > remoteTime
        ? localRecord
        : remoteRecord,
    );
  }

  return {
    records: [...records.values()].sort(
      (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
    ),
    conflicts,
  };
}
