import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  detectWebGL2Support,
  resolveQualityDecision,
  type BrowserCapabilitySnapshot,
} from "@/lib/three/capability-policy";
import { createObservatorySceneStore } from "@/lib/three/scene-state";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function healthySnapshot(
  overrides: Partial<BrowserCapabilitySnapshot> = {},
): BrowserCapabilitySnapshot {
  return {
    ...INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
    webgl2: "supported",
    viewport: { width: 1_440, height: 900 },
    devicePixelRatio: 1.5,
    deviceMemoryGb: 8,
    hardwareConcurrency: 8,
    reducedMotion: false,
    reducedData: false,
    effectiveConnectionType: "4g",
    battery: { charging: true, level: 1 },
    ...overrides,
  };
}

test("WebGL2 detection supports success, null-context, and exception paths", () => {
  assert.equal(
    detectWebGL2Support(() => ({ getContext: () => ({ renderer: "test" }) })),
    "supported",
  );
  assert.equal(
    detectWebGL2Support(() => ({ getContext: () => null })),
    "unsupported",
  );
  assert.equal(
    detectWebGL2Support(() => ({
      getContext: () => {
        throw new Error("context blocked");
      },
    })),
    "unsupported",
  );
});

test("unknown or unsupported WebGL2 fails closed even when full quality was requested", () => {
  assert.deepEqual(resolveQualityDecision(INITIAL_BROWSER_CAPABILITY_SNAPSHOT, "full"), {
    tier: "static",
    source: "automatic",
    preference: "full",
    reasons: ["webgl2-unknown"],
  });
  assert.deepEqual(resolveQualityDecision(healthySnapshot({ webgl2: "unsupported" }), "full"), {
    tier: "static",
    source: "automatic",
    preference: "full",
    reasons: ["webgl2-unsupported"],
  });
});

test("manual quality explicitly overrides soft network, battery, viewport, and hardware hints", () => {
  const constrained = healthySnapshot({
    viewport: { width: 390, height: 844 },
    devicePixelRatio: 3,
    deviceMemoryGb: 2,
    hardwareConcurrency: 2,
    reducedMotion: true,
    reducedData: true,
    effectiveConnectionType: "2g",
    battery: { charging: false, level: 0.05 },
  });

  assert.deepEqual(resolveQualityDecision(constrained, "full"), {
    tier: "full",
    source: "manual",
    preference: "full",
    reasons: ["manual-full"],
  });
  assert.equal(resolveQualityDecision(constrained, "reduced").tier, "reduced");
  assert.equal(resolveQualityDecision(constrained, "static").tier, "static");
});

test("automatic reduced-data and very slow connection modes preserve the poster", () => {
  assert.deepEqual(resolveQualityDecision(healthySnapshot({ reducedData: true }), "auto"), {
    tier: "static",
    source: "automatic",
    preference: "auto",
    reasons: ["reduced-data"],
  });
  assert.deepEqual(
    resolveQualityDecision(healthySnapshot({ effectiveConnectionType: "slow-2g" }), "auto"),
    {
      tier: "static",
      source: "automatic",
      preference: "auto",
      reasons: ["slow-connection"],
    },
  );
});

test("automatic motion, battery, viewport, DPR, memory, CPU, and 3G hints select reduced quality", () => {
  const decision = resolveQualityDecision(
    healthySnapshot({
      viewport: { width: 390, height: 844 },
      devicePixelRatio: 3,
      deviceMemoryGb: 4,
      hardwareConcurrency: 4,
      reducedMotion: true,
      effectiveConnectionType: "3g",
      battery: { charging: false, level: 0.2 },
    }),
    "auto",
  );

  assert.equal(decision.tier, "reduced");
  assert.deepEqual(decision.reasons, [
    "reduced-motion",
    "low-battery",
    "narrow-viewport",
    "high-mobile-dpr",
    "limited-memory",
    "limited-cpu",
    "moderate-connection",
  ]);
});

