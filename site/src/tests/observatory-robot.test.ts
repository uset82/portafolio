import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { Vector3 } from "three";

import {
  OBSERVATORY_ROBOT_TECHNICAL_ART,
  RobotAssetContractError,
  assertRobotAssetContract,
  captureRobotDiagnostics,
  inspectRobotAssetContract,
  resolveRobotDiagnosticsPhase,
  resolveRobotPresentation,
} from "@/lib/three/robot-system";
import {
  OBSERVATORY_TEST_ASSET_ROOT,
  createObservatoryTestGltf,
} from "@/testing/observatory-test-doubles";

const workspaceRoot = process.cwd();
const robotUrl = `${OBSERVATORY_TEST_ASSET_ROOT}/robot-guide-lod-0.glb`;

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function assertVectorClose(actual: Vector3, expected: readonly number[]) {
  const values = [actual.x, actual.y, actual.z];
  values.forEach((value, index) => {
    assert.equal(Math.abs(value - expected[index]!) < 0.000_001, true);
  });
}

test("the deterministic robot satisfies the required node, clip, bounds, and budget contract", () => {
  const asset = createObservatoryTestGltf(robotUrl);
  const inspection = inspectRobotAssetContract(asset.scene, asset.animations);

  assert.equal(inspection.valid, true);
  if (!inspection.valid) return;

  assert.doesNotThrow(() => assertRobotAssetContract(asset));
  assert.equal(
    inspection.size.every((value) => value > 0),
    true,
  );
  assert.deepEqual(
    asset.animations.map((clip) => clip.name),
    [...OBSERVATORY_ROBOT_TECHNICAL_ART.requiredClips],
  );
  assert.equal(OBSERVATORY_ROBOT_TECHNICAL_ART.budget.maximumTriangles, 45_000);
  assert.equal(OBSERVATORY_ROBOT_TECHNICAL_ART.budget.shadowCasters, 0);
  assert.equal(OBSERVATORY_ROBOT_TECHNICAL_ART.budget.postPasses, 0);
});

test("presentation normalization preserves canonical transforms and lands the hand on the water target", () => {
  const asset = createObservatoryTestGltf(robotUrl);
  const inspection = assertRobotAssetContract(asset);
  const canonicalTransform = {
    position: asset.scene.position.toArray(),
    rotation: asset.scene.rotation.toArray(),
    scale: asset.scene.scale.toArray(),
  };
  const presentation = resolveRobotPresentation(asset.scene, asset.animations);

  assert.ok(presentation);
  const scaledSize = inspection.size.map((value) => value * presentation.uniformScale);
  scaledSize.forEach((value, index) => {
    assert.equal(
      value <= OBSERVATORY_ROBOT_TECHNICAL_ART.targetDimensionsMeters[index]! + 0.000_001,
      true,
    );
  });

  const resolvedHand = new Vector3(...inspection.handContact)
    .add(new Vector3(...presentation.canonicalOffset))
    .multiplyScalar(presentation.uniformScale)
    .applyAxisAngle(new Vector3(0, 1, 0), presentation.rotation[1])
    .add(new Vector3(...presentation.position));
  assertVectorClose(resolvedHand, OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters);
  assert.deepEqual(asset.scene.position.toArray(), canonicalTransform.position);
  assert.deepEqual(asset.scene.rotation.toArray(), canonicalTransform.rotation);
  assert.deepEqual(asset.scene.scale.toArray(), canonicalTransform.scale);
});

test("robot diagnostics expose contract, placement, contact, selection, and idle-cycle evidence", () => {
  const asset = createObservatoryTestGltf(robotUrl);
  const diagnostics = captureRobotDiagnostics({
    root: asset.scene,
    animations: asset.animations,
    quality: "full",
    motion: "full",
    selected: true,
    idleElapsedSeconds: 1.25,
  });

  assert.equal(diagnostics.version, 1);
  assert.equal(diagnostics.phase, "active");
  assert.equal(diagnostics.selected, true);
  assert.equal(diagnostics.contract.valid, true);
  assert.deepEqual(diagnostics.contract.issues, []);
  assert.ok(diagnostics.presentation);
  assert.equal(diagnostics.presentation.handAlignmentErrorMeters, 0);
  assert.equal(
    diagnostics.presentation.scaledSize.every(
      (value, index) =>
        value <= OBSERVATORY_ROBOT_TECHNICAL_ART.targetDimensionsMeters[index]! + 0.000_001,
    ),
    true,
  );
  assert.equal(diagnostics.presentation.interactionAnchorWorld.every(Number.isFinite), true);
  assert.deepEqual(
    diagnostics.presentation.handTargetWorld,
    OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters,
  );
  assert.equal(diagnostics.idle.clipAvailable, true);
  assert.equal(diagnostics.idle.active, true);
  assert.equal(diagnostics.idle.durationSeconds, 1);
  assert.equal(diagnostics.idle.normalizedCycle, 0.25);
  assert.equal(
    diagnostics.idle.maximumAnimatedFps,
    OBSERVATORY_ROBOT_TECHNICAL_ART.maximumAnimatedFps,
  );
});

