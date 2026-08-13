import assert from "node:assert/strict";
import test from "node:test";
import {
  defineRepoAgent,
  parseAgentManifest,
  resultMatchesManifestOutputs,
  type RepoAgent,
} from "@/ana/protocol";
import {
  ANA_LOW_CONFIDENCE_THRESHOLD,
  ANA_VERIFICATION_AGENT_ID,
  ANA_VERIFICATION_CAPABILITY,
  ANA_VERIFICATION_CODES,
  applyOptionalVerificationAgent,
  completeVerification,
  createAnaVerificationAgent,
  indexRepoAgents,
  runAna,
  verifyResponses,
  type AnaPlan,
  type AnaPlanStep,
} from "@/ana/core";
import type { AgentResponse } from "@/ana/protocol/schemas";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const fakeAgent = (options: {
  id: string;
  domain: RepositoryDomain;
  capability: string;
  outputs?: { name: string; type: "object" | "string" | "array" }[];
  execute?: RepoAgent["execute"];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA verification tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: [
      { name: "fullName", type: "string", required: false },
      { name: "birthDate", type: "string", required: false },
      { name: "birthTime", type: "string", required: false },
    ],
    outputs: options.outputs ?? [{ name: "result", type: "object" }],
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
    execute:
      options.execute ??
      (async () => ({
        agentId: manifest.id,
        status: "success",
        result: { fixture: true },
        summary: `${manifest.id} ok`,
        runtimeMs: 1,
      })),
  });
};

const verificationAgent = (execute: RepoAgent["execute"]): RepoAgent => {
  const manifest = parseAgentManifest({
    id: ANA_VERIFICATION_AGENT_ID,
    name: "ANA Verifier",
    repository: "uset82/portafolio",
    version: "1.0.0",
    description: "Fake optional verification agent.",
    domains: ["ai-tooling"],
    capabilities: [ANA_VERIFICATION_CAPABILITY],
    inputs: [
      { name: "findings", type: "array", required: true },
      { name: "failedAgentIds", type: "array", required: false },
      { name: "contradictionCount", type: "number", required: false },
    ],
    outputs: [{ name: "review", type: "object" }],
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
    execute,
  });
};

const step = (agentId: string, capability: string, domain: RepositoryDomain): AnaPlanStep => ({
  agentId,
  capability,
  domain,
  dependsOn: [],
});

