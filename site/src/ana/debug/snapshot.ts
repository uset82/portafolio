import type { AgentResponse } from "../protocol/schemas";
import type { AnaResult, AnaTraceEvent } from "../core/schemas";
import { redactDebugPreview } from "./redact";
import { anaDebugSnapshotSchema, type AnaDebugSnapshot } from "./schemas";

const unique = (values: readonly string[]): string[] => {
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    ordered.push(value);
  }
  return ordered;
};

const latencyFromTraces = (traces: readonly AnaTraceEvent[]): AnaDebugSnapshot["latency"] => {
  const latest = new Map<string, { agentId: string; capability: string; runtimeMs: number }>();
  for (const event of traces) {
    if (event.runtimeMs === undefined) continue;
    latest.set(`${event.agentId}:${event.capability}`, {
      agentId: event.agentId,
      capability: event.capability,
      runtimeMs: event.runtimeMs,
    });
  }
  return [...latest.values()];
};

const errorSummaries = (responses: readonly AgentResponse[]): string[] =>
  responses
    .filter((response) => response.status === "failed")
    .map((response) => response.summary)
    .filter((summary) => summary.length > 0);

export const toDebugSnapshot = (options: {
  result: AnaResult;
  message: string;
  cost: { units: number; limit: number };
  recordedAt?: string;
}): AnaDebugSnapshot => {
  const { result } = options;
  const steps = result.plan.steps.map((step) => ({
    agentId: step.agentId,
    capability: step.capability,
  }));
  const active = unique(steps.map((step) => step.agentId));
  return anaDebugSnapshotSchema.parse({
    requestId: result.requestId,
    traceId: result.traceId,
    recordedAt: options.recordedAt ?? new Date().toISOString(),
    request: {
      kind: result.kind,
      preview: redactDebugPreview(options.message),
    },
    plan: {
      agentCount: active.length,
      goals: [...result.plan.goals],
      selectedDomains: [...(result.plan.selectedDomains ?? [])],
      steps,
      unavailableAgents: [...result.plan.unavailableAgents],
      missingInputCount: result.plan.missingInputs.length,
    },
    active,
    latency: latencyFromTraces(result.traces),
    tokens: { input: 0, output: 0, reported: false },
    cost: options.cost,
    result: {
      status: result.status,
      errors: errorSummaries(result.responses),
    },
  });
};
