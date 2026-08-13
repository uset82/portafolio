import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { executePlan, indexRepoAgents, runAna } from "@/ana/core";
import { createAnaPostHandler } from "@/ana/ui";
import { defineRepoAgent, parseAgentManifest, type RepoAgent } from "@/ana/protocol";
import { requestAnaStream } from "@/lib/ai/ana-client";
import {
  anaStatusAnnouncement,
  encodeSseEvent,
  isAnaStatusEvent,
  isAnaStreamCompleteEvent,
  parseSseDataFrames,
  type AnaStatusEvent,
} from "@/lib/ai/ana-status";

const readSource = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

const fakeAgent = (options: {
  id: string;
  domain: "astrology" | "numerology" | "music";
  capability: string;
  summary: string;
}): RepoAgent => {
  const manifest = parseAgentManifest({
    id: options.id,
    name: options.id,
    repository: `uset82/${options.id}`,
    version: "1.0.0",
    description: "Fake specialist for ANA streaming tests.",
    domains: [options.domain],
    capabilities: [options.capability],
    inputs: [{ name: "token", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
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
    execute: async () => ({
      agentId: manifest.id,
      status: "success",
      result: { fixture: true },
      summary: options.summary,
      runtimeMs: 8,
    }),
  });
};

const jsonStreamRequest = (body: unknown) =>
  new Request("http://localhost/api/ana", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
    },
    body: JSON.stringify(body),
  });

test("status announcements describe phases and do not include answer tokens", () => {
  assert.equal(
    anaStatusAnnouncement({ agentId: "ana", phase: "understanding" }),
    "ANA is understanding your question.",
  );
  assert.equal(
    anaStatusAnnouncement({ agentId: "astraea", phase: "running", capability: "natal-chart" }),
    "ASTRAEA is calculating a natal chart.",
  );
  assert.equal(
    anaStatusAnnouncement({ agentId: "ana", phase: "combining" }),
    "ANA is combining the results.",
  );
  assert.doesNotMatch(
    anaStatusAnnouncement({ agentId: "ana", phase: "combining" }),
    /natal chart JSON|Sun in|token/,
  );
});

test("runAna streams plan/execution status before the synthesized answer", async () => {
  const events: AnaStatusEvent[] = [];
  const strudel = fakeAgent({
    id: "strudel",
    domain: "music",
    capability: "pattern-generate",
    summary: "Fixture live-coding pattern.",
  });
  const result = await runAna(
    { requestId: "stream-1", message: "Generate a live-coding music pattern." },
    {
      agents: [strudel],
      createTraceId: () => "trace-stream-1",
      onStatus: (event) => events.push(event),
    },
  );

  assert.deepEqual(
    events.map((event) => event.phase),
    ["understanding", "planning", "running", "combining"],
  );
  assert.equal(events[2]?.agentId, "strudel");
  assert.match(events[2]?.announcement ?? "", /STRUDEL is generating a music pattern/);
  assert.equal(
    events.some((event) => event.announcement.includes(result.answer.slice(0, 24))),
    false,
  );
  const serialized = JSON.stringify(events);
  assert.doesNotMatch(serialized, /provided|birthDate|fixture/);
  assert.equal("answer" in events[0]!, false);
});

test("executePlan reports traces through onTrace without input values", async () => {
  const traces: string[] = [];
  const agent = fakeAgent({
    id: "astraea",
    domain: "astrology",
    capability: "natal-chart",
    summary: "Fixture natal chart.",
  });
  await executePlan({
    requestId: "trace-inputs",
    steps: [
      {
        agentId: "astraea",
        capability: "natal-chart",
        domain: "astrology",
        dependsOn: [],
      },
    ],
    provided: { birthDate: "1995-05-12", birthPlace: "Oslo", fullName: "Anna" },
    index: indexRepoAgents([agent]),
    onTrace: (event) => traces.push(`${event.agentId}:${event.event}`),
  });
  assert.deepEqual(traces, ["astraea:start", "astraea:success"]);
});