test("healthy desktop and unavailable optional hints resolve without penalizing support", () => {
  assert.deepEqual(resolveQualityDecision(healthySnapshot(), "auto"), {
    tier: "full",
    source: "automatic",
    preference: "auto",
    reasons: ["balanced-default"],
  });
  assert.equal(
    resolveQualityDecision(
      healthySnapshot({
        deviceMemoryGb: null,
        hardwareConcurrency: null,
        effectiveConnectionType: null,
        battery: null,
      }),
      "auto",
    ).tier,
    "full",
  );
});

test("capability assessment and manual preference have typed scene-store ownership", () => {
  const store = createObservatorySceneStore();
  const snapshot = healthySnapshot();
  const decision = resolveQualityDecision(snapshot, "auto");

  store.dispatch({ type: "capabilities/apply", snapshot, decision });
  assert.equal(store.getSnapshot().version, 2);
  assert.equal(store.getSnapshot().capabilities, snapshot);
  assert.equal(store.getSnapshot().quality.tier, "full");
  assert.deepEqual(store.getSnapshot().quality.reasons, ["balanced-default"]);

  store.dispatch({ type: "quality/preference", preference: "reduced" });
  assert.equal(store.getSnapshot().quality.preference, "reduced");
  store.dispatch({
    type: "capabilities/apply",
    snapshot,
    decision: resolveQualityDecision(snapshot, "reduced"),
  });
  assert.equal(store.getSnapshot().quality.source, "manual");
  assert.equal(store.getSnapshot().quality.tier, "reduced");

  const unsupported = healthySnapshot({ webgl2: "unsupported" });
  store.dispatch({
    type: "capabilities/apply",
    snapshot: unsupported,
    decision: resolveQualityDecision(unsupported, "reduced"),
  });
  assert.equal(store.getSnapshot().loading.lifecycle, "unsupported");
  assert.equal(store.getSnapshot().camera.view, "fallback");
});

test("the client controller feature-detects optional signals, cleans listeners, and exposes manual control", () => {
  const policySource = readSource("src/lib/three/capability-policy.ts");
  const controllerSource = readSource("src/components/three/observatory-capability-controller.tsx");
  const runtimeProviderSource = readSource(
    "src/components/three/observatory-scene-runtime-provider.tsx",
  );
  const qualityControlSource = readSource("src/components/three/observatory-quality-control.tsx");
  const qualityControlStyles = readSource(
    "src/components/three/observatory-quality-control.module.css",
  );
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");

  assert.match(policySource, /getContext\("webgl2"/);
  assert.match(controllerSource, /navigatorWithHints\.deviceMemory/);
  assert.match(controllerSource, /navigator\.hardwareConcurrency/);
  assert.match(controllerSource, /window\.devicePixelRatio/);
  assert.match(controllerSource, /window\.innerWidth/);
  assert.match(controllerSource, /prefers-reduced-motion: reduce/);
  assert.match(controllerSource, /connection\?\.saveData/);
  assert.match(controllerSource, /navigatorWithHints\.getBattery/);
  assert.match(controllerSource, /\.catch\(\(\) => undefined\)/);
  assert.match(controllerSource, /removeEventListener\("resize"/);
  assert.match(controllerSource, /quality\/preference/);
  assert.match(runtimeProviderSource, /<ObservatoryCapabilityController/);
  assert.doesNotMatch(shellSource, /ObservatoryCapabilityController/);
  assert.match(qualityControlSource, /<fieldset/);
  assert.match(qualityControlSource, /type="radio"/);
  assert.match(qualityControlSource, /aria-live="polite"/);
  assert.match(qualityControlSource, /"auto"[\s\S]*"full"[\s\S]*"reduced"[\s\S]*"static"/);
  assert.match(qualityControlStyles, /min-block-size: var\(--control-height\)/);
  assert.match(qualityControlStyles, /prefers-reduced-motion: reduce/);
});
