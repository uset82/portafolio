import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  collectProvenance,
  fingerprintInput,
  formatProvenanceSources,
  indexRepoAgents,
  runAna,
  synthesizeAnaResult,
  verifyResponses,
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
    description: "Fake specialist for ANA provenance tests.",
    domains: [domain],
    capabilities: [capability],
    inputs: [
      { name: "birthDate", type: "string", required: false },
      { name: "fullName", type: "string", required: false },
      { name: "token", type: "string", required: false },
    ],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "sensitive",
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
      summary: "Software engineering skills are a verified strength.",
      confidence: 0.91,
      runtimeMs: 1,
    }),
  });
};

test("input fingerprints are stable and never contain the raw values", () => {
  const first = fingerprintInput({ birthDate: "1815-12-10", fullName: "Ada Lovelace" });
  const second = fingerprintInput({ fullName: "Ada Lovelace", birthDate: "1815-12-10" });
  const other = fingerprintInput({ birthDate: "1995-05-12", fullName: "Ada Lovelace" });
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.equal(first, second);
  assert.notEqual(first, other);
  assert.doesNotMatch(first, /1815-12-10|Ada Lovelace|1995-05-12/);
});

test("a synthesized claim retains producer, repository, capability, time, fingerprint, and confidence", () => {
  const education = fakeAgent("education", "education", "education-profile");
  const step: AnaPlanStep = {
    agentId: "education",
    capability: "education-profile",
    domain: "education",
    dependsOn: [],
  };
  const responses: AgentResponse[] = [
    {
      agentId: "education",
      status: "success",
      result: { fixture: true },
      summary: "Software engineering skills are a verified strength.",
      confidence: 0.91,
      runtimeMs: 1,
    },
  ];
  const plan = {
    kind: "specialist" as const,
    goals: ["career-analysis" as const],
    domains: ["education" as const],
    provided: { birthDate: "1815-12-10", fullName: "Ada Lovelace", token: "x" },
    steps: [step],
    missingInputs: [],
    unavailableAgents: [],
    dag: {
      execution: "parallel" as const,
      nodes: [
        {
          id: "education:education-profile",
          agentId: "education",
          capability: "education-profile",
          dependsOn: [],
        },
      ],
      waves: [["education:education-profile"]],
      cycles: [],
    },
  };
  const index = indexRepoAgents([education]);
  const provenance = collectProvenance({
    plan,
    responses,
    index,
    traces: [
      {
        at: "2026-08-13T08:15:00Z",
        agentId: "education",
        capability: "education-profile",
        event: "success",
        attempt: 1,
        runtimeMs: 1,
      },
    ],
  });
  assert.equal(provenance.length, 1);
  const claim = provenance[0];
  assert.equal(claim?.statement, "Software engineering skills are a verified strength.");
  assert.equal(claim?.agentId, "education");
  assert.equal(claim?.repository, "uset82/education");
  assert.equal(claim?.capability, "education-profile");
  assert.equal(claim?.producedAt, "2026-08-13T08:15:00Z");
  assert.equal(claim?.confidence, 0.91);
  assert.match(claim?.inputFingerprint ?? "", /^[a-f0-9]{64}$/);
  const serialized = JSON.stringify({ provenance, sources: formatProvenanceSources(provenance) });
  assert.doesNotMatch(serialized, /1815-12-10|Ada Lovelace|birthDate|fullName/);
  const synthesized = synthesizeAnaResult({
    plan,
    responses,
    verification: verifyResponses(plan, responses),
    index,
    traces: [
      {
        at: "2026-08-13T08:15:00Z",
        agentId: "education",
        capability: "education-profile",
        event: "success",
        attempt: 1,
        runtimeMs: 1,
      },
    ],
  });
  assert.match(synthesized.answer, /Sources/);
  assert.match(synthesized.answer, /education/);
  assert.match(synthesized.answer, /education-profile/);
  assert.match(synthesized.answer, /uset82\/education/);
  assert.doesNotMatch(synthesized.answer, /1815-12-10|Ada Lovelace/);
  assert.equal(synthesized.provenance[0]?.statement, claim?.statement);
});

test("runAna provenance omits private natal inputs from the public answer", async () => {
  const astraea = fakeAgent("astraea", "astrology", "natal-chart");
  const result = await runAna(
    {
      requestId: "prov-1",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [astraea], maxRetries: 0 },
  );
  assert.equal(result.provenance[0]?.capability, "natal-chart");
  assert.equal(result.provenance[0]?.agentId, "astraea");
  assert.equal(result.provenance[0]?.repository, "uset82/astraea");
  assert.match(result.provenance[0]?.producedAt ?? "", /T.*Z/);
  assert.match(result.provenance[0]?.inputFingerprint ?? "", /^[a-f0-9]{64}$/);
  assert.equal(
    result.provenance[0]?.statement,
    "Software engineering skills are a verified strength.",
  );
  const publicSurface = `${result.answer}\n${JSON.stringify(result.provenance)}`;
  assert.doesNotMatch(publicSurface, /1815-12-10/);
  assert.match(result.answer, /Sources/);
});
