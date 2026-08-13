import assert from "node:assert/strict";
import test from "node:test";
import {
  AgentProtocolError,
  assertRequestMatchesManifest,
  defineRepoAgent,
  invokeRepoAgent,
  parseAgentHealth,
  parseAgentManifest,
  parseAgentRequest,
  parseAgentResponse,
  type AgentManifest,
  type AgentRequest,
  type RepoAgent,
} from "@/ana/protocol";

const validManifest = (): AgentManifest =>
  parseAgentManifest({
    id: "fixture-protocol-agent",
    name: "Fixture Protocol Agent",
    repository: "uset82/fixture-protocol-agent",
    version: "1.0.0",
    description: "In-memory specialist used to prove the RepoAgent contract.",
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

const validRequest = (overrides: Partial<AgentRequest> = {}): AgentRequest => ({
  requestId: "req-protocol-1",
  capability: "numerology-profile",
  input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
  ...overrides,
});

const createFixtureAgent = (manifest = validManifest()): RepoAgent =>
  defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-12T22:00:00Z",
    }),
    execute: async (request) => ({
      agentId: manifest.id,
      status: "success",
      result: { capability: request.capability, received: request.input },
      summary: "Computed a fixture profile without calling a real repository.",
      evidence: [{ kind: "capability", label: request.capability }],
      runtimeMs: 4,
      confidence: 1,
    }),
  });

test("a complete RepoAgent manifest parses", () => {
  const manifest = validManifest();
  assert.equal(manifest.id, "fixture-protocol-agent");
  assert.deepEqual(manifest.permissions, ["read", "compute"]);
  assert.equal(manifest.execution, "local-function");
});

test("invalid manifests are rejected", () => {
  const withoutTimeout: Record<string, unknown> = { ...validManifest() };
  delete withoutTimeout.timeoutMs;
  assert.throws(() => parseAgentManifest(withoutTimeout), AgentProtocolError);
  assert.throws(() => parseAgentManifest({ ...validManifest(), capabilities: [] }), /capabilities/);
  assert.throws(
    () =>
      parseAgentManifest({
        ...validManifest(),
        capabilities: ["numerology-profile", "numerology-profile"],
      }),
    /Duplicate capability/,
  );
  assert.throws(
    () => parseAgentManifest({ ...validManifest(), permissions: ["admin"] } as unknown),
    AgentProtocolError,
  );
  assert.throws(
    () => parseAgentManifest({ ...validManifest(), sensitivity: "secret" } as unknown),
    AgentProtocolError,
  );
  assert.throws(
    () => parseAgentManifest({ ...validManifest(), extraField: true } as unknown),
    AgentProtocolError,
  );
});

test("invalid requests and responses are rejected", () => {
  assert.throws(() => parseAgentRequest({ capability: "numerology-profile" }), AgentProtocolError);
  assert.throws(
    () =>
      parseAgentResponse({
        agentId: "fixture-protocol-agent",
        status: "success",
        result: {},
        runtimeMs: 1,
      }),
    /summary/,
  );
  assert.throws(
    () =>
      parseAgentResponse({
        agentId: "fixture-protocol-agent",
        status: "success",
        result: {},
        summary: "ok",
        runtimeMs: 1,
        confidence: 1.4,
      }),
    /confidence/,
  );
  assert.throws(
    () => parseAgentHealth({ agentId: "fixture-protocol-agent", status: "healthy" }),
    AgentProtocolError,
  );
});

test("requests must match declared capabilities, required inputs, and types", () => {
  const manifest = validManifest();
  assert.throws(
    () => assertRequestMatchesManifest(manifest, validRequest({ capability: "natal-chart" })),
    /not provided/,
  );
  assert.throws(
    () =>
      assertRequestMatchesManifest(manifest, validRequest({ input: { fullName: "Ada Lovelace" } })),
    /birthDate/,
  );
  assert.throws(
    () =>
      assertRequestMatchesManifest(
        manifest,
        validRequest({
          input: { fullName: "Ada", birthDate: "1815-12-10", extraField: true },
        }),
      ),
    /extraField/,
  );
  assert.throws(
    () =>
      assertRequestMatchesManifest(
        manifest,
        validRequest({ input: { fullName: 12, birthDate: "1815-12-10" } }),
      ),
    /fullName must be string/,
  );
});

test("invokeRepoAgent runs a specialist through the shared contract", async () => {
  const agent = createFixtureAgent();
  const health = parseAgentHealth(await agent.health());
  assert.equal(health.status, "healthy");

  const response = await invokeRepoAgent(agent, validRequest());
  assert.equal(response.status, "success");
  assert.equal(response.agentId, "fixture-protocol-agent");
  assert.match(response.summary, /fixture profile/);
  assert.equal(response.confidence, 1);
});

test("invokeRepoAgent rejects responses from the wrong agent id", async () => {
  const manifest = validManifest();
  const agent: RepoAgent = {
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-12T22:00:00Z",
    }),
    execute: async () => ({
      agentId: "someone-else",
      status: "success",
      result: {},
      summary: "wrong agent",
      runtimeMs: 1,
    }),
  };

  await assert.rejects(() => invokeRepoAgent(agent, validRequest()), /does not match manifest/);
});
