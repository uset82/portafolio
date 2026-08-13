import { anaDebugSnapshotSchema, type AnaDebugSnapshot } from "./schemas";

export type AnaDebugStore = {
  record(snapshot: AnaDebugSnapshot): void;
  list(): readonly AnaDebugSnapshot[];
  clear(): void;
};

export const ANA_DEBUG_STORE_LIMIT = 20;

export const createAnaDebugStore = (limit = ANA_DEBUG_STORE_LIMIT): AnaDebugStore => {
  const snapshots: AnaDebugSnapshot[] = [];
  return {
    record: (snapshot) => {
      snapshots.unshift(anaDebugSnapshotSchema.parse(snapshot));
      snapshots.splice(limit);
    },
    list: () => snapshots,
    clear: () => {
      snapshots.length = 0;
    },
  };
};

const processStore = createAnaDebugStore();

export const getAnaDebugStore = (): AnaDebugStore => processStore;

export const isAnaDebugEnabled = (env: Record<string, string | undefined> = process.env): boolean =>
  env.ANA_DEBUG_ENABLED === "true";
