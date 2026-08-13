import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { invokeRepoAgent } from "@/ana/protocol";
import { AGENT_JSON_SCHEMA_V1, loadAgentJsonFile, parseAgentJsonDocument } from "@/ana/manifest";
import {
  assertWave2MatchesClassification,
  createElectronicsAgent,
  createMentoraAgent,
  createStillasAgent,
  createWave2Specialists,
  ELECTRONICS_TOOL_CARDS,
  electronicsAgentJson,
  REMOTE_CODE_NOT_EXECUTED,
  WAVE2_DISABLED_REPOSITORIES,
  WAVE2_KNOWLEDGE_REPOSITORIES,
  WAVE2_NAMED_INTEGRATION,
  wave2AgentJsonDocuments,
} from "@/ana/specialists";
import { admitAgentDocument, buildAgentRegistry, loadDiscoveredDocuments } from "@/ana/registry";
import { loadEffectiveRepositoryAudits } from "@/ana/repositories/registry";
import { contextFilter } from "@/ana/privacy";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const manifestsRoot = path.join(repoRoot, "brain/repositories/manifests");
const generatedPath = path.join(repoRoot, "brain/repositories/registry.generated.json");
const overridesPath = path.join(repoRoot, "brain/repositories/registry.overrides.json");

test("wave 2 is integrated as classified and is not retyped", () => {
  assertWave2MatchesClassification();
  const byRepository = Object.fromEntries(
    WAVE2_NAMED_INTEGRATION.map((entry) => [entry.repository, entry]),
  );
  assert.equal(byRepository["uset82/mentora"]?.kind, "agent");
  assert.equal(byRepository["uset82/smartapply-app"]?.kind, "agent");
  assert.equal(byRepository["uset82/Thesis-Writer-Kit"]?.kind, "agent");
  assert.equal(byRepository["uset82/StillasCalculator"]?.kind, "tool");
  assert.equal(byRepository["uset82/SmartHomeControl"]?.kind, "electronics-tool");
  assert.equal(byRepository["uset82/3Doodle"]?.kind, "knowledge");
  assert.equal(byRepository["uset82/avatar-studio"]?.kind, "knowledge");
  assert.equal(byRepository["uset82/iFoundYou"]?.kind, "knowledge");
  assert.equal(byRepository["uset82/Paper2Video"]?.kind, "disabled");
  assert.deepEqual(WAVE2_DISABLED_REPOSITORIES, ["uset82/Paper2Video"]);
  assert.deepEqual(WAVE2_KNOWLEDGE_REPOSITORIES, [
    "uset82/avatar-studio",
    "uset82/3Doodle",
    "uset82/iFoundYou",
  ]);
});

test("wave 2 host agent.json files match the specialist documents", async () => {
  const loaded = await Promise.all(
    ["mentora", "smartapply", "thesis-writer", "stillas", "electronics"].map((id) =>
      loadAgentJsonFile(path.join(manifestsRoot, id, "agent.json")),
    ),
  );
  assert.deepEqual(loaded, wave2AgentJsonDocuments);
});

test("mentora stays unavailable until an engine is injected and does not run remote code", async () => {
  const unavailable = createMentoraAgent();
  assert.equal((await unavailable.health()).status, "unavailable");
  const failed = await invokeRepoAgent(unavailable, {
    requestId: "mentora-1",
    capability: "career-analysis",
    input: { fieldOfStudy: "software engineering" },
  });
  assert.equal(failed.status, "failed");
  assert.equal(failed.summary, REMOTE_CODE_NOT_EXECUTED);

  const mentora = createMentoraAgent({
    engine: {
      health: async () => "healthy",
      execute: async (request) => ({ fieldOfStudy: request.input.fieldOfStudy, fixture: true }),
    },
  });
  const ok = await invokeRepoAgent(mentora, {
    requestId: "mentora-2",
    capability: "career-analysis",
    input: { fieldOfStudy: "software engineering" },
  });
  assert.equal(ok.status, "success");
  assert.equal((ok.result as { fixture: boolean }).fixture, true);
});

