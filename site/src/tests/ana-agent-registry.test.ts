import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";
import {
  AGENT_JSON_SCHEMA_V1,
  parseAgentJsonDocument,
  type AgentJsonDocument,
} from "@/ana/manifest";
import {
  AgentRegistryError,
  admitAgentDocument,
  buildAgentRegistry,
  discoverAgentJsonFiles,
  loadDiscoveredDocuments,
  staticHealthProbe,
} from "@/ana/registry";
import { loadEffectiveRepositoryAudits } from "@/ana/repositories/registry";
import { repositoryAuditSchema, type RepositoryAudit } from "@/ana/repositories/schemas";

const temporaryDirectories: string[] = [];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const generatedPath = path.join(repoRoot, "brain/repositories/registry.generated.json");
const overridesPath = path.join(repoRoot, "brain/repositories/registry.overrides.json");
const checkedAt = "2026-08-13T00:00:00Z";

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const document = (
  overrides: Partial<AgentJsonDocument> & Pick<AgentJsonDocument, "id" | "repository">,
): AgentJsonDocument =>
  parseAgentJsonDocument({
    schema: AGENT_JSON_SCHEMA_V1,
    type: "agent",
    name: "Fixture Agent",
    version: "1.0.0",
    description: "Fixture specialist for registry tests.",
    domains: ["numerology"],
    capabilities: ["numerology-profile"],
    inputs: [{ name: "fullName", type: "string", required: true, sensitivity: "personal" }],
    outputs: [{ name: "profile", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "personal",
    execution: "local-function",
    timeoutMs: 4_000,
    ...overrides,
  });

const audit = (
  overrides: Partial<RepositoryAudit> & Pick<RepositoryAudit, "repository">,
): RepositoryAudit =>
  repositoryAuditSchema.parse({
    description: "Fixture audit",
    language: "TypeScript",
    hasBackend: false,
    hasAPI: false,
    hasDatabase: false,
    hasLLM: false,
    domain: ["numerology"],
    capabilities: ["numerology-profile"],
    status: "prototype",
    agentPotential: "high",
    recommendedType: "agent",
    visibility: "public",
    enabled: false,
    contentsInspected: true,
    sizeKb: 12,
    manifestFiles: ["package.json"],
    ...overrides,
  });

const healthyProbe = staticHealthProbe({ status: "healthy", checkedAt });

test("runtime lookup keeps only public enabled agent and tool manifests", async () => {
  const pinaculo = document({
    id: "pinaculo",
    repository: "uset82/fixture-pinaculo",
    domains: ["numerology"],
    capabilities: ["numerology-profile", "life-cycles"],
  });
  const strudel = document({
    id: "strudel",
    name: "Fixture Music Agent",
    repository: "uset82/fixture-strudel",
    domains: ["music"],
    capabilities: ["pattern-generate"],
    sensitivity: "public",
    inputs: [{ name: "prompt", type: "string", required: true }],
  });
  const qr = document({
    id: "qr-code",
    type: "tool",
    name: "Fixture QR Tool",
    repository: "uset82/fixture-qr",
    domains: ["web"],
    capabilities: ["qr-generate"],
    sensitivity: "public",
    permissions: ["read", "compute"],
    inputs: [{ name: "text", type: "string", required: true }],
  });
  const disabledDoc = document({
    id: "empty-lab",
    repository: "uset82/fixture-empty",
  });
  const knowledgeDoc = document({
    id: "course-notes",
    repository: "uset82/fixture-notes",
  });
  const privateDoc = document({
    id: "secret-lab",
    repository: "uset82/fixture-private",
  });
  const unknownDoc = document({
    id: "orphan",
    repository: "uset82/fixture-unknown",
  });
  const mismatchDoc = document({
    id: "wrong-type",
    type: "agent",
    repository: "uset82/fixture-mismatch",
  });

  const { registry, skipped } = await buildAgentRegistry({
    documents: [
      pinaculo,
      strudel,
      qr,
      disabledDoc,
      knowledgeDoc,
      privateDoc,
      unknownDoc,
      mismatchDoc,
    ],
    audits: [
      audit({ repository: "uset82/fixture-pinaculo", enabled: true, domain: ["numerology"] }),
      audit({
        repository: "uset82/fixture-strudel",
        enabled: true,
        domain: ["music"],
        recommendedType: "agent",
      }),
      audit({
        repository: "uset82/fixture-qr",
        enabled: true,
        recommendedType: "tool",
        domain: ["web"],
        agentPotential: "low",
      }),
      audit({
        repository: "uset82/fixture-empty",
        recommendedType: "disabled",
        agentPotential: "none",
      }),
      audit({
        repository: "uset82/fixture-notes",
        recommendedType: "knowledge",
        agentPotential: "low",
      }),
      audit({
        repository: "uset82/fixture-private",
        visibility: "private",
        contentsInspected: false,
      }),
      audit({
        repository: "uset82/fixture-mismatch",
        enabled: true,
        recommendedType: "tool",
      }),
    ],
    healthProbe: healthyProbe,
  });

  assert.deepEqual(
    registry.list().map((record) => record.id),
    ["pinaculo", "qr-code", "strudel"],
  );

  const numerology = registry.findByCapability("numerology-profile");
  assert.deepEqual(
    numerology.map((record) => record.id),
    ["pinaculo"],
  );
  assert.equal(registry.findByCapability("natal_chart").length, 0);

  const music = registry.findByDomain("music");
  assert.deepEqual(
    music.map((record) => record.id),
    ["strudel"],
  );

  const pinaculoRecord = registry.getById("pinaculo");
  assert.ok(pinaculoRecord);
  assert.equal(pinaculoRecord.availability, "available");
  assert.equal(pinaculoRecord.health.status, "healthy");
  assert.equal(pinaculoRecord.version, "1.0.0");
  assert.deepEqual(pinaculoRecord.permissions, ["read", "compute"]);
  assert.equal(pinaculoRecord.privacyLevel, "personal");
  assert.equal(pinaculoRecord.latencyEstimateMs, 4_000);
  assert.equal(pinaculoRecord.costEstimate, "unknown");

  assert.deepEqual(skipped.map((entry) => `${entry.reason}:${entry.repository}`).sort(), [
    "disabled-type:uset82/fixture-empty",
    "knowledge-type:uset82/fixture-notes",
    "private:uset82/fixture-private",
    "type-mismatch:uset82/fixture-mismatch",
    "unknown-repository:uset82/fixture-unknown",
  ]);
});

test("enabled private repositories are rejected instead of registered", () => {
  assert.throws(
    () =>
      admitAgentDocument(
        document({ id: "secret-lab", repository: "uset82/fixture-private" }),
        audit({
          repository: "uset82/fixture-private",
          visibility: "private",
          enabled: true,
          contentsInspected: false,
        }),
      ),
    (error: unknown) => error instanceof AgentRegistryError && error.code === "private_enabled",
  );
});

test("duplicate ids are rejected", async () => {
  const first = document({ id: "dup", repository: "uset82/fixture-a" });
  const second = document({ id: "dup", repository: "uset82/fixture-b" });
  await assert.rejects(
    () =>
      buildAgentRegistry({
        documents: [first, second],
        audits: [
          audit({ repository: "uset82/fixture-a", enabled: true }),
          audit({ repository: "uset82/fixture-b", enabled: true }),
        ],
      }),
    (error: unknown) => error instanceof AgentRegistryError && error.code === "duplicate_id",
  );
});

test("file discovery loads agent.json from a manifests root", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ana-agent-registry-"));
  temporaryDirectories.push(directory);
  const nested = path.join(directory, "fixture-protocol-agent");
  await mkdir(nested);
  const payload = document({
    id: "fixture-protocol-agent",
    repository: "uset82/fixture-protocol-agent",
  });
  await writeFile(path.join(nested, "agent.json"), `${JSON.stringify(payload, null, 2)}\n`);

  const files = await discoverAgentJsonFiles(directory);
  assert.equal(files.length, 1);
  assert.deepEqual(await discoverAgentJsonFiles(path.join(directory, "missing")), []);
  const documents = await loadDiscoveredDocuments(directory);
  const { registry } = await buildAgentRegistry({
    documents,
    audits: [audit({ repository: "uset82/fixture-protocol-agent", enabled: true })],
    healthProbe: healthyProbe,
  });
  assert.equal(registry.getById("fixture-protocol-agent")?.type, "agent");
});

test("committed audits do not activate specialists without enabled manifests", async () => {
  const audits = await loadEffectiveRepositoryAudits({ generatedPath, overridesPath });
  const { registry, skipped } = await buildAgentRegistry({
    documents: [
      document({
        id: "astraea",
        repository: "uset82/ASTROEA",
        domains: ["astrology"],
        capabilities: ["natal-chart"],
        sensitivity: "sensitive",
        inputs: [{ name: "birthDate", type: "string", required: true, sensitivity: "sensitive" }],
      }),
      document({
        id: "pinaculo",
        repository: "uset82/pinaculo",
        domains: ["numerology"],
        capabilities: ["numerology-profile"],
      }),
      document({
        id: "strudel",
        repository: "uset82/StrudelAI",
        domains: ["music"],
        capabilities: ["pattern-generate"],
        sensitivity: "public",
        inputs: [{ name: "prompt", type: "string", required: true }],
      }),
    ],
    audits,
  });

  assert.equal(registry.list().length, 0);
  assert.equal(
    audits.some((entry) => entry.enabled || entry.visibility === "private"),
    false,
  );
  assert.deepEqual(
    skipped.map((entry) => entry.reason),
    ["not-enabled", "not-enabled", "not-enabled"],
  );
  assert.equal(registry.findByCapability("natal-chart").length, 0);
  assert.equal(registry.findByDomain("astrology").length, 0);
});
