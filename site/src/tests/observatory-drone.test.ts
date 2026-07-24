import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ObservatoryArtifactAccess } from "@/components/three/observatory-artifact-access";
import {
  ObservatorySceneProvider,
  type ObservatorySceneProviderProps,
} from "@/components/three/observatory-scene-provider";
import { createObservatoryDroneModel } from "@/lib/three/create-observatory-drone-model";
import {
  OBSERVATORY_DRONE_TECHNICAL_ART,
  captureDroneDiagnostics,
  inspectDronePoseSafety,
  resolveDroneAmbientPose,
  resolveDronePresentation,
} from "@/lib/three/drone-system";
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import { createObservatorySceneStore } from "@/lib/three/scene-state";
import { naturalPalette } from "@/styles/palette";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

test("the procedural drone is action-ready, natural-palette-only, and within both runtime tiers", () => {
  const asset = getObservatoryAsset("drone");
  const palette = new Set(Object.values(naturalPalette));
  const full = createObservatoryDroneModel("full");
  const reduced = createObservatoryDroneModel("reduced");

  try {
    assert.equal(asset.kind, "procedural");
    assert.equal(asset.status, "specified");
    assert.deepEqual(OBSERVATORY_DRONE_TECHNICAL_ART.dimensionsMeters, asset.scaleMeters);
    assert.equal(OBSERVATORY_DRONE_TECHNICAL_ART.fidelityClaim, "stylized-approximation-only");
    assert.equal(full.rotorPivots.length, 4);
    assert.equal(reduced.rotorPivots.length, 4);
    assert.equal(full.root.getObjectByName("DroneCollisionProxy") !== undefined, true);
    assert.equal(full.root.getObjectByName("DroneCameraGimbal") !== undefined, true);
    assert.equal(full.diagnostics.actionReady, true);
    assert.equal(full.diagnostics.triangles <= asset.lods[0]!.maxTriangles, true);
    assert.equal(reduced.diagnostics.triangles <= asset.lods[1]!.maxTriangles, true);
    assert.equal(
      full.diagnostics.drawCalls <= OBSERVATORY_DRONE_TECHNICAL_ART.tiers.full.maximumDrawCalls,
      true,
    );
    assert.equal(full.diagnostics.materialCount, 5);
    assert.equal(full.diagnostics.textureCount, 0);
    for (const color of Object.values(OBSERVATORY_DRONE_TECHNICAL_ART.colors)) {
      assert.equal(palette.has(color), true);
    }
  } finally {
    full.dispose();
    reduced.dispose();
  }
});

test("the stabilization path rests for two thirds of each cycle and stays inside every safety limit", () => {
  const { motion } = OBSERVATORY_DRONE_TECHNICAL_ART;
  const restAtStart = resolveDroneAmbientPose(0);
  const restAtBoundary = resolveDroneAmbientPose(motion.activeSeconds);
  const restNearEnd = resolveDroneAmbientPose(motion.cycleSeconds - 0.001);
  let activeSamples = 0;
  let restSamples = 0;

  assert.deepEqual(restAtStart, restAtBoundary);
  assert.equal(restNearEnd.active, false);

  for (let index = 0; index <= 1_200; index += 1) {
    const elapsed = (motion.cycleSeconds * index) / 1_200;
    const pose = resolveDroneAmbientPose(elapsed);
    const safety = inspectDronePoseSafety(pose);
    if (pose.active) activeSamples += 1;
    else restSamples += 1;
    assert.equal(safety.safe, true, `unsafe drone pose at ${elapsed.toFixed(3)} seconds`);
    assert.equal(Math.abs(pose.offsetMeters[1]) <= motion.maximumVerticalOffsetMeters + 1e-9, true);
    assert.equal(Math.abs(pose.rotationRadians[2]) <= motion.maximumRollRadians + 1e-9, true);
  }

  assert.equal(activeSamples > 0, true);
  assert.equal(restSamples > activeSamples, true);
  assert.equal(motion.activeSeconds + motion.restSeconds, motion.cycleSeconds);
});

test("reduced, compact, static, and hidden-document paths stop ambient animation", () => {
  assert.deepEqual(resolveDronePresentation("full", "full", false), {
    tier: "full",
    animated: true,
    settleImmediately: false,
  });
  assert.deepEqual(resolveDronePresentation("full", "paused", false), {
    tier: "full",
    animated: false,
    settleImmediately: false,
  });
  assert.deepEqual(resolveDronePresentation("full", "reduced", false), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveDronePresentation("full", "full", true), {
    tier: "reduced",
    animated: false,
    settleImmediately: true,
  });
  assert.deepEqual(resolveDronePresentation("static", "static", false), {
    tier: "poster",
    animated: false,
    settleImmediately: true,
  });
});

