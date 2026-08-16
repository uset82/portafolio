import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";
import {
  AGENT_JSON_SCHEMA_V1,
  AgentJsonError,
  isSupportedAgentJsonSchema,
  loadAgentJsonFile,
  loadAgentManifestFromFile,
  parseAgentJsonDocument,
  parseAgentJsonText,
  supportedAgentJsonSchemas,
  toAgentManifest,
  type AgentJsonDocument,
} from "@/ana/manifest";
import { parseAgentManifest } from "@/ana/protocol";

const temporaryDirectories: string[] = [];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const validDocument = (): AgentJsonDocument =>
  parseAgentJsonDocument({
    schema: AGENT_JSON_SCHEMA_V1,
    type: "agent",
    id: "fixture-protocol-agent",
    name: "Fixture Protocol Agent",
    repository: "uset82/fixture-protocol-agent",
    version: "1.0.0",
    description: "On-disk specialist manifest used to prove repo2agent/v1.",
    domains: ["numerology"],
    capabilities: ["numerology-profile"],
    inputs: [
      { name: "fullName", type: "string", required: true, sensitivity: "personal" },
      { name: "birthDate", type: "string", required: true, sensitivity: "sensitive" },
    ],
    outputs: [{ name: "profile", type: "object", description: "Numeric profile summary" }],
    permissions: ["read", "compute"],
    sensitivity: "sensitive",
    execution: "local-function",
    timeoutMs: 5_000,
  });

const specExampleAstraea = {
  schema: "repo2agent/v1",
  id: "astraea",
  name: "ASTRAEA",
  type: "agent",
  repository: "uset82/ASTROEA",
  domains: ["astrology"],
  capabilities: ["natal_chart", "transits", "synastry", "solar_return", "interpretation"],
  requiredInputs: ["birth_date", "birth_time", "birth_location"],
  sensitivity: "sensitive",
};

const skippedDirectoryNames = new Set([".git", ".next", "node_modules"]);

/**
 * Design handoffs arrive with an `uploads/` folder holding a snapshot of this
 * repository, which the design tool ingested as context. That snapshot is not
 * our source — it is a copy of it — so its manifests would otherwise be counted
 * twice. `.gitignore` draws the same boundary and keeps it out of git.
 */
const isHandoffUpload = (entryPath: string) =>
  entryPath.includes("-handoff") && entryPath.split(path.sep).includes("uploads");

const collectAgentJsonFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (skippedDirectoryNames.has(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (isHandoffUpload(entryPath)) continue;
    if (entry.isDirectory()) {
      files.push(...(await collectAgentJsonFiles(entryPath)));
      continue;
    }
    if (entry.isFile() && entry.name === "agent.json") {
      files.push(path.relative(repoRoot, entryPath));
    }
  }
  return files;
};

test("repo2agent/v1 documents parse and convert to the RepoAgent manifest", () => {
  const document = validDocument();
  assert.equal(document.schema, "repo2agent/v1");
  assert.equal(document.type, "agent");
  assert.equal(isSupportedAgentJsonSchema(document.schema), true);
  assert.deepEqual(supportedAgentJsonSchemas, ["repo2agent/v1"]);

  const manifest = toAgentManifest(document);
  assert.equal("schema" in manifest, false);
  assert.equal("type" in manifest, false);
  assert.equal(parseAgentManifest(manifest).id, "fixture-protocol-agent");
});

test("new capabilities can be added without changing the v1 parser", () => {
  const document = parseAgentJsonDocument({
    ...validDocument(),
    capabilities: ["numerology-profile", "life-cycles", "pinnacle-cycles"],
  });
  assert.deepEqual(document.capabilities, ["numerology-profile", "life-cycles", "pinnacle-cycles"]);
});

test("invalid and unsupported manifests are rejected", () => {
  assert.throws(() => parseAgentJsonDocument(specExampleAstraea), AgentJsonError);
  assert.throws(
    () => parseAgentJsonDocument(specExampleAstraea),
    /natal_chart|requiredInputs|version/,
  );

  const missingSchema = { ...validDocument() } as Record<string, unknown>;
  delete missingSchema.schema;
  assert.throws(() => parseAgentJsonDocument(missingSchema), /schema/);

  assert.throws(
    () => parseAgentJsonDocument({ ...validDocument(), schema: "repo2agent/v2" } as unknown),
    (error: unknown) =>
      error instanceof AgentJsonError &&
      error.code === "unsupported_schema" &&
      error.message.includes("repo2agent/v2"),
  );

  assert.throws(
    () => parseAgentJsonDocument({ ...validDocument(), type: "knowledge" } as unknown),
    AgentJsonError,
  );
  assert.throws(() => parseAgentJsonText("{"), /not valid JSON/);
  assert.equal(isSupportedAgentJsonSchema("repo2agent/v2"), false);
});

test("the loader reads a valid file and rejects a missing file", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ana-agent-json-"));
  temporaryDirectories.push(directory);
  const filePath = path.join(directory, "agent.json");
  await writeFile(filePath, `${JSON.stringify(validDocument(), null, 2)}\n`);

  const loaded = await loadAgentJsonFile(filePath);
  assert.equal(loaded.id, "fixture-protocol-agent");
  const manifest = await loadAgentManifestFromFile(filePath);
  assert.equal(manifest.repository, "uset82/fixture-protocol-agent");

  await assert.rejects(
    () => loadAgentJsonFile(path.join(directory, "missing.json")),
    (error: unknown) => error instanceof AgentJsonError && error.code === "file_not_found",
  );
});

test("committed agent.json files are only the host specialist manifests", async () => {
  const files = (await collectAgentJsonFiles(repoRoot))
    .map((file) => file.split(path.sep).join("/"))
    .sort();
  const hostManifests = [
    "brain/repositories/manifests/astraea/agent.json",
    "brain/repositories/manifests/electronics/agent.json",
    "brain/repositories/manifests/mentora/agent.json",
    "brain/repositories/manifests/pinaculo/agent.json",
    "brain/repositories/manifests/smartapply/agent.json",
    "brain/repositories/manifests/stillas/agent.json",
    "brain/repositories/manifests/strudel/agent.json",
    "brain/repositories/manifests/thesis-writer/agent.json",
  ] as const;
  assert.deepEqual(files, [...hostManifests, ...hostManifests.map((file) => `site/${file}`)]);
});
