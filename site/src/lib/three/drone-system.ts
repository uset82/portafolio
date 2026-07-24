import { naturalPalette } from "@/styles/palette";

import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";

type Vector3Tuple = readonly [number, number, number];

export type DroneAmbientPose = {
  offsetMeters: Vector3Tuple;
  rotationRadians: Vector3Tuple;
  rotorRotationRadians: number;
  active: boolean;
};

export const DRONE_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type DronePresentationTier = (typeof DRONE_PRESENTATION_TIERS)[number];

export type DronePresentation = {
  tier: DronePresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type DroneSafetyInspection = {
  withinHoverCorridor: boolean;
  withinRoofClearance: boolean;
  clearOfRobotSilhouette: boolean;
  withinAttitudeLimits: boolean;
  safe: boolean;
};

export type DroneDiagnosticsPhase = "poster" | "reduced" | "active" | "rest" | "paused";

export type DroneSafetyDiagnostics = Readonly<{
  inspection: DroneSafetyInspection;
  corridorMarginMeters: number;
  roofClearanceMeters: number;
  minimumRequiredRoofClearanceMeters: number;
  robotDistanceMeters: number;
  robotClearanceMeters: number;
  attitudeMarginRadians: number;
}>;

export type DroneDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: DronePresentation;
  phase: DroneDiagnosticsPhase;
  elapsedSeconds: number;
  pose: DroneAmbientPose | null;
  worldPositionMeters: Vector3Tuple | null;
  safety: DroneSafetyDiagnostics | null;
}>;

export type DroneDiagnostics = Readonly<{
  capture: () => DroneDiagnosticsSnapshot;
}>;

const droneAsset = getObservatoryAsset("drone");

export const OBSERVATORY_DRONE_TECHNICAL_ART = {
  visualThesis:
    "A compact off-white camera body, four diagonal pewter arms, and four protected rotor rings form a quiet aerial-systems concept above the Observatory workbench.",
  contentJob:
    "Identify Aerial systems as an experimental Laboratory direction without implying autonomous flight, measured performance, production hardware, or a fidelity-grade reconstruction.",
  interactionThesis:
    "A sparse four-second stabilization cycle gently adjusts altitude and attitude before resting for eight seconds; selection remains a semantic focus cue only.",
  assetStrategy: "runtime-authored-procedural-reference-informed-concept",
  fidelityClaim: "stylized-approximation-only",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: droneAsset.scaleMeters,
  positionMeters: [4.6, 4.24, -0.35] as Vector3Tuple,
  rotationRadians: [0, -0.28, 0] as Vector3Tuple,
  screenAnchorNormalized: [0.72, 0.18] as const,
  interactionTargetId: droneAsset.interaction!.targetId,
  accessibleLabel: droneAsset.interaction!.accessibleLabel,
  href: droneAsset.interaction!.href!,
  maximumAnimatedFps: 12,
  motion: {
    activeSeconds: 4,
    restSeconds: 8,
    cycleSeconds: 12,
    maximumVerticalOffsetMeters: 0.06,
    maximumLateralOffsetMeters: 0.04,
    maximumLongitudinalOffsetMeters: 0.03,
    maximumRollRadians: (1.3 * Math.PI) / 180,
    maximumPitchRadians: (0.75 * Math.PI) / 180,
    maximumYawRadians: (0.5 * Math.PI) / 180,
  },
  safety: {
    roomRoofMeters: 5.04,
    minimumRoofClearanceMeters: 0.25,
    modelHalfHeightMeters: droneAsset.scaleMeters[1] / 2,
    hoverCorridor: {
      min: [4.54, 4.16, -0.4] as Vector3Tuple,
      max: [4.66, 4.32, -0.3] as Vector3Tuple,
    },
    robotExclusionSphere: {
      center: [1.4, 1.05, 0] as Vector3Tuple,
      radiusMeters: 2.4,
    },
  },
  colors: {
    ceramic: naturalPalette.offWhite,
    ceramicShadow: naturalPalette.stone,
    pewter: naturalPalette.pewter,
    joint: naturalPalette.espresso,
    cameraGlass: naturalPalette.waterSlate,
  },
  tiers: {
    full: {
      maximumTriangles: 9_000,
      maximumDrawCalls: 18,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      bodySegments: 28,
      guardSegments: 32,
      fasteners: 8,
    },
    reduced: {
      maximumTriangles: 3_800,
      maximumDrawCalls: 15,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      bodySegments: 16,
      guardSegments: 18,
      fasteners: 4,
    },
    poster: {
      maximumTriangles: 0,
      maximumDrawCalls: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      bodySegments: 0,
      guardSegments: 0,
      fasteners: 0,
    },
  },
  prohibitedClaims: [
    "autonomous-flight",
    "working-flight-controller",
    "aerodynamic-performance",
    "camera-resolution-or-range",
    "production-ready-hardware",
    "reference-fidelity-without-render-review",
  ],
  prohibitedDetails: [
    "weapons",
    "military-camouflage",
    "anthropomorphic-face",
    "exposed-dangerous-blades",
    "blue-emission",
    "neon-trails",
    "rapid-continuous-hover",
  ],
} as const;

