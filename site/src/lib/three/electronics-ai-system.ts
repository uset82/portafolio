import { naturalPalette } from "@/styles/palette";

import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";

type Vector3Tuple = readonly [number, number, number];

export type ElectronicsAiMechanismPose = {
  controlRotation: number;
  servicePanelLift: number;
  indicatorLift: number;
};

export const ELECTRONICS_AI_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type ElectronicsAiPresentationTier = (typeof ELECTRONICS_AI_PRESENTATION_TIERS)[number];

export type ElectronicsAiPresentation = {
  tier: ElectronicsAiPresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type ElectronicsAiDiagnosticsPhase =
  "poster" | "reduced" | "animating" | "settled" | "paused";

export type ElectronicsAiAlignmentDiagnostics = Readonly<{
  settled: boolean;
  progressError: number;
  controlErrorRadians: number;
  servicePanelErrorMeters: number;
  indicatorErrorMeters: number;
}>;

export type ElectronicsAiDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: ElectronicsAiPresentation;
  phase: ElectronicsAiDiagnosticsPhase;
  selected: boolean;
  progress: number | null;
  targetProgress: 0 | 1 | null;
  currentPose: ElectronicsAiMechanismPose | null;
  targetPose: ElectronicsAiMechanismPose | null;
  alignment: ElectronicsAiAlignmentDiagnostics | null;
  conceptContract: typeof ELECTRONICS_AI_MODULE_CONTRACT;
}>;

export type ElectronicsAiDiagnostics = Readonly<{
  capture: () => ElectronicsAiDiagnosticsSnapshot;
}>;

const electronicsAsset = getObservatoryAsset("electronics-ai-module");

export const ELECTRONICS_AI_MODULE_CONTRACT = {
  role: "conceptual-modular-electronics-enclosure",
  functioningHardwareClaim: false,
  aiInferenceClaim: false,
  liveDataClaim: false,
  statusWindow: "blank-non-emissive-mechanical-indicator",
  protectedModules: true,
  rapidFlashing: false,
} as const;

export const OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART = {
  visualThesis:
    "A compact horizontal walnut and graphite chassis protects modular sage boards behind an aged-pewter grille, with tactile controls, cable sockets, cooling ribs, and one blank mechanical status window.",
  contentJob:
    "Represent the electronics and AI thread as a Laboratory concept without presenting a functioning computer, proprietary board, trained model, live data, or performance result.",
  interactionThesis:
    "Selection rotates one tactile control, raises the service lid slightly, and lifts a non-emissive status flag once; the cue never blinks, pulses, or loops.",
  assetStrategy: "runtime-authored-procedural-geometry",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: electronicsAsset.scaleMeters,
  positionMeters: [-3.6, 0.02, -0.8] as Vector3Tuple,
  rotationRadians: [0, 0.08, 0] as Vector3Tuple,
  interactionNodeName: "ElectronicsInteraction",
  interactionTargetId: electronicsAsset.interaction!.targetId,
  accessibleLabel: electronicsAsset.interaction!.accessibleLabel,
  href: electronicsAsset.interaction!.href!,
  focusDurationMs: 700,
  maximumAnimatedFps: 24,
  colors: {
    walnut: naturalPalette.walnut,
    pewter: naturalPalette.pewter,
    graphite: naturalPalette.deepEspresso,
    circuitGreen: naturalPalette.moss,
    indicator: naturalPalette.clay,
  },
  controls: {
    fullBoards: 3,
    reducedBoards: 2,
    fullGrilleBars: 14,
    reducedGrilleBars: 8,
    fullCoolingRibs: 8,
    reducedCoolingRibs: 4,
    cableSockets: 4,
  },
  tiers: {
    full: {
      maximumTriangles: 6_200,
      maximumDrawCalls: 20,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    reduced: {
      maximumTriangles: 2_600,
      maximumDrawCalls: 15,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    poster: {
      maximumTriangles: 0,
      maximumDrawCalls: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
  },
  prohibitedClaims: [
    "functioning-ai-hardware",
    "trained-model",
    "live-inference",
    "processing-speed-or-power-metric",
    "certified-electrical-device",
  ],
  prohibitedDetails: [
    "proprietary-board-or-device-copy",
    "logos-or-pseudo-writing",
    "live-data-screen",
    "exposed-hazardous-mains",
    "cable-clutter",
    "blinking-indicator-wall",
    "neon-emission",
  ],
} as const;

export const ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES = {
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

export function resolveElectronicsAiMechanismPose(
  focusProgress: number,
): ElectronicsAiMechanismPose {
  const focus = easeInOutCubic(focusProgress);
  return {
    controlRotation: focus * (Math.PI / 6),
    servicePanelLift: focus * 0.055,
    indicatorLift: focus * 0.045,
  };
}

function cloneFinitePose(
  pose: ElectronicsAiMechanismPose | null,
): ElectronicsAiMechanismPose | null {
  if (
    !pose ||
    !Number.isFinite(pose.controlRotation) ||
    !Number.isFinite(pose.servicePanelLift) ||
    !Number.isFinite(pose.indicatorLift)
  ) {
    return null;
  }

  return { ...pose };
}

export function captureElectronicsAiDiagnostics({
  presentation,
  selected,
  progress,
  targetProgress,
  pose,
}: {
  presentation: ElectronicsAiPresentation;
  selected: boolean;
  progress: number;
  targetProgress: number;
  pose: ElectronicsAiMechanismPose | null;
}): ElectronicsAiDiagnosticsSnapshot {
  const conceptContract = { ...ELECTRONICS_AI_MODULE_CONTRACT };

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
      conceptContract,
    };
  }

  const safeProgress = Number.isFinite(progress) ? clamp01(progress) : null;
  const safeTargetProgress = targetProgress === 0 || targetProgress === 1 ? targetProgress : null;
  const currentPose = cloneFinitePose(pose);
  const targetPose =
    safeTargetProgress === null ? null : resolveElectronicsAiMechanismPose(safeTargetProgress);
  const alignment =
    safeProgress === null || safeTargetProgress === null || !currentPose || !targetPose
      ? null
      : (() => {
          const progressError = Math.abs(safeProgress - safeTargetProgress);
          const controlErrorRadians = Math.abs(
            currentPose.controlRotation - targetPose.controlRotation,
          );
          const servicePanelErrorMeters = Math.abs(
            currentPose.servicePanelLift - targetPose.servicePanelLift,
          );
          const indicatorErrorMeters = Math.abs(
            currentPose.indicatorLift - targetPose.indicatorLift,
          );

          return {
            settled:
              progressError <= ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.progress &&
              controlErrorRadians <= ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.rotationRadians &&
              servicePanelErrorMeters <= ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters &&
              indicatorErrorMeters <= ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters,
            progressError,
            controlErrorRadians,
            servicePanelErrorMeters,
            indicatorErrorMeters,
          };
        })();
  const phase: ElectronicsAiDiagnosticsPhase =
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
    conceptContract,
  };
}

export function resolveElectronicsAiPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): ElectronicsAiPresentation {
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
