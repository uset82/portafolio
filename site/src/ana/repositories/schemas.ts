import { z } from "zod";

export const repositoryStatusSchema = z.enum([
  "production",
  "prototype",
  "experiment",
  "educational",
  "empty",
  "duplicate",
  "fork",
]);

export const agentPotentialSchema = z.enum(["high", "medium", "low", "none"]);

export const recommendedTypeSchema = z.enum(["agent", "tool", "knowledge", "disabled"]);

export const repositoryVisibilitySchema = z.enum(["public", "private"]);

export const repositoryDomainSchema = z.enum([
  "ai-tooling",
  "astrology",
  "career",
  "construction",
  "design",
  "drone",
  "education",
  "electronics",
  "embedded",
  "energy",
  "finance",
  "fpga",
  "game",
  "iot",
  "music",
  "numerology",
  "osint",
  "portfolio",
  "research",
  "video",
  "web",
  "3d",
]);

const optionalTrimmed = z.string().trim().min(1);

export const repositoryAuditSchema = z
  .object({
    repository: z
      .string()
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use an owner/repository GitHub name"),
    description: optionalTrimmed.max(500).optional(),
    language: optionalTrimmed.max(80).optional(),
    framework: optionalTrimmed.max(80).optional(),
    readme: optionalTrimmed.max(1_200).optional(),
    hasBackend: z.boolean(),
    hasAPI: z.boolean(),
    hasDatabase: z.boolean(),
    hasLLM: z.boolean(),
    domain: z.array(repositoryDomainSchema),
    capabilities: z.array(
      z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case capabilities"),
    ),
    status: repositoryStatusSchema,
    agentPotential: agentPotentialSchema,
    recommendedType: recommendedTypeSchema,
    visibility: repositoryVisibilitySchema,
    enabled: z.boolean(),
    contentsInspected: z.boolean(),
    sizeKb: z.number().int().nonnegative(),
    manifestFiles: z.array(z.string().min(1)),
  })
  .strict();

export const repositoryOverrideSchema = repositoryAuditSchema
  .partial()
  .omit({ repository: true })
  .extend({
    notes: optionalTrimmed.max(500).optional(),
  })
  .strict();

export const repositoryRegistrySchema = z
  .object({
    schemaVersion: z.literal(1),
    generatedBy: z.literal("ana:audit-repositories"),
    generatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    owner: z.string().min(1),
    source: z.enum(["github-api", "fixture"]),
    repositoryCount: z.number().int().nonnegative(),
    repositories: z.array(repositoryAuditSchema),
  })
  .strict()
  .superRefine((registry, context) => {
    if (registry.repositoryCount !== registry.repositories.length) {
      context.addIssue({
        code: "custom",
        path: ["repositoryCount"],
        message: `Expected ${registry.repositories.length} repositories`,
      });
    }

    const seen = new Set<string>();
    registry.repositories.forEach((audit, index) => {
      if (seen.has(audit.repository)) {
        context.addIssue({
          code: "custom",
          path: ["repositories", index, "repository"],
          message: `Duplicate repository ${audit.repository}`,
        });
      }
      seen.add(audit.repository);
    });
  });

export const repositoryOverridesSchema = z
  .object({
    schemaVersion: z.literal(1),
    overrides: z.record(z.string(), repositoryOverrideSchema),
  })
  .strict()
  .superRefine((file, context) => {
    for (const key of Object.keys(file.overrides)) {
      if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(key)) {
        context.addIssue({
          code: "custom",
          path: ["overrides", key],
          message: "Override keys must be owner/repository names",
        });
      }
    }
  });

export type RepositoryStatus = z.infer<typeof repositoryStatusSchema>;
export type AgentPotential = z.infer<typeof agentPotentialSchema>;
export type RecommendedType = z.infer<typeof recommendedTypeSchema>;
export type RepositoryVisibility = z.infer<typeof repositoryVisibilitySchema>;
export type RepositoryDomain = z.infer<typeof repositoryDomainSchema>;
export type RepositoryAudit = z.infer<typeof repositoryAuditSchema>;
export type RepositoryOverride = z.infer<typeof repositoryOverrideSchema>;
export type RepositoryRegistry = z.infer<typeof repositoryRegistrySchema>;
export type RepositoryOverrides = z.infer<typeof repositoryOverridesSchema>;
