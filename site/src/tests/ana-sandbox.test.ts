import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  ANA_SANDBOX_LIMITS,
  createAnaSandbox,
  SANDBOX_DENIED_CONTAINER,
  SANDBOX_DENIED_ISOLATION,
  SANDBOX_DENIED_OUTPUT,
  SANDBOX_DENIED_REPOSITORY,
  SANDBOX_DENIED_URL,
  TRUSTED_LOCAL_AGENT_IDS,
} from "@/ana/sandbox";
import { createPinaculoAgent } from "@/ana/specialists";
import { createChartEngineFromEnv } from "@/ana/specialists/astraea/engine";
import { createMusicEngineFromEnv } from "@/ana/specialists/strudel/engine";
import { executePlan, indexRepoAgents } from "@/ana/core";

const fakeAgent = (options: {
  id?: string;
  execution?: "local-function" | "http" | "container";
  execute: RepoAgent["execute"];
}): RepoAgent => {
  const id = options.id ?? "fixture";
  const manifest = parseAgentManifest({
    id,
    name: id,
    repository: `uset82/${id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA sandbox tests.",
    domains: ["numerology"],
    capabilities: ["numerology-profile"],
    inputs: [
      { name: "fullName", type: "string", required: false },
      { name: "birthDate", type: "string", required: false },
    ],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "sensitive",
    execution: options.execution ?? "local-function",
    timeoutMs: 1_000,
  });
  return defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-13T00:00:00Z",
    }),
    execute: options.execute,
  });
};

test("repository code is not executed inside the portfolio process", async () => {
  const sandbox = createAnaSandbox();
  const denied = await sandbox.runRepository({
    repository: "uset82/ASTROEA",
    path: "C:/work/ASTROEA/src/index.ts",
    capability: "natal-chart",
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.summary, SANDBOX_DENIED_REPOSITORY);
  assert.deepEqual((denied.result as { limits: typeof ANA_SANDBOX_LIMITS }).limits, sandbox.limits);
  assert.equal(TRUSTED_LOCAL_AGENT_IDS.includes("pinaculo"), true);
});

test("sandbox jobs carry CPU, memory, and timeout limits", () => {
  const sandbox = createAnaSandbox({
    limits: { timeoutMs: 4_000, memoryMb: 64, cpuMs: 2_000 },
  });
  assert.equal(sandbox.limits.timeoutMs, 4_000);
  assert.equal(sandbox.limits.memoryMb, 64);
  assert.equal(sandbox.limits.cpuMs, 2_000);
  assert.equal(sandbox.limits.maxOutputBytes, ANA_SANDBOX_LIMITS.maxOutputBytes);
});

test("network policy denies file, metadata, and private targets", () => {
  const sandbox = createAnaSandbox();
  assert.equal(sandbox.inspectUrl("file:///etc/passwd").ok, false);
  assert.equal(sandbox.inspectUrl("http://169.254.169.254/latest/meta-data").ok, false);
  assert.equal(sandbox.inspectUrl("http://metadata.google.internal/").ok, false);
  assert.equal(sandbox.inspectUrl("http://127.0.0.1:8080").ok, false);
  assert.equal(sandbox.inspectUrl("https://example.com/api").ok, true);
  const privateAllowed = sandbox.inspectUrl("http://localhost:8000");
  assert.equal(privateAllowed.ok, false);
  assert.equal(sandbox.inspectUrl("http://localhost:8000", { allowPrivateHosts: true }).ok, true);
  assert.equal(SANDBOX_DENIED_URL.length > 0, true);
});

test("specialist HTTP engines reject metadata URLs from env", async () => {
  const astraea = createChartEngineFromEnv({
    ASTRAEA_API_URL: "http://169.254.169.254/",
  });
  assert.equal(await astraea.health(), "unavailable");
  const strudel = createMusicEngineFromEnv({
    STRUDEL_API_URL: "file:///tmp/agent",
  });
  assert.equal(await strudel.health(), "unavailable");
});

test("filesystem and secret isolation keep .env and API keys out of the sandbox", async () => {
  const sandbox = createAnaSandbox({
    env: {
      NODE_ENV: "test",
      OPENROUTER_API_KEY: "should-not-leak",
      ANA_MEMORY_KEY: "aabb".repeat(16),
    },
  });
  assert.deepEqual(sandbox.env, { NODE_ENV: "test" });
  assert.equal("OPENROUTER_API_KEY" in sandbox.env, false);

  const agent = fakeAgent({
    execute: async () => {
      throw new Error("should not run");
    },
  });
  const denied = await sandbox.runAgent({
    agent,
    request: {
      requestId: "box-1",
      capability: "numerology-profile",
      input: { fullName: "site/.env.local" },
    },
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.summary, SANDBOX_DENIED_ISOLATION);
});

test("sandbox output is validated before ANA consumes it", async () => {
  const sandbox = createAnaSandbox({ limits: { maxOutputBytes: 200 } });
  const huge = fakeAgent({
    execute: async () => ({
      agentId: "fixture",
      status: "success",
      result: { blob: "x".repeat(500) },
      summary: "too large",
      runtimeMs: 1,
    }),
  });
  const oversized = await sandbox.runAgent({
    agent: huge,
    request: {
      requestId: "box-2",
      capability: "numerology-profile",
      input: { fullName: "Ada Lovelace" },
    },
  });
  assert.equal(oversized.status, "failed");
  assert.equal(oversized.summary, SANDBOX_DENIED_OUTPUT);

  const dirty = fakeAgent({
    execute: async () => ({
      agentId: "fixture",
      status: "success",
      result: { constructor: { polluted: true } },
      summary: "unsafe",
      runtimeMs: 1,
    }),
  });
  const rejected = await sandbox.runAgent({
    agent: dirty,
    request: {
      requestId: "box-3",
      capability: "numerology-profile",
      input: { fullName: "Ada Lovelace" },
    },
  });
  assert.equal(rejected.status, "failed");
  assert.equal(rejected.summary, SANDBOX_DENIED_OUTPUT);
});

test("extracted Pináculo compute still runs as a trusted host function", async () => {
  const sandbox = createAnaSandbox();
  const response = await sandbox.runAgent({
    agent: createPinaculoAgent(),
    request: {
      requestId: "box-4",
      capability: "numerology-profile",
      input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    },
  });
  assert.equal(response.status, "success");
  const result = response.result as { positions: { A: number } };
  assert.equal(result.positions.A, 3);
});

test("container execution is denied until a provider is configured", async () => {
  const sandbox = createAnaSandbox();
  const denied = await sandbox.runContainer({
    agentId: "untrusted",
    capability: "run",
    execution: "container",
    limits: sandbox.limits,
  });
  assert.equal(denied.status, "failed");
  assert.equal(denied.summary, SANDBOX_DENIED_CONTAINER);
});

test("executePlan still runs injected specialists through the sandbox", async () => {
  const agent = fakeAgent({
    id: "pinaculo",
    execute: async (request) => ({
      agentId: "pinaculo",
      status: "success",
      result: { received: request.input },
      summary: "sandboxed fixture",
      runtimeMs: 1,
    }),
  });
  const result = await executePlan({
    requestId: "box-5",
    steps: [
      {
        agentId: "pinaculo",
        capability: "numerology-profile",
        domain: "numerology",
        dependsOn: [],
      },
    ],
    provided: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    index: indexRepoAgents([agent]),
    sharePersonalProfile: true,
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "success");
  assert.deepEqual(result.responses[0]?.result, {
    received: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
  });
});