const REST_POSE: DroneAmbientPose = {
  offsetMeters: [0, 0, 0],
  rotationRadians: [0, 0, 0],
  rotorRotationRadians: 0,
  active: false,
};

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function distanceBetween(a: Vector3Tuple, b: Vector3Tuple) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function resolveDroneWorldPosition(pose: DroneAmbientPose): Vector3Tuple {
  return OBSERVATORY_DRONE_TECHNICAL_ART.positionMeters.map(
    (value, index) => value + pose.offsetMeters[index]!,
  ) as unknown as Vector3Tuple;
}

export function resolveDroneAmbientPose(elapsedSeconds: number): DroneAmbientPose {
  if (!Number.isFinite(elapsedSeconds)) return REST_POSE;

  const { activeSeconds, cycleSeconds } = OBSERVATORY_DRONE_TECHNICAL_ART.motion;
  const cycleTime = positiveModulo(elapsedSeconds, cycleSeconds);
  if (cycleTime <= Number.EPSILON || cycleTime >= activeSeconds) return REST_POSE;

  const progress = cycleTime / activeSeconds;
  const primaryWave = Math.sin(progress * Math.PI * 2);
  const secondaryWave = Math.sin(progress * Math.PI * 4);
  const envelope = Math.sin(progress * Math.PI);
  const lateral = primaryWave * OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumLateralOffsetMeters;
  const vertical =
    secondaryWave * OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumVerticalOffsetMeters;
  const longitudinal =
    primaryWave * envelope * OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumLongitudinalOffsetMeters;

  return {
    offsetMeters: [lateral, vertical, longitudinal],
    rotationRadians: [
      -longitudinal *
        (OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumPitchRadians /
          OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumLongitudinalOffsetMeters),
      secondaryWave * OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumYawRadians,
      -lateral *
        (OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumRollRadians /
          OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumLateralOffsetMeters),
    ],
    rotorRotationRadians: progress * Math.PI * 6,
    active: true,
  };
}

export function inspectDronePoseSafety(pose: DroneAmbientPose): DroneSafetyInspection {
  const technicalArt = OBSERVATORY_DRONE_TECHNICAL_ART;
  const worldPosition = resolveDroneWorldPosition(pose);
  const { min, max } = technicalArt.safety.hoverCorridor;
  const withinHoverCorridor = worldPosition.every(
    (value, index) => value >= min[index]! - 1e-9 && value <= max[index]! + 1e-9,
  );
  const withinRoofClearance =
    worldPosition[1] +
      technicalArt.safety.modelHalfHeightMeters +
      technicalArt.safety.minimumRoofClearanceMeters <=
    technicalArt.safety.roomRoofMeters;
  const clearOfRobotSilhouette =
    distanceBetween(worldPosition, technicalArt.safety.robotExclusionSphere.center) >=
    technicalArt.safety.robotExclusionSphere.radiusMeters;
  const withinAttitudeLimits =
    Math.abs(pose.rotationRadians[0]) <= technicalArt.motion.maximumPitchRadians + 1e-9 &&
    Math.abs(pose.rotationRadians[1]) <= technicalArt.motion.maximumYawRadians + 1e-9 &&
    Math.abs(pose.rotationRadians[2]) <= technicalArt.motion.maximumRollRadians + 1e-9;

  return {
    withinHoverCorridor,
    withinRoofClearance,
    clearOfRobotSilhouette,
    withinAttitudeLimits,
    safe:
      withinHoverCorridor && withinRoofClearance && clearOfRobotSilhouette && withinAttitudeLimits,
  };
}

