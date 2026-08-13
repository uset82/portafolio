import { z } from "zod";
import {
  AGENT_JSON_SCHEMA_V1,
  agentJsonV1Schema,
  type AgentJsonDocument,
} from "../manifest/schemas";

export const capabilityProposalStatusSchema = z.enum(["proposed", "approved", "edited", "ignored"]);

export const capabilityProposalSkipReasonSchema = z.enum([
  "private",
  "empty",
  "duplicate",
  "fork",
  "knowledge",
  "disabled",
  "no-capabilities",
  "no-domain",
]);

export const capabilityProposalSchema = z
  .object({
    repository: z
      .string()
      .regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/, "Use an owner/repository GitHub name"),
    suggestedAgent: z.string().trim().min(1).max(80),
    capabilities: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
    status: capabilityProposalStatusSchema,
    enabled: z.literal(false),
    document: agentJsonV1Schema.optional(),
    skipReason: capabilityProposalSkipReasonSchema.optional(),
    notes: z.string().trim().min(1).max(500).optional(),
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

export const capabilityProposalDecisionSchema = z
  .object({
    action: z.enum(["approve", "edit", "ignore"]),
    document: agentJsonV1Schema.optional(),
    notes: z.string().trim().min(1).max(500).optional(),
    reviewedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict();

export type CapabilityProposalStatus = z.infer<typeof capabilityProposalStatusSchema>;
export type CapabilityProposalSkipReason = z.infer<typeof capabilityProposalSkipReasonSchema>;
export type CapabilityProposal = z.infer<typeof capabilityProposalSchema>;
export type CapabilityProposalDecision = z.infer<typeof capabilityProposalDecisionSchema>;

export const parseCapabilityProposal = (value: unknown): CapabilityProposal =>
  capabilityProposalSchema.parse(value);

export const AGENT_JSON_PROPOSAL_SCHEMA = AGENT_JSON_SCHEMA_V1;

export type ProposedAgentJson = AgentJsonDocument;
