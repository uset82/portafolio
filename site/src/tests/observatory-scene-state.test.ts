import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { observatoryAssetIds } from "@/lib/three/asset-registry-schema";
import { observatoryAssetRegistry } from "@/lib/three/asset-registry";
import {
  CAMERA_VIEWS,
  OBSERVATORY_ENVIRONMENT,
  OBSERVATORY_LIGHT_RIG,
  SCENE_ARTIFACT_IDS,
  SCENE_GROUPS,
  SCENE_OWNERSHIP,
} from "@/lib/three/scene-config";
import {
  INITIAL_OBSERVATORY_SCENE_STATE,
  canRenderObservatoryScene,
  createObservatorySceneStore,
  resolveSceneMotionMode,
} from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function prepareFullScene() {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "quality/set", tier: "full", source: "manual" });
  store.dispatch({ type: "loading/start", total: 3, activeGroup: "architecture" });
  store.dispatch({ type: "loading/progress", loaded: 2, total: 3, activeGroup: "guide" });
  store.dispatch({ type: "loading/ready" });
  return store;
}

test("scene configuration owns every registry asset, interaction target, camera, light, and environment", () => {
  const groupedAssets = Object.values(SCENE_GROUPS).flatMap((group) => group.assetIds);
  const interactionTargets = observatoryAssetRegistry.assets
    .flatMap((asset) => (asset.interaction ? [asset.interaction.targetId] : []))
    .sort();
  const paletteValues = new Set(Object.values(naturalPalette));

  assert.deepEqual([...groupedAssets].sort(), [...observatoryAssetIds].sort());
  assert.equal(new Set(groupedAssets).size, observatoryAssetIds.length);
  assert.deepEqual(interactionTargets, [...SCENE_ARTIFACT_IDS].sort());
  assert.equal(OBSERVATORY_ENVIRONMENT.environmentMapUrl, null);
  assert.equal(OBSERVATORY_ENVIRONMENT.background, "transparent");
  assert.equal(SCENE_OWNERSHIP.camera, "ObservatoryCamera");
  assert.equal(SCENE_OWNERSHIP.state, "ObservatorySceneStore");

  for (const view of Object.values(CAMERA_VIEWS)) {
    assert.equal(view.near > 0, true);
    assert.equal(view.far > view.near, true);
    assert.equal(view.fov >= 30 && view.fov <= 50, true);
    assert.equal([...view.position, ...view.target].every(Number.isFinite), true);
  }
  for (const light of OBSERVATORY_LIGHT_RIG) {
    assert.equal(paletteValues.has(light.color), true);
    if (light.kind === "hemisphere") assert.equal(paletteValues.has(light.groundColor), true);
    if (light.kind === "directional") assert.equal(light.castShadow, false);
  }
});

test("initial scene state fails closed to poster, fallback camera, muted sound, and static motion", () => {
  const store = createObservatorySceneStore();

  assert.deepEqual(store.getSnapshot(), INITIAL_OBSERVATORY_SCENE_STATE);
  assert.equal(canRenderObservatoryScene(store.getSnapshot()), false);
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "static");
});

test("real loading progress resolves a full scene and requests the owned home camera", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "quality/set", tier: "full", source: "manual" });
  store.dispatch({ type: "loading/start", total: 3, activeGroup: "architecture" });
  store.dispatch({ type: "loading/progress", loaded: 9, total: 3, activeGroup: "guide" });

  assert.deepEqual(store.getSnapshot().loading, {
    lifecycle: "preparing",
    loaded: 3,
    total: 3,
    activeGroup: "guide",
    attempt: 0,
    error: null,
  });

  store.dispatch({ type: "loading/ready" });
  assert.equal(store.getSnapshot().loading.lifecycle, "ready");
  assert.equal(store.getSnapshot().camera.view, "home");
  assert.equal(store.getSnapshot().camera.phase, "requested");
  assert.equal(canRenderObservatoryScene(store.getSnapshot()), true);
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "full");
});

test("artifact selection requests one camera view and never auto-starts Sound Lab", () => {
  const store = prepareFullScene();
  store.dispatch({ type: "artifact/select", artifactId: "sound-lab" });

  assert.equal(store.getSnapshot().selection.artifactId, "sound-lab");
  assert.equal(store.getSnapshot().camera.view, "sound-lab");
  assert.equal(store.getSnapshot().sound.status, "muted");
  assert.equal(store.getSnapshot().sound.muted, true);

  store.dispatch({ type: "sound/play", userInitiated: true });
  assert.equal(store.getSnapshot().sound.status, "playing");
  assert.equal(store.getSnapshot().sound.muted, false);
});

