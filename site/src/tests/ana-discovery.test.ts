import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  buildDiscoveryIndex,
  createUnavailableEmbeddingEngine,
  draftPlan,
  indexRepoAgents,
  rankCapabilities,
  rankCapabilitiesSync,
  routeIntent,
  understandIntent,
} from "@/ana/core";
import { hostAgentJsonDocuments } from "@/ana/specialists";
import { PAPER2VIDEO_EXCLUDED } from "@/ana/domains";
import { loadEffectiveRepositoryAudits } from "@/ana/repositories/registry";
import { repositoryAuditSchema, type RepositoryAudit } from "@/ana/repositories/schemas";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const audit = (
  overrides: Partial<RepositoryAudit> & Pick<RepositoryAudit, "repository">,
): RepositoryAudit =>
  repositoryAuditSchema.parse({
    hasBackend: false,
    hasAPI: false,
    hasDatabase: false,
    hasLLM: false,
    domain: ["electronics"],
    capabilities: [],
    status: "prototype",
    agentPotential: "low",
    recommendedType: "knowledge",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 1,
    manifestFiles: [],
    ...overrides,
  });

const fakeElectronics = (): RepoAgent => {
  const manifest = parseAgentManifest({
    id: "electronics-agent",
    name: "Electronics",
    repository: "uset82/TRAFFICLIGHT",
    version: "1.0.0",
    description: "Electronics cluster",
    domains: ["electronics", "embedded", "iot", "fpga"],
    capabilities: [
      "traffic-light",
      "fpga-uart",
      "microcontroller",
      "smart-home",
      "watering-system",
    ],
    inputs: [{ name: "query", type: "string", required: false }],
    outputs: [{ name: "catalog", type: "object" }],
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
      result: { capability: request.capability },
      summary: `Fixture ${request.capability}.`,
      runtimeMs: 1,
    }),
  });
};

test("discovery documents embed descriptions, capabilities, README, API schemas, and tool text", () => {
  const index = buildDiscoveryIndex({
    includeHostCatalog: true,
    manifests: hostAgentJsonDocuments,
    audits: [
      audit({
        repository: "uset82/TRAFFICLIGHT",
        recommendedType: "tool",
        readme: "STM32 EXTI interrupt traffic light on Nucleo-F767ZI.",
        capabilities: ["traffic-light"],
      }),
    ],
  });
  const traffic = index.documents.find((document) => document.capability === "traffic-light");
  const manifest = index.documents.find((document) => document.id === "manifest:electronics-agent");
  const readme = index.documents.find((document) => document.id === "audit:uset82/TRAFFICLIGHT");
  assert.equal(traffic?.fields.toolDescription?.includes("EXTI"), true);
  assert.equal(manifest?.fields.description?.includes("electronics"), true);
  assert.equal(manifest?.fields.apiSchema?.includes("inputs"), true);
  assert.equal(manifest?.fields.capabilities?.includes("traffic-light"), true);
  assert.equal(readme?.fields.readme?.includes("STM32"), true);
});

test("embeddings rank STM32 EXTI interrupt queries toward the electronics agent", async () => {
  const index = buildDiscoveryIndex({
    includeHostCatalog: true,
    manifests: hostAgentJsonDocuments,
  });
  const ranked = await rankCapabilities("STM32 EXTI interrupt debugging", index);
  const executable = ranked.filter((hit) => hit.executable);
  assert.equal(executable.length > 0, true);
  assert.equal(
    executable.some(
      (hit) => hit.agentId === "electronics-agent" || hit.capability === "traffic-light",
    ),
    true,
  );
  const electronicsScore =
    ranked.find((hit) => hit.agentId === "electronics-agent" || hit.domainAgentId === "engineering")
      ?.score ?? 0;
  const astraeaScore = ranked.find((hit) => hit.agentId === "astraea")?.score ?? 0;
  assert.equal(electronicsScore > astraeaScore, true);
});

