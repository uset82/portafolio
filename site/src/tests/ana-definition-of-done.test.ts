import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  defineRepoAgent,
  parseAgentManifest,
  parseAgentResponse,
  type RepoAgent,
} from "@/ana/protocol";
import {
  ANA_PORTFOLIO_BOUNDARY,
  draftPlan,
  executePlan,
  indexRepoAgents,
  routeIntent,
  runAna,
  synthesizeAnaResult,
  verifyResponses,
  type AnaPlan,
  type AnaPlanStep,
} from "@/ana/core";
import { createAnaSandbox, SANDBOX_DENIED_REPOSITORY } from "@/ana/sandbox";
import { createAnaPostHandler } from "@/ana/ui";
import {
  createPinaculoAgent,
  electronicsAgentJson,
  stillasAgentJson,
  ELECTRONICS_TOOL_CARDS,
} from "@/ana/specialists";
import { scanOwnedRepositories } from "@/ana/repositories/scanner";
import type { DiscoveredRepository } from "@/ana/repositories/github";
import { repositoryAuditSchema } from "@/ana/repositories/schemas";
import { initRepo2Agent, registerRepo2AgentDirectory } from "@/ana/sdk";
import { AnaExplorationPanel } from "@/components/ana-exploration-panel";
import { observatorySpecialistStatuses, selectExplorationPrompts } from "@/lib/ai/ana-exploration";
import type { AgentResponse } from "@/ana/protocol/schemas";
import type { RepositoryDomain } from "@/ana/repositories/schemas";

const coreDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../ana/core");
const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const fakeAgent = (options: {
  id: string;
  domain: RepositoryDomain;
  capability: string;
  inputs?: { name: string; type: "string"; required: boolean }[];
  execute?: RepoAgent["execute"];
  summary?: string;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Definition-of-done fixture.",
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
    execute:
      options.execute ??
      (async (request) => ({
        agentId: manifest.id,
        status: "success",
        result: { fixture: true, received: request.input },
        summary: options.summary ?? `${manifest.id} fixture.`,
        runtimeMs: 1,
      })),
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
  summary: "Fixture natal chart.",
});

const pinaculo = fakeAgent({
  id: "pinaculo",
  domain: "numerology",
  capability: "numerology-profile",
  inputs: [
    { name: "fullName", type: "string", required: true },
    { name: "birthDate", type: "string", required: true },
  ],
  summary: "Fixture numerology profile.",
});

