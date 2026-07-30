import { Box3, Vector3, type AnimationClip, type Object3D } from "three";

import { naturalPalette } from "@/styles/palette";

import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";

type Vector3Tuple = readonly [number, number, number];

const robotAsset = getObservatoryAsset("robot-guide");
const yAxis = new Vector3(0, 1, 0);

export const OBSERVATORY_ROBOT_TECHNICAL_ART = {
  visualThesis:
    "An off-white ceramic mechanical guide kneels at the basin as the calm focal bridge between human curiosity and the Observatory systems.",
  assetStrategy: "runtime-authored-procedural-rights-safe",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
    importedModelLocalUp: "+Y",
    importedModelLocalForward: "+Z",
  },
  transformOwnership: {
    canonical: "loaded GLTF scene and node transforms",
    presentation: "ObservatoryRobot wrapper offset, uniform scale, yaw, and translation",
  },
  targetDimensionsMeters: robotAsset.scaleMeters,
  presentationYawRadians: -0.58,
  handWaterTargetMeters: [0.42, -0.035, 0.92] as Vector3Tuple,
  focusTargetMeters: [1.4, 1.05, 0] as Vector3Tuple,
  requiredNodes: robotAsset.nodes,
  requiredClips: robotAsset.clips.filter((clip) => clip.required).map((clip) => clip.id),
  idleClipId: "idle",
  maximumAnimatedFps: 24,
  budget: {
    maximumTriangles: robotAsset.lods[0]!.maxTriangles,
    maximumMaterials: 5,
    maximumTextureDimension: 2_048,
    maximumGlbMb: 2.5,
    shadowCasters: 0,
    postPasses: 0,
  },
  /**
   * Rights-safe runtime-authored focal guide. Task 1.27 rejected Hunyuan for
   * worldwide portfolio use, so this follows the same approved provider-neutral
   * procedural route as every other Observatory artifact. It satisfies the
   * identical node/clip/bounds runtime contract as an imported model. Carlos
   * approved activating it as the U.17 rights-safe fallback on 2026-07-26; a
   * future sculpted rights-cleared GLB can replace it through the still-tested
   * model loading path without contract changes.
   */
  proceduralCandidate: {
    assetStrategy: "runtime-authored-procedural-reference-informed-candidate",
    fidelityClaim: "stylized-approximation-only",
    interactionTargetId: robotAsset.interaction!.targetId,
    accessibleLabel: robotAsset.interaction!.accessibleLabel,
    interactionAnchorMeters: [0, 0.92, -0.18] as Vector3Tuple,
    motion: {
      idleCycleSeconds: 12,
      headAcknowledgementSeconds: 1.6,
      waterContactSeconds: 2.6,
      maximumHeadYawRadians: (18 * Math.PI) / 180,
      maximumHeadPitchRadians: (10 * Math.PI) / 180,
      maximumIdleCorrectionRadians: (1.5 * Math.PI) / 180,
      maximumBreathScaleRatio: 0.008,
    },
    colors: {
      ceramic: naturalPalette.offWhite,
      ceramicShadow: naturalPalette.stone,
      armature: naturalPalette.deepWood,
      detail: naturalPalette.walnut,
    },
    tiers: {
      full: {
        maximumTriangles: robotAsset.lods[0]!.maxTriangles,
        maximumDrawCalls: 34,
        materials: 4,
        textures: 0,
        renderTargets: 0,
        postPasses: 0,
        shadowCasters: 0,
        shellSegments: 24,
        limbSegments: 12,
        contactFingers: 4,
        fasteners: 8,
      },
      reduced: {
        maximumTriangles: robotAsset.lods[2]!.maxTriangles,
        maximumDrawCalls: 32,
        materials: 4,
        textures: 0,
        renderTargets: 0,
        postPasses: 0,
        shadowCasters: 0,
        shellSegments: 14,
        limbSegments: 8,
        contactFingers: 3,
        fasteners: 4,
      },
    },
    prohibitedDetails: [
      "human-skin",
      "projected-face",
      "weapon",
      "wings",
      "extra-limbs",
      "aggressive-military-silhouette",
      "glossy-consumer-electronics-finish",
      "purposeless-exposed-cables",
      "blue-emission",
      "neon-trails",
    ],
  },
} as const;

export type RobotAssetContractResult =
  | {
      valid: true;
      size: Vector3Tuple;
      handContact: Vector3Tuple;
      interactionAnchor: Vector3Tuple;
    }
  | {
      valid: false;
      issues: readonly string[];
    };