test("drone diagnostics expose phase, pose, and measurable safety clearances", () => {
  const activePose = resolveDroneAmbientPose(1);
  const active = captureDroneDiagnostics({
    presentation: resolveDronePresentation("full", "full", false),
    elapsedSeconds: 1,
    pose: activePose,
  });

  assert.equal(active.version, 1);
  assert.equal(active.phase, "active");
  assert.equal(active.elapsedSeconds, 1);
  assert.deepEqual(active.pose, activePose);
  assert.equal(active.safety?.inspection.safe, true);
  assert.equal((active.safety?.corridorMarginMeters ?? -1) >= -1e-9, true);
  assert.equal(
    (active.safety?.roofClearanceMeters ?? 0) >=
      (active.safety?.minimumRequiredRoofClearanceMeters ?? 1),
    true,
  );
  assert.equal((active.safety?.robotClearanceMeters ?? -1) >= 0, true);
  assert.equal((active.safety?.attitudeMarginRadians ?? -1) >= -1e-9, true);

  const paused = captureDroneDiagnostics({
    presentation: resolveDronePresentation("full", "paused", false),
    elapsedSeconds: 1,
    pose: activePose,
  });
  assert.equal(paused.phase, "paused");
  assert.deepEqual(paused.pose, activePose);

  const resting = captureDroneDiagnostics({
    presentation: resolveDronePresentation("full", "full", false),
    elapsedSeconds: 6,
    pose: resolveDroneAmbientPose(6),
  });
  assert.equal(resting.phase, "rest");
  assert.equal(resting.pose?.active, false);

  const reduced = captureDroneDiagnostics({
    presentation: resolveDronePresentation("full", "reduced", false),
    elapsedSeconds: 1,
    pose: activePose,
  });
  assert.equal(reduced.phase, "reduced");
  assert.equal(reduced.elapsedSeconds, 0);
  assert.deepEqual(reduced.pose, resolveDroneAmbientPose(0));

  const poster = captureDroneDiagnostics({
    presentation: resolveDronePresentation("static", "static", false),
    elapsedSeconds: 1,
    pose: activePose,
  });
  assert.equal(poster.phase, "poster");
  assert.equal(poster.pose, null);
  assert.equal(poster.worldPositionMeters, null);
  assert.equal(poster.safety, null);
});

test("Aerial systems has an accurate DOM route independent of the Canvas", () => {
  const store = createObservatorySceneStore();
  store.dispatch({ type: "artifact/select", artifactId: "drone" });
  const markup = renderToStaticMarkup(
    createElement(
      ObservatorySceneProvider,
      { store } as ObservatorySceneProviderProps,
      createElement(ObservatoryArtifactAccess, {
        artifact: {
          artifactId: "drone",
          href: "/laboratory",
          title: "Aerial systems",
          descriptor: "Guarded camera-drone concept",
          status: "concept",
          mechanismDescription:
            "A protected-rotor camera-drone concept uses a sparse stabilization cycle; no flight-performance or autonomous-operation claim is made.",
        },
        interactive: true,
      }),
    ),
  );

  assert.match(markup, /data-artifact-id="drone"/);
  assert.match(markup, /data-selected="true"/);
  assert.match(markup, /href="\/laboratory"/);
  assert.match(markup, /Open Aerial systems — Guarded camera-drone concept/);
  assert.match(markup, /no flight-performance or autonomous-operation claim/);
  assert.match(markup, /Return to overview/);
});

test("one sparse drone owner is wired with visibility pause, DOM fallback, and no glow loop", () => {
  const droneSource = readSource("src/components/three/observatory-drone.tsx");
  const modelSource = readSource("src/lib/three/create-observatory-drone-model.ts");
  const shellSource = readSource("src/components/three/observatory-scene-shell.tsx");
  const liveSceneSource = readSource("src/components/three/observatory-live-scene.tsx");
  const progressiveSource = readSource(
    "src/components/three/observatory-progressive-experience.tsx",
  );
  const capabilitySource = readSource("src/components/three/observatory-capability-controller.tsx");
  const pageSource = readSource("src/app/page.tsx");
  const styles = readSource("src/app/globals.css");
  const manifest = readSource("../docs/assets/observatory-3d-manifest.json");

  assert.match(droneSource, /window\.setInterval/);
  assert.match(droneSource, /window\.setTimeout/);
  assert.match(droneSource, /motion\.restSeconds/);
  assert.match(droneSource, /useFrame/);
  assert.match(droneSource, /onClick=\{selectDrone\}/);
  assert.match(droneSource, /captureDroneDiagnostics/);
  assert.match(droneSource, /onDiagnosticsReady/);
  assert.doesNotMatch(
    droneSource + modelSource,
    /useState|requestAnimationFrame|TextGeometry|CanvasTexture|VideoTexture|shaderMaterial|emissive|window\.__|globalThis\./,
  );
  assert.equal((shellSource.match(/<ObservatoryDrone/g) ?? []).length, 1);
  assert.match(shellSource, /onDroneDiagnosticsReady/);
  assert.match(liveSceneSource, /onDroneDiagnosticsReady/);
  assert.match(progressiveSource, /onDroneDiagnosticsReady/);
  assert.match(capabilitySource, /visibilitychange/);
  assert.match(capabilitySource, /motion\/visibility/);
  assert.match(pageSource, /artifactId: "drone"/);
  assert.match(pageSource, /stylized|visual concept|flight-performance/);
  assert.match(
    styles,
    /\.observatory-artifact-access\[data-artifact-id="drone"\][\s\S]*top:\s*17%/,
  );
  assert.match(
    styles,
    /@media \(max-width: 64rem\)[\s\S]*data-artifact-id="drone"[\s\S]*display:\s*none/,
  );
  assert.match(manifest, /"id": "drone"[\s\S]*"status": "specified"/);
  assert.match(manifest, /stylized approximation only/);
});
