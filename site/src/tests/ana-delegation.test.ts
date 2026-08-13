import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_DELEGATION_DENIED,
  ANA_DEFAULT_MAX_AGENT_DEPTH,
  ANA_DEFAULT_MAX_AGENTS_PER_REQUEST,
  ANA_DEFAULT_MAX_RUNTIME_MS,
  executePlan,
  indexRepoAgents,
  requestSpecialist,
  type AnaPlanStep,
} from "@/ana/core";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fakeAgent = (options: {
  id: string;
  domain: RepositoryDomain;
  capability: string;
  execute: RepoAgent["execute"];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA delegation tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: [{ name: "token", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: 1_000,
  });
  return defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-13T00:00:00Z",
    }),
    execute: options.execute,
  });
};

const ok = (agentId: string, summary: string) => ({
  agentId,
  status: "success" as const,
  result: { fixture: true },
  summary,
  runtimeMs: 1,
});

const step = (agentId: string, capability: string, domain: RepositoryDomain): AnaPlanStep => ({
  agentId,
  capability,
  domain,
  dependsOn: [],
});

test("defaults match the spec limits", () => {
  assert.equal(ANA_DEFAULT_MAX_AGENT_DEPTH, 3);
  assert.equal(ANA_DEFAULT_MAX_AGENTS_PER_REQUEST, 8);
  assert.equal(ANA_DEFAULT_MAX_RUNTIME_MS, 30_000);
});

test("a specialist can request others only through ANA, and those calls stay in the trace", async () => {
  const called: string[] = [];
  const mentora = fakeAgent({
    id: "mentora",
    domain: "education",
    capability: "education-guidance",
    execute: async () => {
      called.push("mentora");
      return ok("mentora", "Education notes.");
    },
  });
  const electronics = fakeAgent({
    id: "electronics-agent",
    domain: "electronics",
    capability: "capability-search",
    execute: async () => {
      called.push("electronics-agent");
      return ok("electronics-agent", "Engineering notes.");
    },
  });
  const career = fakeAgent({
    id: "career-agent",
    domain: "career",
    capability: "career-analysis",
    execute: async (request) => {
      called.push("career-agent");
      assert.equal("index" in request, false);
      const education = await requestSpecialist({
        agentId: "mentora",
        capability: "education-guidance",
        reason: "I need education information.",
      });
      const engineering = await requestSpecialist({
        agentId: "electronics-agent",
        capability: "capability-search",
        reason: "I need technical capability information.",
      });
      assert.equal(education.status, "success");
      assert.equal(engineering.status, "success");
      return ok("career-agent", "Career after education and engineering.");
    },
  });

  const result = await executePlan({
    requestId: "delegate-1",
    steps: [step("career-agent", "career-analysis", "career")],
    provided: { token: "x", birthDate: "1995-05-12", fullName: "Anna" },
    index: indexRepoAgents([career, mentora, electronics]),
    maxRetries: 0,
  });

  assert.deepEqual(called, ["career-agent", "mentora", "electronics-agent"]);
  assert.equal(result.responses[0]?.status, "success");
  const delegated = result.traces.filter((event) => event.event === "delegate");
  assert.equal(delegated.length, 2);
  assert.equal(
    delegated.every((event) => event.via === "career-agent"),
    true,
  );
  assert.equal(
    result.traces.some(
      (event) =>
        event.agentId === "mentora" && event.event === "start" && event.via === "career-agent",
    ),
    true,
  );
  assert.equal(
    result.traces.some(
      (event) =>
        event.agentId === "electronics-agent" && event.event === "start" && event.depth === 2,
    ),
    true,
  );
  const serialized = JSON.stringify(result.traces);
  assert.doesNotMatch(serialized, /1995-05-12|Anna|birthDate|fullName/);
});

test("requestSpecialist outside ANA's runtime is denied", async () => {
  const response = await requestSpecialist({
    agentId: "mentora",
    capability: "education-guidance",
    reason: "I need education information.",
  });
  assert.equal(response.status, "failed");
  assert.equal(response.summary, ANA_DELEGATION_DENIED);
});

test("requestSpecialist does not accept an input blob", async () => {
  const response = await requestSpecialist({
    agentId: "mentora",
    capability: "education-guidance",
    reason: "I need education information.",
    input: { birthDate: "1995-05-12", fullName: "Anna" },
  });
  assert.equal(response.status, "failed");
  assert.match(response.summary ?? "", /Invalid specialist delegation request/);
  assert.doesNotMatch(JSON.stringify(response), /1995-05-12|Anna/);
});

