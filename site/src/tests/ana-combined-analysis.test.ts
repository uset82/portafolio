import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_COMBINED_CONSENT_FIELD,
  ANA_COMBINED_CONSENT_PROMPT,
  draftPlan,
  indexRepoAgents,
  routeIntent,
  runAna,
  understandIntent,
} from "@/ana/core";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const COMBINED_WITHOUT_CONSENT =
  "Combined analysis of my personality, education, career, and business. My name is Anna. I was born 12 May 1995 at 14:35 in Oslo. Education: software engineering. Skills: analysis. Interests: engines. Goals: apply my work.";

const COMBINED_WITH_CONSENT = `Combined analysis of my personality, education, career, and business. I consent to share my personal profile.
My name is Ada Lovelace. Birth date 1815-12-10 10:00 in London.
Education: mathematics
Skills: analysis
Interests: engines
Goals: apply my work`;

const PII = /Anna|Oslo|1995-05-12|14:35|Ada Lovelace|1815-12-10|fullName|birthDate|birthTime/;

const fakeAgent = (options: {
  id: string;
  domain: RepositoryDomain;
  capability: string;
  inputs: { name: string; required: boolean }[];
  summary: string;
  confidence?: number;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA combined-analysis tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: options.inputs.map((input) => ({
      name: input.name,
      type: "string",
      required: input.required,
    })),
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity:
      options.domain === "astrology" || options.domain === "numerology" ? "sensitive" : "personal",
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
    execute: async (request) => {
      const response: {
        agentId: string;
        status: "success";
        result: { received: Record<string, unknown> };
        summary: string;
        runtimeMs: number;
        confidence?: number;
      } = {
        agentId: manifest.id,
        status: "success",
        result: { received: request.input },
        summary: options.summary,
        runtimeMs: 1,
      };
      if (options.confidence !== undefined) response.confidence = options.confidence;
      return response;
    },
  });
};

const profileInputs = [
  { name: "fullName", required: false },
  { name: "birthDate", required: false },
  { name: "birthTime", required: false },
  { name: "birthPlace", required: false },
  { name: "education", required: false },
  { name: "skills", required: false },
  { name: "goals", required: false },
  { name: "interests", required: false },
  { name: "fieldOfStudy", required: false },
  { name: "prompt", required: false },
];

const specialists = () => ({
  astraea: fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [
      { name: "birthDate", required: true },
      { name: "birthTime", required: true },
      { name: "birthPlace", required: false },
      { name: "fullName", required: false },
      { name: "education", required: false },
    ],
    summary: "Warm, outward temperament.",
    confidence: 0.99,
  }),
  pinaculo: fakeAgent({
    id: "pinaculo",
    domain: "numerology",
    capability: "numerology-profile",
    inputs: [
      { name: "fullName", required: true },
      { name: "birthDate", required: true },
      { name: "birthTime", required: false },
      { name: "education", required: false },
    ],
    summary: "Name number emphasizes structure.",
    confidence: 0.95,
  }),
  mentora: fakeAgent({
    id: "mentora",
    domain: "education",
    capability: "career-analysis",
    inputs: profileInputs,
    summary: "Mathematics education is a verified foundation.",
    confidence: 0.91,
  }),
  smartapply: fakeAgent({
    id: "smartapply",
    domain: "career",
    capability: "application-track",
    inputs: profileInputs,
    summary: "Application tracking shows engineering-adjacent roles.",
    confidence: 0.88,
  }),
  business: fakeAgent({
    id: "business",
    domain: "career",
    capability: "business-ideas",
    inputs: profileInputs,
    summary: "A tables business is a practical option.",
    confidence: 0.84,
  }),
});

test("explicit natal-only requests stay on ASTRAEA and are not combined analysis", () => {
  const message = "Please calculate a natal chart. Birth date 1815-12-10 10:00";
  const intent = understandIntent(message);
  assert.deepEqual(intent.goals, ["natal-chart"]);
  const drafted = draftPlan({ requestId: "combined-natal", message });
  const { astraea, pinaculo, mentora, smartapply, business } = specialists();
  const routed = routeIntent(
    drafted,
    indexRepoAgents([astraea, pinaculo, mentora, smartapply, business]),
    message,
  );
  assert.deepEqual(
    routed.steps.map((step) => step.agentId),
    ["astraea"],
  );
});

test("combined analysis without consent does not share personal fields", async () => {
  const { astraea, pinaculo, mentora, smartapply, business } = specialists();
  const result = await runAna(
    { requestId: "combined-no-consent", message: COMBINED_WITHOUT_CONSENT },
    { agents: [astraea, pinaculo, mentora, smartapply, business] },
  );
  assert.equal(result.status, "needs-input");
  assert.deepEqual(result.plan.missingInputs, [ANA_COMBINED_CONSENT_FIELD]);
  assert.equal(result.responses.length, 0);
  assert.equal(result.answer, ANA_COMBINED_CONSENT_PROMPT);
  assert.doesNotMatch(result.answer, PII);
  assert.doesNotMatch(JSON.stringify(result.traces), PII);
  assert.deepEqual(
    result.plan.steps.map((step) => step.agentId),
    ["astraea", "pinaculo", "mentora", "smartapply", "business"],
  );
});

