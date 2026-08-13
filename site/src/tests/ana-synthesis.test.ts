import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  buildAnaSynthesis,
  indexRepoAgents,
  synthesizeAnaResult,
  verifyResponses,
  type AnaPlan,
  type AnaPlanStep,
} from "@/ana/core";
import type { AgentResponse } from "@/ana/protocol/schemas";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const fakeAgent = (id: string, domain: RepositoryDomain, capability: string): RepoAgent => {
  const manifest = parseAgentManifest({
    id,
    name: id,
    repository: `uset82/${id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA synthesis tests.",
    domains: [domain],
    capabilities: [capability],
    inputs: [{ name: "token", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: domain === "astrology" || domain === "numerology" ? "sensitive" : "public",
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
      summary: `${id} unused execute`,
      runtimeMs: 1,
    }),
  });
};

const step = (agentId: string, capability: string, domain: RepositoryDomain): AnaPlanStep => ({
  agentId,
  capability,
  domain,
  dependsOn: [],
});

const planOf = (steps: AnaPlanStep[], unavailableAgents: string[] = []): AnaPlan => ({
  kind: "specialist",
  goals: ["career-analysis"],
  domains: steps.map((entry) => entry.domain),
  provided: {},
  steps,
  missingInputs: [],
  unavailableAgents,
  dag: {
    execution: "mixed",
    nodes: steps.map((entry) => ({
      id: `${entry.agentId}:${entry.capability}`,
      agentId: entry.agentId,
      capability: entry.capability,
      dependsOn: [],
    })),
    waves: [steps.map((entry) => `${entry.agentId}:${entry.capability}`)],
    cycles: [],
  },
});

const response = (options: {
  agentId: string;
  summary: string;
  confidence?: number;
  status?: AgentResponse["status"];
}): AgentResponse => {
  const payload: AgentResponse = {
    agentId: options.agentId,
    status: options.status ?? "success",
    result: { fixture: true },
    summary: options.summary,
    runtimeMs: 1,
  };
  if (options.confidence !== undefined) payload.confidence = options.confidence;
  return payload;
};

test("synthesis keeps symbolic interpretation out of high-confidence facts", () => {
  const steps = [
    step("education", "education-profile", "education"),
    step("astraea", "natal-chart", "astrology"),
  ];
  const responses = [
    response({
      agentId: "education",
      summary: "Software engineering skills are a verified strength.",
      confidence: 0.91,
    }),
    response({
      agentId: "astraea",
      summary: "Warm, outward temperament.",
      confidence: 0.99,
    }),
  ];
  const plan = planOf(steps);
  const index = indexRepoAgents([
    fakeAgent("education", "education", "education-profile"),
    fakeAgent("astraea", "astrology", "natal-chart"),
  ]);
  const verification = verifyResponses(plan, responses);
  const synthesized = synthesizeAnaResult({ plan, responses, verification, index });
  assert.match(synthesized.answer, /AGREEMENTS/);
  assert.match(synthesized.answer, /CONTRADICTIONS/);
  assert.match(synthesized.answer, /HIGH-CONFIDENCE FACTS/);
  assert.match(synthesized.answer, /ASSUMPTIONS/);
  assert.match(synthesized.answer, /SYMBOLIC INTERPRETATION/);
  assert.match(synthesized.answer, /PRACTICAL EVIDENCE/);
  assert.match(synthesized.answer, /RECOMMENDATIONS/);
  assert.match(synthesized.answer, /ACTION PLAN/);
  assert.match(synthesized.answer, /Software engineering skills are a verified strength/);
  assert.match(synthesized.answer, /Warm, outward temperament/);
  assert.match(synthesized.answer, /Keep symbolic interpretation separate/);
  const facts = synthesized.answer.split("SYMBOLIC INTERPRETATION")[0] ?? "";
  assert.match(facts, /HIGH-CONFIDENCE FACTS/);
  assert.match(facts, /Software engineering skills/);
  assert.doesNotMatch(facts, /Warm, outward temperament|Sun in Leo/);
  assert.doesNotMatch(synthesized.answer, /become an engineer because of (your )?natal/i);
});

test("conflicting career specialists are reported and not concatenated into one claim", () => {
  const steps = [
    step("career-alpha", "career-analysis", "career"),
    step("career-beta", "career-analysis", "career"),
  ];
  const responses = [
    response({ agentId: "career-alpha", summary: "Recommend embedded systems." }),
    response({ agentId: "career-beta", summary: "Recommend product design." }),
  ];
  const plan = planOf(steps);
  const index = indexRepoAgents([
    fakeAgent("career-alpha", "career", "career-analysis"),
    fakeAgent("career-beta", "career", "career-analysis"),
  ]);
  const verification = verifyResponses(plan, responses);
  assert.equal(verification.contradictions.length > 0, true);
  const synthesis = buildAnaSynthesis({
    responses,
    provenance: [
      {
        statement: "Recommend embedded systems.",
        agentId: "career-alpha",
        repository: "uset82/career-alpha",
        capability: "career-analysis",
        producedAt: "2026-08-13T08:00:00Z",
        inputFingerprint: "a".repeat(64),
      },
      {
        statement: "Recommend product design.",
        agentId: "career-beta",
        repository: "uset82/career-beta",
        capability: "career-analysis",
        producedAt: "2026-08-13T08:00:01Z",
        inputFingerprint: "b".repeat(64),
      },
    ],
    verification,
    unavailableAgents: [],
  });
  assert.equal(synthesis.contradictions.length > 0, true);
  assert.equal(synthesis.practicalEvidence.length, 2);
  assert.match(synthesis.combined, /Conflicting specialist claims/);
  assert.doesNotMatch(synthesis.combined, /Recommend embedded systems\.Recommend product design/);
  const synthesized = synthesizeAnaResult({ plan, responses, verification, index });
  assert.match(synthesized.answer, /CONTRADICTIONS/);
  assert.match(synthesized.answer, /does not pick a winner/i);
  assert.match(synthesized.answer, /Recommend embedded systems/);
  assert.match(synthesized.answer, /Recommend product design/);
});
