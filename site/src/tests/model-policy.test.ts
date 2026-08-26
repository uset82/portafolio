import assert from "node:assert/strict";
import test from "node:test";

import type { CcAiProviderInput } from "@/lib/ai/cc-ai-service";
import {
  CcAiModelPolicyError,
  createCcAiModelPolicy,
  type CcAiModelEnvironment,
} from "@/lib/ai/model-policy";
import { buildOpenRouterChatRequest, resolveCcAiTimeoutMs } from "@/lib/ai/openrouter-chat-request";

const environment = (overrides: Partial<CcAiModelEnvironment> = {}): CcAiModelEnvironment => ({
  CC_AI_MODE: undefined,
  OPENROUTER_MODEL: undefined,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
  CC_AI_REASONING_EFFORT: undefined,
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
    reasoningEffort: "low",
    provider: {
      allowFallbacks: true,
      dataCollection: "deny",
      zdr: false,
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

test("prototype policy accepts a paid named model with the free-router fallback", () => {
  const policy = createCcAiModelPolicy(
    environment({
      OPENROUTER_MODEL: "z-ai/glm-5.3-flash",
      OPENROUTER_FALLBACK_MODELS: "openrouter/free",
    }),
  );

  assert.equal(policy.primaryModel, "z-ai/glm-5.3-flash");
  assert.deepEqual(policy.fallbackModels, ["openrouter/free"]);
  assert.deepEqual(policy.requestedModels, ["z-ai/glm-5.3-flash", "openrouter/free"]);
  assert.equal(policy.routingKind, "named-model");
  assert.equal(policy.variableSelection, false);
  assert.equal(policy.provider.dataCollection, "deny");
  assert.equal(policy.provider.zdr, false);
});

test("reasoning effort defaults to low and rejects unsupported levels", () => {
  // Reasoning tokens are drawn from the completion budget, so the old hardcoded
  // "max" spent all 4000 tokens thinking and returned empty content.
  assert.equal(createCcAiModelPolicy(environment()).reasoningEffort, "low");
  assert.equal(
    createCcAiModelPolicy(environment({ CC_AI_REASONING_EFFORT: " HIGH " })).reasoningEffort,
    "high",
  );
  assert.throws(
    () => createCcAiModelPolicy(environment({ CC_AI_REASONING_EFFORT: "maximum" })),
    /CC_AI_REASONING_EFFORT must be one of/,
  );
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
      zdr: false,
    },
    reasoning: { effort: "low" },
    maxCompletionTokens: 120,
    stream: false,
  });
});

test("configured reasoning effort reaches the OpenRouter request", () => {
  const policy = createCcAiModelPolicy(
    environment({ OPENROUTER_MODEL: "vendor/primary", CC_AI_REASONING_EFFORT: "medium" }),
  );
  const request = buildOpenRouterChatRequest({
    messages: [{ role: "user", content: "Question" }],
    modelPolicy: policy,
    maxOutputTokens: 120,
  });

  assert.deepEqual(request.reasoning, { effort: "medium" });
});

test("prototype timeout defaults to 180s and stays capped", () => {
  assert.equal(resolveCcAiTimeoutMs("prototype", undefined), 180_000);
  assert.equal(resolveCcAiTimeoutMs("production", undefined), 12_000);
  assert.equal(resolveCcAiTimeoutMs("prototype", "45000"), 45_000);
  assert.equal(resolveCcAiTimeoutMs("prototype", "90000"), 90_000);
  assert.equal(resolveCcAiTimeoutMs("prototype", "300000"), 180_000);
});

test("a policy without fallbacks emits one model instead of a models sequence", () => {
  // The free router is the one primary that genuinely stands alone: it is
  // already the last resort, so nothing is appended behind it.
  const policy = createCcAiModelPolicy(environment({ OPENROUTER_MODEL: "openrouter/free" }));
  const request = buildOpenRouterChatRequest({
    messages: [{ role: "user", content: "Question" }],
    modelPolicy: policy,
    maxOutputTokens: 120,
  });

  assert.equal("model" in request ? request.model : undefined, "openrouter/free");
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
  assert.deepEqual(policy.provider, {
    allowFallbacks: true,
    dataCollection: "deny",
    zdr: true,
  });
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

test("provider policy always denies training and scopes zero-retention to production", () => {
  // Requiring zero data retention of the free prototype router matches zero
  // endpoints much of the time ("No endpoints found matching your data
  // policy"), which made every CACM AI request fail. Paid production routing
  // keeps the stricter requirement.
  const prototype = createCcAiModelPolicy(environment({ CC_AI_MODE: "prototype" }));
  assert.equal(prototype.provider.dataCollection, "deny");
  assert.equal(prototype.provider.allowFallbacks, true);
  assert.equal(prototype.provider.zdr, false);

  const production = createCcAiModelPolicy(
    environment({
      CC_AI_MODE: "production",
      OPENROUTER_PRODUCTION_MODEL: "anthropic/claude-sonnet-4",
    }),
  );
  assert.equal(production.provider.dataCollection, "deny");
  assert.equal(production.provider.zdr, true);
});

test("a named prototype model keeps the free router behind it", () => {
  // `stealth/ox-alpha` was withdrawn from OpenRouter's catalogue while it was
  // the configured model. Every request 404'd, fell through to the unavailable
  // branch, and found an empty fallback list behind it, so the assistant
  // answered nothing at all until an environment variable was changed. A
  // withdrawn model has to degrade, not take the route down with it.
  const policy = createCcAiModelPolicy(environment({ OPENROUTER_MODEL: "stealth/ox-alpha" }));

  assert.equal(policy.primaryModel, "stealth/ox-alpha");
  assert.deepEqual(policy.fallbackModels, ["openrouter/free"]);
  assert.deepEqual(policy.requestedModels, ["stealth/ox-alpha", "openrouter/free"]);
});

test("configured fallbacks are used exactly, with nothing appended", () => {
  const policy = createCcAiModelPolicy(
    environment({
      OPENROUTER_MODEL: "vendor/primary",
      OPENROUTER_FALLBACK_MODELS: "vendor/second,vendor/third",
    }),
  );

  assert.deepEqual(policy.fallbackModels, ["vendor/second", "vendor/third"]);
});

test("production is left to its own fallbacks, free routes included never", () => {
  const policy = createCcAiModelPolicy(
    environment({
      CC_AI_MODE: "production",
      OPENROUTER_PRODUCTION_MODEL: "anthropic/claude-sonnet-4",
    }),
  );

  // Production rejects free routes outright, so the prototype safety net must
  // not follow it in and quietly break that rule.
  assert.deepEqual(policy.fallbackModels, []);
});
