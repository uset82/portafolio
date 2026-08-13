import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  createAnaDebugGetHandler,
  createAnaDebugStore,
  executePlan,
  indexRepoAgents,
  isAnaDebugEnabled,
  redactDebugPreview,
  runAna,
  toDebugSnapshot,
  type AnaPlanStep,
} from "@/ana/core";
import { AnaDebugDashboard } from "@/components/ana-debug-dashboard";
import { rawSiteContent } from "@/content/records";
import type { AnaDebugSnapshot } from "@/ana/debug";

const ANNA_OSLO_FIXTURE =
  "My name is Anna. I was born 12 May 1995 at 14:35 in Oslo. I study software engineering and want to start a music company.";

const SENSITIVE = /1995-05-12|Anna|Oslo|14:35|birthDate|fullName|birthPlace|birthTime/;

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "numerology" | "music" | "education" | "career";
  capability: string;
  inputs?: { name: string; type: "string"; required: boolean }[];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA debug tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: (options.inputs ?? [{ name: "token", type: "string", required: false }]).map(
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
      result: { received: request.input },
      summary: `Fixture result from ${manifest.id}.`,
      runtimeMs: 12,
    }),
  });
};

const careerSnapshot = (): AnaDebugSnapshot => ({
  requestId: "debug-career-1",
  traceId: "trace-career-1",
  recordedAt: "2026-08-13T09:00:00Z",
  request: { kind: "specialist", preview: "What career fits me?" },
  plan: {
    agentCount: 4,
    goals: ["career-analysis"],
    selectedDomains: ["education-agent", "career-agent"],
    steps: [
      { agentId: "astraea", capability: "natal-chart" },
      { agentId: "pinaculo", capability: "numerology-profile" },
      { agentId: "mentora", capability: "career-analysis" },
      { agentId: "smartapply", capability: "application-track" },
    ],
    unavailableAgents: [],
    missingInputCount: 0,
  },
  active: ["astraea", "pinaculo", "mentora", "smartapply"],
  latency: [
    { agentId: "astraea", capability: "natal-chart", runtimeMs: 1_800 },
    { agentId: "pinaculo", capability: "numerology-profile", runtimeMs: 900 },
    { agentId: "mentora", capability: "career-analysis", runtimeMs: 2_200 },
    { agentId: "smartapply", capability: "application-track", runtimeMs: 1_400 },
  ],
  tokens: { input: 0, output: 0, reported: false },
  cost: { units: 4, limit: 8 },
  result: { status: "answered", errors: [] },
});

test("debug preview redacts names, dates, times, and places", () => {
  const preview = redactDebugPreview(ANNA_OSLO_FIXTURE);
  assert.doesNotMatch(preview, SENSITIVE);
  assert.match(preview, /software engineering/);
  assert.equal(redactDebugPreview("What career fits me?"), "What career fits me?");
});

test("debug snapshots keep request, plan, agents, latency, tokens, cost, and result without inputs", async () => {
  const store = createAnaDebugStore();
  const result = await runAna(
    { requestId: "debug-1", message: ANNA_OSLO_FIXTURE },
    {
      agents: [
        fakeAgent({
          id: "astraea",
          domain: "astrology",
          capability: "natal-chart",
          inputs: [
            { name: "birthDate", type: "string", required: true },
            { name: "birthTime", type: "string", required: true },
          ],
        }),
        fakeAgent({
          id: "pinaculo",
          domain: "numerology",
          capability: "numerology-profile",
          inputs: [
            { name: "fullName", type: "string", required: true },
            { name: "birthDate", type: "string", required: true },
          ],
        }),
        fakeAgent({
          id: "strudel",
          domain: "music",
          capability: "pattern-generate",
          inputs: [{ name: "prompt", type: "string", required: true }],
        }),
      ],
      debugStore: store,
      createTraceId: () => "trace-anna-1",
    },
  );
  assert.equal(result.traceId, "trace-anna-1");
  assert.equal(result.requestId, "debug-1");
  const [snapshot] = store.list();
  assert.equal(snapshot?.requestId, "debug-1");
  assert.equal(snapshot?.traceId, "trace-anna-1");
  assert.equal(snapshot?.plan.agentCount, 3);
  assert.deepEqual(snapshot?.active, ["astraea", "pinaculo", "strudel"]);
  assert.equal(snapshot?.tokens.reported, false);
  assert.equal(snapshot?.cost.units > 0, true);
  assert.equal(snapshot?.result.status, "answered");
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, SENSITIVE);
  assert.doesNotMatch(serialized, /received/);
  assert.equal("provided" in (snapshot?.plan ?? {}), false);
});

