import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_PORTFOLIO_BOUNDARY,
  ANA_REMAINING_GAPS,
  ANA_RUNTIME_PATH,
  completeVerification,
  emptyExecutionDag,
  executePlan,
  indexRepoAgents,
  runAna,
  synthesizeAnaResult,
  type AnaPlan,
} from "@/ana/core";
import { createAnaSandbox, SANDBOX_DENIED_REPOSITORY } from "@/ana/sandbox";
import { createAnaPostHandler } from "@/ana/ui";
import type { AnaStatusEvent } from "@/lib/ai/ana-status";

const coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../ana/core");

const readCoreSources = (): { name: string; source: string }[] =>
  readdirSync(coreDir)
    .filter((name) => name.endsWith(".ts"))
    .map((name) => ({
      name,
      source: readFileSync(path.join(coreDir, name), "utf8"),
    }));

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "electronics";
  capability: string;
  inputs?: { name: string; type: "string"; required: boolean }[];
  summary: string;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Architecture confirmation fixture.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: (options.inputs ?? [{ name: "birthDate", type: "string", required: true }]).map(
      (input) => ({
        name: input.name,
        type: input.type,
        required: input.required,
      }),
    ),
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
      result: { fixture: true, capability: request.capability },
      summary: options.summary,
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
  summary: "Fixture natal chart from the architecture test agent.",
});

const widgetPlan = (): AnaPlan => ({
  kind: "specialist",
  goals: ["capability-search"],
  domains: ["electronics"],
  provided: {},
  steps: [
    {
      agentId: "widget-lab",
      capability: "widget-check",
      domain: "electronics",
      dependsOn: [],
    },
  ],
  missingInputs: [],
  unavailableAgents: [],
  dag: emptyExecutionDag(),
});

test("runAna walks User → planner → registry → sandbox → traces → verification → synthesis", async () => {
  assert.deepEqual(
    [...ANA_RUNTIME_PATH],
    [
      "user",
      "ana",
      "planner",
      "registry",
      "capability-selection",
      "specialists-tools",
      "sandbox",
      "result-bus",
      "verification",
      "synthesis",
      "user",
    ],
  );

  const anaSource = readFileSync(path.join(coreDir, "ana.ts"), "utf8");
  for (const symbol of [
    "draftPlan",
    "routeIntent",
    "executePlan",
    "completeVerification",
    "synthesizeAnaResult",
  ]) {
    assert.match(anaSource, new RegExp(symbol));
  }
  const executorSource = readFileSync(path.join(coreDir, "executor.ts"), "utf8");
  assert.match(executorSource, /createAnaSandbox/);
  assert.match(executorSource, /evaluateSecurityGate/);
  assert.match(executorSource, /sandbox\.runAgent/);

  const phases: AnaStatusEvent["phase"][] = [];
  const result = await runAna(
    {
      requestId: "arch-1",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    {
      agents: [astraea],
      onStatus: (event) => phases.push(event.phase),
    },
  );

  assert.deepEqual(phases, ["understanding", "planning", "running", "combining"]);
  assert.equal(result.kind, "specialist");
  assert.equal(result.status, "answered");
  assert.deepEqual(
    result.plan.steps.map((step) => `${step.agentId}:${step.capability}`),
    ["astraea:natal-chart"],
  );
  assert.deepEqual(
    result.traces.map((trace) => trace.event),
    ["start", "success"],
  );
  assert.equal(result.responses[0]?.agentId, "astraea");
  assert.match(result.answer, /delegated/i);
  assert.match(result.answer, /Fixture natal chart/);
  assert.equal(Array.isArray(result.warnings), true);
  assert.equal(Array.isArray(result.assumptions), true);
});

test("portfolio facts still defer to CC AI after the confirmed path", async () => {
  const result = await runAna(
    { requestId: "arch-2", message: "Tell me about your work and the Astraea case study" },
    { agents: [astraea] },
  );
  assert.equal(result.kind, "portfolio-fact");
  assert.equal(result.status, "deferred");
  assert.equal(result.answer, ANA_PORTFOLIO_BOUNDARY);
  assert.equal(result.responses.length, 0);
});

test("ANA Core executes unknown agents by protocol without specialist implementations", async () => {
  for (const file of readCoreSources()) {
    assert.doesNotMatch(file.source, /from ["']@\/ana\/specialists/);
    assert.doesNotMatch(file.source, /from ["']\.\.\/specialists/);
    assert.doesNotMatch(file.source, /github\.com\/uset82\/(ASTROEA|pinaculo|StrudelAI)/);
  }

  const widget = fakeAgent({
    id: "widget-lab",
    domain: "electronics",
    capability: "widget-check",
    inputs: [{ name: "query", type: "string", required: false }],
    summary: "Fixture widget check from an uncatalogued specialist.",
  });
  const index = indexRepoAgents([widget]);
  const plan = widgetPlan();
  const executed = await executePlan({
    requestId: "arch-3",
    steps: plan.steps,
    provided: {},
    index,
  });
  assert.equal(executed.responses[0]?.agentId, "widget-lab");
  assert.equal(executed.responses[0]?.status, "success");
  assert.deepEqual(
    executed.traces.map((trace) => trace.event),
    ["start", "success"],
  );

  const verification = await completeVerification({
    plan,
    responses: executed.responses,
    requestId: "arch-3",
    index,
  });
  const synthesized = synthesizeAnaResult({
    plan,
    responses: executed.responses,
    verification,
    index,
    traces: executed.traces,
  });
  assert.match(synthesized.answer, /widget-lab/);
  assert.match(synthesized.answer, /Fixture widget check/);

  const sandbox = createAnaSandbox();
  const denied = await sandbox.runRepository({
    repository: "uset82/widget-lab",
    path: "/tmp/widget-lab",
    capability: "widget-check",
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.summary, SANDBOX_DENIED_REPOSITORY);
});

test("remaining architecture gaps stay recorded and public ANA stays gated", async () => {
  const ids = ANA_REMAINING_GAPS.map((gap) => gap.id);
  for (const required of [
    "public-assistant",
    "specialists-disabled",
    "named-catalog-routing",
    "host-adapters",
    "spec-diagram-placeholders",
    "sandbox-docker",
    "repo2agent-unpublished",
    "phase-30-dod",
  ]) {
    assert.equal(ids.includes(required), true, `missing gap ${required}`);
  }
  assert.equal(
    ANA_REMAINING_GAPS.every((gap) => gap.summary.trim().length > 0),
    true,
  );

  const handler = createAnaPostHandler({
    enabled: false,
    runtime: { agents: [astraea] },
    createRequestId: () => "arch-disabled",
  });
  const response = await handler(
    new Request("http://localhost/api/ana", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Please calculate a natal chart." }),
    }),
  );
  assert.equal(response.status, 503);
  const body = (await response.json()) as { ok: boolean; error?: { code: string } };
  assert.equal(body.ok, false);
  assert.equal(body.error?.code, "disabled");
});
