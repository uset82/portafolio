import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  applyAgentDependencies,
  detectCycles,
  executePlan,
  indexRepoAgents,
  planExecutionWaves,
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
    description: "Fake specialist for ANA DAG tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: [{ name: "token", type: "string", required: true }],
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

const graphStep = (agentId: string, capability: string, domain: RepositoryDomain): AnaPlanStep => ({
  agentId,
  capability,
  domain,
  dependsOn: [],
});

const specGraph = () =>
  applyAgentDependencies([
    graphStep("astraea", "natal-chart", "astrology"),
    graphStep("pinaculo", "numerology-profile", "numerology"),
    graphStep("education", "career-analysis", "education"),
    graphStep("career", "career-analysis", "career"),
    graphStep("business", "business-ideas", "career"),
  ]);

test("the spec graph is career after education and business after career", () => {
  const steps = specGraph();
  const career = steps.find((step) => step.agentId === "career");
  const business = steps.find((step) => step.agentId === "business");
  assert.deepEqual(career?.dependsOn, ["education:career-analysis"]);
  assert.deepEqual(business?.dependsOn, [
    "career:career-analysis",
    "astraea:natal-chart",
    "pinaculo:numerology-profile",
  ]);
  assert.deepEqual(planExecutionWaves(steps).waves, [
    ["astraea:natal-chart", "pinaculo:numerology-profile", "education:career-analysis"],
    ["career:career-analysis"],
    ["business:business-ideas"],
  ]);
  assert.deepEqual(detectCycles(steps), []);
});

test("dangling predecessor ids are ignored during resolution", () => {
  const steps = applyAgentDependencies([
    graphStep("career", "career-analysis", "career"),
    graphStep("astraea", "natal-chart", "astrology"),
  ]);
  const career = steps.find((step) => step.agentId === "career");
  assert.deepEqual(career?.dependsOn, []);
  assert.deepEqual(planExecutionWaves(steps).waves, [
    ["career:career-analysis", "astraea:natal-chart"],
  ]);
});

test("circular dependencies are detected and not executed", async () => {
  const started: string[] = [];
  const left: AnaPlanStep = {
    agentId: "left",
    capability: "natal-chart",
    domain: "astrology",
    dependsOn: ["right:natal-chart"],
  };
  const right: AnaPlanStep = {
    agentId: "right",
    capability: "natal-chart",
    domain: "astrology",
    dependsOn: ["left:natal-chart"],
  };
  assert.deepEqual(detectCycles([left, right]), [["left:natal-chart", "right:natal-chart"]]);
  const make = (id: string) =>
    fakeAgent({
      id,
      domain: "astrology",
      capability: "natal-chart",
      execute: async () => {
        started.push(id);
        return {
          agentId: id,
          status: "success",
          result: { fixture: true },
          summary: `${id} ok`,
          runtimeMs: 1,
        };
      },
    });
  const result = await executePlan({
    requestId: "dag-cycle",
    steps: [left, right],
    provided: { token: "x" },
    index: indexRepoAgents([make("left"), make("right")]),
    maxRetries: 0,
  });
  assert.deepEqual(started, []);
  assert.equal(result.responses[0]?.status, "failed");
  assert.match(result.responses[0]?.summary ?? "", /Circular dependency/);
});

test("career runs only after education finishes", { timeout: 3_000 }, async () => {
  let educationEnded = 0;
  let careerStarted = 0;
  const education = fakeAgent({
    id: "education",
    domain: "education",
    capability: "career-analysis",
    execute: async () => {
      await delay(30);
      educationEnded = Date.now();
      return {
        agentId: "education",
        status: "success",
        result: { fixture: true },
        summary: "education ok",
        runtimeMs: 30,
      };
    },
  });
  const career = fakeAgent({
    id: "career",
    domain: "career",
    capability: "career-analysis",
    execute: async () => {
      careerStarted = Date.now();
      return {
        agentId: "career",
        status: "success",
        result: { fixture: true },
        summary: "career ok",
        runtimeMs: 1,
      };
    },
  });
  const steps = applyAgentDependencies([
    graphStep("education", "career-analysis", "education"),
    graphStep("career", "career-analysis", "career"),
  ]);
  const result = await executePlan({
    requestId: "dag-career",
    steps,
    provided: { token: "x" },
    index: indexRepoAgents([education, career]),
    maxRetries: 0,
  });
  assert.equal(
    result.responses.every((response) => response.status === "success"),
    true,
  );
  assert.equal(educationEnded > 0, true);
  assert.equal(careerStarted >= educationEnded, true);
});

test(
  "business waits for career while independent specialists overlap",
  { timeout: 3_000 },
  async () => {
    let started = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const times: Record<string, { start: number; end: number }> = {};
    const make = (id: string, domain: RepositoryDomain, capability: string) =>
      fakeAgent({
        id,
        domain,
        capability,
        execute: async () => {
          const start = Date.now();
          if (id === "astraea" || id === "pinaculo" || id === "education") {
            started += 1;
            if (started === 3) release();
            await gate;
          }
          if (id === "career" || id === "business") await delay(5);
          times[id] = { start, end: Date.now() };
          return {
            agentId: id,
            status: "success",
            result: { fixture: true },
            summary: `${id} ok`,
            runtimeMs: 1,
          };
        },
      });
    const agents = [
      make("astraea", "astrology", "natal-chart"),
      make("pinaculo", "numerology", "numerology-profile"),
      make("education", "education", "career-analysis"),
      make("career", "career", "career-analysis"),
      make("business", "career", "business-ideas"),
    ];
    const steps = specGraph();
    const result = await executePlan({
      requestId: "dag-business",
      steps,
      provided: { token: "x" },
      index: indexRepoAgents(agents),
      maxRetries: 0,
      concurrencyLimit: 3,
    });
    assert.equal(result.responses.length, 5);
    assert.equal(
      result.responses.every((response) => response.status === "success"),
      true,
    );
    const career = times.career;
    const business = times.business;
    const education = times.education;
    assert.ok(career && business && education);
    assert.equal(career.start >= education.end, true);
    assert.equal(business.start >= career.end, true);
    assert.equal(business.start >= (times.astraea?.end ?? 0), true);
    assert.equal(business.start >= (times.pinaculo?.end ?? 0), true);
  },
);
