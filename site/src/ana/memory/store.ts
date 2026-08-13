import { randomBytes } from "node:crypto";
import { decryptJson, encryptJson } from "./crypto";
import { filterRecordForAgent } from "./permissions";
import {
  deleteMemoryInputSchema,
  FIELD_TO_CATEGORY,
  projectMemoryRecordSchema,
  saveUserMemoryInputSchema,
  type DeleteMemoryInput,
  type EncryptedBlob,
  type MemoryCategory,
  type ProjectMemoryRecord,
  type PublicSafeUserView,
  type SaveUserMemoryInput,
  type SaveUserMemoryResult,
  type SessionMemory,
  type SessionTurn,
  type UserMemory,
} from "./schemas";

const SENSITIVE_FIELD_PATTERN =
  /birthDate|birthTime|birthPlace|fullName|1815-12-10|latitude|longitude/i;

type StoredUser = {
  userId: string;
  updatedAt: string;
  categories: Partial<Record<MemoryCategory, EncryptedBlob>>;
};

export type RememberSessionTurnInput = {
  sessionId: string;
  requestId: string;
  message: string;
  provided: Record<string, unknown>;
  status: string;
};

export type HydrateProvidedInput = {
  requestProvided: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
  applyUserMemory?: boolean;
};

export type AnaMemoryStore = {
  rememberSessionTurn(input: RememberSessionTurnInput): SessionMemory;
  getSession(sessionId: string): SessionMemory | undefined;
  saveUserMemory(input: SaveUserMemoryInput): SaveUserMemoryResult;
  getUserMemory(userId: string): UserMemory | undefined;
  publicSafeUserView(userId: string): PublicSafeUserView | undefined;
  peekUserStorage(userId: string): StoredUser | undefined;
  deleteMemory(input: DeleteMemoryInput): boolean;
  putProjectMemory(record: ProjectMemoryRecord): ProjectMemoryRecord;
  getProjectMemory(repository: string): ProjectMemoryRecord | undefined;
  hydrateProvided(input: HydrateProvidedInput): Record<string, unknown>;
  flattenUserMemory(memory: UserMemory): Record<string, unknown>;
};

export type CreateAnaMemoryOptions = {
  key?: Buffer;
  now?: () => string;
};

const hasValue = (value: unknown) => value !== undefined && value !== "";

const mergeProvided = (...layers: Array<Record<string, unknown> | undefined>) => {
  const merged: Record<string, unknown> = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [field, value] of Object.entries(layer)) {
      if (!hasValue(value)) continue;
      merged[field] = value;
    }
  }
  return merged;
};

const cloneProvided = (provided: Record<string, unknown>) => mergeProvided(provided);

const profileFromProvided = (
  provided: Record<string, unknown>,
  categories: readonly MemoryCategory[],
): Partial<Record<MemoryCategory, Record<string, unknown>>> => {
  const allowed = new Set(categories);
  const profile: Partial<Record<MemoryCategory, Record<string, unknown>>> = {};
  for (const [field, value] of Object.entries(provided)) {
    const category = FIELD_TO_CATEGORY[field];
    if (!category || !allowed.has(category) || !hasValue(value)) continue;
    const bucket = { ...(profile[category] ?? {}), [field]: value };
    profile[category] = bucket;
  }
  return profile;
};

const mergeProfiles = (
  ...layers: Array<Partial<Record<MemoryCategory, Record<string, unknown>>> | undefined>
) => {
  const profile: Partial<Record<MemoryCategory, Record<string, unknown>>> = {};
  for (const layer of layers) {
    if (!layer) continue;
    for (const [category, data] of Object.entries(layer) as Array<
      [MemoryCategory, Record<string, unknown> | undefined]
    >) {
      if (!data) continue;
      const bucket: Record<string, unknown> = { ...(profile[category] ?? {}) };
      for (const [field, value] of Object.entries(data)) {
        if (!hasValue(value)) continue;
        bucket[field] = value;
      }
      if (Object.keys(bucket).length > 0) profile[category] = bucket;
    }
  }
  return profile;
};

export const flattenUserMemory = (memory: UserMemory): Record<string, unknown> => {
  const provided: Record<string, unknown> = {};
  for (const data of Object.values(memory.profile)) {
    if (!data) continue;
    for (const [field, value] of Object.entries(data)) {
      if (hasValue(value)) provided[field] = value;
    }
  }
  return provided;
};

export const publicSafeUserView = (memory: UserMemory): PublicSafeUserView => ({
  userId: memory.userId,
  savedCategories: (Object.keys(memory.profile) as MemoryCategory[]).sort(),
  updatedAt: memory.updatedAt,
});

