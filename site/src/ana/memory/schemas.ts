import { z } from "zod";

export const memoryScopeSchema = z.enum(["session", "user", "project"]);

export const memoryCategorySchema = z.enum([
  "basic",
  "education",
  "skills",
  "interests",
  "goals",
  "birthProfile",
  "preferences",
]);

export const encryptedBlobSchema = z
  .object({
    v: z.literal(1),
    alg: z.literal("aes-256-gcm"),
    iv: z.string().regex(/^[a-f0-9]{24}$/),
    tag: z.string().regex(/^[a-f0-9]{32}$/),
    data: z.string().regex(/^[a-f0-9]+$/),
  })
  .strict();

export const userProfileSchema = z
  .object({
    basic: z.record(z.string(), z.unknown()).optional(),
    education: z.record(z.string(), z.unknown()).optional(),
    skills: z.record(z.string(), z.unknown()).optional(),
    interests: z.record(z.string(), z.unknown()).optional(),
    goals: z.record(z.string(), z.unknown()).optional(),
    birthProfile: z.record(z.string(), z.unknown()).optional(),
    preferences: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const saveUserMemoryInputSchema = z
  .object({
    userId: z.string().trim().min(1).max(80),
    consent: z.boolean(),
    categories: z.array(memoryCategorySchema).min(1),
    sessionId: z.string().trim().min(1).max(80).optional(),
    profile: userProfileSchema.optional(),
  })
  .strict();

export const deleteMemoryInputSchema = z
  .object({
    scope: memoryScopeSchema,
    sessionId: z.string().trim().min(1).max(80).optional(),
    userId: z.string().trim().min(1).max(80).optional(),
    category: memoryCategorySchema.optional(),
    repository: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export const projectMemoryRecordSchema = z
  .object({
    repository: z.string().trim().min(1).max(160),
    knowledgeRef: z.string().trim().min(1).max(400),
    summary: z.string().trim().min(1).max(400).optional(),
  })
  .strict();

export type MemoryScope = z.infer<typeof memoryScopeSchema>;
export type MemoryCategory = z.infer<typeof memoryCategorySchema>;
export type EncryptedBlob = z.infer<typeof encryptedBlobSchema>;
export type SaveUserMemoryInput = z.infer<typeof saveUserMemoryInputSchema>;
export type DeleteMemoryInput = z.infer<typeof deleteMemoryInputSchema>;
export type ProjectMemoryRecord = z.infer<typeof projectMemoryRecordSchema>;

export type SessionTurn = {
  requestId: string;
  message: string;
  status: string;
  at: string;
};

export type SessionMemory = {
  sessionId: string;
  provided: Record<string, unknown>;
  turns: SessionTurn[];
};

export type UserMemory = {
  userId: string;
  profile: Partial<Record<MemoryCategory, Record<string, unknown>>>;
  updatedAt: string;
};

export type PublicSafeUserView = {
  userId: string;
  savedCategories: MemoryCategory[];
  updatedAt: string;
};

export type SaveUserMemoryResult =
  | { status: "saved"; memory: UserMemory }
  | { status: "rejected"; reason: "consent-required" | "empty" };

export const SENSITIVE_CATEGORIES: readonly MemoryCategory[] = ["basic", "birthProfile"];

export const FIELD_TO_CATEGORY: Readonly<Record<string, MemoryCategory>> = {
  fullName: "basic",
  birthDate: "birthProfile",
  birthTime: "birthProfile",
  birthPlace: "birthProfile",
  latitude: "birthProfile",
  longitude: "birthProfile",
  person2BirthDate: "birthProfile",
  person2BirthTime: "birthProfile",
  person2Latitude: "birthProfile",
  person2Longitude: "birthProfile",
  fieldOfStudy: "education",
  education: "education",
  experience: "skills",
  skills: "skills",
  interests: "interests",
  goals: "goals",
  prompt: "preferences",
  bpm: "preferences",
  musicPreferences: "preferences",
};
