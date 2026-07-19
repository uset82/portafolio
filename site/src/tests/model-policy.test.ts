import assert from "node:assert/strict";
import test from "node:test";

import type { CcAiProviderInput } from "@/lib/ai/cc-ai-service";
import {
  CcAiModelPolicyError,
  createCcAiModelPolicy,
  type CcAiModelEnvironment,
} from "@/lib/ai/model-policy";
import { buildOpenRouterChatRequest } from "@/lib/ai/openrouter-chat-request";

const environment = (overrides: Partial<CcAiModelEnvironment> = {}): CcAiModelEnvironment => ({
  CC_AI_MODE: undefined,
  OPENROUTER_MODEL: undefined,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
  ...overrides,
});

test("model policy defaults to the variable free prototype router", () => {
  const policy = createCcAiModelPolicy(environment());

  assert.deepEqual(policy, {
    mode: "prototype",
    primaryModel: "openrouter/free",
    fallbackModels: [],
    requestedModels: ["openrouter/free"],
    routingKind: "free-router",
    variableSelection: true,
    provider: {
      allowFallbacks: true,
      dataCollection: "deny",
      zdr: true,
    },
  });
});

test("prototype model can be overridden with a named free variant", () => {
  const policy = createCcAiModelPolicy(
    environment({ OPENROUTER_MODEL: "google/gemma-3-27b-it:free" }),
  );

  assert.equal(policy.primaryModel, "google/gemma-3-27b-it:free");
  assert.equal(policy.routingKind, "specific-free-model");
  assert.equal(policy.variableSelection, false);
});

test("ordered model fallbacks and strict provider constraints reach the OpenRouter request", () => {
  const policy = createCcAiModelPolicy(
    environment({
      OPENROUTER_MODEL: "vendor/primary",
      OPENROUTER_FALLBACK_MODELS: "vendor/backup-one, vendor/backup-two, vendor/backup-one",
    }),
  );
  const input: Omit<CcAiProviderInput, "signal"> = {
    messages: [{ role: "user", content: "Question" }],
    modelPolicy: policy,
    maxOutputTokens: 120,
  };

  assert.deepEqual(buildOpenRouterChatRequest(input), {
    messages: input.messages,
    models: ["vendor/primary", "vendor/backup-one", "vendor/backup-two"],
    provider: {
      allowFallbacks: true,
      dataCollection: "deny",
      zdr: true,
    },
    maxCompletionTokens: 120,
    stream: false,
  });
});

test("a policy without fallbacks emits one model instead of a models sequence", () => {
  const policy = createCcAiModelPolicy(environment({ OPENROUTER_MODEL: "vendor/primary" }));
  const request = buildOpenRouterChatRequest({
    messages: [{ role: "user", content: "Question" }],
    modelPolicy: policy,
    maxOutputTokens: 120,
  });

  assert.equal("model" in request ? request.model : undefined, "vendor/primary");
  assert.equal("models" in request, false);
});

test("production mode uses only its configured paid model sequence", () => {
  const policy = createCcAiModelPolicy(
    environment({
      CC_AI_MODE: "production",
      OPENROUTER_MODEL: "prototype/ignored:free",
      OPENROUTER_PRODUCTION_MODEL: "anthropic/claude-sonnet-4",
      OPENROUTER_PRODUCTION_FALLBACK_MODELS: "openai/gpt-5-mini,google/gemini-2.5-flash",
    }),
  );

  assert.equal(policy.mode, "production");
  assert.equal(policy.routingKind, "named-model");
  assert.deepEqual(policy.requestedModels, [
    "anthropic/claude-sonnet-4",
    "openai/gpt-5-mini",
    "google/gemini-2.5-flash",
  ]);
});

test("production mode fails closed without a paid named model", () => {
  assert.throws(
    () => createCcAiModelPolicy(environment({ CC_AI_MODE: "production" })),
    CcAiModelPolicyError,
  );
  assert.throws(
    () =>
      createCcAiModelPolicy(
        environment({
          CC_AI_MODE: "production",
          OPENROUTER_PRODUCTION_MODEL: "openrouter/free",
        }),
      ),
    /paid named models/,
  );
});

test("model policy rejects malformed IDs and excessive fallback sequences", () => {
  assert.throws(
    () => createCcAiModelPolicy(environment({ OPENROUTER_MODEL: "bad model" })),
    /invalid model ID/,
  );
  assert.throws(
    () => createCcAiModelPolicy(environment({ OPENROUTER_FALLBACK_MODELS: "a/1,b/2,c/3,d/4,e/5" })),
    /at most 4 unique models/,
  );
});
