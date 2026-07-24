import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";
import { naturalPalette } from "@/styles/palette";

type Vector3Tuple = readonly [number, number, number];

const pinaculoAsset = getObservatoryAsset("pinaculo");

export const PINACULO_POSITION_COUNT = 24;
export const PINACULO_MASTER_PATTERN_STATIONS = [
  { reference: 11, markerIndices: [2, 3], groovesPerMarker: 1 },
  { reference: 22, markerIndices: [10, 11], groovesPerMarker: 2 },
  { reference: 33, markerIndices: [18, 19], groovesPerMarker: 3 },
] as const;
export const PINACULO_MASTER_GROOVE_COUNT = PINACULO_MASTER_PATTERN_STATIONS.reduce(
  (total, station) => total + station.markerIndices.length * station.groovesPerMarker,
  0,
);

export const PINACULO_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type PinaculoPresentationTier = (typeof PINACULO_PRESENTATION_TIERS)[number];

export type PinaculoPresentation = {
  tier: PinaculoPresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type PinaculoMechanismPose = {
  carrierRotation: number;
  latchLift: number;
};

export type PinaculoDiagnosticsPhase = "poster" | "reduced" | "animating" | "settled" | "paused";

export type PinaculoAlignmentDiagnostics = Readonly<{
  settled: boolean;
  progressError: number;
  carrierErrorRadians: number;
  latchErrorMeters: number;
}>;

export type PinaculoDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: PinaculoPresentation;
  phase: PinaculoDiagnosticsPhase;
  selected: boolean;
  positionCount: typeof PINACULO_POSITION_COUNT;
  onePositionRadians: number;
  progress: number | null;
  targetProgress: 0 | 1 | null;
  currentPositionOffset: number | null;
  targetPositionOffset: 0 | 1 | null;
  currentPose: PinaculoMechanismPose | null;
  targetPose: PinaculoMechanismPose | null;
  alignment: PinaculoAlignmentDiagnostics | null;
}>;

export type PinaculoDiagnostics = Readonly<{
  capture: () => PinaculoDiagnosticsSnapshot;
}>;

const ONE_POSITION_RADIANS = (Math.PI * 2) / PINACULO_POSITION_COUNT;

export const PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES = {
  progress: 0.001,
  carrierRadians: 0.001,
  latchMeters: 0.0005,
} as const;