test("combined analysis with consent runs the five specialists and keeps four labeled sections", async () => {
  const { astraea, pinaculo, mentora, smartapply, business } = specialists();
  const result = await runAna(
    { requestId: "combined-consent", message: COMBINED_WITH_CONSENT },
    { agents: [astraea, pinaculo, mentora, smartapply, business] },
  );
  assert.equal(result.status, "answered");
  assert.deepEqual(result.plan.goals, ["combined-analysis"]);
  assert.deepEqual(
    result.responses.map((response) => response.agentId),
    ["astraea", "pinaculo", "mentora", "smartapply", "business"],
  );
  assert.deepEqual(result.plan.unavailableAgents, ["market-research"]);
  const businessStep = result.plan.steps.find((step) => step.agentId === "business");
  assert.equal(businessStep?.dependsOn.includes("smartapply:application-track"), true);
  assert.equal(businessStep?.dependsOn.includes("astraea:natal-chart"), true);
  assert.equal(businessStep?.dependsOn.includes("pinaculo:numerology-profile"), true);
  const careerStep = result.plan.steps.find((step) => step.agentId === "smartapply");
  assert.deepEqual(careerStep?.dependsOn, ["mentora:career-analysis"]);

  assert.match(result.answer, /FACTUAL ANALYSIS/);
  assert.match(result.answer, /SYMBOLIC INTERPRETATION/);
  assert.match(result.answer, /AI INFERENCE/);
  assert.match(result.answer, /ACTIONABLE RECOMMENDATION/);
  const factual = result.answer.split("SYMBOLIC INTERPRETATION")[0] ?? "";
  assert.match(factual, /Mathematics education is a verified foundation/);
  assert.match(factual, /Application tracking shows engineering-adjacent roles/);
  assert.doesNotMatch(factual, /Warm, outward temperament|Name number emphasizes structure/);
  assert.match(result.answer, /Warm, outward temperament/);
  assert.match(result.answer, /ANA inferences, not verified facts/);
  assert.match(result.answer, /suggestions, not facts/);
  assert.doesNotMatch(result.answer, /become an engineer because of (your )?natal/i);
  assert.match(result.answer, /did not invent/);
  assert.doesNotMatch(result.answer, /market (size|share|forecast)|TAM|invented market/i);
  assert.doesNotMatch(result.answer, PII);
  assert.doesNotMatch(JSON.stringify(result.traces), PII);

  const received = Object.fromEntries(
    result.responses.map((response) => [
      response.agentId,
      (response.result as { received: Record<string, unknown> }).received,
    ]),
  );
  assert.deepEqual(received.astraea, {
    birthDate: "1815-12-10",
    birthTime: "10:00",
    birthPlace: "London",
  });
  assert.deepEqual(received.pinaculo, {
    fullName: "Ada Lovelace",
    birthDate: "1815-12-10",
  });
  assert.deepEqual(received.mentora, {
    education: "mathematics",
    skills: "analysis",
    interests: "engines",
    goals: "apply my work",
  });
  assert.deepEqual(received.smartapply, {
    education: "mathematics",
    skills: "analysis",
    goals: "apply my work",
  });
  assert.deepEqual(received.business, {
    education: "mathematics",
    skills: "analysis",
    interests: "engines",
    goals: "apply my work",
  });
});

test("combined analysis lists unregistered education, career, and business without inventing them", async () => {
  const { astraea, pinaculo } = specialists();
  const result = await runAna(
    {
      requestId: "combined-partial",
      message: COMBINED_WITH_CONSENT,
    },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.status, "answered");
  assert.deepEqual(
    result.responses.map((response) => response.agentId),
    ["astraea", "pinaculo"],
  );
  assert.deepEqual(result.plan.unavailableAgents, [
    "business",
    "career-agent",
    "education-agent",
    "market-research",
  ]);
  assert.match(result.answer, /UNAVAILABLE SPECIALISTS/);
  assert.match(result.answer, /did not invent/);
  assert.doesNotMatch(result.answer, /become an engineer because of (your )?natal/i);
  assert.doesNotMatch(result.answer, PII);
});

test("sharePersonalProfile input is enough consent for combined analysis", async () => {
  const { astraea, pinaculo, mentora, smartapply, business } = specialists();
  const result = await runAna(
    {
      requestId: "combined-flag",
      message: COMBINED_WITHOUT_CONSENT,
      input: { sharePersonalProfile: true },
    },
    { agents: [astraea, pinaculo, mentora, smartapply, business] },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.responses.length, 5);
  assert.doesNotMatch(result.answer, PII);
});
