import assert from "node:assert/strict";
import test from "node:test";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import { executePlan, indexRepoAgents, runAna, type AnaPlanStep } from "@/ana/core";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fakeAgent = (options: {
  id: string;
  capability: string;
  timeoutMs?: number;
  inputs?: { name: string; type: "string" | "number"; required: boolean }[];
  execute: RepoAgent["execute"];
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA execution tests.",
    domains: ["astrology"],
    capabilities: [options.capability],
    inputs: (options.inputs ?? [{ name: "token", type: "string", required: true }]).map(
      (input) => ({
        name: input.name,
        type: input.type,
        required: input.required,
      }),
    ),
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: options.timeoutMs ?? 1_000,
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

const step = (agentId: string, capability: string): AnaPlanStep => ({
  agentId,
  capability,
  domain: "astrology",
  dependsOn: [],
});

const dependentStep = (agentId: string, capability: string, dependsOn: string[]): AnaPlanStep => ({
  agentId,
  capability,
  domain: "astrology",
  dependsOn,
});

test(
  "independent agents overlap instead of running strictly in sequence",
  { timeout: 3_000 },
  async () => {
    let started = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const make = (id: string) =>
      fakeAgent({
        id,
        capability: "natal-chart",
        execute: async () => {
          started += 1;
          if (started === 3) release();
          await gate;
          return {
            agentId: id,
            status: "success",
            result: { fixture: true },
            summary: `${id} ok`,
            runtimeMs: 1,
          };
        },
      });
    const agents = [make("one"), make("two"), make("three")];
    const result = await executePlan({
      requestId: "exec-1",
      steps: [step("one", "natal-chart"), step("two", "natal-chart"), step("three", "natal-chart")],
      provided: { token: "x" },
      index: indexRepoAgents(agents),
      maxRetries: 0,
    });
    assert.equal(result.responses.length, 3);
    assert.equal(
      result.responses.every((response) => response.status === "success"),
      true,
    );
    assert.deepEqual(
      result.responses.map((response) => response.agentId),
      ["one", "two", "three"],
    );
  },
);

test("one specialist timeout does not block the others", async () => {
  const slow = fakeAgent({
    id: "slow",
    capability: "natal-chart",
    timeoutMs: 40,
    execute: async () => {
      await delay(400);
      return {
        agentId: "slow",
        status: "success",
        result: { fixture: true },
        summary: "too late",
        runtimeMs: 400,
      };
    },
  });
  const fast = fakeAgent({
    id: "fast",
    capability: "natal-chart",
    execute: async () => ({
      agentId: "fast",
      status: "success",
      result: { fixture: true },
      summary: "fast ok",
      runtimeMs: 1,
    }),
  });
  const result = await executePlan({
    requestId: "exec-2",
    steps: [step("slow", "natal-chart"), step("fast", "natal-chart")],
    provided: { token: "x" },
    index: indexRepoAgents([slow, fast]),
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "failed");
  assert.match(result.responses[0]?.summary ?? "", /Timed out/);
  assert.equal(result.responses[1]?.status, "success");
  assert.equal(
    result.traces.some((event) => event.event === "timeout" && event.agentId === "slow"),
    true,
  );
});

test("timeouts retry once and then fail", async () => {
  let attempts = 0;
  const flaky = fakeAgent({
    id: "flaky",
    capability: "natal-chart",
    timeoutMs: 40,
    execute: async () => {
      attempts += 1;
      await delay(400);
      return {
        agentId: "flaky",
        status: "success",
        result: { fixture: true },
        summary: "late",
        runtimeMs: 400,
      };
    },
  });
  const result = await executePlan({
    requestId: "exec-3",
    steps: [step("flaky", "natal-chart")],
    provided: { token: "x" },
    index: indexRepoAgents([flaky]),
    maxRetries: 1,
  });
  assert.equal(attempts, 2);
  assert.equal(result.responses[0]?.status, "failed");
  assert.equal(
    result.traces.some((event) => event.event === "retry"),
    true,
  );
});

test("a thrown specialist becomes a failed response instead of breaking ANA", async () => {
  const boom = fakeAgent({
    id: "boom",
    capability: "natal-chart",
    execute: async () => {
      throw new Error("engine down");
    },
  });
  const ok = fakeAgent({
    id: "ok",
    capability: "natal-chart",
    execute: async () => ({
      agentId: "ok",
      status: "success",
      result: { fixture: true },
      summary: "ok",
      runtimeMs: 1,
    }),
  });
  const result = await executePlan({
    requestId: "exec-4",
    steps: [step("boom", "natal-chart"), step("ok", "natal-chart")],
    provided: { token: "x" },
    index: indexRepoAgents([boom, ok]),
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "failed");
  assert.match(result.responses[0]?.summary ?? "", /engine down/);
  assert.equal(result.responses[1]?.status, "success");
});

test("concurrency limit caps overlapping specialists", async () => {
  let running = 0;
  let maxRunning = 0;
  const make = (id: string) =>
    fakeAgent({
      id,
      capability: "natal-chart",
      execute: async () => {
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await delay(40);
        running -= 1;
        return {
          agentId: id,
          status: "success",
          result: { fixture: true },
          summary: `${id} ok`,
          runtimeMs: 40,
        };
      },
    });
  const agents = [make("a"), make("b"), make("c"), make("d")];
  await executePlan({
    requestId: "exec-5",
    steps: agents.map((agent) => step(agent.manifest().id, "natal-chart")),
    provided: { token: "x" },
    index: indexRepoAgents(agents),
    concurrencyLimit: 2,
    maxRetries: 0,
  });
  assert.equal(maxRunning, 2);
});

test("cost limit skips later specialists after the budget is spent", async () => {
  const make = (id: string) =>
    fakeAgent({
      id,
      capability: "natal-chart",
      execute: async () => ({
        agentId: id,
        status: "success",
        result: { fixture: true },
        summary: `${id} ok`,
        runtimeMs: 1,
      }),
    });
  const agents = [make("first"), make("second"), make("third")];
  const result = await executePlan({
    requestId: "exec-6",
    steps: [
      step("first", "natal-chart"),
      step("second", "natal-chart"),
      step("third", "natal-chart"),
    ],
    provided: { token: "x" },
    index: indexRepoAgents(agents),
    costLimit: 1,
    concurrencyLimit: 1,
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "success");
  assert.equal(result.responses[1]?.status, "failed");
  assert.match(result.responses[1]?.summary ?? "", /Cost limit/);
  assert.equal(
    result.traces.some((event) => event.event === "skipped-cost"),
    true,
  );
});

test("cancellation stops remaining work", async () => {
  const controller = new AbortController();
  controller.abort();
  const agent = fakeAgent({
    id: "late",
    capability: "natal-chart",
    execute: async () => ({
      agentId: "late",
      status: "success",
      result: { fixture: true },
      summary: "should not run",
      runtimeMs: 1,
    }),
  });
  const result = await executePlan({
    requestId: "exec-7",
    steps: [step("late", "natal-chart")],
    provided: { token: "x" },
    index: indexRepoAgents([agent]),
    signal: controller.signal,
    maxRetries: 0,
  });
  assert.equal(result.responses[0]?.status, "failed");
  assert.match(result.responses[0]?.summary ?? "", /Cancelled/);
  assert.equal(
    result.traces.some((event) => event.event === "cancelled"),
    true,
  );
});

test("traces omit sensitive inputs", async () => {
  const agent = fakeAgent({
    id: "astraea",
    capability: "natal-chart",
    execute: async () => ({
      agentId: "astraea",
      status: "success",
      result: { fixture: true },
      summary: "ok",
      runtimeMs: 1,
    }),
  });
  const result = await executePlan({
    requestId: "exec-8",
    steps: [step("astraea", "natal-chart")],
    provided: {
      token: "x",
      birthDate: "1995-05-12",
      fullName: "Anna",
      birthPlace: "Oslo",
    },
    index: indexRepoAgents([agent]),
    maxRetries: 0,
  });
  const serialized = JSON.stringify(result.traces);
  assert.doesNotMatch(serialized, /1995-05-12|Anna|Oslo|birthDate|fullName/);
  assert.equal(
    result.traces.some((event) => event.event === "success"),
    true,
  );
});

test("dependent steps fall back to sequential execution", async () => {
  const order: string[] = [];
  const make = (id: string) =>
    fakeAgent({
      id,
      capability: "natal-chart",
      execute: async () => {
        order.push(id);
        return {
          agentId: id,
          status: "success",
          result: { fixture: true },
          summary: `${id} ok`,
          runtimeMs: 1,
        };
      },
    });
  const result = await executePlan({
    requestId: "exec-9",
    steps: [
      step("first", "natal-chart"),
      dependentStep("second", "natal-chart", ["first:natal-chart"]),
    ],
    provided: { token: "x" },
    index: indexRepoAgents([make("first"), make("second")]),
    maxRetries: 0,
  });
  assert.deepEqual(order, ["first", "second"]);
  assert.equal(result.responses[1]?.status, "success");
});

test("runAna still answers when one injected specialist fails", async () => {
  const boom = fakeAgent({
    id: "astraea",
    capability: "natal-chart",
    inputs: [
      { name: "birthDate", type: "string", required: true },
      { name: "birthTime", type: "string", required: true },
    ],
    execute: async () => {
      throw new Error("chart engine missing");
    },
  });
  const result = await runAna(
    {
      requestId: "exec-10",
      message: "Please calculate a natal chart. Birth date 1815-12-10 10:00",
      input: { birthDate: "1815-12-10", birthTime: "10:00" },
    },
    { agents: [boom], maxRetries: 0 },
  );
  assert.equal(result.status, "failed");
  assert.equal(result.responses[0]?.status, "failed");
  assert.equal(result.traces.length > 0, true);
  const serialized = JSON.stringify(result.traces);
  assert.doesNotMatch(serialized, /1815-12-10|10:00|birthDate/);
});