const natalRequest = {
  requestId: "dod-nl",
  message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
  input: { birthDate: "1815-12-10", birthTime: "10:00" },
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

const responseOf = (agentId: string, summary: string): AgentResponse => ({
  agentId,
  status: "success",
  result: { fixture: true },
  summary,
  runtimeMs: 1,
});

test("ANA-30.1 ANA receives one natural-language question", async () => {
  const result = await runAna(natalRequest, { agents: [astraea] });
  assert.equal(result.requestId, "dod-nl");
  assert.match(natalRequest.message, /natal chart/i);
  assert.equal(result.kind, "specialist");
});

test("ANA-30.2 ANA understands the goal", async () => {
  const drafted = draftPlan(natalRequest);
  assert.equal(drafted.kind, "specialist");
  assert.deepEqual(drafted.goals, ["natal-chart"]);
  const deferred = await runAna(
    { requestId: "dod-2", message: "Tell me about your work and the Astraea case study" },
    { agents: [astraea] },
  );
  assert.equal(deferred.kind, "portfolio-fact");
  assert.equal(deferred.answer, ANA_PORTFOLIO_BOUNDARY);
});

test("ANA-30.3 ANA searches the agent registry", async () => {
  const index = indexRepoAgents([astraea, pinaculo]);
  assert.deepEqual(
    index.findByCapability("natal-chart").map((agent) => agent.manifest().id),
    ["astraea"],
  );
  assert.deepEqual(
    index.findByDomain("numerology").map((agent) => agent.manifest().id),
    ["pinaculo"],
  );
  const drafted = draftPlan(natalRequest);
  const routed = routeIntent(drafted, index, natalRequest.message);
  assert.deepEqual(
    routed.steps.map((entry) => `${entry.agentId}:${entry.capability}`),
    ["astraea:natal-chart"],
  );
});

test("ANA-30.4 ANA selects the correct specialist agent(s)", async () => {
  const natal = await runAna(natalRequest, { agents: [astraea, pinaculo] });
  assert.deepEqual(
    natal.plan.steps.map((entry) => entry.agentId),
    ["astraea"],
  );
  const numbers = await runAna(
    {
      requestId: "dod-4",
      message: "Run a numerology profile for Ada Lovelace born 1815-12-10",
      input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    },
    { agents: [astraea, pinaculo] },
  );
  assert.deepEqual(
    numbers.plan.steps.map((entry) => entry.agentId),
    ["pinaculo"],
  );
});

test("ANA-30.5 ANA requests missing information only when needed", async () => {
  const missing = await runAna(
    { requestId: "dod-5a", message: "Run a numerology profile for me" },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(missing.status, "needs-input");
  assert.deepEqual(missing.plan.missingInputs, ["fullName", "birthDate"]);
  assert.equal(missing.responses.length, 0);

  const complete = await runAna(natalRequest, { agents: [astraea] });
  assert.equal(complete.status, "answered");
  assert.deepEqual(complete.plan.missingInputs, []);
  assert.equal(complete.responses.length, 1);
});

test("ANA-30.6 agents can run concurrently", { timeout: 3_000 }, async () => {
  let started = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const make = (id: string) =>
    fakeAgent({
      id,
      domain: "astrology",
      capability: "natal-chart",
      inputs: [{ name: "token", type: "string", required: true }],
      execute: async () => {
        started += 1;
        if (started === 2) release();
        await gate;
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
    requestId: "dod-6",
    steps: [step("one", "natal-chart", "astrology"), step("two", "natal-chart", "astrology")],
    provided: { token: "x" },
    index: indexRepoAgents([make("one"), make("two")]),
    maxRetries: 0,
  });
  assert.equal(result.responses.length, 2);
  assert.equal(
    result.responses.every((entry) => entry.status === "success"),
    true,
  );
});

test("ANA-30.7 each agent receives only required user data", async () => {
  const seen: Record<string, Record<string, unknown>> = {};
  const natal = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [
      { name: "birthDate", type: "string", required: true },
      { name: "birthTime", type: "string", required: true },
    ],
    execute: async (request) => {
      seen.astraea = request.input;
      return {
        agentId: "astraea",
        status: "success",
        result: { fixture: true },
        summary: "natal",
        runtimeMs: 1,
      };
    },
  });
  const numbers = fakeAgent({
    id: "pinaculo",
    domain: "numerology",
    capability: "numerology-profile",
    inputs: [
      { name: "fullName", type: "string", required: true },
      { name: "birthDate", type: "string", required: true },
    ],
    execute: async (request) => {
      seen.pinaculo = request.input;
      return {
        agentId: "pinaculo",
        status: "success",
        result: { fixture: true },
        summary: "numbers",
        runtimeMs: 1,
      };
    },
  });
  await executePlan({
    requestId: "dod-7",
    steps: [
      step("astraea", "natal-chart", "astrology"),
      step("pinaculo", "numerology-profile", "numerology"),
    ],
    provided: {
      fullName: "Ada Lovelace",
      birthDate: "1815-12-10",
      birthTime: "10:00",
      password: "not-a-real-secret",
      prompt: "soft piano",
    },
    index: indexRepoAgents([natal, numbers]),
    sharePersonalProfile: true,
    maxRetries: 0,
  });
  assert.deepEqual(seen.astraea, { birthDate: "1815-12-10", birthTime: "10:00" });
  assert.deepEqual(seen.pinaculo, { fullName: "Ada Lovelace", birthDate: "1815-12-10" });
  assert.equal("password" in (seen.astraea ?? {}), false);
  assert.equal("prompt" in (seen.pinaculo ?? {}), false);
});

test("ANA-30.8 deterministic repos execute as tools rather than unnecessary LLMs", async () => {
  assert.equal(electronicsAgentJson.type, "tool");
  assert.equal(stillasAgentJson.type, "tool");
  assert.equal(ELECTRONICS_TOOL_CARDS.length, 5);
  assert.equal(electronicsAgentJson.execution, "local-function");
  const computed = await createPinaculoAgent().execute({
    requestId: "dod-8",
    capability: "numerology-profile",
    input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
  });
  assert.equal(computed.status, "success");
  assert.equal(typeof (computed.result as { positions?: unknown }).positions, "object");
  const pinaculoCore = readFileSync(path.join(coreDir, "../specialists/pinaculo/core.ts"), "utf8");
  assert.doesNotMatch(pinaculoCore, /openai|fetch\(|anthropic|llm/i);
});

test("ANA-30.9 repository code runs isolated when execution is required", async () => {
  const sandbox = createAnaSandbox();
  const denied = await sandbox.runRepository({
    repository: "uset82/new-energy-project",
    path: "/tmp/new-energy-project",
    capability: "energy-model",
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.summary, SANDBOX_DENIED_REPOSITORY);
});

test("ANA-30.10 agent outputs follow one shared schema", () => {
  const parsed = parseAgentResponse({
    agentId: "astraea",
    status: "success",
    result: { fixture: true },
    summary: "ok",
    runtimeMs: 4,
  });
  assert.equal(parsed.agentId, "astraea");
  assert.throws(() =>
    parseAgentResponse({
      agentId: "astraea",
      status: "success",
      result: { fixture: true },
    }),
  );
});

test("ANA-30.11 failures do not break ANA", async () => {
  const boom = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [{ name: "token", type: "string", required: false }],
    execute: async () => {
      throw new Error("specialist exploded");
    },
  });
  const ok = fakeAgent({
    id: "ok",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [{ name: "token", type: "string", required: false }],
    summary: "still answered",
  });
  const executed = await executePlan({
    requestId: "dod-11",
    steps: [step("astraea", "natal-chart", "astrology"), step("ok", "natal-chart", "astrology")],
    provided: { token: "x" },
    index: indexRepoAgents([boom, ok]),
    maxRetries: 0,
  });
  assert.equal(executed.responses[0]?.status, "failed");
  assert.equal(executed.responses[1]?.status, "success");
  const result = await runAna(natalRequest, { agents: [boom] });
  assert.equal(result.status === "failed" || result.status === "answered", true);
  assert.equal(typeof result.answer, "string");
  assert.match(result.answer, /./);
});

test("ANA-30.12 ANA identifies contradictions", () => {
  const steps = [
    step("career-alpha", "career-analysis", "career"),
    step("career-beta", "career-analysis", "career"),
  ];
  const responses = [
    responseOf("career-alpha", "Recommend embedded systems."),
    responseOf("career-beta", "Recommend product design."),
  ];
  const verification = verifyResponses(planOf(steps), responses);
  assert.equal(verification.contradictions.length > 0, true);
});

test("ANA-30.13 ANA synthesizes rather than concatenating answers", () => {
  const steps = [
    step("career-alpha", "career-analysis", "career"),
    step("career-beta", "career-analysis", "career"),
  ];
  const responses = [
    responseOf("career-alpha", "Recommend embedded systems."),
    responseOf("career-beta", "Recommend product design."),
  ];
  const index = indexRepoAgents([
    fakeAgent({ id: "career-alpha", domain: "career", capability: "career-analysis" }),
    fakeAgent({ id: "career-beta", domain: "career", capability: "career-analysis" }),
  ]);
  const synthesized = synthesizeAnaResult({
    plan: planOf(steps),
    responses,
    verification: verifyResponses(planOf(steps), responses),
    index,
  });
  assert.match(synthesized.answer, /CONTRADICTIONS/);
  assert.match(synthesized.answer, /ANA SYNTHESIS/);
  assert.doesNotMatch(synthesized.answer, /Recommend embedded systems\.Recommend product design/);
});

test("ANA-30.14 results retain repository/agent provenance", async () => {
  const result = await runAna(natalRequest, { agents: [astraea] });
  assert.equal(result.provenance.length > 0, true);
  const source = result.provenance[0];
  assert.equal(source?.agentId, "astraea");
  assert.equal(source?.repository, "uset82/astraea");
  assert.equal(source?.capability, "natal-chart");
  assert.equal(source?.inputFingerprint.length, 64);
  assert.equal(typeof source?.producedAt, "string");
});

test("ANA-30.15 the user sees one coherent response", async () => {
  const result = await runAna(natalRequest, { agents: [astraea] });
  assert.equal(result.status, "answered");
  assert.equal(typeof result.answer, "string");
  assert.match(result.answer, /delegated/i);
  assert.match(result.answer, /ANA SYNTHESIS/);
  assert.equal(result.answer.includes("\n\n"), true);
});

test("ANA-30.16 the portfolio UI visualizes which systems were activated", async () => {
  assert.deepEqual(selectExplorationPrompts({}), []);
  const statuses = observatorySpecialistStatuses(["astraea"]);
  assert.deepEqual(
    statuses.map((entry) => [entry.agentId, entry.state]),
    [
      ["astraea", "active"],
      ["pinaculo", "standby"],
      ["strudel", "standby"],
      ["electronics-agent", "standby"],
    ],
  );
  const markup = renderToStaticMarkup(
    createElement(AnaExplorationPanel, { prompts: [], statuses }),
  );
  assert.match(markup, /aria-label="Observatory specialist status"/);
  assert.match(markup, /data-state="active"/);
  assert.match(markup, /data-agent="astraea"/);

  const handler = createAnaPostHandler({
    enabled: true,
    runtime: { agents: [astraea] },
    createRequestId: () => "dod-16",
  });
  const response = await handler(
    new Request("http://localhost/api/ana", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(natalRequest),
    }),
  );
  const body = (await response.json()) as { active?: string[] };
  assert.deepEqual(body.active, ["astraea"]);
});