test("executePlan reports cost units without storing inputs on traces", async () => {
  const agent = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
  });
  const step: AnaPlanStep = {
    agentId: "astraea",
    capability: "natal-chart",
    domain: "astrology",
    dependsOn: [],
  };
  const executed = await executePlan({
    requestId: "debug-cost",
    steps: [step],
    provided: { birthDate: "1995-05-12", fullName: "Anna" },
    index: indexRepoAgents([agent]),
    maxRetries: 0,
  });
  assert.equal(executed.cost.units, 1);
  assert.equal(executed.cost.limit > 0, true);
  assert.doesNotMatch(JSON.stringify(executed.traces), SENSITIVE);
});

test("the debug HTTP surface is absent unless explicitly enabled", async () => {
  const store = createAnaDebugStore();
  store.record(careerSnapshot());
  const closed = createAnaDebugGetHandler({ store, enabled: false });
  const hidden = await closed();
  assert.equal(hidden.status, 404);
  const hiddenBody = (await hidden.json()) as { ok: boolean };
  assert.equal(hiddenBody.ok, false);

  const open = createAnaDebugGetHandler({ store, enabled: true });
  const visible = await open();
  assert.equal(visible.status, 200);
  const body = (await visible.json()) as { ok: boolean; snapshots: AnaDebugSnapshot[] };
  assert.equal(body.ok, true);
  assert.equal(body.snapshots[0]?.request.preview, "What career fits me?");
  assert.doesNotMatch(JSON.stringify(body), SENSITIVE);
});

test("the debug dashboard shows request, plan, active agents, latency, tokens, cost, and result", () => {
  const markup = renderToStaticMarkup(
    createElement(AnaDebugDashboard, { snapshots: [careerSnapshot()] }),
  );
  assert.match(markup, /<main id="main-content"/);
  assert.match(markup, /<h1[^>]*>ANA debug<\/h1>/);
  assert.match(markup, /Request ID/);
  assert.match(markup, /Trace ID/);
  assert.match(markup, /What career fits me\?/);
  assert.match(markup, />Plan<\/h2>/);
  assert.match(markup, /4 agents/);
  assert.match(markup, />Active<\/h2>/);
  assert.match(markup, />astraea<\/li>/);
  assert.match(markup, />Latency<\/h2>/);
  assert.match(markup, /1\.8s/);
  assert.match(markup, />Tokens<\/h2>/);
  assert.match(markup, /not reported/);
  assert.match(markup, />Cost<\/h2>/);
  assert.match(markup, /4 \/ 8 units/);
  assert.match(markup, />Result<\/h2>/);
  assert.match(markup, />Success<\/p>/);
  assert.doesNotMatch(markup, SENSITIVE);
  assert.doesNotMatch(markup, /<(?:form|input|textarea|canvas)\b/);
});

test("debug is off by default and is not a public navigation target", () => {
  assert.equal(isAnaDebugEnabled({}), false);
  assert.equal(isAnaDebugEnabled({ ANA_DEBUG_ENABLED: "false" }), false);
  assert.equal(isAnaDebugEnabled({ ANA_DEBUG_ENABLED: "true" }), true);
  assert.equal(
    rawSiteContent.navigation.some((item) => item.href === "/ana/debug"),
    false,
  );
  const page = readFileSync(path.join(process.cwd(), "src/app/ana/debug/page.tsx"), "utf8");
  assert.match(page, /robots:\s*\{\s*index:\s*false/);
  assert.match(page, /notFound\(\)/);
  assert.match(page, /isAnaDebugEnabled/);
  const envExample = readFileSync(path.join(process.cwd(), ".env.example"), "utf8");
  assert.match(envExample, /ANA_DEBUG_ENABLED=false/);
});

test("toDebugSnapshot never copies provided inputs or specialist payloads", async () => {
  const result = await runAna(
    {
      requestId: "debug-2",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
    },
    {
      agents: [
        fakeAgent({
          id: "astraea",
          domain: "astrology",
          capability: "natal-chart",
          inputs: [{ name: "birthDate", type: "string", required: true }],
        }),
      ],
      createTraceId: () => "trace-natal-1",
    },
  );
  const snapshot = toDebugSnapshot({
    result,
    message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
    cost: { units: 1, limit: 8 },
  });
  const serialized = JSON.stringify(snapshot);
  assert.doesNotMatch(serialized, /1815-12-10|Ada Lovelace|birthDate|received/);
  assert.equal(snapshot.requestId, "debug-2");
  assert.equal(snapshot.traceId, "trace-natal-1");
});
