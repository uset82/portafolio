import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import { createAnaMemory, runAna } from "@/ana/core";
import {
  AGENT_CATEGORY_PERMISSIONS,
  assertMemoryPathIsolated,
  decryptJson,
  encryptJson,
  filterRecordForAgent,
  MEMORY_ISOLATION_ERROR,
} from "@/ana/memory";

const KEY = Buffer.from("11".repeat(32), "hex");
const NOW = "2026-08-13T10:00:00Z";

const pinaculo: RepoAgent = (() => {
  const manifest = parseAgentManifest({
    id: "pinaculo",
    name: "pinaculo",
    repository: "uset82/pinaculo",
    version: "1.0.0",
    description: "Fake Pináculo for ANA memory tests.",
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
  return defineRepoAgent({
    manifest: () => manifest,
    health: async () => ({
      agentId: manifest.id,
      status: "healthy",
      checkedAt: NOW,
    }),
    execute: async (request) => ({
      agentId: manifest.id,
      status: "success",
      result: { received: request.input },
      summary: "Fixture Pináculo profile from session memory.",
      confidence: 0.8,
      runtimeMs: 1,
    }),
  });
})();

test("session memory reuses provided fields in the same conversation", async () => {
  const memory = createAnaMemory({ key: KEY, now: () => NOW });
  const first = await runAna(
    {
      requestId: "mem-1",
      message: "Hold these details for this conversation.",
      input: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    },
    { agents: [pinaculo], memory, sessionId: "session-ada", userId: "user-ada" },
  );
  assert.notEqual(first.status, "answered");
  assert.equal(memory.getUserMemory("user-ada"), undefined);

  const second = await runAna(
    { requestId: "mem-2", message: "Run a numerology profile" },
    { agents: [pinaculo], memory, sessionId: "session-ada" },
  );
  assert.equal(second.status, "answered");
  assert.equal(second.plan.provided.fullName, "Ada Lovelace");
  assert.equal(second.plan.provided.birthDate, "1815-12-10");
  assert.equal(memory.getUserMemory("user-ada"), undefined);
  assert.equal(memory.getSession("session-ada")?.turns.length, 2);
});

test("user memory saves only with explicit consent and can be deleted", () => {
  const memory = createAnaMemory({ key: KEY, now: () => NOW });
  memory.rememberSessionTurn({
    sessionId: "session-ada",
    requestId: "mem-3",
    message: "My name is Ada Lovelace. Birth date 1815-12-10",
    provided: { fullName: "Ada Lovelace", birthDate: "1815-12-10" },
    status: "needs-input",
  });

  const refused = memory.saveUserMemory({
    userId: "user-ada",
    consent: false,
    categories: ["basic", "birthProfile"],
    sessionId: "session-ada",
  });
  assert.equal(refused.status, "rejected");
  if (refused.status !== "rejected") throw new Error("expected consent rejection");
  assert.equal(refused.reason, "consent-required");
  assert.equal(memory.getUserMemory("user-ada"), undefined);

  const saved = memory.saveUserMemory({
    userId: "user-ada",
    consent: true,
    categories: ["basic", "birthProfile"],
    sessionId: "session-ada",
  });
  assert.equal(saved.status, "saved");
  if (saved.status !== "saved") throw new Error("expected save");
  assert.deepEqual(saved.memory.profile.basic, { fullName: "Ada Lovelace" });
  assert.deepEqual(saved.memory.profile.birthProfile, { birthDate: "1815-12-10" });

  assert.equal(memory.deleteMemory({ scope: "session", sessionId: "session-ada" }), true);
  assert.equal(memory.getSession("session-ada"), undefined);
  assert.equal(memory.getUserMemory("user-ada")?.profile.birthProfile?.birthDate, "1815-12-10");

  assert.equal(
    memory.deleteMemory({ scope: "user", userId: "user-ada", category: "birthProfile" }),
    true,
  );
  assert.equal(memory.getUserMemory("user-ada")?.profile.birthProfile, undefined);
  assert.deepEqual(memory.getUserMemory("user-ada")?.profile.basic, { fullName: "Ada Lovelace" });
  assert.equal(memory.deleteMemory({ scope: "user", userId: "user-ada" }), true);
  assert.equal(memory.getUserMemory("user-ada"), undefined);
});

test("saved user memory is applied only when explicitly requested", async () => {
  const memory = createAnaMemory({ key: KEY, now: () => NOW });
  const saved = memory.saveUserMemory({
    userId: "user-ada",
    consent: true,
    categories: ["basic", "birthProfile"],
    profile: {
      basic: { fullName: "Ada Lovelace" },
      birthProfile: { birthDate: "1815-12-10" },
    },
  });
  assert.equal(saved.status, "saved");
  if (saved.status !== "saved") throw new Error("expected save");

  const withoutConsent = await runAna(
    { requestId: "mem-4", message: "Run a numerology profile" },
    { agents: [pinaculo], memory, sessionId: "fresh", userId: "user-ada" },
  );
  assert.equal(withoutConsent.status, "needs-input");
  assert.deepEqual(withoutConsent.plan.missingInputs, ["fullName", "birthDate"]);

  const withConsent = await runAna(
    { requestId: "mem-5", message: "Run a numerology profile" },
    {
      agents: [pinaculo],
      memory,
      sessionId: "fresh-2",
      userId: "user-ada",
      applyUserMemory: true,
    },
  );
  assert.equal(withConsent.status, "answered");
  assert.equal(withConsent.plan.provided.fullName, "Ada Lovelace");
});

test("per-agent category permissions deny fields the specialist does not require", () => {
  const record = {
    fullName: "Ada Lovelace",
    birthDate: "1815-12-10",
    prompt: "soft piano",
    fieldOfStudy: "mathematics",
  };
  assert.deepEqual(filterRecordForAgent("astraea", record), { birthDate: "1815-12-10" });
  assert.deepEqual(filterRecordForAgent("pinaculo", record), {
    fullName: "Ada Lovelace",
    birthDate: "1815-12-10",
  });
  assert.deepEqual(filterRecordForAgent("strudel", record), { prompt: "soft piano" });
  assert.deepEqual(filterRecordForAgent("unknown-agent", record), {});
  assert.deepEqual(AGENT_CATEGORY_PERMISSIONS.strudel, ["preferences"]);
});

test("sensitive user memory is encrypted at rest and omits raw values from public views", () => {
  const memory = createAnaMemory({ key: KEY, now: () => NOW });
  const saved = memory.saveUserMemory({
    userId: "user-ada",
    consent: true,
    categories: ["basic", "birthProfile"],
    profile: {
      basic: { fullName: "Ada Lovelace" },
      birthProfile: { birthDate: "1815-12-10", birthPlace: "London" },
    },
  });
  assert.equal(saved.status, "saved");

  const stored = memory.peekUserStorage("user-ada");
  assert.ok(stored);
  const serialized = JSON.stringify(stored);
  assert.doesNotMatch(serialized, /Ada Lovelace|1815-12-10|London/);
  assert.match(stored.categories.birthProfile?.data ?? "", /^[a-f0-9]+$/);

  const view = memory.publicSafeUserView("user-ada");
  assert.deepEqual(view?.savedCategories, ["basic", "birthProfile"]);
  assert.doesNotMatch(JSON.stringify(view), /Ada Lovelace|1815-12-10|London/);

  const roundTrip = decryptJson<Record<string, unknown>>(
    stored.categories.birthProfile!,
    KEY,
    "user-ada:birthProfile",
  );
  assert.equal(roundTrip.birthDate, "1815-12-10");
});

test("project memory stays separate from private profile and public ledgers", () => {
  const memory = createAnaMemory({ key: KEY, now: () => NOW });
  memory.putProjectMemory({
    repository: "uset82/pinaculo",
    knowledgeRef: "brain/github/pinaculo/README.snapshot.md",
    summary: "Public numerology calculator repository.",
  });
  assert.equal(memory.getProjectMemory("uset82/pinaculo")?.repository, "uset82/pinaculo");
  assert.throws(
    () =>
      memory.putProjectMemory({
        repository: "uset82/pinaculo",
        knowledgeRef: "birthDate=1815-12-10",
      }),
    /private profile/,
  );
  assert.throws(
    () =>
      memory.putProjectMemory({
        repository: "uset82/portafolio",
        knowledgeRef: "site/src/content/cc-ai-public-knowledge.json",
      }),
    /CC AI ledger/,
  );

  const ledgerPath = resolve(process.cwd(), "src/content/cc-ai-public-knowledge.json");
  const before = readFileSync(ledgerPath, "utf8");
  memory.saveUserMemory({
    userId: "user-ada",
    consent: true,
    categories: ["birthProfile"],
    profile: { birthProfile: { birthDate: "1815-12-10" } },
  });
  assert.equal(readFileSync(ledgerPath, "utf8"), before);
  assert.doesNotMatch(before, /1815-12-10|Ada Lovelace/);
});

test("brain-private persistence paths stay isolated from public brain and client bundles", () => {
  assert.doesNotThrow(() => assertMemoryPathIsolated("C:/work/brain-private/ana-memory"));
  assert.throws(
    () => assertMemoryPathIsolated("C:/Users/carlos/PROYECTOS/PORTAFOLIO/brain/repositories"),
    (error: Error) => error.message === MEMORY_ISOLATION_ERROR,
  );
  assert.throws(
    () =>
      assertMemoryPathIsolated(
        "C:/Users/carlos/PROYECTOS/PORTAFOLIO/site/src/content/cc-ai-public-knowledge.json",
      ),
    (error: Error) => error.message === MEMORY_ISOLATION_ERROR,
  );
  assert.throws(
    () => assertMemoryPathIsolated("C:/Users/carlos/PROYECTOS/PORTAFOLIO/site/.next/server"),
    (error: Error) => error.message === MEMORY_ISOLATION_ERROR,
  );
});

test("client modules do not import ANA memory", () => {
  const sourceRoot = resolve(process.cwd(), "src");
  const walk = (directory: string): string[] =>
    readdirSync(directory).flatMap((name) => {
      const path = join(directory, name);
      return statSync(path).isDirectory()
        ? walk(path)
        : extname(path) === ".ts" || extname(path) === ".tsx"
          ? [path]
          : [];
    });
  const leaks = walk(sourceRoot).filter((file) => {
    const contents = readFileSync(file, "utf8");
    return /^\s*["']use client["'];/m.test(contents) && /@\/ana\/memory|ana\/memory/.test(contents);
  });
  assert.deepEqual(
    leaks.map((file) => relative(process.cwd(), file)),
    [],
  );
});

test("encryption round-trip binds ciphertext to user and category", () => {
  const blob = encryptJson({ birthDate: "1815-12-10" }, KEY, "user-ada:birthProfile");
  assert.doesNotMatch(JSON.stringify(blob), /1815-12-10/);
  assert.equal(
    decryptJson<{ birthDate: string }>(blob, KEY, "user-ada:birthProfile").birthDate,
    "1815-12-10",
  );
  assert.throws(() => decryptJson(blob, KEY, "user-ada:basic"));
});
