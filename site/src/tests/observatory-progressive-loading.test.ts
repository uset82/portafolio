import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { observatoryAssetRegistry } from "@/lib/three/asset-registry";
import type { ObservatoryAsset } from "@/lib/three/asset-registry-schema";
import {
  INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  resolveQualityDecision,
} from "@/lib/three/capability-policy";
import {
  buildProgressiveLoadPlan,
  describeProgressiveSceneStatus,
  findOnDemandEntry,
} from "@/lib/three/progressive-loading";
import { createObservatorySceneStore } from "@/lib/three/scene-state";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function loadableAssets() {
  return observatoryAssetRegistry.assets.map((asset) => ({
    ...asset,
    lods: asset.lods.map((lod) => ({
      ...lod,
      url: asset.kind === "model" ? `/three/models/${asset.id}-lod-${lod.level}.glb` : null,
    })),
  })) as ObservatoryAsset[];
}

function supportedStore() {
  const store = createObservatorySceneStore();
  const snapshot = {
    ...INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
    webgl2: "supported" as const,
    viewport: { width: 1_440, height: 900 },
    devicePixelRatio: 1.5,
    deviceMemoryGb: 8,
    hardwareConcurrency: 8,
    effectiveConnectionType: "4g" as const,
    battery: { charging: true, level: 1 },
  };
  store.dispatch({
    type: "capabilities/apply",
    snapshot,
    decision: resolveQualityDecision(snapshot, "auto"),
  });
  return store;
}

test("the current rights-gated registry refuses Canvas mounting and names missing hero models", () => {
  const plan = buildProgressiveLoadPlan(observatoryAssetRegistry.assets, "full");

  assert.equal(plan.canMountCanvas, false);
  assert.deepEqual(plan.missingHeroCritical, ["observatory-shell", "robot-guide"]);
  assert.deepEqual(plan.heroCritical, []);
  assert.deepEqual(plan.deferred, []);
  assert.deepEqual(plan.onDemand, []);
});

test("full and reduced plans choose deterministic LODs in priority order", () => {
  const assets = loadableAssets();
  const full = buildProgressiveLoadPlan(assets, "full");
  const reduced = buildProgressiveLoadPlan(assets, "reduced");

  assert.equal(full.canMountCanvas, true);
  assert.equal(
    full.heroCritical.every((entry) => entry.lodLevel === 0),
    true,
  );
  assert.equal(
    reduced.heroCritical.every((entry) => entry.lodLevel >= 1),
    true,
  );
  assert.deepEqual(
    full.heroCritical.map((entry) => entry.assetId),
    ["observatory-shell", "robot-guide"],
  );
  assert.deepEqual(
    full.deferred.map((entry) => entry.assetId),
    ["drone", "props-and-plants"],
  );
  assert.equal(findOnDemandEntry(full, "astraea")?.assetId, "astraea");
  assert.equal(findOnDemandEntry(full, null), null);
});

test("scene status remains truthful from capability check through loading and failure", () => {
  const initialStore = createObservatorySceneStore();
  const initialPlan = buildProgressiveLoadPlan(observatoryAssetRegistry.assets, "static");
  assert.equal(
    describeProgressiveSceneStatus(initialStore.getSnapshot(), initialPlan),
    "Poster mode · checking device support",
  );

  const store = supportedStore();
  const missingPlan = buildProgressiveLoadPlan(observatoryAssetRegistry.assets, "full");
  assert.equal(
    describeProgressiveSceneStatus(store.getSnapshot(), missingPlan),
    "Poster mode · immersive assets awaiting approval",
  );

  const loadablePlan = buildProgressiveLoadPlan(loadableAssets(), "full");
  store.dispatch({ type: "loading/start", total: 2, activeGroup: "architecture" });
  store.dispatch({ type: "loading/progress", loaded: 1, total: 2, activeGroup: "guide" });
  assert.equal(
    describeProgressiveSceneStatus(store.getSnapshot(), loadablePlan),
    "Preparing Observatory · 1 of 2",
  );

  store.dispatch({
    type: "loading/fail",
    error: {
      code: "asset-load",
      message: "The interactive Observatory could not be prepared.",
      recoverable: true,
      assetId: "robot-guide",
    },
  });
  assert.equal(
    describeProgressiveSceneStatus(store.getSnapshot(), loadablePlan),
    "Poster mode · interactive scene could not be prepared",
  );
});

test("poster markup precedes the conditional Canvas and Three stays behind dynamic boundaries", () => {
  const pageSource = readSource("src/app/page.tsx");
  const experienceSource = readSource(
    "src/components/three/observatory-progressive-experience.tsx",
  );
  const lazyCanvasSource = readSource("src/components/three/lazy-three-canvas.tsx");
  const liveSceneSource = readSource("src/components/three/observatory-live-scene.tsx");

  assert.match(pageSource, /ObservatoryProgressiveExperience[\s\S]*ImageFrame/);
  assert.equal(
    experienceSource.indexOf("observatory-poster-layer") <
      experienceSource.indexOf("plan.canMountCanvas"),
    true,
  );
  assert.match(experienceSource, /dynamic\([\s\S]*observatory-live-scene/);
  assert.match(lazyCanvasSource, /dynamic(?:<[^>]+>)?\([\s\S]*three-canvas[\s\S]*ssr: false/);
  assert.doesNotMatch(
    pageSource + experienceSource + lazyCanvasSource,
    /@react-three|from "three"/,
  );
  assert.match(liveSceneSource, /@react-three\/fiber/);
});

test("the live owner loads critical first, schedules deferred work, watches selection, and disposes", () => {
  const liveSource = readSource("src/components/three/observatory-live-scene.tsx");

  assert.match(liveSource, /await loadEntries\(plan\.heroCritical, true\)/);
  assert.match(liveSource, /scheduleDeferred\(\)/);
  assert.match(liveSource, /requestIdleCallback/);
  assert.match(liveSource, /findOnDemandEntry\(plan, selected\)/);
  assert.match(liveSource, /store\.subscribe\(loadSelected\)/);
  assert.match(liveSource, /disposeGltfAsset/);
  assert.match(liveSource, /evictGltfCache/);
  assert.match(liveSource, /attempts\.forEach\(\(attempt\) => attempt\.abort\(\)\)/);
});
