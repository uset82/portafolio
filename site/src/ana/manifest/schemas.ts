import { z } from "zod";
import {
  agentManifestFields,
  refineUniqueAgentManifestKeys,
  type AgentManifest,
} from "../protocol/schemas";

export const AGENT_JSON_SCHEMA_V1 = "repo2agent/v1" as const;

export const agentJsonTypeSchema = z.enum(["agent", "tool"]);

export const agentJsonV1Schema = z
  .object({
    schema: z.literal(AGENT_JSON_SCHEMA_V1),
    type: agentJsonTypeSchema,
    ...agentManifestFields,
  })
  .strict()
  .superRefine(refineUniqueAgentManifestKeys);

export const supportedAgentJsonSchemas = [AGENT_JSON_SCHEMA_V1] as const;

export type AgentJsonSchemaId = (typeof supportedAgentJsonSchemas)[number];
export type AgentJsonType = z.infer<typeof agentJsonTypeSchema>;
export type AgentJsonDocument = z.infer<typeof agentJsonV1Schema>;

export const toAgentManifest = (document: AgentJsonDocument): AgentManifest => ({
  id: document.id,
  name: document.name,
  repository: document.repository,
  version: document.version,
  description: document.description,
  domains: document.domains,
  capabilities: document.capabilities,
  inputs: document.inputs,
  outputs: document.outputs,
  permissions: document.permissions,
  sensitivity: document.sensitivity,
  execution: document.execution,
  timeoutMs: document.timeoutMs,
});