const planOf = (steps: AnaPlanStep[]): AnaPlan => ({
  kind: "specialist",
  goals: ["career-analysis"],
  domains: steps.map((entry) => entry.domain),
  provided: {},
  steps,
  missingInputs: [],
  unavailableAgents: [],
  dag: {
    execution: "parallel",
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

const ok = (options: {
  agentId: string;
  summary?: string;
  result?: unknown;
  status?: AgentResponse["status"];
  confidence?: number;
  assumptions?: string[];
}): AgentResponse => {
  const payload: AgentResponse = {
    agentId: options.agentId,
    status: options.status ?? "success",
    result: options.result ?? { fixture: true },
    summary: options.summary ?? `${options.agentId} ok`,
    runtimeMs: 1,
  };
  if (options.confidence !== undefined) payload.confidence = options.confidence;
  if (options.assumptions) payload.assumptions = options.assumptions;
  return payload;
};

const codesOf = (plan: AnaPlan, responses: AgentResponse[], agents: RepoAgent[] = []) =>
  verifyResponses(
    plan,
    responses,
    agents.length > 0 ? { index: indexRepoAgents(agents) } : {},
  ).findings.map((item) => item.code);

test("schema validator accepts a single object payload as the declared output", () => {
  const education = fakeAgent({
    id: "education",
    domain: "education",
    capability: "education-profile",
    outputs: [{ name: "profile", type: "object" }],
  });
  assert.equal(resultMatchesManifestOutputs(education.manifest(), { positions: [1, 2, 3] }), true);
  const plan = planOf([step("education", "education-profile", "education")]);
  const verification = verifyResponses(
    plan,
    [ok({ agentId: "education", result: { positions: [1, 2, 3] } })],
    { index: indexRepoAgents([education]) },
  );
  assert.equal(
    verification.findings.some((item) => item.code === "invalid-output"),
    false,
  );
});

test("schema validator flags output that does not match declared fields", () => {
  const agent = fakeAgent({
    id: "electronics-agent",
    domain: "electronics",
    capability: "traffic-light",
    outputs: [
      { name: "catalog", type: "object" },
      { name: "notes", type: "string" },
    ],
  });
  const plan = planOf([step("electronics-agent", "traffic-light", "electronics")]);
  const verification = verifyResponses(
    plan,
    [ok({ agentId: "electronics-agent", result: { fixture: true } })],
    { index: indexRepoAgents([agent]) },
  );
  assert.equal(verification.invalidAgentIds.includes("electronics-agent"), true);
  assert.equal(
    verification.findings.some((item) => item.code === "invalid-output"),
    true,
  );
});

test("unanswered capability, execution failure, undeclared assumptions, and low confidence are detected", () => {
  const agents = [
    fakeAgent({ id: "mentora", domain: "education", capability: "education-guidance" }),
    fakeAgent({ id: "smartapply", domain: "career", capability: "career-analysis" }),
    fakeAgent({ id: "stillas", domain: "construction", capability: "stillas-catalog" }),
    fakeAgent({ id: "electronics-agent", domain: "electronics", capability: "traffic-light" }),
  ];
  const plan = planOf([
    step("mentora", "education-guidance", "education"),
    step("smartapply", "career-analysis", "career"),
    step("stillas", "stillas-catalog", "construction"),
    step("electronics-agent", "traffic-light", "electronics"),
  ]);
  const responses = [
    ok({ agentId: "mentora", result: { error: "missing course list" } }),
    ok({
      agentId: "smartapply",
      status: "failed",
      result: { error: "engine down" },
      summary: "Engine down.",
    }),
    ok({
      agentId: "stillas",
      status: "partial",
      result: { fixture: true },
      summary: "Partial catalog.",
    }),
    ok({
      agentId: "electronics-agent",
      result: { fixture: true },
      confidence: 0.2,
      summary: "Uncertain traffic-light match.",
    }),
  ];
  const verification = verifyResponses(plan, responses, { index: indexRepoAgents(agents) });
  const codes = new Set(verification.findings.map((item) => item.code));
  assert.equal(codes.has("unanswered-capability"), true);
  assert.equal(codes.has("execution-failure"), true);
  assert.equal(codes.has("undeclared-assumptions"), true);
  assert.equal(codes.has("low-confidence"), true);
  assert.equal(verification.unansweredAgentIds.includes("mentora"), true);
  assert.equal(verification.failedAgentIds.includes("smartapply"), true);
  assert.equal(verification.lowConfidenceAgentIds.includes("electronics-agent"), true);
  assert.equal(ANA_LOW_CONFIDENCE_THRESHOLD, 0.7);
});

test("partial results with declared assumptions are not flagged", () => {
  const plan = planOf([step("stillas", "stillas-catalog", "construction")]);
  const verification = verifyResponses(plan, [
    ok({
      agentId: "stillas",
      status: "partial",
      assumptions: ["Catalog coverage is host-side only."],
      summary: "Partial catalog.",
    }),
  ]);
  assert.equal(
    verification.findings.some((item) => item.code === "undeclared-assumptions"),
    false,
  );
});

test("consistency check reports contradictions across agents on the same capability", () => {
  const plan = planOf([
    step("career-alpha", "career-analysis", "career"),
    step("career-beta", "career-analysis", "career"),
  ]);
  const verification = verifyResponses(plan, [
    ok({ agentId: "career-alpha", summary: "Recommend embedded systems." }),
    ok({ agentId: "career-beta", summary: "Recommend product design." }),
  ]);
  assert.equal(verification.contradictions.length > 0, true);
  assert.equal(
    verification.findings.some((item) => item.code === "contradiction"),
    true,
  );
});

test("a claimed capability mismatch is unanswered, not a contradiction", () => {
  const plan = planOf([step("astraea", "natal-chart", "astrology")]);
  const verification = verifyResponses(plan, [
    ok({ agentId: "astraea", result: { capability: "synastry", fixture: true } }),
  ]);
  assert.equal(verification.unansweredAgentIds.includes("astraea"), true);
  assert.equal(verification.contradictions.length, 0);
});

test("optional verification agent stays off unless requested", async () => {
  const astraea = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
  });
  const result = await runAna(
    {
      requestId: "ana-verify-off",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [astraea] },
  );
  assert.equal(result.status, "answered");
  assert.equal(
    result.warnings.some((warning) => warning.includes("Optional verification agent")),
    false,
  );
});

test("optional verification agent reviews codes only and does not receive private inputs", async () => {
  const seen: unknown[] = [];
  const verifier = verificationAgent(async (request) => {
    seen.push(request.input);
    return {
      agentId: ANA_VERIFICATION_AGENT_ID,
      status: "success",
      result: { review: { findingCount: 0 } },
      summary: "Optional verification agent found no issues.",
      runtimeMs: 1,
    };
  });
  const astraea = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
  });
  const result = await runAna(
    {
      requestId: "ana-verify-on",
      message:
        "My name is Anna. I was born 12 May 1995 at 14:35 in Oslo. Please calculate a natal chart.",
      input: { birthDate: "1995-05-12", birthTime: "14:35", fullName: "Anna" },
    },
    { agents: [astraea], verificationAgent: verifier },
  );
  assert.equal(result.status, "answered");
  assert.equal(seen.length, 1);
  const serialized = JSON.stringify(seen[0]);
  assert.doesNotMatch(serialized, /Anna|Oslo|1995-05-12|14:35|fullName|birthDate|birthTime/);
  assert.match(serialized, /findings/);
  const codes = JSON.parse(serialized) as { findings: { code: string }[] };
  for (const item of codes.findings) {
    assert.equal(
      ANA_VERIFICATION_CODES.includes(item.code as (typeof ANA_VERIFICATION_CODES)[number]),
      true,
    );
  }
});

