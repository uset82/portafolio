import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_PORTFOLIO_BOUNDARY,
  emptyVerification,
  indexRepoAgents,
  runAna,
  synthesizeAnaResult,
  understandIntent,
} from "@/ana/core";
import { SYMBOLIC_INTERPRETATION_WARNING } from "@/ana/specialists";

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "numerology" | "music";
  capability: string;
  inputs: { name: string; type: "string" | "number"; required: boolean }[];
  summary: string;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA Core tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: options.inputs.map((input) => ({
      name: input.name,
      type: input.type,
      required: input.required,
    })),
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: options.domain === "music" ? "public" : "sensitive",
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
    execute: async (request) => ({
      agentId: manifest.id,
      status: "success",
      result: { fixture: true, received: request.input },
      summary: options.summary,
      ...(options.domain === "music" ? {} : { warnings: [SYMBOLIC_INTERPRETATION_WARNING] }),
      runtimeMs: 1,
    }),
  });
};

const astraea = fakeAgent({
  id: "astraea",
  domain: "astrology",
  capability: "natal-chart",
  inputs: [
    { name: "birthDate", type: "string", required: true },
    { name: "birthTime", type: "string", required: true },
  ],
  summary: "Fixture natal chart from the fake ASTRAEA agent.",
});

const pinaculo = fakeAgent({
  id: "pinaculo",
  domain: "numerology",
  capability: "numerology-profile",
  inputs: [
    { name: "fullName", type: "string", required: true },
    { name: "birthDate", type: "string", required: true },
  ],
  summary: "Fixture Pináculo profile from the fake numerology agent.",
});

test("ANA delegates specialist domains and does not invent the answer", async () => {
  const result = await runAna(
    {
      requestId: "ana-1",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.kind, "specialist");
  assert.equal(result.status, "answered");
  assert.equal(result.responses.length, 1);
  assert.equal(result.responses[0]?.agentId, "astraea");
  assert.match(result.answer, /delegated/i);
  assert.match(result.answer, /Fixture natal chart/);
  assert.doesNotMatch(result.answer, /Sun in Leo/);
  assert.equal(result.provenance[0]?.capability, "natal-chart");
  assert.equal(result.warnings.includes(SYMBOLIC_INTERPRETATION_WARNING), true);
});

test("ANA asks for missing inputs instead of executing", async () => {
  const result = await runAna(
    { requestId: "ana-2", message: "Run a numerology profile for me" },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.status, "needs-input");
  assert.deepEqual(result.plan.missingInputs, ["fullName", "birthDate"]);
  assert.equal(result.responses.length, 0);
  assert.match(result.answer, /fullName/);
});

test("ANA defers portfolio facts to CC AI's public knowledge boundary", async () => {
  const result = await runAna(
    { requestId: "ana-3", message: "Tell me about your work and the Astraea case study" },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.kind, "portfolio-fact");
  assert.equal(result.status, "deferred");
  assert.equal(result.responses.length, 0);
  assert.equal(result.answer, ANA_PORTFOLIO_BOUNDARY);
  assert.doesNotMatch(result.answer, /Acme|Google|invented employer/);
});

test("ANA delegates numerology to the fake Pináculo agent only", async () => {
  const result = await runAna(
    {
      requestId: "ana-4",
      message: "Run a numerology profile. My name is Ada Lovelace. 1815-12-10",
    },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.responses.length, 1);
  assert.equal(result.responses[0]?.agentId, "pinaculo");
  assert.match(result.answer, /Fixture Pináculo profile/);
  assert.doesNotMatch(result.answer, /astraea|Sun in Leo/i);
});

test("ANA refuses a specialist domain when a capable agent exists but was not delegated", () => {
  const synthesized = synthesizeAnaResult({
    plan: {
      kind: "specialist",
      goals: ["natal-chart"],
      domains: ["astrology"],
      provided: { birthDate: "1815-12-10", birthTime: "10:00" },
      steps: [
        {
          agentId: "astraea",
          capability: "natal-chart",
          domain: "astrology",
          dependsOn: [],
        },
      ],
      missingInputs: [],
      unavailableAgents: [],
      dag: {
        execution: "parallel",
        nodes: [
          {
            id: "astraea:natal-chart",
            agentId: "astraea",
            capability: "natal-chart",
            dependsOn: [],
          },
        ],
        waves: [["astraea:natal-chart"]],
        cycles: [],
      },
    },
    responses: [],
    verification: emptyVerification(),
    index: indexRepoAgents([astraea]),
  });
  assert.equal(synthesized.status, "failed");
  assert.match(synthesized.answer, /without delegation/);
  assert.doesNotMatch(synthesized.answer, /Sun in Leo/);
});

test("ANA will not invent a specialist answer when no agent is registered", async () => {
  const result = await runAna(
    { requestId: "ana-5", message: "Calculate a natal chart for 1815-12-10" },
    { agents: [] },
  );
  assert.equal(result.status, "failed");
  assert.equal(result.responses.length, 0);
  assert.match(result.answer, /will not invent/);
});

test("understandIntent keeps portfolio questions out of specialist routing", () => {
  assert.equal(understandIntent("Where did you work on your CV?").kind, "portfolio-fact");
  assert.equal(understandIntent("Calculate a natal chart").kind, "specialist");
});