test("POST /api/ana uses SSE when requested and keeps JSON as the default", async () => {
  const strudel = fakeAgent({
    id: "strudel",
    domain: "music",
    capability: "pattern-generate",
    summary: "Fixture live-coding pattern.",
  });
  const handler = createAnaPostHandler({
    enabled: true,
    runtime: { agents: [strudel], createTraceId: () => "trace-sse-1" },
    createRequestId: () => "sse-1",
  });

  const json = await handler(
    new Request("http://localhost/api/ana", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        requestId: "sse-1",
        message: "Generate a live-coding music pattern.",
        input: { fullName: "Anna", birthDate: "1995-05-12", birthPlace: "Oslo" },
      }),
    }),
  );
  assert.equal(json.headers.get("content-type")?.includes("application/json"), true);
  const jsonBody = (await json.json()) as { ok: boolean; answer: string };
  assert.equal(jsonBody.ok, true);

  const streamed = await handler(
    jsonStreamRequest({
      requestId: "sse-1",
      message: "Generate a live-coding music pattern.",
      input: { fullName: "Anna", birthDate: "1995-05-12", birthPlace: "Oslo" },
    }),
  );
  assert.equal(streamed.status, 200);
  assert.match(streamed.headers.get("content-type") ?? "", /text\/event-stream/);
  const text = await streamed.text();
  const frames = parseSseDataFrames(text);
  const phases = frames.filter(isAnaStatusEvent).map((event) => event.phase);
  assert.deepEqual(phases, ["understanding", "planning", "running", "combining"]);
  const complete = frames.find(isAnaStreamCompleteEvent);
  assert.equal(complete?.ok, true);
  assert.equal(complete?.requestId, "sse-1");
  assert.equal(typeof complete?.answer, "string");
  const serialized = JSON.stringify(frames);
  assert.doesNotMatch(serialized, /Anna|Oslo|birthDate|"provided"/);
  assert.equal(
    frames.filter(isAnaStatusEvent).some((event) => event.announcement === complete?.answer),
    false,
  );
});

test("the ANA stream client reads status events and the final answer", async () => {
  const events: AnaStatusEvent[] = [];
  const payload = [
    encodeSseEvent({
      type: "status",
      requestId: "client-1",
      traceId: "trace-client-1",
      agentId: "ana",
      label: "ANA",
      phase: "understanding",
      announcement: "ANA is understanding your question.",
      active: [],
    }),
    encodeSseEvent({
      type: "complete",
      ok: true,
      requestId: "client-1",
      traceId: "trace-client-1",
      answer: "A synthesized specialist answer.",
      status: "answered",
      active: ["strudel"],
    }),
  ].join("");

  const response = await requestAnaStream(
    { message: "Generate a live-coding music pattern.", requestId: "client-1" },
    new AbortController().signal,
    (event) => events.push(event),
    async () =>
      new Response(payload, {
        status: 200,
        headers: { "content-type": "text/event-stream; charset=utf-8" },
      }),
  );

  assert.equal(response.ok, true);
  if (response.ok) {
    assert.equal(response.answer, "A synthesized specialist answer.");
  }
  assert.deepEqual(
    events.map((event) => event.announcement),
    ["ANA is understanding your question."],
  );
  assert.equal(
    events.some((event) => event.announcement === "A synthesized specialist answer."),
    false,
  );
});

test("streaming uses the existing POST route handler, not a new realtime stack", () => {
  const http = readSource("src/ana/ui/http.ts");
  const panel = readSource("src/components/cc-ai-panel.tsx");
  const pkg = readSource("package.json");
  const live = readSource("src/lib/ai/cc-ai-ui-state.ts");

  assert.match(http, /text\/event-stream/);
  assert.match(http, /encodeSseEvent/);
  assert.doesNotMatch(http, /WebSocket|socket\.io/);
  assert.match(panel, /requestAnaStream/);
  assert.match(panel, /setAnaAnnouncement\(event\.announcement\)/);
  assert.match(panel, /Answer received\. Presenting it now\./);
  assert.match(panel, /aria-live="off"/);
  assert.match(panel, /aria-live="polite"/);
  assert.match(live, /status: "presenting"/);
  assert.doesNotMatch(pkg, /"socket\.io"|"ws"|"eventsource"/);
});