test("a failing optional verification agent does not break ANA", async () => {
  const verifier = verificationAgent(async () => {
    throw new Error("verifier exploded");
  });
  const astraea = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
  });
  const result = await runAna(
    {
      requestId: "ana-verify-fail",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [astraea], verificationAgent: verifier },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.warnings.includes("Optional verification agent did not complete."), true);
});

test("built-in verification agent summarizes finding counts", async () => {
  const plan = planOf([
    step("career-alpha", "career-analysis", "career"),
    step("career-beta", "career-analysis", "career"),
  ]);
  const responses = [
    ok({ agentId: "career-alpha", summary: "Recommend embedded systems." }),
    ok({ agentId: "career-beta", summary: "Recommend product design." }),
  ];
  const verification = await completeVerification({
    plan,
    responses,
    requestId: "ana-verify-builtin",
    runVerificationAgent: true,
  });
  assert.equal(verification.verifierAgentId, ANA_VERIFICATION_AGENT_ID);
  assert.match(verification.verifierSummary ?? "", /issue/);
  assert.equal(
    createAnaVerificationAgent().manifest().capabilities.includes(ANA_VERIFICATION_CAPABILITY),
    true,
  );
});

test("optional agent without result-verification is skipped", async () => {
  const plan = planOf([step("education", "education-profile", "education")]);
  const verification = verifyResponses(plan, [ok({ agentId: "education" })]);
  const skipped = await applyOptionalVerificationAgent({
    verification,
    agent: fakeAgent({ id: "education", domain: "education", capability: "education-profile" }),
    requestId: "ana-verify-skip",
  });
  assert.equal(skipped.verifierAgentId, undefined);
  assert.deepEqual(skipped.findings, verification.findings);
});

test("the six verification checks are the documented set", () => {
  assert.deepEqual(
    [...ANA_VERIFICATION_CODES],
    [
      "unanswered-capability",
      "invalid-output",
      "execution-failure",
      "undeclared-assumptions",
      "contradiction",
      "low-confidence",
    ],
  );
});

test("codesOf helper covers a missing specialist response", () => {
  const plan = planOf([step("mentora", "education-guidance", "education")]);
  assert.deepEqual(codesOf(plan, []), ["unanswered-capability"]);
});