test("ANA-30.17 new repos can later be discovered and registered without modifying ANA Core", async () => {
  for (const name of readdirSync(coreDir).filter((file) => file.endsWith(".ts"))) {
    const source = readFileSync(path.join(coreDir, name), "utf8");
    assert.doesNotMatch(source, /from ["']@\/ana\/sdk/);
    assert.doesNotMatch(source, /from ["']\.\.\/sdk/);
    assert.doesNotMatch(source, /from ["']\.\.\/repositories\/scanner/);
    assert.doesNotMatch(source, /from ["']@\/ana\/specialists/);
  }

  const listed: DiscoveredRepository[] = [
    {
      owner: "uset82",
      name: "new-energy-project",
      fullName: "uset82/new-energy-project",
      description: "Energy modeling sandbox",
      fork: false,
      private: false,
      visibility: "public",
      sizeKb: 800,
      defaultBranch: "main",
      homepage: null,
      topics: [],
      htmlUrl: "https://github.com/uset82/new-energy-project",
      language: "TypeScript",
    },
  ];
  const scan = scanOwnedRepositories({
    listed,
    knownAudits: [
      repositoryAuditSchema.parse({
        repository: "uset82/ASTROEA",
        hasBackend: false,
        hasAPI: false,
        hasDatabase: false,
        hasLLM: false,
        domain: ["astrology"],
        capabilities: ["natal-chart"],
        status: "prototype",
        agentPotential: "high",
        recommendedType: "agent",
        visibility: "public",
        enabled: false,
        contentsInspected: true,
        sizeKb: 100,
        manifestFiles: ["package.json"],
      }),
    ],
    inspections: [
      {
        repository: listed[0]!,
        contentsInspected: true,
        treePaths: ["README.md", "src/model.ts"],
        manifests: { "package.json": '{"name":"new-energy-project"}' },
        readme: "Energy systems project with simulation and battery analysis.",
      },
    ],
  });
  assert.deepEqual(scan.newPublic, ["uset82/new-energy-project"]);
  assert.equal(
    scan.audits.every((audit) => audit.enabled === false),
    true,
  );
  assert.equal(
    scan.proposals.every((proposal) => proposal.enabled === false),
    true,
  );

  const directory = await mkdtemp(path.join(os.tmpdir(), "ana-dod-"));
  temporaryDirectories.push(directory);
  const scaffold = path.join(directory, "sample");
  const manifests = path.join(directory, "manifests");
  await initRepo2Agent({
    directory: scaffold,
    id: "sample-agent",
    name: "Sample Agent",
    repository: "uset82/sample-agent",
    domain: "web",
    capability: "sample-task",
    type: "agent",
  });
  const registered = await registerRepo2AgentDirectory(scaffold, { manifestsRoot: manifests });
  assert.equal(registered.ok, true);
  if (registered.ok) {
    assert.equal(registered.enabled, false);
    assert.equal(registered.published, false);
  }

  const widget = fakeAgent({
    id: "widget-lab",
    domain: "electronics",
    capability: "widget-check",
    inputs: [{ name: "query", type: "string", required: false }],
    summary: "Uncatalogued specialist fixture.",
  });
  const executed = await executePlan({
    requestId: "dod-17",
    steps: [step("widget-lab", "widget-check", "electronics")],
    provided: {},
    index: indexRepoAgents([widget]),
    maxRetries: 0,
  });
  assert.equal(executed.responses[0]?.agentId, "widget-lab");
  assert.equal(executed.responses[0]?.status, "success");
});
