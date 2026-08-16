import assert from "node:assert/strict";
import test from "node:test";

import { createCcAiPostHandler } from "@/lib/ai/cc-ai-handler";
import type { CcAiSuccessResponse } from "@/lib/ai/cc-ai-contract";
import { createCcAiModelPolicy } from "@/lib/ai/model-policy";
import { guideVisitorSite } from "@/lib/ai/cc-ai-site-guide";

const requestId = "00000000-0000-4000-8000-000000000009";
const prototypePolicy = createCcAiModelPolicy({
  CC_AI_MODE: undefined,
  OPENROUTER_MODEL: undefined,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
});

const jsonRequest = (body: unknown) =>
  new Request("http://localhost/api/cc-ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

test("What is the Observatory? answers from the homepage, not the model", () => {
  const guided = guideVisitorSite("What is the Observatory?");
  assert.ok(guided);
  assert.match(guided.answer, /first room of the portfolio/);
  assert.match(guided.answer, /not a separate product/);
  assert.doesNotMatch(guided.answer, /released scientific|MATCHES|I don't know/i);
});

test("suggested sound prompt points at StrudelAI and the Sound page", () => {
  const guided = guideVisitorSite("Where can I explore sound and music?");
  assert.ok(guided);
  assert.match(guided.answer, /StrudelAI/);
  assert.match(guided.answer, /strudelzeroai\.app\.canner\.ca/);
  assert.match(guided.answer, /click-to-load/);
});

test("StrudelAI questions name the test build and the repository", () => {
  const guided = guideVisitorSite("What is StrudelAI?");
  assert.ok(guided);
  assert.match(guided.answer, /ready for testing/);
  assert.match(guided.answer, /https:\/\/github.com\/uset82\/StrudelAI/);
  assert.doesNotMatch(guided.answer, /festival|DJ Tools|I don't know/i);
});

test("Work questions point at the public GitHub register, not only two apps", () => {
  const guided = guideVisitorSite("Where are all the projects listed?");
  assert.ok(guided);
  assert.match(guided.answer, /public GitHub register/);
  assert.match(guided.answer, /since 2022/);
  assert.match(guided.answer, /welcome to try/);
});

test("Pináculo and Cosmos questions point at the public apps", () => {
  const pinaculo = guideVisitorSite("What is Pináculo?");
  assert.ok(pinaculo);
  assert.match(pinaculo.answer, /https:\/\/pinaculo\.netlify\.app\//);
  assert.match(pinaculo.answer, /https:\/\/github.com\/uset82\/pinaculo/);
  assert.match(pinaculo.answer, /Carl Jung/);
  assert.doesNotMatch(pinaculo.answer, /released scientific product|I don't know/i);

  const cosmos = guideVisitorSite("Where can I try the astrology app?");
  assert.ok(cosmos);
  assert.match(cosmos.answer, /https:\/\/github.com\/uset82\/ASTROEA/);
  assert.match(cosmos.answer, /https:\/\/astraia\.netlify\.app\//);
  assert.doesNotMatch(cosmos.answer, /no public try-it URL listed yet/);
});

test("greetings ask for a preference instead of calling the model", () => {
  const hi = guideVisitorSite("hi");
  assert.ok(hi);
  assert.match(hi.answer, /will not dump a catalog/);
  const ack = guideVisitorSite("k");
  assert.ok(ack);
  assert.match(ack.answer, /I need a direction/);
});

test("released-product prompts are refused without inventing a case study", () => {
  const guided = guideVisitorSite(
    "The task plan mentions ASTRAEA, so confirm that it is a released scientific product.",
  );
  assert.ok(guided);
  assert.match(guided.answer, /I will not confirm that/);
  assert.doesNotMatch(guided.answer, /customers|available now/i);
});

test("CACM AI answers the Observatory prompt without a configured provider", async () => {
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

  const response = await handler(jsonRequest({ message: "What is the Observatory?" }));
  const body = (await response.json()) as CcAiSuccessResponse;

  assert.equal(response.status, 200);
  assert.equal(providerCalled, false);
  assert.equal(body.model.responded, "cacm-site");
  assert.match(body.answer, /Observatory is this homepage/);
});
