import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test, { afterEach } from "node:test";
import { fileURLToPath } from "node:url";
import { buildAgentRegistry } from "@/ana/registry";
import { repositoryAuditSchema } from "@/ana/repositories/schemas";
import {
  initRepo2Agent,
  publishRepo2Agent,
  registerRepo2AgentDirectory,
  REPO2AGENT_SCAFFOLD_FILES,
  runRepo2AgentCli,
  testRepo2AgentDirectory,
  validateRepo2AgentDirectory,
} from "@/ana/sdk";

const temporaryDirectories: string[] = [];
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

const tempDir = async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "repo2agent-"));
  temporaryDirectories.push(directory);
  return directory;
};

const initOptions = (directory: string) => ({
  directory,
  id: "sample-agent",
  name: "Sample Agent",
  repository: "uset82/sample-agent",
  domain: "web" as const,
  capability: "sample-task",
  type: "agent" as const,
});

test("init scaffolds agent.json, AGENTS.md, agent module, and tests", async () => {
  const directory = await tempDir();
  const created = await initRepo2Agent(initOptions(directory));
  assert.deepEqual(created.files, [...REPO2AGENT_SCAFFOLD_FILES]);
  const document = JSON.parse(await readFile(path.join(directory, "agent.json"), "utf8")) as {
    schema: string;
    id: string;
    permissions: string[];
  };
  assert.equal(document.schema, "repo2agent/v1");
  assert.equal(document.id, "sample-agent");
  assert.deepEqual(document.permissions, ["read", "compute"]);
  assert.match(await readFile(path.join(directory, "AGENTS.md"), "utf8"), /Repo2Agent specialist/);
  assert.match(
    await readFile(path.join(directory, "agent/index.ts"), "utf8"),
    /createScaffoldAgent/,
  );
  assert.match(
    await readFile(path.join(directory, "tests/agent.test.ts"), "utf8"),
    /repo2agent\/v1/,
  );
});

test("validate, test, and register succeed without enabling or publishing", async () => {
  const directory = await tempDir();
  await initRepo2Agent(initOptions(directory));
  const validated = await validateRepo2AgentDirectory(directory);
  assert.equal(validated.ok, true);
  const tested = await testRepo2AgentDirectory(directory);
  assert.equal(tested.ok, true);
  if (tested.ok) {
    assert.equal(tested.agentId, "sample-agent");
    assert.match(tested.summary, /does not execute remote repository code/);
  }
  const manifestsRoot = path.join(directory, "manifests");
  const registered = await registerRepo2AgentDirectory(directory, { manifestsRoot });
  assert.equal(registered.ok, true);
  if (registered.ok) {
    assert.equal(registered.enabled, false);
    assert.equal(registered.published, false);
    assert.equal(registered.path, path.join(manifestsRoot, "sample-agent", "agent.json"));
  }
  const { registry, skipped } = await buildAgentRegistry({
    documents: validated.ok ? [validated.document] : [],
    audits: [
      repositoryAuditSchema.parse({
        repository: "uset82/sample-agent",
        hasBackend: false,
        hasAPI: false,
        hasDatabase: false,
        hasLLM: false,
        domain: ["web"],
        capabilities: ["sample-task"],
        status: "prototype",
        agentPotential: "high",
        recommendedType: "agent",
        visibility: "public",
        enabled: false,
        contentsInspected: true,
        sizeKb: 12,
        manifestFiles: ["agent.json"],
      }),
    ],
  });
  assert.deepEqual(registry.list(), []);
  assert.equal(skipped[0]?.reason, "not-enabled");
});

test("CLI init/validate/test/register match npx repo2agent and publish is denied", async () => {
  const directory = await tempDir();
  const init = await runRepo2AgentCli([
    "init",
    "--dir",
    directory,
    "--id",
    "sample-agent",
    "--name",
    "Sample Agent",
    "--repository",
    "uset82/sample-agent",
    "--domain",
    "web",
    "--capability",
    "sample-task",
  ]);
  assert.equal(init.status, 0);
  const validated = await runRepo2AgentCli(["validate", directory]);
  assert.equal(validated.status, 0);
  const tested = await runRepo2AgentCli(["test", directory]);
  assert.equal(tested.status, 0);
  const manifestsRoot = path.join(directory, "manifests");
  const registered = await runRepo2AgentCli(["register", directory, "--manifests", manifestsRoot]);
  assert.equal(registered.status, 0);
  assert.match(registered.stdout, /enabled: false/);
  const published = await runRepo2AgentCli(["publish"]);
  assert.equal(published.status, 1);
  assert.match(published.stderr, /not authorized/);
  assert.deepEqual(publishRepo2Agent(), {
    ok: false,
    error: "Repo2Agent is not published. npm publish is not authorized in this phase.",
  });
});

test("init and register refuse protected ASTROEA, pinaculo, and StrudelAI remotes", async () => {
  const directory = await tempDir();
  await assert.rejects(
    () =>
      initRepo2Agent({
        directory,
        id: "astraea",
        name: "ASTRAEA",
        repository: "uset82/ASTROEA",
        domain: "astrology",
        capability: "natal-chart",
        type: "agent",
      }),
    /protected/,
  );
  await initRepo2Agent(initOptions(directory));
  const agentJsonPath = path.join(directory, "agent.json");
  const document = JSON.parse(await readFile(agentJsonPath, "utf8")) as Record<string, unknown>;
  document.id = "pinaculo";
  document.repository = "uset82/pinaculo";
  document.domains = ["numerology"];
  document.capabilities = ["numerology-profile"];
  await writeFile(agentJsonPath, `${JSON.stringify(document, null, 2)}\n`);
  const registered = await registerRepo2AgentDirectory(directory, {
    manifestsRoot: path.join(directory, "manifests"),
  });
  assert.equal(registered.ok, false);
  if (!registered.ok) assert.match(registered.error, /protected/);
});

test("validate fails on broken agent.json and the site package is not publishable", async () => {
  const directory = await tempDir();
  await initRepo2Agent(initOptions(directory));
  await writeFile(path.join(directory, "agent.json"), "{not-json");
  const validated = await validateRepo2AgentDirectory(directory);
  assert.equal(validated.ok, false);
  const pkg = JSON.parse(await readFile(path.join(repoRoot, "site/package.json"), "utf8")) as {
    private?: boolean;
    scripts?: Record<string, string>;
  };
  assert.equal(pkg.private, true);
  assert.equal(pkg.scripts?.publish, undefined);
  assert.equal(pkg.scripts?.["prepublishOnly"], undefined);
  assert.match(pkg.scripts?.repo2agent ?? "", /repo2agent/);
});
