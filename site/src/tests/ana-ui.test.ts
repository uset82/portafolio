import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { createAnaPostHandler } from "@/ana/ui";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import { AnaExplorationPanel } from "@/components/ana-exploration-panel";
import { CcAiPanel } from "@/components/cc-ai-panel";
import { invokeAssistantChannel, resolveAssistantChannel } from "@/lib/ai/assistant-channel";
import {
  OBSERVATORY_SPECIALIST_REFS,
  observatorySpecialistStatuses,
  selectExplorationPrompts,
} from "@/lib/ai/ana-exploration";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

const jsonRequest = (body: unknown) =>
  new Request("http://localhost/api/ana", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const fakeMusicAgent = (): RepoAgent => {
  const manifest = parseAgentManifest({
    id: "strudel",
    name: "strudel",
    repository: "uset82/StrudelAI",
    version: "1.0.0",
    description: "Fake Strudel specialist for ANA UI tests.",
    domains: ["music"],
    capabilities: ["pattern-generate"],
    inputs: [{ name: "token", type: "string", required: false }],
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
    execute: async () => ({
      agentId: manifest.id,
      status: "success",
      result: { fixture: true, pattern: "s('bd sd')" },
      summary: "Fixture live-coding pattern.",
      runtimeMs: 4,
    }),
  });
};

test("exploration chips stay hidden until the orchestrator and required agents are enabled", () => {
  assert.deepEqual(selectExplorationPrompts({}), []);
  assert.deepEqual(
    selectExplorationPrompts({ orchestratorEnabled: true, availableAgentIds: [] }),
    [],
  );
  assert.deepEqual(
    selectExplorationPrompts({
      orchestratorEnabled: true,
      availableAgentIds: ["mentora"],
    }).map((entry) => entry.id),
    ["education", "projects"],
  );

  const withElectronics = selectExplorationPrompts({
    orchestratorEnabled: true,
    availableAgentIds: ["electronics-agent"],
  });
  assert.deepEqual(
    withElectronics.map((entry) => entry.id),
    ["engineering", "projects"],
  );
  assert.equal(
    withElectronics.find((entry) => entry.id === "engineering")?.prompt.includes("STM32"),
    true,
  );

  const career = selectExplorationPrompts({
    orchestratorEnabled: true,
    availableAgentIds: ["mentora", "smartapply"],
  });
  assert.equal(
    career.some((entry) => entry.id === "career"),
    true,
  );
  assert.equal(
    selectExplorationPrompts({
      orchestratorEnabled: true,
      availableAgentIds: ["mentora", "smartapply", "business"],
    }).some((entry) => entry.id === "business"),
    true,
  );
  assert.equal(
    selectExplorationPrompts({
      orchestratorEnabled: true,
      availableAgentIds: ["mentora", "smartapply"],
    }).some((entry) => entry.id === "business"),
    false,
  );
});

test("typed and welcome-prompt questions stay on CC AI even when ANA transport is injected", async () => {
  const calls = { ccAi: 0, ana: 0 };
  const sendCcAi = async () => {
    calls.ccAi += 1;
    return "cc-ai";
  };
  const sendAna = async () => {
    calls.ana += 1;
    return "ana";
  };

  const typed = await invokeAssistantChannel({
    channel: resolveAssistantChannel("typed"),
    sendCcAi,
    sendAna,
  });
  const welcome = await invokeAssistantChannel({
    channel: resolveAssistantChannel("cc-ai-prompt"),
    sendCcAi,
    sendAna,
  });
  const projects = await invokeAssistantChannel({
    channel: resolveAssistantChannel({ kind: "exploration", channel: "cc-ai" }),
    sendCcAi,
    sendAna,
  });

  assert.equal(typed.channel, "cc-ai");
  assert.equal(welcome.channel, "cc-ai");
  assert.equal(projects.channel, "cc-ai");
  assert.equal(calls.ccAi, 3);
  assert.equal(calls.ana, 0);

  const specialist = await invokeAssistantChannel({
    channel: resolveAssistantChannel({ kind: "exploration", channel: "ana" }),
    sendCcAi,
    sendAna,
  });
  assert.equal(specialist.channel, "ana");
  assert.equal(calls.ana, 1);
  assert.equal(calls.ccAi, 3);

  const panel = readSource("src/components/cc-ai-panel.tsx");
  assert.match(panel, /resolveAssistantChannel\("typed"\)/);
  assert.match(panel, /resolveAssistantChannel\("cc-ai-prompt"\)/);
  assert.doesNotMatch(panel, /resolveAssistantChannel\("ana"\)/);
});

test("ANA chips do not replace the CACM AI trigger, skip link, or primary navigation", () => {
  const markup = renderToStaticMarkup(createElement(CcAiPanel));
  const panel = readSource("src/components/cc-ai-panel.tsx");
  const home = readSource("src/app/page.tsx");
  const layout = readSource("src/app/layout.tsx");
  const navigation = readSource("src/content/records.ts");

  assert.match(markup, /<button[^>]+class="cc-ai-trigger"[^>]+aria-expanded="false"/);
  assert.match(markup, /Ask CACM AI/);
  assert.doesNotMatch(markup, /ana-exploration/);
  assert.match(panel, /key="cc-ai-trigger"/);
  assert.match(panel, /<AnaExplorationPanel/);
  assert.match(home, /<CcAiPanel/);
  assert.match(home, /selectExplorationPrompts/);
  assert.match(home, /availableAgentIds:\s*\[\s*\]/);
  assert.match(layout, /className="skip-link"/);
  assert.match(layout, /href="#main-content"/);
  assert.match(home, /id="main-content"/);
  assert.doesNotMatch(navigation, /\/ana\/debug/);
  assert.doesNotMatch(home, /href="\/api\/ana"/);
});

test("Observatory specialist mapping is status, not separate chatbots", () => {
  const statuses = observatorySpecialistStatuses(["astraea"]);
  const markup = renderToStaticMarkup(
    createElement(AnaExplorationPanel, {
      prompts: [],
      statuses,
    }),
  );
  const threeDir = [
    "src/components/three/observatory-progressive-experience.tsx",
    "src/components/three/observatory-experience-controls.tsx",
  ];

  assert.deepEqual(
    OBSERVATORY_SPECIALIST_REFS.map((entry) => [entry.artifactId, entry.agentId]),
    [
      ["astraea", "astraea"],
      ["pinaculo", "pinaculo"],
      ["sound-lab", "strudel"],
      ["electronics-ai", "electronics-agent"],
    ],
  );
  assert.match(markup, /data-artifact="astraea"[^>]*data-agent="astraea"/);
  assert.match(markup, /data-state="active"/);
  assert.match(markup, /Status only — not separate chatbots/);
  assert.doesNotMatch(markup, /<a\b/);
  assert.doesNotMatch(markup, /cc-ai-trigger/);
  for (const file of threeDir) {
    const source = readSource(file);
    assert.doesNotMatch(source, /sendQuestion|requestAna|\/api\/ana/);
  }
});

test("ANA UI keeps a reduced-motion and no-JS specialist status path", () => {
  const home = readSource("src/app/page.tsx");
  const styles = readSource("src/app/globals.css");
  const panel = readSource("src/components/cc-ai-panel.tsx");

  assert.match(home, /<noscript>/);
  assert.match(home, /CACM AI remains the public portfolio guide/);
  assert.match(home, /observatorySpecialistStatuses\(\)/);
  assert.match(styles, /\.ana-status__dot\s*\{[^}]*animation:\s*none/);
  assert.doesNotMatch(styles, /@keyframes\s+ana-/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.ana-status__dot/);
  assert.match(panel, /useReducedMotion/);
  assert.match(panel, /ANA is thinking/);
});

test("POST /api/ana stays disabled by default and never returns provided inputs", async () => {
  const route = readSource("src/app/api/ana/route.ts");
  assert.match(route, /ANA_SPECIALISTS_ENABLED === "true"/);
  assert.match(route, /createAnaPostHandler/);
  assert.match(route, /createHostSpecialists/);

  const disabled = createAnaPostHandler({
    enabled: false,
    runtime: { agents: [] },
    createRequestId: () => "ana-disabled",
  });
  const disabledResponse = await disabled(
    jsonRequest({ message: "Generate a live-coding music pattern." }),
  );
  assert.equal(disabledResponse.status, 503);
  const disabledBody = (await disabledResponse.json()) as {
    ok: boolean;
    error?: { code: string };
  };
  assert.equal(disabledBody.ok, false);
  assert.equal(disabledBody.error?.code, "disabled");

  const enabled = createAnaPostHandler({
    enabled: true,
    runtime: { agents: [fakeMusicAgent()] },
    createRequestId: () => "ana-enabled",
  });
  const ok = await enabled(
    jsonRequest({
      requestId: "ana-enabled",
      message: "Generate a live-coding music pattern.",
      input: { fullName: "Anna", birthDate: "1995-05-12", birthPlace: "Oslo" },
    }),
  );
  assert.equal(ok.status, 200);
  const body = (await ok.json()) as Record<string, unknown>;
  const serialized = JSON.stringify(body);
  assert.equal(body.ok, true);
  assert.equal(body.requestId, "ana-enabled");
  assert.equal(typeof body.traceId, "string");
  assert.equal(typeof body.answer, "string");
  assert.equal(Array.isArray(body.active), true);
  assert.deepEqual(Object.keys(body).sort(), [
    "active",
    "answer",
    "ok",
    "requestId",
    "status",
    "traceId",
  ]);
  assert.doesNotMatch(serialized, /Anna|Oslo|birthDate|provided/);
});
