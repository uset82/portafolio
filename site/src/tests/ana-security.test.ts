import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import type { AgentPermission } from "@/ana/protocol/schemas";
import {
  evaluateSecurityGate,
  executePlan,
  indexRepoAgents,
  runAna,
  VISITOR_PERMISSIONS,
} from "@/ana/core";
import { pinaculoAgentJson, createPinaculoAgent } from "@/ana/specialists";
import { toAgentManifest } from "@/ana/manifest";

const fakeAgent = (options: {
  id?: string;
  permissions: AgentPermission[];
  execute?: RepoAgent["execute"];
}): RepoAgent => {
  const id = options.id ?? "fixture";
  let ran = 0;
  const manifest = parseAgentManifest({
    id,
    name: id,
    repository: `uset82/${id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA security-gate tests.",
    domains: ["career"],
    capabilities: ["career-analysis"],
    inputs: [{ name: "token", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
    permissions: options.permissions,
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: 1_000,
  });
  const agent = defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-13T00:00:00Z",
    }),
    execute: async (request) => {
      ran += 1;
      if (options.execute) return options.execute(request);
      return {
        agentId: manifest.id,
        status: "success",
        result: { ran },
        summary: "security fixture",
        runtimeMs: 1,
      };
    },
  });
  return Object.assign(agent, { ran: () => ran });
};

test("visitor-facing default is read plus compute", () => {
  assert.deepEqual(VISITOR_PERMISSIONS, ["read", "compute"]);
  const pinaculo = toAgentManifest(pinaculoAgentJson);
  assert.deepEqual(pinaculo.permissions, ["read", "compute"]);
  const decision = evaluateSecurityGate({
    agent: createPinaculoAgent(),
    input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    sharePersonalProfile: true,
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.checks.canRun, true);
  assert.equal(decision.checks.canWrite, false);
  assert.equal(decision.checks.canCallExternalApis, false);
  assert.equal(decision.checks.requiresConfirmation, false);
});

test("security gate records run, access, write, network, secrets, and confirmation checks", () => {
  const writer = fakeAgent({ permissions: ["read", "compute", "write"] });
  const decision = evaluateSecurityGate({
    agent: writer,
    input: { token: "x" },
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.checks.canRun, false);
  assert.equal(decision.checks.canAccessInformation, true);
  assert.equal(decision.checks.canWrite, false);
  assert.equal(decision.checks.canCallExternalApis, false);
  assert.equal(decision.checks.canExposeSecrets, false);
  assert.equal(decision.checks.requiresConfirmation, true);
  assert.match(decision.reasons.join(" "), /write is not granted/);
});

test("write and external-action are denied without an explicit grant", async () => {
  const writer = fakeAgent({
    id: "writer",
    permissions: ["read", "compute", "write"],
  });
  const actor = fakeAgent({
    id: "actor",
    permissions: ["read", "compute", "external-action"],
  });
  const deniedWrite = await executePlan({
    requestId: "sec-1",
    steps: [
      {
        agentId: "writer",
        capability: "career-analysis",
        domain: "career",
        dependsOn: [],
      },
    ],
    provided: { token: "x" },
    index: indexRepoAgents([writer]),
    maxRetries: 0,
  });
  assert.equal(deniedWrite.responses[0]?.status, "failed");
  assert.match(deniedWrite.responses[0]?.summary ?? "", /Security gate denied/);
  assert.equal((writer as RepoAgent & { ran: () => number }).ran(), 0);

  const deniedExternal = await executePlan({
    requestId: "sec-2",
    steps: [
      {
        agentId: "actor",
        capability: "career-analysis",
        domain: "career",
        dependsOn: [],
      },
    ],
    provided: { token: "x" },
    index: indexRepoAgents([actor]),
    maxRetries: 0,
  });
  assert.equal(deniedExternal.responses[0]?.status, "failed");
  assert.match(deniedExternal.responses[0]?.summary ?? "", /external-action is not granted/);
  assert.equal((actor as RepoAgent & { ran: () => number }).ran(), 0);
});

test("write runs only after an explicit grant and confirmation", async () => {
  const writer = fakeAgent({
    id: "writer",
    permissions: ["read", "compute", "write"],
  });
  const allowed = await executePlan({
    requestId: "sec-3",
    steps: [
      {
        agentId: "writer",
        capability: "career-analysis",
        domain: "career",
        dependsOn: [],
      },
    ],
    provided: { token: "x" },
    index: indexRepoAgents([writer]),
    grantedPermissions: ["read", "compute", "write"],
    securityConfirmed: true,
    maxRetries: 0,
  });
  assert.equal(allowed.responses[0]?.status, "success");
  assert.equal((writer as RepoAgent & { ran: () => number }).ran(), 1);
});

test("runAna still executes read-compute specialists through the security gate", async () => {
  const manifest = parseAgentManifest({
    id: "pinaculo",
    name: "pinaculo",
    repository: "uset82/pinaculo",
    version: "1.0.0",
    description: "Fake Pináculo for security-gate tests.",
    domains: ["numerology"],
    capabilities: ["numerology-profile"],
    inputs: [
      { name: "fullName", type: "string", required: true },
      { name: "birthDate", type: "string", required: true },
    ],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "sensitive",
    execution: "local-function",
    timeoutMs: 1_000,
  });
  const pinaculo = defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: "2026-08-13T00:00:00Z",
    }),
    execute: async () => ({
      agentId: "pinaculo",
      status: "success",
      result: { fixture: true },
      summary: "Fixture Pináculo profile from the security gate.",
      runtimeMs: 1,
    }),
  });
  const result = await runAna(
    {
      requestId: "sec-4",
      message: "Run a numerology profile. My name is Ada Lovelace. 1815-12-10",
    },
    { agents: [pinaculo] },
  );
  assert.equal(result.status, "answered");
  assert.equal(result.responses[0]?.agentId, "pinaculo");
});
