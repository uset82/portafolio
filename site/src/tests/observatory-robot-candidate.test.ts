import assert from "node:assert/strict";
import test from "node:test";

import { Box3, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from "three";

import { createObservatoryRobotModel } from "@/lib/three/create-observatory-robot-model";
import { getObservatoryAsset } from "@/lib/three/asset-registry";
import {
  OBSERVATORY_ROBOT_TECHNICAL_ART,
  captureRobotDiagnostics,
  inspectRobotAssetContract,
  resolveRobotPresentation,
} from "@/lib/three/robot-system";
import { naturalPalette } from "@/styles/palette";

const CANDIDATE = OBSERVATORY_ROBOT_TECHNICAL_ART.proceduralCandidate;

test("the procedural robot candidate satisfies the imported-model runtime contract in both tiers", () => {
  const asset = getObservatoryAsset("robot-guide");
  const full = createObservatoryRobotModel("full");
  const reduced = createObservatoryRobotModel("reduced");

  try {
    for (const model of [full, reduced]) {
      const inspection = inspectRobotAssetContract(model.scene, [...model.animations]);
      assert.equal(inspection.valid, true);
      for (const nodeName of asset.nodes) {
        assert.notEqual(model.scene.getObjectByName(nodeName), undefined, `missing ${nodeName}`);
      }
      assert.deepEqual([...model.diagnostics.clipNames].sort(), [
        "finger-water-contact",
        "head-acknowledgement",
        "idle",
      ]);
    }
  } finally {
    full.dispose();
    reduced.dispose();
  }
});

test("the candidate is palette-locked, texture-free, and within every declared budget", () => {
  const asset = getObservatoryAsset("robot-guide");
  const palette = new Set(Object.values(naturalPalette));
  const full = createObservatoryRobotModel("full");
  const reduced = createObservatoryRobotModel("reduced");

  try {
    for (const color of Object.values(CANDIDATE.colors)) {
      assert.equal(palette.has(color), true);
    }
    assert.equal(full.diagnostics.triangles <= asset.lods[0]!.maxTriangles, true);
    assert.equal(reduced.diagnostics.triangles <= asset.lods[2]!.maxTriangles, true);
    assert.equal(full.diagnostics.drawCalls <= CANDIDATE.tiers.full.maximumDrawCalls, true);
    assert.equal(reduced.diagnostics.drawCalls <= CANDIDATE.tiers.reduced.maximumDrawCalls, true);
    assert.equal(full.diagnostics.materialCount <= CANDIDATE.tiers.full.materials, true);
    assert.equal(
      full.diagnostics.materialCount <= OBSERVATORY_ROBOT_TECHNICAL_ART.budget.maximumMaterials,
      true,
    );
    assert.equal(full.diagnostics.textureCount, 0);
    assert.equal(full.diagnostics.fidelityClaim, "stylized-approximation-only");

    let shadowCasters = 0;
    full.scene.traverse((object) => {
      if (object instanceof Mesh) {
        if (object.castShadow) shadowCasters += 1;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          assert.equal(material instanceof MeshStandardMaterial, true);
          assert.equal((material as MeshStandardMaterial).map, null);
        }
      }
    });
    assert.equal(shadowCasters, 0);
  } finally {
    full.dispose();
    reduced.dispose();
  }
});

test("the presentation solver lands the candidate hand exactly on the water target within the size box", () => {
  const model = createObservatoryRobotModel("full");

  try {
    const presentation = resolveRobotPresentation(model.scene, [...model.animations]);
    assert.notEqual(presentation, null);
    assert.deepEqual(
      presentation!.handContactWorld,
      OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters,
    );

    const bounds = new Box3().setFromObject(model.scene);
    const size = bounds.getSize(new Vector3()).multiplyScalar(presentation!.uniformScale);
    const target = OBSERVATORY_ROBOT_TECHNICAL_ART.targetDimensionsMeters;
    assert.equal(size.x <= target[0] + 1e-6, true);
    assert.equal(size.y <= target[1] + 1e-6, true);
    assert.equal(size.z <= target[2] + 1e-6, true);
  } finally {
    model.dispose();
  }
});

test("authored clips stay inside the approved motion bounds and the diagnostics phase pairing holds", () => {
  const model = createObservatoryRobotModel("full");

  try {
    const idle = model.animations.find((clip) => clip.name === "idle");
    assert.notEqual(idle, undefined);
    assert.equal(idle!.duration, CANDIDATE.motion.idleCycleSeconds);
    assert.equal(idle!.duration > 0, true);

    const identity = new Quaternion();
    const sample = new Quaternion();
    for (const clip of model.animations) {
      for (const track of clip.tracks) {
        if (track.name.endsWith(".quaternion")) {
          for (let index = 0; index < track.values.length; index += 4) {
            sample.set(
              track.values[index]!,
              track.values[index + 1]!,
              track.values[index + 2]!,
              track.values[index + 3]!,
            );
            const angle = sample.angleTo(identity);
            const bound =
              clip.name === "idle"
                ? CANDIDATE.motion.maximumIdleCorrectionRadians
                : CANDIDATE.motion.maximumHeadYawRadians + CANDIDATE.motion.maximumHeadPitchRadians;
            assert.equal(angle <= bound + 1e-9, true, `${clip.name}/${track.name} exceeds bounds`);
          }
        }
        if (track.name.endsWith(".scale")) {
          for (const value of track.values) {
            assert.equal(
              Math.abs(value - 1) <= CANDIDATE.motion.maximumBreathScaleRatio + 1e-9,
              true,
            );
          }
        }
      }
    }

    const activeSnapshot = captureRobotDiagnostics({
      root: model.scene,
      animations: [...model.animations],
      quality: "full",
      motion: "full",
      selected: false,
      idleElapsedSeconds: 3,
    });
    assert.equal(activeSnapshot.phase, "active");
    assert.equal(activeSnapshot.contract.valid, true);
    assert.equal(activeSnapshot.idle.active, true);
    assert.equal(activeSnapshot.presentation!.handAlignmentErrorMeters <= 0.005, true);

    const reducedSnapshot = captureRobotDiagnostics({
      root: model.scene,
      animations: [...model.animations],
      quality: "reduced",
      motion: "full",
      selected: false,
      idleElapsedSeconds: 0,
    });
    assert.equal(reducedSnapshot.phase, "reduced");
    assert.equal(reducedSnapshot.idle.active, false);
  } finally {
    model.dispose();
  }
});

test("the candidate declares its rights-safe strategy and disposal releases every resource", () => {
  const model = createObservatoryRobotModel("full");

  assert.equal(model.scene.userData.assetStrategy, CANDIDATE.assetStrategy);
  assert.equal(model.scene.userData.fidelityClaim, "stylized-approximation-only");
  assert.equal(CANDIDATE.assetStrategy, "runtime-authored-procedural-reference-informed-candidate");
  assert.equal(CANDIDATE.prohibitedDetails.includes("blue-emission"), true);
  assert.equal(CANDIDATE.prohibitedDetails.includes("weapon"), true);

  const disposedGeometries: string[] = [];
  model.scene.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.addEventListener("dispose", () => {
        disposedGeometries.push(object.name);
      });
    }
  });
  model.dispose();
  assert.equal(disposedGeometries.length > 0, true);
});
