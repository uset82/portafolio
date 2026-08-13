import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { invokeRepoAgent } from "@/ana/protocol";
import { loadAgentJsonFile } from "@/ana/manifest";
import {
  createAgentPostHandler,
  createAstraeaAgent,
  createPhase6Specialists,
  createPinaculoAgent,
  createStrudelAgent,
  phase6AgentJsonDocuments,
  SYMBOLIC_INTERPRETATION_WARNING,
} from "@/ana/specialists";
import { calculateComplete } from "@/ana/specialists/pinaculo/core";
import { buildAgentRegistry, loadDiscoveredDocuments } from "@/ana/registry";
import { loadEffectiveRepositoryAudits } from "@/ana/repositories/registry";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const manifestsRoot = path.join(repoRoot, "brain/repositories/manifests");
const generatedPath = path.join(repoRoot, "brain/repositories/registry.generated.json");
const overridesPath = path.join(repoRoot, "brain/repositories/registry.overrides.json");

const jsonRequest = (body: unknown) =>
  new Request("http://localhost/api/agent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("host agent.json files match the Phase 6 specialist documents", async () => {
  const loaded = await Promise.all(
    ["astraea", "pinaculo", "strudel"].map((id) =>
      loadAgentJsonFile(path.join(manifestsRoot, id, "agent.json")),
    ),
  );
  assert.deepEqual(loaded, phase6AgentJsonDocuments);
});

test("pinaculo computes the extracted Pináculo core without UI", async () => {
  const positions = calculateComplete(10, 12, 1815);
  assert.equal(positions.A, 3);
  assert.equal(positions.B, 1);
  assert.equal(positions.C, 6);

  const agent = createPinaculoAgent();
  const health = await agent.health();
  assert.equal(health.status, "healthy");

  const response = await invokeRepoAgent(agent, {
    requestId: "pinaculo-1",
    capability: "numerology-profile",
    input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
  });
  assert.equal(response.status, "success");
  assert.equal(response.warnings?.includes(SYMBOLIC_INTERPRETATION_WARNING), true);
  assert.match(response.summary, /birth date only/);
  const result = response.result as { positions: { A: number; B: number; C: number } };
  assert.equal(result.positions.A, 3);
});

test("astraea and strudel use injected engines and do not invent domain output", async () => {
  const astraea = createAstraeaAgent({
    chartEngine: {
      health: async () => "healthy",
      natal: async (input) => ({ chart_type: "natal", input }),
      transits: async () => ({ chart_type: "transit" }),
      synastry: async () => ({ chart_type: "synastry" }),
      solarReturn: async () => ({ chart_type: "solar_return" }),
    },
  });
  const natal = await invokeRepoAgent(astraea, {
    requestId: "astraea-1",
    capability: "natal-chart",
    input: {
      birthDate: "1815-12-10",
      birthTime: "10:00",
      latitude: 51.5,
      longitude: -0.12,
    },
  });
  assert.equal(natal.status, "success");
  assert.equal(natal.warnings?.includes(SYMBOLIC_INTERPRETATION_WARNING), true);

  const interpretation = await invokeRepoAgent(astraea, {
    requestId: "astraea-2",
    capability: "interpretation",
    input: {
      birthDate: "1815-12-10",
      birthTime: "10:00",
      latitude: 51.5,
      longitude: -0.12,
    },
  });
  assert.equal(interpretation.status, "failed");
  assert.match(interpretation.summary, /not invented/);

  const strudel = createStrudelAgent({
    musicEngine: {
      health: async () => "healthy",
      generate: async (input) => ({
        type: "update_tracks",
        prompt: input.prompt,
        tracks: { drums: 's("bd")' },
      }),
    },
  });
  const pattern = await invokeRepoAgent(strudel, {
    requestId: "strudel-1",
    capability: "pattern-generate",
    input: { prompt: "slow techno pulse" },
  });
  assert.equal(pattern.status, "success");

  const unavailable = createPhase6Specialists({});
  assert.equal((await unavailable.astraea.health()).status, "unavailable");
  assert.equal((await unavailable.strudel.health()).status, "unavailable");
  const missingEngine = await invokeRepoAgent(unavailable.astraea, {
    requestId: "astraea-3",
    capability: "natal-chart",
    input: {
      birthDate: "1815-12-10",
      birthTime: "10:00",
      latitude: 51.5,
      longitude: -0.12,
    },
  });
  assert.equal(missingEngine.status, "failed");
});

test("the /api/agent adapter is disabled by default and is not a chatbot", async () => {
  const specialists = {
    astraea: createAstraeaAgent({
      chartEngine: {
        health: async () => "healthy",
        natal: async () => ({ chart_type: "natal" }),
        transits: async () => ({}),
        synastry: async () => ({}),
        solarReturn: async () => ({}),
      },
    }),
    pinaculo: createPinaculoAgent(),
    strudel: createStrudelAgent({
      musicEngine: {
        health: async () => "healthy",
        generate: async () => ({ type: "update_tracks" }),
      },
    }),
  };

  const disabled = createAgentPostHandler({
    enabled: false,
    specialists,
    createRequestId: () => "req-disabled",
  });
  const disabledResponse = await disabled(
    jsonRequest({
      capability: "numerology-profile",
      input: { fullName: "Ada", birthDate: "1815-12-10" },
    }),
  );
  assert.equal(disabledResponse.status, 503);

  const enabled = createAgentPostHandler({
    enabled: true,
    specialists,
    createRequestId: () => "req-enabled",
  });
  const ok = await enabled(
    jsonRequest({
      agentId: "pinaculo",
      capability: "numerology-profile",
      input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    }),
  );
  assert.equal(ok.status, 200);
  const body = (await ok.json()) as { ok: boolean; response: { agentId: string } };
  assert.equal(body.ok, true);
  assert.equal(body.response.agentId, "pinaculo");

  const ccAiSource = await readFile(path.join(repoRoot, "site/src/app/api/cc-ai/route.ts"), "utf8");
  assert.match(ccAiSource, /createCcAiPostHandler/);
});

test("committed manifests stay out of runtime lookup while specialists are disabled", async () => {
  const audits = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  const documents = await loadDiscoveredDocuments(manifestsRoot);
  const { registry, skipped } = await buildAgentRegistry({ documents, audits });
  assert.equal(documents.length, 8);
  assert.equal(registry.list().length, 0);
  assert.equal(
    skipped.every((entry) => entry.reason === "not-enabled"),
    true,
  );
});