export function captureDroneDiagnostics({
  presentation,
  elapsedSeconds,
  pose,
}: {
  presentation: DronePresentation;
  elapsedSeconds: number;
  pose: DroneAmbientPose | null;
}): DroneDiagnosticsSnapshot {
  if (presentation.tier === "poster") {
    return {
      version: 1,
      presentation: { ...presentation },
      phase: "poster",
      elapsedSeconds: 0,
      pose: null,
      worldPositionMeters: null,
      safety: null,
    };
  }

  const resolvedPose =
    presentation.tier === "reduced" || pose === null
      ? REST_POSE
      : {
          offsetMeters: [...pose.offsetMeters] as Vector3Tuple,
          rotationRadians: [...pose.rotationRadians] as Vector3Tuple,
          rotorRotationRadians: pose.rotorRotationRadians,
          active: pose.active,
        };
  const safeElapsedSeconds =
    presentation.tier === "reduced" || !Number.isFinite(elapsedSeconds)
      ? 0
      : Math.max(0, elapsedSeconds);
  const worldPositionMeters = resolveDroneWorldPosition(resolvedPose);
  const inspection = inspectDronePoseSafety(resolvedPose);
  const { hoverCorridor, roomRoofMeters, modelHalfHeightMeters, robotExclusionSphere } =
    OBSERVATORY_DRONE_TECHNICAL_ART.safety;
  const corridorMarginMeters = Math.min(
    ...worldPositionMeters.flatMap((value, index) => [
      value - hoverCorridor.min[index]!,
      hoverCorridor.max[index]! - value,
    ]),
  );
  const roofClearanceMeters = roomRoofMeters - (worldPositionMeters[1] + modelHalfHeightMeters);
  const robotDistanceMeters = distanceBetween(worldPositionMeters, robotExclusionSphere.center);
  const attitudeMarginRadians = Math.min(
    OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumPitchRadians -
      Math.abs(resolvedPose.rotationRadians[0]),
    OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumYawRadians -
      Math.abs(resolvedPose.rotationRadians[1]),
    OBSERVATORY_DRONE_TECHNICAL_ART.motion.maximumRollRadians -
      Math.abs(resolvedPose.rotationRadians[2]),
  );
  const phase: DroneDiagnosticsPhase =
    presentation.tier === "reduced"
      ? "reduced"
      : !presentation.animated
        ? "paused"
        : resolvedPose.active
          ? "active"
          : "rest";

  return {
    version: 1,
    presentation: { ...presentation },
    phase,
    elapsedSeconds: safeElapsedSeconds,
    pose: resolvedPose,
    worldPositionMeters,
    safety: {
      inspection,
      corridorMarginMeters,
      roofClearanceMeters,
      minimumRequiredRoofClearanceMeters:
        OBSERVATORY_DRONE_TECHNICAL_ART.safety.minimumRoofClearanceMeters,
      robotDistanceMeters,
      robotClearanceMeters: robotDistanceMeters - robotExclusionSphere.radiusMeters,
      attitudeMarginRadians,
    },
  };
}

export function resolveDronePresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): DronePresentation {
  if (quality === "static" || motion === "static") {
    return { tier: "poster", animated: false, settleImmediately: true };
  }
  if (quality === "reduced" || motion === "reduced" || compactViewport) {
    return { tier: "reduced", animated: false, settleImmediately: true };
  }
  if (motion === "paused") {
    return { tier: "full", animated: false, settleImmediately: false };
  }
  return { tier: "full", animated: true, settleImmediately: false };
}
