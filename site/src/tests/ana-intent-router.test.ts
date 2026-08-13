import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  draftPlan,
  extractProvided,
  indexRepoAgents,
  routeIntent,
  runAna,
  understandIntent,
} from "@/ana/core";

const ANNA_OSLO_FIXTURE =
  "My name is Anna. I was born 12 May 1995 at 14:35 in Oslo. I study software engineering and want to start a music company.";

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "numerology" | "music" | "web";
  capability: string;
  inputs: { name: string; type: "string" | "number"; required: boolean }[];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA intent-router tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: options.inputs.map((input) => ({
      name: input.name,
      type: input.type,
      required: input.required,
    })),
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
    execute: async (request) => ({
      agentId: manifest.id,
      status: "success",
      result: { fixture: true, received: request.input },
      summary: `Fixture result from ${manifest.id}.`,
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
});

const pinaculo = fakeAgent({
  id: "pinaculo",
  domain: "numerology",
  capability: "numerology-profile",
  inputs: [
    { name: "fullName", type: "string", required: true },
    { name: "birthDate", type: "string", required: true },
  ],
});

const strudel = fakeAgent({
  id: "strudel",
  domain: "music",
  capability: "pattern-generate",
  inputs: [{ name: "prompt", type: "string", required: true }],
});

const qr = fakeAgent({
  id: "qr",
  domain: "web",
  capability: "generate-qr",
  inputs: [{ name: "text", type: "string", required: true }],
});

test("the Anna/Oslo fixture detects goals, extracts data, and builds a parallel DAG", () => {
  const drafted = draftPlan({ requestId: "anna-1", message: ANNA_OSLO_FIXTURE });
  assert.equal(drafted.kind, "specialist");
  assert.deepEqual(drafted.goals, [
    "personality-analysis",
    "career-analysis",
    "business-ideas",
    "pattern-generate",
  ]);
  assert.deepEqual(drafted.provided, {
    fullName: "Anna",
    birthDate: "1995-05-12",
    birthTime: "14:35",
    birthPlace: "Oslo",
    fieldOfStudy: "software engineering",
    prompt: "start a music company",
  });
  assert.equal("latitude" in drafted.provided, false);
  assert.equal("longitude" in drafted.provided, false);
  assert.doesNotMatch(ANNA_OSLO_FIXTURE, /1982|carlos/i);

  const routed = routeIntent(
    drafted,
    indexRepoAgents([astraea, pinaculo, strudel, qr]),
    ANNA_OSLO_FIXTURE,
  );
  assert.deepEqual(
    routed.steps.map((step) => step.agentId),
    ["astraea", "pinaculo", "strudel"],
  );
  assert.deepEqual(routed.selectedDomains, [
    "personal-insight",
    "education-agent",
    "career-agent",
    "creative",
  ]);
  assert.deepEqual(routed.unavailableAgents, ["business", "career-agent", "education-agent"]);
  assert.equal(routed.dag.execution, "parallel");
  assert.equal(routed.dag.nodes.length, 3);
  assert.equal(
    routed.dag.nodes.every((node) => node.dependsOn.length === 0),
    true,
  );
  assert.equal(
    routed.steps.some((step) => step.agentId === "qr"),
    false,
  );
});

test("the Anna/Oslo fixture asks only for missing selected-agent inputs", async () => {
  const withoutTime = ANNA_OSLO_FIXTURE.replace(" at 14:35", "");
  const result = await runAna(
    { requestId: "anna-2", message: withoutTime },
    { agents: [astraea, pinaculo, strudel, qr] },
  );
  assert.equal(result.status, "needs-input");
  assert.deepEqual(result.plan.missingInputs, ["birthTime"]);
  assert.equal(result.responses.length, 0);
  assert.match(result.answer, /birthTime/);
  assert.doesNotMatch(result.answer, /mentora|latitude|text/);
});

test("the Anna/Oslo fixture delegates only registered specialists and does not invent the rest", async () => {
  const result = await runAna(
    { requestId: "anna-3", message: ANNA_OSLO_FIXTURE },
    { agents: [astraea, pinaculo, strudel, qr] },
  );
  assert.equal(result.status, "answered");
  assert.deepEqual(
    result.responses.map((response) => response.agentId),
    ["astraea", "pinaculo", "strudel"],
  );
  assert.match(result.answer, /business, career-agent, education-agent/);
  assert.match(result.answer, /did not invent/);
  assert.doesNotMatch(result.answer, /qr|Sun in Leo|Google/);
});

test("explicit natal chart selects only ASTRAEA", () => {
  const message = "Please calculate a natal chart. Birth date 1815-12-10 10:00";
  const drafted = draftPlan({ requestId: "natal-1", message });
  assert.deepEqual(drafted.goals, ["natal-chart"]);
  const routed = routeIntent(drafted, indexRepoAgents([astraea, pinaculo, strudel, qr]), message);
  assert.deepEqual(
    routed.steps.map((step) => step.agentId),
    ["astraea"],
  );
  assert.deepEqual(routed.selectedDomains, ["personal-insight"]);
  assert.equal(routed.steps[0]?.domainAgentId, "personal-insight");
  assert.deepEqual(routed.unavailableAgents, []);
});

test("extractProvided keeps ISO dates and does not geocode a birth place", () => {
  const provided = extractProvided({
    requestId: "extract-1",
    message: "My name is Ada Lovelace. 1815-12-10 10:00 in London",
  });
  assert.equal(provided.fullName, "Ada Lovelace");
  assert.equal(provided.birthDate, "1815-12-10");
  assert.equal(provided.birthPlace, "London");
  assert.equal(provided.latitude, undefined);
  assert.equal(provided.longitude, undefined);
});

test("understandIntent still keeps portfolio questions out of specialist routing", () => {
  const intent = understandIntent("Tell me about your work and the Astraea case study");
  assert.equal(intent.kind, "portfolio-fact");
  assert.deepEqual(intent.goals, []);
});
