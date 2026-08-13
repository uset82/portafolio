import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  DOMAIN_AGENT_IDS,
  DOMAIN_AGENTS,
  PAPER2VIDEO_EXCLUDED,
  applyAgentDependencies,
  domainAgentById,
  expandDomainMembers,
  executableDomainMembers,
  indexRepoAgents,
  routeIntent,
  runAna,
  draftPlan,
} from "@/ana/core";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const fakeAgent = (options: {
  id: string;
  domain: RepositoryDomain;
  capability: string;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA domain-agent tests.",
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
    execute: async () => ({
      agentId: manifest.id,
      status: "success",
      result: { fixture: true },
      summary: `Fixture result from ${manifest.id}.`,
      runtimeMs: 1,
    }),
  });
};

const astraea = fakeAgent({ id: "astraea", domain: "astrology", capability: "natal-chart" });
const pinaculo = fakeAgent({
  id: "pinaculo",
  domain: "numerology",
  capability: "numerology-profile",
});
const strudel = fakeAgent({ id: "strudel", domain: "music", capability: "pattern-generate" });
const mentora = fakeAgent({ id: "mentora", domain: "education", capability: "career-analysis" });
const smartapply = fakeAgent({
  id: "smartapply",
  domain: "career",
  capability: "application-track",
});
const thesisWriter = fakeAgent({
  id: "thesis-writer",
  domain: "research",
  capability: "thesis-outline",
});
const electronics = fakeAgent({
  id: "electronics-agent",
  domain: "electronics",
  capability: "traffic-light",
});
const stillas = fakeAgent({
  id: "stillas",
  domain: "construction",
  capability: "scaffolding-info",
});
const qr = fakeAgent({ id: "qr", domain: "web", capability: "generate-qr" });

test("five domain agents exist and do not execute knowledge or Paper2Video", () => {
  assert.deepEqual(
    [...DOMAIN_AGENT_IDS],
    ["creative", "engineering", "personal-insight", "education-agent", "career-agent"],
  );
  assert.equal(DOMAIN_AGENTS.length, 5);
  const repositories = DOMAIN_AGENTS.flatMap((agent) =>
    agent.members.map((member) => member.repository),
  );
  assert.equal(repositories.includes(PAPER2VIDEO_EXCLUDED), false);
  const creative = domainAgentById("creative");
  assert.equal(creative !== undefined, true);
  assert.equal(
    creative?.members.some(
      (member) => member.kind === "knowledge" && member.repository === "uset82/LyriGenie",
    ),
    true,
  );
  assert.equal(
    executableDomainMembers(creative as NonNullable<typeof creative>).every(
      (member) => member.kind === "specialist",
    ),
    true,
  );
});

test("default selection uses domain agents and hides unregistered micro-agents", () => {
  const message = "Please calculate a natal chart. Birth date 1815-12-10 10:00";
  const natal = draftPlan({
    requestId: "domain-1",
    message,
  });
  const routed = routeIntent(
    natal,
    indexRepoAgents([astraea, pinaculo, strudel, mentora, smartapply, electronics, stillas, qr]),
    message,
  );
  assert.deepEqual(routed.selectedDomains, ["personal-insight"]);
  assert.deepEqual(
    routed.steps.map((step) => step.agentId),
    ["astraea"],
  );
  assert.equal(
    routed.steps.some((step) =>
      ["pinaculo", "strudel", "electronics-agent", "stillas", "qr", "mentora"].includes(
        step.agentId,
      ),
    ),
    false,
  );
});

test("career-analysis expands Education and Career members, not thesis-writer", () => {
  const drafted = draftPlan({
    requestId: "domain-2",
    message: "I study software engineering and want career advice",
  });
  const routed = routeIntent(
    drafted,
    indexRepoAgents([mentora, smartapply, thesisWriter, electronics, qr]),
    "I study software engineering and want career advice",
  );
  assert.deepEqual(routed.selectedDomains, ["education-agent", "career-agent"]);
  assert.deepEqual(
    routed.steps.map((step) => step.agentId),
    ["mentora", "smartapply"],
  );
  assert.equal(
    routed.steps.some((step) => step.agentId === "thesis-writer"),
    false,
  );
  const ordered = applyAgentDependencies(routed.steps);
  const smartapplyStep = ordered.find((step) => step.agentId === "smartapply");
  assert.deepEqual(smartapplyStep?.dependsOn, ["mentora:career-analysis"]);
});

test("engineering expands to one electronics specialist, not five LLM agents", () => {
  const expanded = expandDomainMembers({
    domainAgentId: "engineering",
    goals: [],
    index: indexRepoAgents([electronics, stillas, qr]),
    message: "STM32 traffic light",
  });
  assert.deepEqual(
    expanded.steps.map((step) => step.agentId),
    ["electronics-agent"],
  );
  assert.equal(expanded.steps[0]?.domainAgentId, "engineering");
});

test("specialist provenance stays visible after domain aggregation", async () => {
  const result = await runAna(
    {
      requestId: "domain-3",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [astraea, pinaculo, electronics, qr] },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.provenance[0]?.agentId, "astraea");
  assert.equal(result.provenance[0]?.domainAgentId, "personal-insight");
  assert.equal(result.provenance[0]?.repository, "uset82/astraea");
  assert.match(result.answer, /Sources/);
  assert.match(result.answer, /astraea/);
  assert.match(result.answer, /via personal-insight/);
  assert.doesNotMatch(result.answer, /● personal-insight \(/);
  assert.equal(result.plan.selectedDomains?.includes("personal-insight"), true);
});