test("reduced, paused, poster, and malformed robot diagnostics never claim active idle motion", () => {
  const asset = createObservatoryTestGltf(robotUrl);
  const capture = (quality: "full" | "reduced" | "static", motion: "full" | "paused") =>
    captureRobotDiagnostics({
      root: asset.scene,
      animations: asset.animations,
      quality,
      motion,
      selected: false,
      idleElapsedSeconds: Number.NaN,
    });

  assert.equal(resolveRobotDiagnosticsPhase("reduced", "full"), "reduced");
  assert.equal(resolveRobotDiagnosticsPhase("full", "paused"), "paused");
  assert.equal(resolveRobotDiagnosticsPhase("static", "full"), "poster");
  assert.equal(capture("reduced", "full").idle.active, false);
  assert.equal(capture("full", "paused").idle.active, false);
  assert.equal(capture("static", "full").idle.active, false);
  assert.equal(capture("static", "full").idle.elapsedSeconds, 0);

  asset.scene.getObjectByName("RobotHandContact")?.removeFromParent();
  const malformed = capture("full", "full");
  assert.equal(malformed.contract.valid, false);
  assert.equal(malformed.presentation, null);
  assert.equal(malformed.idle.active, false);
  assert.match(malformed.contract.issues.join("\n"), /RobotHandContact/);
});

test("a malformed robot fails before scene readiness instead of exposing an empty Canvas", () => {
  const asset = createObservatoryTestGltf(robotUrl);
  asset.scene.getObjectByName("RobotHandContact")?.removeFromParent();
  asset.animations = asset.animations.filter((clip) => clip.name !== "idle");
  const result = inspectRobotAssetContract(asset.scene, asset.animations);

  assert.equal(result.valid, false);
  if (result.valid) return;
  assert.match(result.issues.join("\n"), /RobotHandContact/);
  assert.match(result.issues.join("\n"), /Missing clips: idle/);
  assert.throws(
    () => assertRobotAssetContract(asset),
    (error: unknown) => error instanceof RobotAssetContractError && error.assetId === "robot-guide",
  );
});

test("the runtime validates, owns, mounts, animates, selects, and disposes the robot through one path", () => {
  const liveSource = readSource("src/components/three/observatory-live-scene.tsx");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const robotSource = readSource("src/components/three/observatory-robot.tsx");

  assert.equal(
    liveSource.indexOf("assertRobotAssetContract(gltf)") <
      liveSource.indexOf("loadedUrls.set(entry.url, gltf)"),
    true,
  );
  assert.match(liveSource, /setPresentedAssets/);
  assert.match(liveSource, /disposeGltfAsset/);
  assert.match(
    liveSource,
    /assertRobotAssetContract\(gltf\);[\s\S]*disposeGltfAsset\(gltf\);[\s\S]*throw error;/,
  );
  assert.match(
    shellSource,
    /group\.id === "guide"[\s\S]*<ObservatoryRobot[\s\S]*asset=\{loadedAssets\.get\("robot-guide"\)!\}/,
  );
  assert.match(robotSource, /resolveRobotPresentation/);
  assert.match(robotSource, /captureRobotDiagnostics/);
  assert.match(robotSource, /onDiagnosticsReady\(diagnostics\)/);
  assert.match(robotSource, /return \(\) => onDiagnosticsReady\(null\)/);
  assert.match(robotSource, /maximumAnimatedFps/);
  assert.match(robotSource, /scene\.quality\.tier === "full"/);
  assert.match(
    robotSource,
    /action\.paused = true;[\s\S]*\}, \[idleClip, mixer\]\);[\s\S]*actionRef\.current\.paused = !active;/,
  );
  assert.match(robotSource, /type: "artifact\/select", artifactId: "robot-guide"/);
  assert.match(robotSource, /<primitive object=\{asset\.scene\} dispose=\{null\}/);
  assert.match(shellSource, /onRobotDiagnosticsReady/);
  assert.doesNotMatch(robotSource, /traverse\([\s\S]*material/);
});
