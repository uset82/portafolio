import { createHash } from "node:crypto";
import { selectAgentInput } from "../privacy";
import type { AgentResponse } from "../protocol/schemas";
import type { SpecialistIndex } from "./router";
import type { AnaPlan, AnaProvenance, AnaTraceEvent } from "./schemas";

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const stableValue = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (value === null) return "null";
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

export const fingerprintInput = (input: Record<string, unknown>): string => {
  const hashed: Record<string, string> = {};
  for (const key of Object.keys(input).sort()) {
    hashed[key] = sha256(stableValue(input[key]));
  }
  return sha256(JSON.stringify(hashed));
};

const inputForAgent = (
  agentId: string,
  provided: Record<string, unknown>,
  index: SpecialistIndex,
): Record<string, unknown> => {
  const agent = index.getById(agentId);
  if (!agent) return {};
  return selectAgentInput(
    agentId,
    provided,
    agent.manifest().inputs.map((entry) => entry.name),
    { consent: true },
  );
};

const producedAtFor = (
  agentId: string,
  traces: readonly AnaTraceEvent[],
  fallback: string,
): string => {
  for (let index = traces.length - 1; index >= 0; index -= 1) {
    const event = traces[index];
    if (!event || event.agentId !== agentId) continue;
    if (
      event.event === "success" ||
      event.event === "failed" ||
      event.event === "timeout" ||
      event.event === "cancelled"
    ) {
      return event.at;
    }
  }
  return fallback;
};

export const collectProvenance = (options: {
  plan: AnaPlan;
  responses: readonly AgentResponse[];
  index: SpecialistIndex;
  traces?: readonly AnaTraceEvent[];
  now?: () => string;
}): AnaProvenance[] => {
  const traces = options.traces ?? [];
  const fallback = options.now?.() ?? new Date().toISOString();
  return options.responses.map((response) => {
    const step = options.plan.steps.find((entry) => entry.agentId === response.agentId);
    const repository = options.index.getById(response.agentId)?.manifest().repository ?? "unknown";
    const record: AnaProvenance = {
      statement: response.summary,
      agentId: response.agentId,
      repository,
      capability: step?.capability ?? "unknown",
      producedAt: producedAtFor(response.agentId, traces, fallback),
      inputFingerprint: fingerprintInput(
        inputForAgent(response.agentId, options.plan.provided, options.index),
      ),
    };
    if (response.confidence !== undefined) record.confidence = response.confidence;
    if (step?.domainAgentId) record.domainAgentId = step.domainAgentId;
    return record;
  });
};

export const formatProvenanceSources = (provenance: readonly AnaProvenance[]): string => {
  if (provenance.length === 0) return "";
  const lines = provenance.map((entry) => {
    const confidence =
      entry.confidence === undefined ? "confidence n/a" : `confidence ${entry.confidence}`;
    const via = entry.domainAgentId ? ` via ${entry.domainAgentId}` : "";
    return `● ${entry.agentId} (${entry.repository})${via} · ${entry.capability} · ${entry.producedAt} · ${confidence} · input ${entry.inputFingerprint.slice(0, 12)}`;
  });
  return `Sources\n${lines.join("\n")}`;
};
