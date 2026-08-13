import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "../protocol/agent";
import type { AgentResponse } from "../protocol/schemas";

export const ANA_VERIFICATION_AGENT_ID = "ana-verifier";
export const ANA_VERIFICATION_CAPABILITY = "result-verification";

const manifest = parseAgentManifest({
  id: ANA_VERIFICATION_AGENT_ID,
  name: "ANA Verifier",
  repository: "uset82/portafolio",
  version: "1.0.0",
  description:
    "Optional deterministic reviewer of ANA verification findings. It does not receive private inputs or specialist payloads.",
  domains: ["ai-tooling"],
  capabilities: [ANA_VERIFICATION_CAPABILITY],
  inputs: [
    { name: "findings", type: "array", required: true },
    { name: "failedAgentIds", type: "array", required: false },
    { name: "contradictionCount", type: "number", required: false },
  ],
  outputs: [{ name: "review", type: "object", description: "Finding counts by code" }],
  permissions: ["read", "compute"],
  sensitivity: "public",
  execution: "local-function",
  timeoutMs: 1_000,
});

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export const createAnaVerificationAgent = (): RepoAgent =>
  defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: new Date().toISOString(),
    }),
    execute: async (request): Promise<AgentResponse> => {
      const started = Date.now();
      const findings = Array.isArray(request.input.findings) ? request.input.findings : [];
      const codes = findings
        .map((item) => (item && typeof item === "object" && "code" in item ? item.code : undefined))
        .filter((code): code is string => typeof code === "string");
      const failedAgentIds = asStringArray(request.input.failedAgentIds);
      const contradictionCount =
        typeof request.input.contradictionCount === "number" ? request.input.contradictionCount : 0;
      const count = codes.length;
      const summary =
        count === 0
          ? "Optional verification agent found no issues."
          : `Optional verification agent recorded ${count} issue(s).`;
      return {
        agentId: manifest.id,
        status: "success",
        result: {
          review: {
            findingCount: count,
            codes,
            failedAgentIds,
            contradictionCount,
          },
        },
        summary,
        confidence: count === 0 ? 1 : 0.4,
        runtimeMs: Date.now() - started,
      };
    },
  });
