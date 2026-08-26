import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { WebGLRenderer } from "three";

import { ObservatoryProgressiveExperienceContent } from "@/components/three/observatory-progressive-experience";
import {
  ObservatorySceneProvider,
  type ObservatorySceneProviderProps,
} from "@/components/three/observatory-scene-provider";
import type { CcAiErrorResponse, CcAiSuccessResponse } from "@/lib/ai/cc-ai-contract";
import {
  INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  resolveQualityDecision,
} from "@/lib/three/capability-policy";
import { buildProgressiveLoadPlan } from "@/lib/three/progressive-loading";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import {
  CC_AI_TEST_MODEL,
  CC_AI_TEST_REQUEST_ID,
  OBSERVATORY_TEST_ASSET_ROOT,
  createCcAiRouteDouble,
  createObservatoryGltfAttemptDouble,
  createObservatoryTestRegistry,
} from "@/testing";

const workspaceRoot = process.cwd();

test("the Observatory registry double is schema-valid and enables deterministic full/reduced plans", () => {
  const registry = createObservatoryTestRegistry();
  const full = buildProgressiveLoadPlan(registry.assets, "full", "approved");
  const reduced = buildProgressiveLoadPlan(registry.assets, "reduced", "approved");

  assert.equal(full.canMountCanvas, true);
  assert.equal(reduced.canMountCanvas, true);
  assert.deepEqual(full.missingHeroCritical, []);
  assert.equal(full.heroCritical.length, 1);
  assert.equal(full.deferred.length, 1);
  assert.equal(full.onDemand.length, 0);
  assert.equal(
    [...full.heroCritical, ...full.deferred, ...full.onDemand].every((entry) =>
      entry.url.startsWith(`${OBSERVATORY_TEST_ASSET_ROOT}/`),
    ),
    true,
  );
});

test("the GLTF attempt double returns disposable Three scenes without a file or network load", async () => {
  const registry = createObservatoryTestRegistry();
  const plan = buildProgressiveLoadPlan(registry.assets, "full");
  const double = createObservatoryGltfAttemptDouble();
  const attempt = double.createLoadingAttempt({} as WebGLRenderer);
  const urls = plan.heroCritical.map((entry) => entry.url);
  const loaded = await attempt.load(urls);

  assert.deepEqual(double.requestedUrls, urls);
  assert.equal(double.attemptCount, 1);
  assert.equal(loaded.length, 1);
  assert.equal(
    loaded.every((asset) => asset.scene.userData.testDouble === true),
    true,
  );
  assert.deepEqual(attempt.getSnapshot(), { status: "ready", loaded: 1, total: 1, url: null });

  attempt.abort();
  assert.equal(double.abortCount, 1);
});

test("the GLTF attempt double reproduces an exact asset failure and pre-load abort", async () => {
  const failedUrl = `${OBSERVATORY_TEST_ASSET_ROOT}/robot-guide-lod-0.glb`;
  const failing = createObservatoryGltfAttemptDouble({ failUrls: [failedUrl] });
  const failedAttempt = failing.createLoadingAttempt({} as WebGLRenderer);

  await assert.rejects(
    () => failedAttempt.load([failedUrl]),
    (error: unknown) => {
      return error instanceof Error && error.name === "GltfAssetLoadError";
    },
  );
  assert.deepEqual(failedAttempt.getSnapshot(), {
    status: "error",
    loaded: 0,
    total: 1,
    url: failedUrl,
  });

  const aborted = createObservatoryGltfAttemptDouble();
  const abortedAttempt = aborted.createLoadingAttempt({} as WebGLRenderer);
  abortedAttempt.abort();
  await assert.rejects(
    () => abortedAttempt.load([failedUrl]),
    (error: unknown) => error instanceof DOMException && error.name === "AbortError",
  );
  assert.deepEqual(aborted.requestedUrls, []);
});