test("electronics is one tool specialist with five catalog tools, not five LLM agents", async () => {
  const electronics = createElectronicsAgent();
  assert.equal((await electronics.health()).status, "healthy");
  assert.deepEqual(electronics.manifest().capabilities, [
    "traffic-light",
    "fpga-uart",
    "microcontroller",
    "smart-home",
    "watering-system",
  ]);
  assert.equal(electronicsAgentJson.type, "tool");
  assert.equal(electronics.manifest().id, "electronics-agent");
  assert.equal(ELECTRONICS_TOOL_CARDS.length, 5);

  const traffic = await invokeRepoAgent(electronics, {
    requestId: "electronics-1",
    capability: "traffic-light",
    input: {},
  });
  assert.equal(traffic.status, "success");
  const trafficResult = traffic.result as { repository: string; role: string };
  assert.equal(trafficResult.repository, "uset82/TRAFFICLIGHT");
  assert.equal(trafficResult.role, "tool");
  assert.match(traffic.summary, /not executed/);

  const fpga = await invokeRepoAgent(electronics, {
    requestId: "electronics-2",
    capability: "fpga-uart",
    input: {},
  });
  assert.equal((fpga.result as { role: string }).role, "knowledge");
  assert.equal((fpga.result as { repository: string }).repository, "uset82/RS232_VHD_DE2115");

  const home = await invokeRepoAgent(electronics, {
    requestId: "electronics-3",
    capability: "smart-home",
    input: {},
  });
  assert.equal((home.result as { repository: string }).repository, "uset82/SmartHomeControl");

  const stillas = createStillasAgent();
  const info = await invokeRepoAgent(stillas, {
    requestId: "stillas-1",
    capability: "scaffolding-info",
    input: {},
  });
  assert.equal(info.status, "success");
  assert.match(info.summary, /not extracted|not compute/i);
});

test("disabled, knowledge, and private repositories are not activated", async () => {
  const audits = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  const byName = new Map(audits.map((audit) => [audit.repository, audit]));

  for (const entry of WAVE2_NAMED_INTEGRATION) {
    const audit = byName.get(entry.repository);
    assert.equal(audit?.enabled, false, `${entry.repository} must stay disabled`);
    assert.equal(audit?.recommendedType, entry.classifiedAs);
    assert.notEqual(audit?.visibility, "private");
  }

  const paper = byName.get("uset82/Paper2Video");
  assert.equal(paper?.recommendedType, "disabled");
  assert.equal(
    admitAgentDocument(
      parseAgentJsonDocument({
        schema: AGENT_JSON_SCHEMA_V1,
        type: "agent",
        id: "paper2video",
        name: "Paper2Video",
        repository: "uset82/Paper2Video",
        version: "1.0.0",
        description: "Must not activate this upstream fork.",
        domains: ["research"],
        capabilities: ["thesis-outline"],
        inputs: [],
        outputs: [{ name: "result", type: "object" }],
        permissions: ["read", "compute"],
        sensitivity: "public",
        execution: "local-function",
        timeoutMs: 5_000,
      }),
      paper,
    ),
    "disabled-type",
  );

  const doodle = byName.get("uset82/3Doodle");
  assert.equal(
    admitAgentDocument(
      parseAgentJsonDocument({
        schema: AGENT_JSON_SCHEMA_V1,
        type: "agent",
        id: "doodle",
        name: "3Doodle",
        repository: "uset82/3Doodle",
        version: "1.0.0",
        description: "Knowledge until a later domain agent.",
        domains: ["3d"],
        capabilities: ["scaffolding-info"],
        inputs: [],
        outputs: [{ name: "result", type: "object" }],
        permissions: ["read", "compute"],
        sensitivity: "public",
        execution: "local-function",
        timeoutMs: 5_000,
      }),
      doodle,
    ),
    "knowledge-type",
  );

  const documents = await loadDiscoveredDocuments(manifestsRoot);
  const ids = documents.map((document) => document.id).sort();
  assert.deepEqual(ids, [
    "astraea",
    "electronics-agent",
    "mentora",
    "pinaculo",
    "smartapply",
    "stillas",
    "strudel",
    "thesis-writer",
  ]);
  assert.equal(ids.includes("paper2video"), false);
  const knowledge = new Set(WAVE2_KNOWLEDGE_REPOSITORIES);
  assert.equal(
    documents.some((document) => knowledge.has(document.repository)),
    false,
  );

  const { registry, skipped } = await buildAgentRegistry({ documents, audits });
  assert.equal(registry.list().length, 0);
  assert.equal(
    skipped.every((entry) => entry.reason === "not-enabled"),
    true,
  );
  assert.equal(
    audits.some((audit) => audit.visibility === "private" && audit.enabled),
    false,
  );

  const catalog = createWave2Specialists();
  assert.deepEqual(Object.keys(catalog).sort(), [
    "electronics-agent",
    "mentora",
    "smartapply",
    "stillas",
    "thesis-writer",
  ]);
});

test("wave 2 specialists only receive allowlisted personal fields", () => {
  const profile = {
    fullName: "Ada Lovelace",
    birthDate: "1815-12-10",
    fieldOfStudy: "mathematics",
    skills: "analysis",
    goals: "notes",
    password: "not-a-real-secret",
    query: "stm32",
  };
  assert.deepEqual(contextFilter("smartapply", profile, { consent: true }), {
    fieldOfStudy: "mathematics",
    skills: "analysis",
    goals: "notes",
    query: "stm32",
  });
  assert.deepEqual(contextFilter("electronics-agent", profile, { consent: true }), {
    fieldOfStudy: "mathematics",
    skills: "analysis",
    query: "stm32",
  });
  assert.equal("birthDate" in contextFilter("mentora", profile, { consent: true }), false);
});
