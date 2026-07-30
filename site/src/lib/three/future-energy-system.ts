import { naturalPalette } from "@/styles/palette";

import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";

type Vector3Tuple = readonly [number, number, number];

export type FutureEnergyMechanismPose = {
  sagePumpRotation: number;
  teaPumpRotation: number;
  sageSurfaceTilt: number;
  teaSurfaceTilt: number;
  serviceLatchLift: number;
};

export const FUTURE_ENERGY_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type FutureEnergyPresentationTier = (typeof FUTURE_ENERGY_PRESENTATION_TIERS)[number];

export type FutureEnergyPresentation = {
  tier: FutureEnergyPresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type FutureEnergyDiagnosticsPhase =
  "poster" | "reduced" | "animating" | "settled" | "paused";

export type FutureEnergyAlignmentDiagnostics = Readonly<{
  settled: boolean;
  progressError: number;
  sagePumpErrorRadians: number;
  teaPumpErrorRadians: number;
  sageSurfaceErrorRadians: number;
  teaSurfaceErrorRadians: number;
  serviceLatchErrorMeters: number;
}>;

export type FutureEnergyCircuitDiagnostics = Readonly<{
  circuitCount: number;
  allClosed: boolean;
  independent: boolean;
  crossConnectionCount: number;
  distinctReservoirCount: number;
  distinctPumpCount: number;
  distinctStackPortCount: number;
}>;

export type FutureEnergyDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: FutureEnergyPresentation;
  phase: FutureEnergyDiagnosticsPhase;
  selected: boolean;
  progress: number | null;
  targetProgress: 0 | 1 | null;
  currentPose: FutureEnergyMechanismPose | null;
  targetPose: FutureEnergyMechanismPose | null;
  alignment: FutureEnergyAlignmentDiagnostics | null;
  circuits: FutureEnergyCircuitDiagnostics;
}>;

export type FutureEnergyDiagnostics = Readonly<{
  capture: () => FutureEnergyDiagnosticsSnapshot;
}>;

const futureEnergyAsset = getObservatoryAsset("future-energy");

/**
 * The two circuits share a cell-stack enclosure but never connect to one
 * another. Their paths are intentionally semantic as well as renderable so
 * the concept cannot accidentally become one physically misleading loop.
 */
export const FLOW_BATTERY_CIRCUITS = [
  {
    id: "sage-loop",
    liquidRole: "sage-mineral",
    reservoirNode: "FutureEnergySageReservoir",
    pumpNode: "FutureEnergySagePump",
    stackPortNode: "FutureEnergyStackLeftPort",
    closed: true,
    connectsToCircuitIds: [] as const,
    pathMeters: [
      [-0.72, 0.66, 0.43],
      [-0.5, 0.48, 0.51],
      [-0.2, 0.72, 0.43],
      [-0.2, 1.61, 0.43],
      [-0.72, 1.88, 0.4],
      [-0.92, 1.3, 0.18],
    ] as readonly Vector3Tuple[],
  },
  {
    id: "tea-loop",
    liquidRole: "tea-brown",
    reservoirNode: "FutureEnergyTeaReservoir",
    pumpNode: "FutureEnergyTeaPump",
    stackPortNode: "FutureEnergyStackRightPort",
    closed: true,
    connectsToCircuitIds: [] as const,
    pathMeters: [
      [0.72, 0.66, 0.43],
      [0.5, 0.48, 0.51],
      [0.2, 0.72, 0.43],
      [0.2, 1.61, 0.43],
      [0.72, 1.88, 0.4],
      [0.92, 1.3, 0.18],
    ] as readonly Vector3Tuple[],
  },
] as const;

export const OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART = {
  visualThesis:
    "Two guarded glass reservoirs sit on a low walnut and aged-pewter base, each owning one legible closed pipe circuit through a separate side of a shared central stack.",
  contentJob:
    "Identify Future Energy as an approved visual and navigational concept, link to its held case-study route, and avoid implying a built battery, chemistry, pressure rating, or measured performance.",
  interactionThesis:
    "Selection turns the two pump faces in opposite directions, gently tilts both liquid surfaces, and lifts one service latch as a bounded diagrammatic focus cue rather than a live operating simulation.",
  assetStrategy: "runtime-authored-procedural-geometry",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: futureEnergyAsset.scaleMeters,
  positionMeters: [0.2, 0.02, -2.8] as Vector3Tuple,
  rotationRadians: [0, -0.04, 0] as Vector3Tuple,
  interactionNodeName: "FutureEnergyInteraction",
  interactionTargetId: futureEnergyAsset.interaction!.targetId,
  accessibleLabel: futureEnergyAsset.interaction!.accessibleLabel,
  href: futureEnergyAsset.interaction!.href!,
  focusDurationMs: 760,
  maximumAnimatedFps: 24,
  circuits: {
    count: FLOW_BATTERY_CIRCUITS.length,
    independent: true,
    sharedStackSeparatePorts: true,
  },
  colors: {
    walnut: naturalPalette.walnut,
    pewter: naturalPalette.pewter,
    glass: naturalPalette.silver,
    sageLiquid: naturalPalette.mutedSage,
    teaLiquid: naturalPalette.warmTaupe,
  },
  tiers: {
    full: {
      maximumTriangles: 8_200,
      maximumDrawCalls: 22,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      guardPosts: 8,
      stackPlates: 7,
    },
    reduced: {
      maximumTriangles: 3_600,
      maximumDrawCalls: 17,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      guardPosts: 4,
      stackPlates: 4,
    },
    poster: {
      maximumTriangles: 0,
      maximumDrawCalls: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      guardPosts: 0,
      stackPlates: 0,
    },
  },
  prohibitedClaims: [
    "working-or-certified-battery",
    "specific-chemistry",
    "pressure-rating",
    "capacity-or-efficiency-metric",
    "continuous-fluid-simulation",
    "cross-connected-electrolyte-loops",
  ],
  prohibitedDetails: [
    "oil-branding",
    "exposed-pressure-unsafe-glass",
    "impossible-pipe-termination",
    "medical-styling",
    "emissive-fantasy-liquid",
    "blue-glow",
    "pseudo-scientific-labels",
  ],
} as const;