test("keyword lookup is used when embeddings are unavailable", async () => {
  const index = buildDiscoveryIndex({
    includeHostCatalog: true,
    manifests: hostAgentJsonDocuments,
  });
  const ranked = await rankCapabilities("STM32 EXTI interrupt debugging", index, {
    embedder: createUnavailableEmbeddingEngine(),
  });
  assert.equal(ranked[0]?.source, "keyword");
  assert.equal(
    ranked.some((hit) => hit.agentId === "electronics-agent" || hit.capability === "traffic-light"),
    true,
  );
  const sync = rankCapabilitiesSync("RS-232 VHDL UART on DE2-115", index, { useEmbeddings: false });
  assert.equal(sync[0]?.source, "keyword");
  assert.equal(
    sync.some((hit) => hit.capability === "fpga-uart"),
    true,
  );
});

test("private and disabled repositories are not indexed", () => {
  const index = buildDiscoveryIndex({
    includeHostCatalog: true,
    audits: [
      audit({
        repository: "uset82/secret-lab",
        visibility: "private",
        recommendedType: "tool",
        readme: "STM32 EXTI interrupt private notes.",
      }),
      audit({
        repository: PAPER2VIDEO_EXCLUDED,
        recommendedType: "disabled",
        status: "fork",
        domain: ["research"],
        readme: "Automatic video generation from scientific papers.",
      }),
      audit({
        repository: "uset82/antigravity-vibe",
        recommendedType: "disabled",
        status: "empty",
        domain: ["web"],
        readme: "Empty placeholder.",
      }),
    ],
  });
  const repositories = index.documents.map((document) => document.repository);
  assert.equal(repositories.includes("uset82/secret-lab"), false);
  assert.equal(repositories.includes(PAPER2VIDEO_EXCLUDED), false);
  assert.equal(repositories.includes("uset82/antigravity-vibe"), false);
});

test("committed public audits never index private or disabled repositories", async () => {
  const audits = await loadEffectiveRepositoryAudits({
    generatedPath: path.join(repoRoot, "brain/repositories/registry.generated.json"),
    overridesPath: path.join(repoRoot, "brain/repositories/registry.overrides.json"),
  });
  const index = buildDiscoveryIndex({
    audits,
    includeHostCatalog: true,
    manifests: hostAgentJsonDocuments,
  });
  assert.equal(
    index.documents.some((document) => document.repository === PAPER2VIDEO_EXCLUDED),
    false,
  );
  assert.equal(
    audits
      .filter((entry) => entry.recommendedType === "disabled" || entry.visibility === "private")
      .every(
        (entry) => !index.documents.some((document) => document.id === `audit:${entry.repository}`),
      ),
    true,
  );
});

test("STM32 interrupt queries select the engineering domain, not natal or QR", () => {
  const message = "Help me understand an STM32 interrupt problem.";
  const intent = understandIntent(message);
  assert.equal(intent.kind, "specialist");
  assert.deepEqual(intent.goals, ["capability-search"]);
  assert.equal(
    understandIntent("I study software engineering").goals.includes("capability-search"),
    false,
  );

  const drafted = draftPlan({ requestId: "disc-1", message });
  const qrManifest = parseAgentManifest({
    id: "qr",
    name: "qr",
    repository: "uset82/qr",
    version: "1.0.0",
    description: "QR tool",
    domains: ["web"],
    capabilities: ["generate-qr"],
    inputs: [],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: 1_000,
  });
  const qr = defineRepoAgent({
    manifest: () => qrManifest,
    health: async () => ({
      agentId: "qr",
      status: "healthy",
      checkedAt: "2026-08-13T00:00:00Z",
    }),
    execute: async () => ({
      agentId: "qr",
      status: "success",
      result: {},
      summary: "qr",
      runtimeMs: 1,
    }),
  });
  const routed = routeIntent(drafted, indexRepoAgents([fakeElectronics(), qr]), message, {
    discoveryIndex: buildDiscoveryIndex({
      includeHostCatalog: true,
      manifests: hostAgentJsonDocuments,
    }),
  });
  assert.deepEqual(routed.selectedDomains, ["engineering"]);
  assert.deepEqual(
    routed.steps.map((step) => `${step.agentId}:${step.capability}`),
    ["electronics-agent:traffic-light"],
  );
  assert.equal(
    routed.steps.some((step) => step.agentId === "qr"),
    false,
  );
});