export const createAnaMemory = (options: CreateAnaMemoryOptions = {}): AnaMemoryStore => {
  const key = options.key ?? randomBytes(32);
  const now = options.now ?? (() => new Date().toISOString());
  const sessions = new Map<string, SessionMemory>();
  const users = new Map<string, StoredUser>();
  const projects = new Map<string, ProjectMemoryRecord>();

  const encryptCategory = (
    userId: string,
    category: MemoryCategory,
    data: Record<string, unknown>,
  ) => encryptJson(data, key, `${userId}:${category}`);

  const decryptCategory = (userId: string, category: MemoryCategory, blob: EncryptedBlob) =>
    decryptJson<Record<string, unknown>>(blob, key, `${userId}:${category}`);

  const readUser = (userId: string): UserMemory | undefined => {
    const stored = users.get(userId);
    if (!stored) return undefined;
    const profile: UserMemory["profile"] = {};
    for (const [category, blob] of Object.entries(stored.categories) as Array<
      [MemoryCategory, EncryptedBlob | undefined]
    >) {
      if (!blob) continue;
      profile[category] = decryptCategory(userId, category, blob);
    }
    return { userId, profile, updatedAt: stored.updatedAt };
  };

  const writeUser = (userId: string, profile: UserMemory["profile"]): UserMemory => {
    const categories: StoredUser["categories"] = {};
    for (const [category, data] of Object.entries(profile) as Array<
      [MemoryCategory, Record<string, unknown> | undefined]
    >) {
      if (!data || Object.keys(data).length === 0) continue;
      categories[category] = encryptCategory(userId, category, data);
    }
    const memory: UserMemory = { userId, profile, updatedAt: now() };
    users.set(userId, { userId, updatedAt: memory.updatedAt, categories });
    return memory;
  };

  const rememberSessionTurn = (input: RememberSessionTurnInput): SessionMemory => {
    const existing = sessions.get(input.sessionId);
    const provided = mergeProvided(existing?.provided, input.provided);
    const turn: SessionTurn = {
      requestId: input.requestId,
      message: input.message,
      status: input.status,
      at: now(),
    };
    const session: SessionMemory = {
      sessionId: input.sessionId,
      provided,
      turns: [...(existing?.turns ?? []), turn],
    };
    sessions.set(input.sessionId, session);
    return session;
  };

  const saveUserMemory = (input: SaveUserMemoryInput): SaveUserMemoryResult => {
    const parsed = saveUserMemoryInputSchema.parse(input);
    if (parsed.consent !== true) {
      return { status: "rejected", reason: "consent-required" };
    }
    const sessionProvided = parsed.sessionId ? sessions.get(parsed.sessionId)?.provided : undefined;
    const fromSession = sessionProvided
      ? profileFromProvided(sessionProvided, parsed.categories)
      : undefined;
    const existing = readUser(parsed.userId)?.profile;
    const requestedProfile = parsed.profile
      ? Object.fromEntries(
          Object.entries(parsed.profile).filter(([category]) =>
            parsed.categories.includes(category as MemoryCategory),
          ),
        )
      : undefined;
    const profile = mergeProfiles(existing, fromSession, requestedProfile);
    if (Object.keys(profile).length === 0) {
      return { status: "rejected", reason: "empty" };
    }
    return { status: "saved", memory: writeUser(parsed.userId, profile) };
  };

  const deleteMemory = (input: DeleteMemoryInput): boolean => {
    const parsed = deleteMemoryInputSchema.parse(input);
    if (parsed.scope === "session") {
      if (!parsed.sessionId) return false;
      return sessions.delete(parsed.sessionId);
    }
    if (parsed.scope === "project") {
      if (!parsed.repository) return false;
      return projects.delete(parsed.repository);
    }
    if (!parsed.userId) return false;
    if (!parsed.category) return users.delete(parsed.userId);
    const current = readUser(parsed.userId);
    if (!current) return false;
    if (!(parsed.category in current.profile)) return false;
    const next: UserMemory["profile"] = { ...current.profile };
    delete next[parsed.category];
    if (Object.keys(next).length === 0) {
      users.delete(parsed.userId);
      return true;
    }
    writeUser(parsed.userId, next);
    return true;
  };

  const putProjectMemory = (record: ProjectMemoryRecord): ProjectMemoryRecord => {
    const parsed = projectMemoryRecordSchema.parse(record);
    const serialized = JSON.stringify(parsed);
    if (
      SENSITIVE_FIELD_PATTERN.test(serialized) ||
      SENSITIVE_FIELD_PATTERN.test(parsed.knowledgeRef)
    ) {
      throw new Error("Project memory cannot store private profile fields.");
    }
    if (
      /brain-private/i.test(parsed.knowledgeRef) ||
      /cc-ai-public-knowledge/i.test(parsed.knowledgeRef)
    ) {
      throw new Error("Project memory cannot point at private or CC AI ledger paths.");
    }
    projects.set(parsed.repository, parsed);
    return parsed;
  };

  const hydrateProvided = (input: HydrateProvidedInput): Record<string, unknown> => {
    const user =
      input.applyUserMemory === true && input.userId ? readUser(input.userId) : undefined;
    const session = input.sessionId ? sessions.get(input.sessionId) : undefined;
    return mergeProvided(
      user ? flattenUserMemory(user) : undefined,
      session?.provided,
      input.requestProvided,
    );
  };

  return {
    rememberSessionTurn,
    getSession: (sessionId) => {
      const session = sessions.get(sessionId);
      if (!session) return undefined;
      return {
        sessionId: session.sessionId,
        provided: cloneProvided(session.provided),
        turns: session.turns.map((turn) => ({ ...turn })),
      };
    },
    saveUserMemory,
    getUserMemory: (userId) => {
      const memory = readUser(userId);
      if (!memory) return undefined;
      return {
        userId: memory.userId,
        profile: mergeProfiles(memory.profile),
        updatedAt: memory.updatedAt,
      };
    },
    publicSafeUserView: (userId) => {
      const memory = readUser(userId);
      return memory ? publicSafeUserView(memory) : undefined;
    },
    peekUserStorage: (userId) => {
      const stored = users.get(userId);
      if (!stored) return undefined;
      return {
        userId: stored.userId,
        updatedAt: stored.updatedAt,
        categories: { ...stored.categories },
      };
    },
    deleteMemory,
    putProjectMemory,
    getProjectMemory: (repository) => {
      const record = projects.get(repository);
      if (!record) return undefined;
      const copy: ProjectMemoryRecord = {
        repository: record.repository,
        knowledgeRef: record.knowledgeRef,
      };
      if (record.summary !== undefined) copy.summary = record.summary;
      return copy;
    },
    hydrateProvided,
    flattenUserMemory,
  };
};

export { filterRecordForAgent };
