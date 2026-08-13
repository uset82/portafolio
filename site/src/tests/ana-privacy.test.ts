import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import {
  contextFilter,
  executePlan,
  indexRepoAgents,
  maskSensitiveFields,
  runAna,
  toAnalyticsEvent,
} from "@/ana/core";
import { fieldsAllowedForAgent, REDACTED } from "@/ana/privacy";
import type { AnaPlanStep } from "@/ana/core";

const profile = {
  fullName: "Ada Lovelace",
  birthDate: "1815-12-10",
  birthTime: "10:00",
  birthPlace: "London",
  prompt: "soft piano",
  musicPreferences: "piano",
  fieldOfStudy: "mathematics",
  education: "self-taught",
  skills: "analysis",
  experience: "analytical engine notes",
  password: "not-a-real-secret",
};

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "numerology" | "music" | "education";
  capability: string;
  inputs: { name: string; type: "string"; required: boolean }[];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA privacy tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: options.inputs,
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "sensitive",
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
      result: { received: request.input },
      summary: `${manifest.id} received filtered input.`,
      runtimeMs: 1,
    }),
  });
};

const step = (agentId: string, capability: string): AnaPlanStep => ({
  agentId,
  capability,
  domain: agentId === "strudel" ? "music" : "astrology",
  dependsOn: [],
});

test("contextFilter keeps only the fields each specialist is allowed to see", () => {
  assert.deepEqual(contextFilter("astraea", profile, { consent: true }), {
    birthDate: "1815-12-10",
    birthTime: "10:00",
    birthPlace: "London",
  });
  assert.deepEqual(contextFilter("pinaculo", profile, { consent: true }), {
    fullName: "Ada Lovelace",
    birthDate: "1815-12-10",
  });
  assert.deepEqual(contextFilter("strudel", profile, { consent: true }), {
    prompt: "soft piano",
    musicPreferences: "piano",
  });
  assert.deepEqual(contextFilter("career-agent", profile, { consent: true }), {
    fieldOfStudy: "mathematics",
    education: "self-taught",
    skills: "analysis",
    experience: "analytical engine notes",
  });
  assert.deepEqual(contextFilter("unknown-agent", profile, { consent: true }), {});
  assert.equal(fieldsAllowedForAgent("pinaculo").includes("birthTime"), false);
});

test("personal profile fields require explicit consent before sharing", () => {
  assert.deepEqual(contextFilter("astraea", profile), {});
  assert.deepEqual(contextFilter("pinaculo", profile, { consent: false }), {});
  assert.deepEqual(contextFilter("strudel", { prompt: "soft piano", token: "x" }), {
    token: "x",
  });
});

test("executePlan does not send personal fields without share consent", async () => {
  const astraea = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [
      { name: "birthDate", type: "string", required: false },
      { name: "fullName", type: "string", required: false },
      { name: "token", type: "string", required: false },
    ],
  });
  const result = await executePlan({
    requestId: "priv-1",
    steps: [step("astraea", "natal-chart")],
    provided: { ...profile, token: "x" },
    index: indexRepoAgents([astraea]),
    maxRetries: 0,
  });
  assert.deepEqual(result.responses[0]?.result, { received: { token: "x" } });
  assert.doesNotMatch(JSON.stringify(result.traces), /1815-12-10|Ada Lovelace|London|password/);
});

test("runAna sends allowlisted fields to specialists and withholds the rest", async () => {
  const astraea = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    inputs: [
      { name: "birthDate", type: "string", required: true },
      { name: "birthTime", type: "string", required: true },
      { name: "fullName", type: "string", required: false },
      { name: "prompt", type: "string", required: false },
    ],
  });
  const pinaculo = fakeAgent({
    id: "pinaculo",
    domain: "numerology",
    capability: "numerology-profile",
    inputs: [
      { name: "fullName", type: "string", required: true },
      { name: "birthDate", type: "string", required: true },
      { name: "birthTime", type: "string", required: false },
      { name: "prompt", type: "string", required: false },
    ],
  });
  const result = await runAna(
    {
      requestId: "priv-2",
      message:
        "Analyze my personality. My name is Ada Lovelace. Birth date 1815-12-10 10:00 in London",
      input: { prompt: "soft piano" },
    },
    { agents: [astraea, pinaculo] },
  );
  assert.equal(result.status, "answered");
  const byId = Object.fromEntries(result.responses.map((response) => [response.agentId, response]));
  assert.deepEqual(byId.astraea?.result, {
    received: { birthDate: "1815-12-10", birthTime: "10:00" },
  });
  assert.deepEqual(byId.pinaculo?.result, {
    received: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
  });
});

test("sensitive values are masked for logs and omitted from analytics", () => {
  const masked = maskSensitiveFields({
    agentId: "astraea",
    birthDate: "1815-12-10",
    fullName: "Ada Lovelace",
    password: "not-a-real-secret",
    nested: { token: "x", ok: true },
  });
  assert.deepEqual(masked, {
    agentId: "astraea",
    birthDate: REDACTED,
    fullName: REDACTED,
    password: REDACTED,
    nested: { token: REDACTED, ok: true },
  });

  const analytics = toAnalyticsEvent({
    requestId: "priv-3",
    agentId: "astraea",
    event: "success",
    at: "2026-08-13T10:00:00Z",
    birthDate: "1815-12-10",
    fullName: "Ada Lovelace",
    input: profile,
  });
  assert.deepEqual(analytics, {
    requestId: "priv-3",
    agentId: "astraea",
    event: "success",
    at: "2026-08-13T10:00:00Z",
  });
  assert.doesNotMatch(JSON.stringify(analytics), /1815-12-10|Ada Lovelace|soft piano|password/);
});