export type RobotPresentation = {
  canonicalOffset: Vector3Tuple;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  uniformScale: number;
  handContactWorld: Vector3Tuple;
  focusTargetWorld: Vector3Tuple;
};

export type RobotDiagnosticsPhase = "active" | "paused" | "reduced" | "poster";

export type RobotDiagnosticsSnapshot = Readonly<{
  version: 1;
  phase: RobotDiagnosticsPhase;
  selected: boolean;
  contract: Readonly<{
    valid: boolean;
    issues: readonly string[];
    requiredNodes: readonly string[];
    requiredClips: readonly string[];
    canonicalSize: Vector3Tuple | null;
  }>;
  presentation: Readonly<{
    position: Vector3Tuple;
    rotation: Vector3Tuple;
    uniformScale: number;
    scaledSize: Vector3Tuple;
    handContactWorld: Vector3Tuple;
    handTargetWorld: Vector3Tuple;
    handAlignmentErrorMeters: number;
    interactionAnchorWorld: Vector3Tuple;
    focusTargetWorld: Vector3Tuple;
  }> | null;
  idle: Readonly<{
    clipId: string;
    clipAvailable: boolean;
    active: boolean;
    elapsedSeconds: number;
    durationSeconds: number | null;
    normalizedCycle: number | null;
    maximumAnimatedFps: number;
  }>;
}>;

export type RobotDiagnostics = Readonly<{
  capture: () => RobotDiagnosticsSnapshot;
}>;

function tuple(vector: Vector3): Vector3Tuple {
  return [vector.x, vector.y, vector.z];
}

function isFinitePositiveVector(vector: Vector3) {
  return [vector.x, vector.y, vector.z].every((value) => Number.isFinite(value) && value > 0.000_1);
}

function normalizeElapsedSeconds(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function transformCanonicalPoint(point: Vector3Tuple, presentation: RobotPresentation) {
  return new Vector3(...point)
    .add(new Vector3(...presentation.canonicalOffset))
    .multiplyScalar(presentation.uniformScale)
    .applyAxisAngle(yAxis, presentation.rotation[1])
    .add(new Vector3(...presentation.position));
}

export function inspectRobotAssetContract(
  root: Object3D,
  animations: readonly AnimationClip[],
): RobotAssetContractResult {
  root.updateMatrixWorld(true);
  const issues: string[] = [];
  const missingNodes = OBSERVATORY_ROBOT_TECHNICAL_ART.requiredNodes.filter(
    (nodeName) => !root.getObjectByName(nodeName),
  );
  const clipNames = new Set(animations.map((clip) => clip.name));
  const missingClips = OBSERVATORY_ROBOT_TECHNICAL_ART.requiredClips.filter(
    (clipName) => !clipNames.has(clipName),
  );
  const bounds = new Box3().setFromObject(root);
  const size = bounds.getSize(new Vector3());
  const handContact = root.getObjectByName("RobotHandContact");
  const interactionAnchor = root.getObjectByName("RobotInteraction");

  if (missingNodes.length > 0) issues.push(`Missing nodes: ${missingNodes.join(", ")}`);
  if (missingClips.length > 0) issues.push(`Missing clips: ${missingClips.join(", ")}`);
  if (bounds.isEmpty() || !isFinitePositiveVector(size)) {
    issues.push("Robot bounds must be finite and non-empty in all three axes");
  }
  if (!handContact) issues.push("RobotHandContact anchor is required");
  if (!interactionAnchor) issues.push("RobotInteraction anchor is required");

  if (issues.length > 0 || !handContact || !interactionAnchor) {
    return { valid: false, issues };
  }

  return {
    valid: true,
    size: tuple(size),
    handContact: tuple(handContact.getWorldPosition(new Vector3())),
    interactionAnchor: tuple(interactionAnchor.getWorldPosition(new Vector3())),
  };
}

export class RobotAssetContractError extends Error {
  readonly assetId = "robot-guide";
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super("The robot model does not satisfy the Observatory runtime contract.");
    this.name = "RobotAssetContractError";
    this.issues = issues;
  }
}

export function assertRobotAssetContract(asset: {
  scene: Object3D;
  animations: readonly AnimationClip[];
}) {
  const result = inspectRobotAssetContract(asset.scene, asset.animations);
  if (!result.valid) throw new RobotAssetContractError(result.issues);
  return result;
}

