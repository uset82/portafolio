import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_KNOWLEDGE_AGENT_ID,
  ANA_PORTFOLIO_BOUNDARY,
  isAskPortfolioQuestion,
  isSearchablePortfolioAudit,
  runAna,
  searchPortfolioKnowledge,
  understandIntent,
} from "@/ana/core";
import { PAPER2VIDEO_EXCLUDED } from "@/ana/domains";
import { loadEffectiveRepositoryAudits } from "@/ana/repositories/registry";
import { repositoryAuditSchema, type RepositoryAudit } from "@/ana/repositories/schemas";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const audit = (
  overrides: Partial<RepositoryAudit> & Pick<RepositoryAudit, "repository">,
): RepositoryAudit =>
  repositoryAuditSchema.parse({
    hasBackend: false,
    hasAPI: false,
    hasDatabase: false,
    hasLLM: false,
    domain: ["electronics"],
    capabilities: [],
    status: "prototype",
    agentPotential: "low",
    recommendedType: "knowledge",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 12_345,
    manifestFiles: [],
    ...overrides,
  });

const electronicsAgent = (): RepoAgent => {
  const manifest = parseAgentManifest({
    id: "electronics-agent",
    name: "Electronics",
    repository: "uset82/TRAFFICLIGHT",
    version: "1.0.0",
    description: "Electronics cluster",
    domains: ["electronics", "embedded", "iot", "fpga"],
    capabilities: ["traffic-light"],
    inputs: [{ name: "query", type: "string", required: false }],
    outputs: [{ name: "catalog", type: "object" }],
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
      result: { catalog: { title: "should not run" } },
      summary: "Should not execute for Ask My Portfolio.",
      runtimeMs: 1,
    }),
  });
};

const fixtureAudits = (): RepositoryAudit[] => [
  audit({
    repository: "uset82/TRAFFICLIGHT",
    domain: ["electronics", "embedded"],
    capabilities: ["traffic-light"],
    recommendedType: "tool",
    description: "Traffic-light state machine",
  }),
  audit({
    repository: "uset82/StrudelAI",
    domain: ["music"],
    recommendedType: "agent",
    hasLLM: true,
    description: "Live coding music system",
  }),
  audit({
    repository: "uset82/3Doodle",
    domain: ["3d"],
    recommendedType: "knowledge",
    hasLLM: true,
    description: "Sketch to 3D converter",
  }),
  audit({
    repository: "uset82/avatar-studio",
    domain: ["3d", "design"],
    recommendedType: "knowledge",
    description: "Avatar pipeline",
  }),
  audit({
    repository: "uset82/Paper2Video",
    domain: ["video", "research"],
    recommendedType: "disabled",
    status: "fork",
    description: "Upstream paper-to-video fork",
  }),
  audit({
    repository: "uset82/secret-lab",
    domain: ["electronics"],
    visibility: "private",
    recommendedType: "knowledge",
    description: "Private electronics notes",
  }),
];

test("Ask My Portfolio intent is navigation, not a CV or specialist question", () => {
  assert.equal(isAskPortfolioQuestion("What has Carlos built involving embedded systems?"), true);
  assert.equal(isAskPortfolioQuestion("Which projects combine AI and creativity?"), true);
  assert.deepEqual(understandIntent("What has Carlos built involving embedded systems?").goals, [
    "ask-portfolio",
  ]);
  assert.equal(understandIntent("Where did you work on your CV?").kind, "portfolio-fact");
  assert.deepEqual(understandIntent("Where did you work on your CV?").goals, []);
  assert.equal(
    understandIntent("Tell me about your work and the Astraea case study").goals.length,
    0,
  );
});

test("embedded-systems navigation cites public electronics repos and omits private, fork, and disabled sources", async () => {
  const result = await runAna(
    {
      requestId: "ana-ask-embedded",
      message: "What has Carlos built involving embedded systems?",
    },
    { agents: [electronicsAgent()], audits: fixtureAudits() },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.plan.goals.includes("ask-portfolio"), true);
  assert.match(result.answer, /uset82\/TRAFFICLIGHT/);
  assert.match(result.answer, /https:\/\/github.com\/uset82\/TRAFFICLIGHT/);
  assert.doesNotMatch(result.answer, /Paper2Video|secret-lab|12345|users|revenue/i);
  assert.equal(result.responses.length, 0);
  assert.equal(
    result.provenance.every((entry) => entry.agentId === ANA_KNOWLEDGE_AGENT_ID),
    true,
  );
  assert.match(result.answer, /electronics specialist is registered but was not executed/i);
});

test("AI and creativity navigation lists public creative repos without inventing metrics", async () => {
  const result = await runAna(
    {
      requestId: "ana-ask-creative",
      message: "Which projects combine AI and creativity?",
    },
    { agents: [], audits: fixtureAudits() },
  );
  assert.equal(result.status, "answered");
  assert.match(result.answer, /uset82\/StrudelAI/);
  assert.match(result.answer, /uset82\/3Doodle/);
  assert.match(result.answer, /uset82\/avatar-studio/);
  assert.doesNotMatch(result.answer, /TRAFFICLIGHT|Paper2Video|12345|stars|%/);
  assert.match(result.answer, /did not invent metrics/i);
});

test("biography and case-study questions still stay behind the CC AI boundary", async () => {
  const result = await runAna(
    { requestId: "ana-ask-cv", message: "Tell me about your work and the Astraea case study" },
    { agents: [], audits: fixtureAudits() },
  );
  assert.equal(result.answer, ANA_PORTFOLIO_BOUNDARY);
  assert.equal(result.status, "deferred");
});

test("the Railway image can load public audits from the site-vendored brain copy", async () => {
  const generatedPath = path.join(repoRoot, "site/brain/repositories/registry.generated.json");
  const overridesPath = path.join(repoRoot, "site/brain/repositories/registry.overrides.json");
  assert.equal(existsSync(generatedPath), true);
  const audits = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  assert.equal(
    audits.some((entry) => entry.repository === "uset82/StrudelAI"),
    true,
  );
});

test("committed public audits never surface Paper2Video, private repos, or forks as built work", async () => {
  const audits = await loadEffectiveRepositoryAudits({
    generatedPath: path.join(repoRoot, "brain/repositories/registry.generated.json"),
    overridesPath: path.join(repoRoot, "brain/repositories/registry.overrides.json"),
  });
  const searchable = audits.filter(isSearchablePortfolioAudit);
  assert.equal(
    searchable.some((entry) => entry.repository === PAPER2VIDEO_EXCLUDED),
    false,
  );
  assert.equal(
    searchable.some((entry) => entry.visibility === "private" || entry.status === "fork"),
    false,
  );
  const embedded = searchPortfolioKnowledge(
    "What has Carlos built involving embedded systems?",
    audits,
  );
  assert.equal(
    embedded.some((hit) => hit.repository === "uset82/TRAFFICLIGHT"),
    true,
  );
  assert.equal(
    embedded.some((hit) => hit.repository === PAPER2VIDEO_EXCLUDED),
    false,
  );
  const creative = searchPortfolioKnowledge("Which projects combine AI and creativity?", audits);
  const names = creative.map((hit) => hit.repository);
  assert.equal(names.includes("uset82/StrudelAI"), true);
  assert.equal(names.includes("uset82/3Doodle"), true);
  assert.equal(names.includes("uset82/avatar-studio"), true);
});