export const FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES = {
  progress: 0.001,
  rotationRadians: 0.001,
  motionMeters: 0.0005,
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

export function resolveFutureEnergyMechanismPose(focusProgress: number): FutureEnergyMechanismPose {
  const focus = easeInOutCubic(focusProgress);
  return {
    sagePumpRotation: focus * (Math.PI / 3),
    teaPumpRotation: focus * (-Math.PI / 3),
    sageSurfaceTilt: focus * 0.028,
    teaSurfaceTilt: focus * -0.028,
    serviceLatchLift: focus * 0.065,
  };
}

function cloneFinitePose(pose: FutureEnergyMechanismPose | null): FutureEnergyMechanismPose | null {
  if (
    !pose ||
    !Number.isFinite(pose.sagePumpRotation) ||
    !Number.isFinite(pose.teaPumpRotation) ||
    !Number.isFinite(pose.sageSurfaceTilt) ||
    !Number.isFinite(pose.teaSurfaceTilt) ||
    !Number.isFinite(pose.serviceLatchLift)
  ) {
    return null;
  }

  return { ...pose };
}

function captureFutureEnergyCircuitDiagnostics(): FutureEnergyCircuitDiagnostics {
  return {
    circuitCount: FLOW_BATTERY_CIRCUITS.length,
    allClosed: FLOW_BATTERY_CIRCUITS.every((circuit) => circuit.closed),
    independent: OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.circuits.independent,
    crossConnectionCount: FLOW_BATTERY_CIRCUITS.reduce(
      (count, circuit) => count + circuit.connectsToCircuitIds.length,
      0,
    ),
    distinctReservoirCount: new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.reservoirNode))
      .size,
    distinctPumpCount: new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.pumpNode)).size,
    distinctStackPortCount: new Set(FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.stackPortNode))
      .size,
  };
}

export function captureFutureEnergyDiagnostics({
  presentation,
  selected,
  progress,
  targetProgress,
  pose,
}: {
  presentation: FutureEnergyPresentation;
  selected: boolean;
  progress: number;
  targetProgress: number;
  pose: FutureEnergyMechanismPose | null;
}): FutureEnergyDiagnosticsSnapshot {
  const circuits = captureFutureEnergyCircuitDiagnostics();

  if (presentation.tier === "poster") {
    return {
      version: 1,
      presentation: { ...presentation },
      phase: "poster",
      selected,
      progress: null,
      targetProgress: null,
      currentPose: null,
      targetPose: null,
      alignment: null,
      circuits,
    };
  }

  const safeProgress = Number.isFinite(progress) ? clamp01(progress) : null;
  const safeTargetProgress = targetProgress === 0 || targetProgress === 1 ? targetProgress : null;
  const currentPose = cloneFinitePose(pose);
  const targetPose =
    safeTargetProgress === null ? null : resolveFutureEnergyMechanismPose(safeTargetProgress);
  const alignment =
    safeProgress === null || safeTargetProgress === null || !currentPose || !targetPose
      ? null
      : (() => {
          const progressError = Math.abs(safeProgress - safeTargetProgress);
          const sagePumpErrorRadians = Math.abs(
            currentPose.sagePumpRotation - targetPose.sagePumpRotation,
          );
          const teaPumpErrorRadians = Math.abs(
            currentPose.teaPumpRotation - targetPose.teaPumpRotation,
          );
          const sageSurfaceErrorRadians = Math.abs(
            currentPose.sageSurfaceTilt - targetPose.sageSurfaceTilt,
          );
          const teaSurfaceErrorRadians = Math.abs(
            currentPose.teaSurfaceTilt - targetPose.teaSurfaceTilt,
          );
          const serviceLatchErrorMeters = Math.abs(
            currentPose.serviceLatchLift - targetPose.serviceLatchLift,
          );

          return {
            settled:
              progressError <= FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES.progress &&
              Math.max(
                sagePumpErrorRadians,
                teaPumpErrorRadians,
                sageSurfaceErrorRadians,
                teaSurfaceErrorRadians,
              ) <= FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES.rotationRadians &&
              serviceLatchErrorMeters <= FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters,
            progressError,
            sagePumpErrorRadians,
            teaPumpErrorRadians,
            sageSurfaceErrorRadians,
            teaSurfaceErrorRadians,
            serviceLatchErrorMeters,
          };
        })();
  const phase: FutureEnergyDiagnosticsPhase =
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
    progress: safeProgress,
    targetProgress: safeTargetProgress,
    currentPose,
    targetPose,
    alignment,
    circuits,
  };
}

export function resolveFutureEnergyPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): FutureEnergyPresentation {
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