test("uncontrolled recursion is denied and traced", async () => {
  const ping: RepoAgent = fakeAgent({
    id: "career-agent",
    domain: "career",
    capability: "career-analysis",
    execute: async () => {
      const nested = await requestSpecialist({
        agentId: "career-agent",
        capability: "career-analysis",
        reason: "Call myself.",
      });
      assert.equal(nested.status, "failed");
      assert.equal(nested.summary, "recursion");
      return ok("career-agent", "Stopped recursion.");
    },
  });

  const result = await executePlan({
    requestId: "delegate-recursion",
    steps: [step("career-agent", "career-analysis", "career")],
    provided: { token: "x" },
    index: indexRepoAgents([ping]),
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "success");
  assert.equal(
    result.traces.some(
      (event) => event.event === "delegate-denied" && event.reason === "recursion",
    ),
    true,
  );
});

test("maxAgentDepth = 3 blocks a fourth nested specialist", async () => {
  const leaf = fakeAgent({
    id: "delta",
    domain: "electronics",
    capability: "capability-search",
    execute: async () => ok("delta", "Should not run."),
  });
  const make = (id: string, next?: { agentId: string; capability: string }): RepoAgent =>
    fakeAgent({
      id,
      domain: "career",
      capability: "career-analysis",
      execute: async () => {
        if (!next) return ok(id, `${id} done.`);
        const nested = await requestSpecialist({
          agentId: next.agentId,
          capability: next.capability,
          reason: `Need ${next.agentId}.`,
        });
        return {
          agentId: id,
          status: "success",
          result: { nested: nested.status },
          summary: `${id} nested ${nested.status}.`,
          runtimeMs: 1,
        };
      },
    });

  const alpha = make("alpha", { agentId: "beta", capability: "career-analysis" });
  const beta = make("beta", { agentId: "gamma", capability: "career-analysis" });
  const gamma = make("gamma", { agentId: "delta", capability: "capability-search" });

  const result = await executePlan({
    requestId: "delegate-depth",
    steps: [step("alpha", "career-analysis", "career")],
    provided: { token: "x" },
    index: indexRepoAgents([alpha, beta, gamma, leaf]),
    maxRetries: 0,
  });

  assert.equal(result.responses[0]?.status, "success");
  assert.equal(
    result.traces.some(
      (event) => event.event === "delegate-denied" && event.reason === "max-depth",
    ),
    true,
  );
  assert.equal(
    result.traces.some((event) => event.agentId === "delta" && event.event === "start"),
    false,
  );
});

test("maxAgentsPerRequest = 8 blocks further specialists", async () => {
  const helpers = Array.from({ length: 8 }, (_, index) =>
    fakeAgent({
      id: `helper-${index + 1}`,
      domain: "electronics",
      capability: "capability-search",
      execute: async () => ok(`helper-${index + 1}`, "Helper."),
    }),
  );
  const career = fakeAgent({
    id: "career-agent",
    domain: "career",
    capability: "career-analysis",
    execute: async () => {
      const nested = [];
      for (const helper of helpers) {
        nested.push(
          await requestSpecialist({
            agentId: helper.manifest().id,
            capability: "capability-search",
            reason: "Need another specialist.",
          }),
        );
      }
      assert.equal(nested.filter((item) => item.status === "success").length, 7);
      assert.equal(nested.at(-1)?.summary, "max-agents");
      return ok("career-agent", "Capped.");
    },
  });

  const result = await executePlan({
    requestId: "delegate-count",
    steps: [step("career-agent", "career-analysis", "career")],
    provided: { token: "x" },
    index: indexRepoAgents([career, ...helpers]),
    maxRetries: 0,
    maxAgentsPerRequest: 8,
  });
  assert.equal(result.responses[0]?.status, "success");
  assert.equal(
    result.traces.some(
      (event) => event.event === "delegate-denied" && event.reason === "max-agents",
    ),
    true,
  );
});

test("maxRuntime stops nested work", async () => {
  const slow = fakeAgent({
    id: "mentora",
    domain: "education",
    capability: "education-guidance",
    execute: async () => {
      await delay(80);
      return ok("mentora", "Too late.");
    },
  });
  const career = fakeAgent({
    id: "career-agent",
    domain: "career",
    capability: "career-analysis",
    execute: async () => {
      const nested = await requestSpecialist({
        agentId: "mentora",
        capability: "education-guidance",
        reason: "I need education information.",
      });
      return {
        agentId: "career-agent",
        status: nested.status === "success" ? "success" : "partial",
        result: { nested: nested.status },
        summary: nested.summary,
        runtimeMs: 1,
      };
    },
  });

  const result = await executePlan({
    requestId: "delegate-runtime",
    steps: [step("career-agent", "career-analysis", "career")],
    provided: { token: "x" },
    index: indexRepoAgents([career, slow]),
    maxRetries: 0,
    maxRuntimeMs: 20,
  });
  assert.notEqual(result.responses[0]?.status, "success");
  assert.equal(
    result.traces.some((event) => event.event === "cancelled" || event.reason === "max-runtime"),
    true,
  );
});
