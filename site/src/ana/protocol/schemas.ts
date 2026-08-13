import { z } from "zod";
import { repositoryDomainSchema } from "../repositories/schemas";

const optionalTrimmed = z.string().trim().min(1);

export const agentIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case agent ids");

export const agentCapabilitySchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case capabilities");

export const agentInputNameSchema = z
  .string()
  .regex(/^[a-z][a-zA-Z0-9]*$/, "Use camelCase input names");

export const agentPermissionSchema = z.enum([
  "read",
  "compute",
  "network",
  "write",
  "external-action",
  "high-risk",
]);

export const agentSensitivitySchema = z.enum(["public", "personal", "sensitive"]);

export const agentExecutionSchema = z.enum(["local-function", "http", "container", "external-api"]);

export const agentHealthStatusSchema = z.enum(["healthy", "degraded", "unavailable"]);

export const agentResponseStatusSchema = z.enum(["success", "partial", "failed"]);

export const agentValueTypeSchema = z.enum(["string", "number", "boolean", "object", "array"]);

export const agentInputDefinitionSchema = z
  .object({
    name: agentInputNameSchema,
    type: agentValueTypeSchema,
    required: z.boolean(),
    description: optionalTrimmed.max(300).optional(),
    sensitivity: agentSensitivitySchema.optional(),
  })
  .strict();

export const agentOutputDefinitionSchema = z
  .object({
    name: agentInputNameSchema,
    type: agentValueTypeSchema,
    description: optionalTrimmed.max(300).optional(),
  })
  .strict();

export const agentEvidenceSchema = z
  .object({
    kind: z.enum(["repository", "capability", "input", "note"]),
    label: optionalTrimmed.max(200),
    href: z.string().url().optional(),
  })
  .strict();

export const agentManifestFields = {
  id: agentIdSchema,
  name: optionalTrimmed.max(80),
  repository: z
    .string()
    .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use an owner/repository GitHub name"),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, "Use semantic versions like 1.0.0"),
  description: optionalTrimmed.max(500),
  domains: z.array(repositoryDomainSchema).min(1),
  capabilities: z.array(agentCapabilitySchema).min(1),
  inputs: z.array(agentInputDefinitionSchema),
  outputs: z.array(agentOutputDefinitionSchema),
  permissions: z.array(agentPermissionSchema).min(1),
  sensitivity: agentSensitivitySchema,
  execution: agentExecutionSchema,
  timeoutMs: z.number().int().positive().max(120_000),
};

export const refineUniqueAgentManifestKeys = (
  manifest: { capabilities: readonly string[]; inputs: readonly { name: string }[] },
  context: z.RefinementCtx,
) => {
  const capabilitySet = new Set<string>();
  manifest.capabilities.forEach((capability, index) => {
    if (capabilitySet.has(capability)) {
      context.addIssue({
        code: "custom",
        path: ["capabilities", index],
        message: `Duplicate capability ${capability}`,
      });
    }
    capabilitySet.add(capability);
  });

  const inputSet = new Set<string>();
  manifest.inputs.forEach((input, index) => {
    if (inputSet.has(input.name)) {
      context.addIssue({
        code: "custom",
        path: ["inputs", index, "name"],
        message: `Duplicate input ${input.name}`,
      });
    }
    inputSet.add(input.name);
  });
};

export const agentManifestSchema = z
  .object(agentManifestFields)
  .strict()
  .superRefine(refineUniqueAgentManifestKeys);

export const agentRequestSchema = z
  .object({
    requestId: optionalTrimmed.max(80),
    capability: agentCapabilitySchema,
    input: z.record(z.string(), z.unknown()),
  })
  .strict();

export const agentHealthSchema = z
  .object({
    agentId: agentIdSchema,
    status: agentHealthStatusSchema,
    checkedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, "Use an ISO-8601 UTC timestamp"),
    message: optionalTrimmed.max(300).optional(),
  })
  .strict();

export const agentResponseSchema = z
  .object({
    agentId: agentIdSchema,
    status: agentResponseStatusSchema,
    result: z.unknown(),
    summary: optionalTrimmed.max(1_000),
    evidence: z.array(agentEvidenceSchema).optional(),
    assumptions: z.array(optionalTrimmed.max(300)).optional(),
    warnings: z.array(optionalTrimmed.max(300)).optional(),
    confidence: z.number().min(0).max(1).optional(),
    runtimeMs: z.number().nonnegative(),
  })
  .strict();

export type AgentValueType = z.infer<typeof agentValueTypeSchema>;
export type AgentPermission = z.infer<typeof agentPermissionSchema>;
export type AgentSensitivity = z.infer<typeof agentSensitivitySchema>;
export type AgentExecution = z.infer<typeof agentExecutionSchema>;
export type AgentInputDefinition = z.infer<typeof agentInputDefinitionSchema>;
export type AgentOutputDefinition = z.infer<typeof agentOutputDefinitionSchema>;
export type AgentEvidence = z.infer<typeof agentEvidenceSchema>;
export type AgentManifest = z.infer<typeof agentManifestSchema>;
export type AgentRequest = z.infer<typeof agentRequestSchema>;
export type AgentHealth = z.infer<typeof agentHealthSchema>;
export type AgentResponse = z.infer<typeof agentResponseSchema>;
