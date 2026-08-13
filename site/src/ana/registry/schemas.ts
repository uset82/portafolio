import { z } from "zod";
import {
  agentCapabilitySchema,
  agentHealthSchema,
  agentIdSchema,
  agentManifestSchema,
  agentPermissionSchema,
  agentSensitivitySchema,
} from "../protocol/schemas";
import { agentJsonTypeSchema } from "../manifest/schemas";
import { repositoryDomainSchema } from "../repositories/schemas";

export const agentRegistryAvailabilitySchema = z.enum(["available", "unavailable"]);

export const agentCostEstimateSchema = z.enum(["free", "low", "metered", "unknown"]);

export const agentRegistrySkipReasonSchema = z.enum([
  "not-enabled",
  "private",
  "disabled-type",
  "knowledge-type",
  "unknown-repository",
  "type-mismatch",
]);

export const agentRegistryRecordSchema = z
  .object({
    id: agentIdSchema,
    type: agentJsonTypeSchema,
    repository: z
      .string()
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use an owner/repository GitHub name"),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, "Use semantic versions like 1.0.0"),
    availability: agentRegistryAvailabilitySchema,
    health: agentHealthSchema,
    permissions: z.array(agentPermissionSchema).min(1),
    privacyLevel: agentSensitivitySchema,
    latencyEstimateMs: z.number().int().positive().max(120_000),
    costEstimate: agentCostEstimateSchema,
    domains: z.array(repositoryDomainSchema).min(1),
    capabilities: z.array(agentCapabilitySchema).min(1),
    manifest: agentManifestSchema,
  })
  .strict();

export const agentRegistrySkipSchema = z
  .object({
    repository: z.string().min(1),
    id: agentIdSchema.optional(),
    reason: agentRegistrySkipReasonSchema,
  })
  .strict();

export type AgentRegistryAvailability = z.infer<typeof agentRegistryAvailabilitySchema>;
export type AgentCostEstimate = z.infer<typeof agentCostEstimateSchema>;
export type AgentRegistrySkipReason = z.infer<typeof agentRegistrySkipReasonSchema>;
export type AgentRegistryRecord = z.infer<typeof agentRegistryRecordSchema>;
export type AgentRegistrySkip = z.infer<typeof agentRegistrySkipSchema>;
