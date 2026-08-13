import { z } from "zod";
import type { AgentResponse } from "../protocol/schemas";
import type { RepositoryDomain } from "../repositories/schemas";

export const anaIntentKindSchema = z.enum(["specialist", "portfolio-fact", "unknown"]);

export const anaGoalSchema = z.enum([
  "personality-analysis",
  "career-analysis",
  "business-ideas",
  "natal-chart",
  "numerology-profile",
  "pattern-generate",
  "capability-search",
  "ask-portfolio",
  "combined-analysis",
]);

export const anaRequestSchema = z
  .object({
    requestId: z.string().trim().min(1).max(80),
    message: z.string().trim().min(1).max(4_000),
    input: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export type AnaIntentKind = z.infer<typeof anaIntentKindSchema>;
export type AnaGoal = z.infer<typeof anaGoalSchema>;
export type AnaRequest = z.infer<typeof anaRequestSchema>;

export type AnaPlanStep = {
  agentId: string;
  capability: string;
  domain: RepositoryDomain;
  dependsOn: string[];
  domainAgentId?: string;
};

export type AnaExecutionDag = {
  execution: "parallel" | "sequential" | "mixed";
  nodes: {
    id: string;
    agentId: string;
    capability: string;
    dependsOn: string[];
  }[];
  waves: string[][];
  cycles: string[][];
};

export type AnaPlan = {
  kind: AnaIntentKind;
  goals: AnaGoal[];
  domains: RepositoryDomain[];
  provided: Record<string, unknown>;
  steps: AnaPlanStep[];
  missingInputs: string[];
  unavailableAgents: string[];
  selectedDomains?: string[];
  dag: AnaExecutionDag;
};

export type AnaProvenance = {
  statement: string;
  agentId: string;
  repository: string;
  capability: string;
  producedAt: string;
  inputFingerprint: string;
  confidence?: number;
  domainAgentId?: string;
};

export type AnaResultStatus = "answered" | "needs-input" | "deferred" | "failed";

export type AnaResult = {
  requestId: string;
  traceId: string;
  kind: AnaIntentKind;
  status: AnaResultStatus;
  answer: string;
  plan: AnaPlan;
  responses: AgentResponse[];
  provenance: AnaProvenance[];
  warnings: string[];
  assumptions: string[];
  traces: AnaTraceEvent[];
};

export const anaTraceEventNameSchema = z.enum([
  "start",
  "retry",
  "success",
  "failed",
  "timeout",
  "cancelled",
  "skipped-cost",
  "delegate",
  "delegate-denied",
]);

export type AnaTraceEventName = z.infer<typeof anaTraceEventNameSchema>;

export type AnaTraceEvent = {
  at: string;
  agentId: string;
  capability: string;
  event: AnaTraceEventName;
  attempt: number;
  runtimeMs?: number;
  via?: string;
  depth?: number;
  reason?: string;
};

export const ANA_PORTFOLIO_BOUNDARY =
  "ANA does not answer portfolio biography, CV, or project-status facts. Those stay with CC AI and approved public knowledge only.";

export const emptyExecutionDag = (): AnaExecutionDag => ({
  execution: "parallel",
  nodes: [],
  waves: [],
  cycles: [],
});
