import assert from "node:assert/strict";
import test from "node:test";

import { getObservatoryAsset } from "@/lib/three/asset-registry";
import type { ObservatoryAssetId } from "@/lib/three/asset-registry-schema";
import { OBSERVATORY_ASTRAEA_TECHNICAL_ART } from "@/lib/three/astraea-system";
import { createObservatoryRobotModel } from "@/lib/three/create-observatory-robot-model";
import { OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART } from "@/lib/three/electronics-ai-system";
import { OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART } from "@/lib/three/future-energy-system";
import { OBSERVATORY_ENVIRONMENT_TECHNICAL_ART } from "@/lib/three/observatory-environment";
import { OBSERVATORY_PINACULO_TECHNICAL_ART } from "@/lib/three/pinaculo-system";
import {
  OBSERVATORY_ROBOT_TECHNICAL_ART,
  resolveRobotPresentation,
} from "@/lib/three/robot-system";
import { OBSERVATORY_SOUND_LAB_TECHNICAL_ART } from "@/lib/three/sound-lab-system";
import { CAMERA_VIEWS } from "@/lib/three/scene-config";

/* The focal guide's placement is fully determined by the approved hand-water
 * contact, so every floor instrument must keep its authored footprint clear of
 * the guide. PINÁCULO once surrounded the activated robot because no contract
 * owned this clearance. */

const FLOOR_INSTRUMENTS: ReadonlyArray<{
  assetId: ObservatoryAssetId;
  positionMeters: readonly [number, number, number];
}> = [
  { assetId: "astraea", positionMeters: OBSERVATORY_ASTRAEA_TECHNICAL_ART.positionMeters },
  { assetId: "pinaculo", positionMeters: OBSERVATORY_PINACULO_TECHNICAL_ART.positionMeters },
  { assetId: "sound-lab", positionMeters: OBSERVATORY_SOUND_LAB_TECHNICAL_ART.positionMeters },
  {
    assetId: "future-energy",
    positionMeters: OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.positionMeters,
  },
  {
    assetId: "electronics-ai-module",
    positionMeters: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.positionMeters,
  },
];

const CLEARANCE_MARGIN_METERS = 0.25;

function planDistance(a: readonly [number, number, number], b: readonly [number, number, number]) {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

function planRadius(scaleMeters: readonly [number, number, number]) {
  return Math.max(scaleMeters[0], scaleMeters[2]) / 2;
}

test("floor instruments keep their footprints clear of the activated focal guide", () => {
  const model = createObservatoryRobotModel("full");

  try {
    const presentation = resolveRobotPresentation(model.scene, [...model.animations]);
    assert.notEqual(presentation, null);

    const robotRadius = planRadius(getObservatoryAsset("robot-guide").scaleMeters);
    const robotCenter = presentation!.position;
    const handTarget = OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters;

    for (const instrument of FLOOR_INSTRUMENTS) {
      const instrumentRadius = planRadius(getObservatoryAsset(instrument.assetId).scaleMeters);
      const requiredBodyClearance = robotRadius + instrumentRadius + CLEARANCE_MARGIN_METERS;
      const bodyDistance = planDistance(robotCenter, instrument.positionMeters);
      assert.equal(
        bodyDistance >= requiredBodyClearance,
        true,
        `${instrument.assetId} footprint reaches the focal guide body: ` +
          `${bodyDistance.toFixed(2)}m < ${requiredBodyClearance.toFixed(2)}m`,
      );

      const requiredHandClearance = instrumentRadius + CLEARANCE_MARGIN_METERS;
      const handDistance = planDistance(handTarget, instrument.positionMeters);
      assert.equal(
        handDistance >= requiredHandClearance,
        true,
        `${instrument.assetId} footprint reaches the approved hand-water contact: ` +
          `${handDistance.toFixed(2)}m < ${requiredHandClearance.toFixed(2)}m`,
      );
    }
  } finally {
    model.dispose();
  }
});

test("artifact focus cameras stay inside the room or look through the open front", () => {
  const roomRadius = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.dimensionsMeters.roomRadius;
  const wallArc = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.openArc;
  const wallEnd = wallArc.start + wallArc.length;
  const openingBoundaryMarginRadians = 0.06;

  for (const viewId of ["astraea", "future-energy", "electronics-ai"] as const) {
    const [cameraX, , cameraZ] = CAMERA_VIEWS[viewId].position;
    const cameraRadius = Math.hypot(cameraX, cameraZ);
    const cameraAngle = (Math.atan2(cameraX, cameraZ) + Math.PI * 2) % (Math.PI * 2);
    const safelyInsideRoom = cameraRadius <= roomRadius - 0.25;
    const safelyInsideOpening =
      cameraAngle <= wallArc.start - openingBoundaryMarginRadians ||
      cameraAngle >= wallEnd + openingBoundaryMarginRadians;

    assert.equal(
      safelyInsideRoom || safelyInsideOpening,
      true,
      `${viewId} focus camera sits outside the room behind the plaster wall instead of the open front`,
    );
  }
});
