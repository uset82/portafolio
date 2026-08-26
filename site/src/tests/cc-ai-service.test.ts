import assert from "node:assert/strict";
import test from "node:test";

import { createCcAiPostHandler } from "@/lib/ai/cc-ai-handler";
import type { CcAiErrorResponse, CcAiSuccessResponse } from "@/lib/ai/cc-ai-contract";
import { CcAiProviderError, type CcAiProvider, runCcAiCompletion } from "@/lib/ai/cc-ai-service";
import { createCcAiModelPolicy } from "@/lib/ai/model-policy";

const requestId = "00000000-0000-4000-8000-000000000001";
const prototypePolicy = createCcAiModelPolicy({
  CC_AI_MODE: undefined,
  OPENROUTER_MODEL: undefined,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
  CC_AI_REASONING_EFFORT: undefined,
});
const jsonRequest = (body: unknown) =>
  new Request("http://localhost/api/cc-ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const successfulProvider: CcAiProvider = {
  async complete() {
    return { text: "Verified answer", model: "example/responding-model" };
  },
};

test("CACM AI handler stays unavailable while the public service is disabled", async () => {
  const handler = createCcAiPostHandler({
    enabled: false,
    serviceOptions: { provider: successfulProvider, modelPolicy: prototypePolicy },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "What is the Observatory?" }));
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "disabled");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("CACM AI handler rejects invalid input before calling the provider", async () => {
  let providerCalled = false;
  const handler = createCcAiPostHandler({
    enabled: true,
    serviceOptions: {
      modelPolicy: prototypePolicy,
      provider: {
        async complete() {
          providerCalled = true;
          return { text: "Unexpected", model: "unexpected" };
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "" }));
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 400);
  assert.equal(body.error.code, "invalid_request");
  assert.equal(providerCalled, false);
});

test("CACM AI service returns bounded text and actual model metadata", async () => {
  const response = await runCcAiCompletion(
    { message: "Question", history: [], locale: "en" },
    {
      provider: {
        async complete(input) {
          assert.equal(input.maxOutputTokens, 12);
          assert.equal(input.modelPolicy.provider.dataCollection, "deny");
          assert.equal(input.messages[0]?.role, "system");
          assert.match(input.messages[0]?.content ?? "", /approved public portfolio information/);
          assert.deepEqual(input.messages.at(-1), { role: "user", content: "Question" });
          return { text: "123456789", model: "example/responding-model" };
        },
      },
      modelPolicy: prototypePolicy,
      requestId,
      maxOutputTokens: 12,
      maxOutputCharacters: 6,
    },
  );

  assert.deepEqual(response.model, {
    requested: "openrouter/free",
    fallbacks: [],
    responded: "example/responding-model",
    selection: "free-router",
    variable: true,
  });
  assert.equal(response.answer, "123456");
  assert.equal(response.truncated, true);
  assert.deepEqual(response.knowledge, { records: 0, sourceIds: [], truncated: false });
});

test("CACM AI handler normalizes provider rate limits without raw errors", async () => {
  let providerCalls = 0;
  const handler = createCcAiPostHandler({
    enabled: true,
    serviceOptions: {
      modelPolicy: prototypePolicy,
      provider: {
        async complete() {
          providerCalls += 1;
          throw new CcAiProviderError("rate_limited", true);
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "Question" }));
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 429);
  assert.deepEqual(body.error, {
    code: "rate_limited",
    message: "CACM AI has reached its current request limit. Please try again later.",
    retryable: true,
  });
  assert.doesNotMatch(JSON.stringify(body), /stack|authorization|raw/i);
  assert.equal(providerCalls, 1);
});

test("CACM AI handler returns success through a fully mocked provider", async () => {
  const handler = createCcAiPostHandler({
    enabled: true,
    serviceOptions: { provider: successfulProvider, modelPolicy: prototypePolicy },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "Question" }));
  const body = (await response.json()) as CcAiSuccessResponse;

  assert.equal(response.status, 200);
  assert.equal(body.answer, "Verified answer");
  assert.equal(body.model.responded, "example/responding-model");
});

test("CACM AI handler normalizes exhausted payment allowance", async () => {
  const handler = createCcAiPostHandler({
    enabled: true,
    serviceOptions: {
      modelPolicy: prototypePolicy,
      provider: {
        async complete() {
          throw new CcAiProviderError("payment_required", false);
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "Question" }));
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 503);
  assert.deepEqual(body.error, {
    code: "payment_required",
    message: "CACM AI has reached its current usage allowance.",
    retryable: false,
  });
});

test("CACM AI handler normalizes provider failure as retryable unavailability", async () => {
  const handler = createCcAiPostHandler({
    enabled: true,
    serviceOptions: {
      modelPolicy: prototypePolicy,
      provider: {
        async complete() {
          throw new CcAiProviderError("provider_unavailable", true);
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(jsonRequest({ message: "Question" }));
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 503);
  assert.equal(body.error.code, "provider_unavailable");
  assert.equal(body.error.retryable, true);
});

test("CACM AI service aborts the provider and returns a normalized timeout", async () => {
  await assert.rejects(
    () =>
      runCcAiCompletion(
        { message: "Question", history: [], locale: "en" },
        {
          provider: {
            complete(input) {
              return new Promise((_, reject) => {
                input.signal.addEventListener("abort", () => reject(input.signal.reason), {
                  once: true,
                });
              });
            },
          },
          modelPolicy: prototypePolicy,
          requestId,
          timeoutMs: 5,
        },
      ),
    (error: unknown) =>
      error instanceof Error &&
      error.message === "CACM AI took too long to respond. Please try again.",
  );
});

test("CACM AI service honors an already-aborted browser request", async () => {
  const controller = new AbortController();
  controller.abort();
  let providerCalled = false;

  await assert.rejects(
    () =>
      runCcAiCompletion(
        { message: "Question", history: [], locale: "en" },
        {
          provider: {
            async complete() {
              providerCalled = true;
              return { text: "Unexpected", model: "unexpected" };
            },
          },
          modelPolicy: prototypePolicy,
          requestId,
          requestSignal: controller.signal,
        },
      ),
    (error: unknown) => error instanceof Error && error.message === "The request was stopped.",
  );
  assert.equal(providerCalled, false);
});

test("CACM AI qualifies a broad portfolio question instead of dumping repositories", async () => {
  let providerCalled = false;
  const handler = createCcAiPostHandler({
    enabled: true,
    portfolioAudits: [
      {
        repository: "uset82/StrudelAI",
        hasBackend: false,
        hasAPI: false,
        hasDatabase: false,
        hasLLM: true,
        domain: ["music"],
        capabilities: [],
        status: "prototype",
        agentPotential: "medium",
        recommendedType: "agent",
        visibility: "public",
        enabled: false,
        contentsInspected: true,
        sizeKb: 12,
        manifestFiles: [],
        description: "Live coding music system",
      },
    ],
    serviceOptions: {
      modelPolicy: prototypePolicy,
      provider: {
        async complete() {
          providerCalled = true;
          return { text: "Unexpected", model: "unexpected" };
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(
    jsonRequest({ message: "Which projects best show Carlos's AI work?" }),
  );
  const body = (await response.json()) as CcAiSuccessResponse;

  assert.equal(response.status, 200);
  assert.equal(providerCalled, false);
  assert.match(body.answer, /Which of those do you actually want to see\?/);
  assert.doesNotMatch(body.answer, /MATCHES|SOURCES|uset82\/|ANA searched/i);
  assert.equal(body.model.responded, "ana-knowledge");
  assert.equal(body.knowledge.records, 0);
});