export const OBSERVATORY_PINACULO_TECHNICAL_ART = {
  visualThesis:
    "A low walnut-and-clay tabletop instrument uses one exact marker track, shallow construction grooves, and a fixed mechanical latch instead of an occult or glowing dial.",
  contentJob:
    "Identify PINÁCULO as the held numerological-pattern concept and provide its internal project route without implying predictive, scientific, or divination capability.",
  interactionThesis:
    "Selection advances the carrier by exactly one of twenty-four positions and lifts the fixed latch; paired one-, two-, and three-groove stations reference 11, 22, and 33 without drawing numerals or glyphs in 3D.",
  assetStrategy: "runtime-authored-instanced-procedural-geometry",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: pinaculoAsset.scaleMeters,
  positionMeters: [0.8, 0.02, 1.8] as Vector3Tuple,
  rotationRadians: [0, -0.08, 0] as Vector3Tuple,
  interactionTargetId: pinaculoAsset.interaction!.targetId,
  accessibleLabel: pinaculoAsset.interaction!.accessibleLabel,
  href: pinaculoAsset.interaction!.href!,
  focusDurationMs: 700,
  maximumAnimatedFps: 24,
  positionCount: PINACULO_POSITION_COUNT,
  onePositionRadians: ONE_POSITION_RADIANS,
  masterPatternStations: PINACULO_MASTER_PATTERN_STATIONS,
  colors: {
    walnut: naturalPalette.walnut,
    clay: naturalPalette.clay,
    buff: naturalPalette.buff,
    espresso: naturalPalette.espresso,
  },
  tiers: {
    full: {
      constructionRingCount: 3,
      markerCount: PINACULO_POSITION_COUNT,
      markerGrooveCount: PINACULO_MASTER_GROOVE_COUNT,
      maximumTriangles: 5_600,
      maximumDrawCalls: 12,
      materials: 4,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    reduced: {
      constructionRingCount: 2,
      markerCount: PINACULO_POSITION_COUNT,
      markerGrooveCount: PINACULO_MASTER_GROOVE_COUNT,
      maximumTriangles: 2_400,
      maximumDrawCalls: 11,
      materials: 4,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    poster: {
      constructionRingCount: 0,
      markerCount: 0,
      markerGrooveCount: 0,
      maximumTriangles: 0,
      maximumDrawCalls: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
  },
  prohibitedDetails: [
    "drawn-numerals-or-glyphs",
    "pseudo-writing",
    "divination-or-predictive-claims",
    "glowing-runes",
    "magical-effects",
    "loose-untracked-markers",
  ],
} as const;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeInOutCubic(value: number) {
  const progress = clamp01(value);
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function resolvePinaculoMechanismPose(focusProgress: number): PinaculoMechanismPose {
  const progress = easeInOutCubic(focusProgress);
  return {
    carrierRotation: ONE_POSITION_RADIANS * progress,
    latchLift: 0.065 * progress,
  };
}

function cloneFinitePose(pose: PinaculoMechanismPose | null): PinaculoMechanismPose | null {
  if (!pose || !Number.isFinite(pose.carrierRotation) || !Number.isFinite(pose.latchLift)) {
    return null;
  }

  return { ...pose };
}

export function capturePinaculoDiagnostics({
  presentation,
  selected,
  progress,
  targetProgress,
  pose,
}: {
  presentation: PinaculoPresentation;
  selected: boolean;
  progress: number;
  targetProgress: number;
  pose: PinaculoMechanismPose | null;
}): PinaculoDiagnosticsSnapshot {
  if (presentation.tier === "poster") {
    return {
      version: 1,
      presentation: { ...presentation },
      phase: "poster",
      selected,
      positionCount: PINACULO_POSITION_COUNT,
      onePositionRadians: ONE_POSITION_RADIANS,
      progress: null,
      targetProgress: null,
      currentPositionOffset: null,
      targetPositionOffset: null,
      currentPose: null,
      targetPose: null,
      alignment: null,
    };
  }

  const safeProgress = Number.isFinite(progress) ? clamp01(progress) : null;
  const safeTargetProgress = targetProgress === 0 || targetProgress === 1 ? targetProgress : null;
  const currentPose = cloneFinitePose(pose);
  const targetPose =
    safeTargetProgress === null ? null : resolvePinaculoMechanismPose(safeTargetProgress);
  const alignment =
    safeProgress === null || safeTargetProgress === null || !currentPose || !targetPose
      ? null
      : (() => {
          const progressError = Math.abs(safeProgress - safeTargetProgress);
          const carrierErrorRadians = Math.abs(
            currentPose.carrierRotation - targetPose.carrierRotation,
          );
          const latchErrorMeters = Math.abs(currentPose.latchLift - targetPose.latchLift);

          return {
            settled:
              progressError <= PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.progress &&
              carrierErrorRadians <= PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.carrierRadians &&
              latchErrorMeters <= PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.latchMeters,
            progressError,
            carrierErrorRadians,
            latchErrorMeters,
          };
        })();
  const phase: PinaculoDiagnosticsPhase =
    presentation.tier === "reduced"
      ? "reduced"
      : !presentation.animated
        ? "paused"
        : alignment?.settled
          ? "settled"
          : "animating";

  return {
    version: 1,
    presentation: { ...presentation },
    phase,
    selected,
    positionCount: PINACULO_POSITION_COUNT,
    onePositionRadians: ONE_POSITION_RADIANS,
    progress: safeProgress,
    targetProgress: safeTargetProgress,
    currentPositionOffset: currentPose ? currentPose.carrierRotation / ONE_POSITION_RADIANS : null,
    targetPositionOffset: safeTargetProgress,
    currentPose,
    targetPose,
    alignment,
  };
}

export function resolvePinaculoPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): PinaculoPresentation {
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