export function resolveRobotPresentation(
  root: Object3D,
  animations: readonly AnimationClip[],
): RobotPresentation | null {
  const inspection = inspectRobotAssetContract(root, animations);
  if (!inspection.valid) return null;

  const bounds = new Box3().setFromObject(root);
  const center = bounds.getCenter(new Vector3());
  const target = new Vector3(...OBSERVATORY_ROBOT_TECHNICAL_ART.targetDimensionsMeters);
  const size = new Vector3(...inspection.size);
  const uniformScale = Math.min(target.x / size.x, target.y / size.y, target.z / size.z);
  const canonicalOffset = new Vector3(-center.x, -bounds.min.y, -center.z);
  const normalizedHand = new Vector3(...inspection.handContact)
    .add(canonicalOffset)
    .multiplyScalar(uniformScale)
    .applyAxisAngle(yAxis, OBSERVATORY_ROBOT_TECHNICAL_ART.presentationYawRadians);
  const handTarget = new Vector3(...OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters);
  const position = handTarget.clone().sub(normalizedHand);

  return {
    canonicalOffset: tuple(canonicalOffset),
    position: tuple(position),
    rotation: [0, OBSERVATORY_ROBOT_TECHNICAL_ART.presentationYawRadians, 0],
    uniformScale,
    handContactWorld: tuple(handTarget),
    focusTargetWorld: [...OBSERVATORY_ROBOT_TECHNICAL_ART.focusTargetMeters],
  };
}

export function resolveRobotDiagnosticsPhase(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
): RobotDiagnosticsPhase {
  if (quality === "static" || motion === "static") return "poster";
  if (quality === "reduced" || motion === "reduced") return "reduced";
  if (motion === "paused") return "paused";
  return "active";
}

export function captureRobotDiagnostics({
  root,
  animations,
  quality,
  motion,
  selected,
  idleElapsedSeconds,
}: {
  root: Object3D;
  animations: readonly AnimationClip[];
  quality: SceneQualityTier;
  motion: SceneMotionMode;
  selected: boolean;
  idleElapsedSeconds: number;
}): RobotDiagnosticsSnapshot {
  const inspection = inspectRobotAssetContract(root, animations);
  const presentation = inspection.valid ? resolveRobotPresentation(root, animations) : null;
  const phase = resolveRobotDiagnosticsPhase(quality, motion);
  const idleClip =
    animations.find((clip) => clip.name === OBSERVATORY_ROBOT_TECHNICAL_ART.idleClipId) ?? null;
  const elapsedSeconds = normalizeElapsedSeconds(idleElapsedSeconds);
  const durationSeconds =
    idleClip && Number.isFinite(idleClip.duration) && idleClip.duration > 0
      ? idleClip.duration
      : null;
  const presentationDiagnostics =
    inspection.valid && presentation
      ? (() => {
          const handContactWorld = new Vector3(...presentation.handContactWorld);
          const handTargetWorld = new Vector3(
            ...OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters,
          );
          const scaledSize: Vector3Tuple = [
            inspection.size[0] * presentation.uniformScale,
            inspection.size[1] * presentation.uniformScale,
            inspection.size[2] * presentation.uniformScale,
          ];
          const handTargetWorldTuple: Vector3Tuple = [
            ...OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters,
          ];

          return {
            position: presentation.position,
            rotation: presentation.rotation,
            uniformScale: presentation.uniformScale,
            scaledSize,
            handContactWorld: presentation.handContactWorld,
            handTargetWorld: handTargetWorldTuple,
            handAlignmentErrorMeters: handContactWorld.distanceTo(handTargetWorld),
            interactionAnchorWorld: tuple(
              transformCanonicalPoint(inspection.interactionAnchor, presentation),
            ),
            focusTargetWorld: presentation.focusTargetWorld,
          };
        })()
      : null;

  return {
    version: 1,
    phase,
    selected,
    contract: {
      valid: inspection.valid,
      issues: inspection.valid ? [] : inspection.issues,
      requiredNodes: OBSERVATORY_ROBOT_TECHNICAL_ART.requiredNodes,
      requiredClips: OBSERVATORY_ROBOT_TECHNICAL_ART.requiredClips,
      canonicalSize: inspection.valid ? inspection.size : null,
    },
    presentation: presentationDiagnostics,
    idle: {
      clipId: OBSERVATORY_ROBOT_TECHNICAL_ART.idleClipId,
      clipAvailable: idleClip !== null,
      active: inspection.valid && presentation !== null && phase === "active" && idleClip !== null,
      elapsedSeconds,
      durationSeconds,
      normalizedCycle: durationSeconds
        ? (elapsedSeconds % durationSeconds) / durationSeconds
        : null,
      maximumAnimatedFps: OBSERVATORY_ROBOT_TECHNICAL_ART.maximumAnimatedFps,
    },
  };
}