test("the poster-first component accepts test assets and a loader double without server GL work", () => {
  const store = createObservatorySceneStore();
  const capabilities = {
    ...INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
    webgl2: "supported" as const,
    viewport: { width: 1_440, height: 900 },
    devicePixelRatio: 1,
  };
  store.dispatch({
    type: "capabilities/apply",
    snapshot: capabilities,
    decision: resolveQualityDecision(capabilities, "full"),
  });
  const loader = createObservatoryGltfAttemptDouble();
  const registry = createObservatoryTestRegistry();
  const content = createElement(ObservatoryProgressiveExperienceContent, {
    artifacts: [
      {
        artifactId: "astraea",
        href: "/work/astraea",
        title: "ASTRAEA",
        descriptor: "Celestial intelligence",
        status: "concept",
        mechanismDescription: "Three marked rings align when focused.",
      },
      {
        artifactId: "pinaculo",
        href: "/work/pinaculo",
        title: "PINÁCULO",
        descriptor: "Numerological engine",
        status: "concept",
        mechanismDescription: "A 24-position pattern mechanism.",
      },
    ],
    poster: createElement("span", null, "Deterministic poster"),
    assets: registry.assets,
    createLoadingAttempt: loader.createLoadingAttempt,
    liveCanvasPresentation: "approved",
  });

  const html = renderToStaticMarkup(
    createElement(ObservatorySceneProvider, { store } as ObservatorySceneProviderProps, content),
  );

  assert.equal(
    html.indexOf("Deterministic poster") < html.indexOf("observatory-canvas-layer"),
    true,
  );
  assert.match(html, /<figure[^>]*class="observatory-progressive-experience"/);
  assert.match(html, /<figcaption id="observatory-scene-caption" class="visually-hidden">/);
  assert.match(html, /data-scene-layer="poster" aria-hidden="false"/);
  assert.match(html, /data-scene-layer="canvas" aria-hidden="true"/);
  assert.equal(
    html.indexOf('data-scene-layer="canvas"') < html.indexOf('data-scene-layer="artifact-access"'),
    true,
  );
  assert.match(html, /href="\/work\/astraea"/);
  assert.match(html, /ASTRAEA/);
  assert.match(html, /href="\/work\/pinaculo"/);
  assert.match(html, /PINÁCULO/);
  assert.equal(
    html.indexOf('data-scene-layer="artifact-access"') < html.indexOf('data-scene-layer="status"'),
    true,
  );
  assert.match(html, /Poster mode · immersive scene ready to prepare/);
  assert.equal(loader.attemptCount, 0);
  assert.deepEqual(loader.requestedUrls, []);
});

test("the CACM AI route double returns a deterministic response and records the provider contract", async () => {
  const route = createCcAiRouteDouble();
  const response = await route.handle(route.createRequest({ message: "What is Carlos building?" }));
  const body = (await response.json()) as CcAiSuccessResponse;

  assert.equal(response.status, 200);
  assert.equal(body.requestId, CC_AI_TEST_REQUEST_ID);
  assert.equal(body.answer, "Deterministic CACM AI test response.");
  assert.equal(body.model.requested, CC_AI_TEST_MODEL);
  assert.equal(body.model.responded, CC_AI_TEST_MODEL);
  assert.equal(route.calls.length, 1);
  // The free router rides behind any named prototype model, so a model the
  // provider withdraws degrades rather than taking the route down. Seeing it
  // here is the proof that the safety net survives the whole request path.
  assert.deepEqual(route.calls[0]?.requestedModels, [CC_AI_TEST_MODEL, "openrouter/free"]);
  assert.deepEqual(route.calls[0]?.messages.at(-1), {
    role: "user",
    content: "What is Carlos building?",
  });
});

test("the CACM AI double scripts safe failures and produces an e2e route-fulfill payload", async () => {
  const route = createCcAiRouteDouble({
    replies: [{ kind: "error", code: "rate_limited", retryable: true }],
  });
  const fulfill = await route.createFulfillResponse({ message: "Question" });
  const body = JSON.parse(fulfill.body) as CcAiErrorResponse;

  assert.equal(fulfill.status, 429);
  assert.equal(fulfill.headers["cache-control"], "no-store");
  assert.equal(body.error.code, "rate_limited");
  assert.equal(body.error.retryable, true);
  assert.doesNotThrow(() => JSON.stringify(fulfill));
});

test("test-double modules contain no OpenRouter SDK, fetch, or production GLTF loader path", () => {
  const ccAiSource = readFileSync(
    path.join(workspaceRoot, "src/testing/cc-ai-test-doubles.ts"),
    "utf8",
  );
  const observatorySource = readFileSync(
    path.join(workspaceRoot, "src/testing/observatory-test-doubles.ts"),
    "utf8",
  );
  const liveSceneSource = readFileSync(
    path.join(workspaceRoot, "src/components/three/observatory-live-scene.tsx"),
    "utf8",
  );

  assert.doesNotMatch(ccAiSource, /@openrouter\/sdk|fetch\(/);
  assert.doesNotMatch(observatorySource, /new GLTFLoader|loadAsync|fetch\(/);
  assert.match(liveSceneSource, /createLoadingAttempt = createGltfLoadingAttempt/);
  assert.match(liveSceneSource, /createLoadingAttempt\(renderer\)/);
});