test("new camera requests supersede stale completions", () => {
  const store = prepareFullScene();
  store.dispatch({ type: "camera/request", view: "astraea" });
  const staleRequestId = store.getSnapshot().camera.requestId;
  store.dispatch({ type: "camera/started", requestId: staleRequestId });
  assert.equal(store.getSnapshot().camera.phase, "transitioning");
  store.dispatch({ type: "camera/request", view: "pinaculo" });
  const activeRequestId = store.getSnapshot().camera.requestId;

  store.dispatch({ type: "camera/started", requestId: staleRequestId });
  store.dispatch({ type: "camera/settled", requestId: staleRequestId });
  assert.equal(store.getSnapshot().camera.phase, "requested");
  assert.equal(store.getSnapshot().camera.view, "pinaculo");

  store.dispatch({ type: "camera/started", requestId: activeRequestId });
  assert.equal(store.getSnapshot().camera.phase, "transitioning");
  store.dispatch({ type: "camera/settled", requestId: activeRequestId });
  assert.equal(store.getSnapshot().camera.phase, "settled");
});

test("quality, motion preference, pause, and visibility resolve without frame-loop state", () => {
  const store = prepareFullScene();
  store.dispatch({ type: "motion/preference", preference: "reduce" });
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "reduced");

  store.dispatch({ type: "motion/pause", paused: true });
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "paused");
  store.dispatch({ type: "motion/pause", paused: false });
  store.dispatch({ type: "motion/visibility", visible: false });
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "paused");

  store.dispatch({ type: "quality/set", tier: "static", source: "manual" });
  assert.equal(store.getSnapshot().loading.lifecycle, "poster");
  assert.equal(store.getSnapshot().camera.view, "fallback");
  assert.equal(store.getSnapshot().sound.muted, true);
  assert.equal(resolveSceneMotionMode(store.getSnapshot()), "static");
});

test("safe loading errors, context loss, unsupported WebGL, and explicit retry remain recoverable", () => {
  const store = prepareFullScene();
  store.dispatch({
    type: "loading/fail",
    error: {
      code: "asset-load",
      message: "The guide model could not be prepared.",
      recoverable: true,
      assetId: "robot-guide",
    },
  });
  assert.equal(store.getSnapshot().loading.lifecycle, "error");
  assert.equal(store.getSnapshot().loading.error?.assetId, "robot-guide");

  store.dispatch({ type: "loading/retry", total: 3, activeGroup: "guide" });
  assert.equal(store.getSnapshot().loading.lifecycle, "preparing");
  assert.equal(store.getSnapshot().loading.attempt, 1);
  assert.equal(store.getSnapshot().loading.error, null);

  store.dispatch({ type: "loading/context-lost" });
  assert.equal(store.getSnapshot().loading.lifecycle, "context-lost");
  assert.equal(store.getSnapshot().loading.error?.recoverable, true);

  store.dispatch({ type: "loading/unsupported" });
  assert.equal(store.getSnapshot().quality.tier, "static");
  assert.equal(store.getSnapshot().loading.lifecycle, "unsupported");
  assert.equal(store.getSnapshot().loading.error?.recoverable, false);
});

test("scene store and shell use external snapshots and contain no frame-loop React updates", () => {
  const stateSource = readSource("src/lib/three/scene-state.ts");
  const providerSource = readSource("src/components/three/observatory-scene-provider.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");

  assert.doesNotMatch(stateSource, /from\s+["']react["']/);
  assert.match(providerSource, /useSyncExternalStore/);
  assert.match(providerSource, /createObservatorySceneStore/);
  assert.match(shellSource, /useFrame/);
  assert.doesNotMatch(shellSource, /useState|requestAnimationFrame/);
  assert.match(shellSource, /window\.setInterval/);
  assert.match(shellSource, /window\.clearInterval/);
  assert.match(shellSource, /<perspectiveCamera/);
  assert.match(shellSource, /OBSERVATORY_LIGHT_RIG\.map/);
  assert.match(shellSource, /Object\.values\(SCENE_GROUPS\)\.map/);
});
