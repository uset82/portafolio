import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";
import { getObservatoryAsset } from "./asset-registry";
import { threeMaterialPalette } from "@/styles/palette";

type Vector3Tuple = readonly [number, number, number];

const astraeaAsset = getObservatoryAsset("astraea");

export const ASTRAEA_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type AstraeaPresentationTier = (typeof ASTRAEA_PRESENTATION_TIERS)[number];

export type AstraeaPresentation = {
  tier: AstraeaPresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type AstraeaRingPose = {
  outer: number;
  middle: number;
  inner: number;
  pointerLift: number;
};

export type AstraeaDiagnosticsPhase = "poster" | "reduced" | "animating" | "settled" | "paused";

export type AstraeaAlignmentDiagnostics = Readonly<{
  settled: boolean;
  progressError: number;
  ringErrorsRadians: Readonly<{
    outer: number;
    middle: number;
    inner: number;
  }>;
  maximumRingErrorRadians: number;
  pointerErrorMeters: number;
}>;

export type AstraeaDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: AstraeaPresentation;
  phase: AstraeaDiagnosticsPhase;
  selected: boolean;
  progress: number | null;
  targetProgress: 0 | 1 | null;
  currentPose: AstraeaRingPose | null;
  targetPose: AstraeaRingPose | null;
  alignment: AstraeaAlignmentDiagnostics | null;
}>;

export type AstraeaDiagnostics = Readonly<{
  capture: () => AstraeaDiagnosticsSnapshot;
}>;

const REST_POSE = {
  outer: -0.22,
  middle: 0.38,
  inner: -0.5,
  pointerLift: 0,
} as const satisfies AstraeaRingPose;

const FOCUS_POSE = {
  outer: 0.18,
  middle: -0.12,
  inner: 0.14,
  pointerLift: 0.075,
} as const satisfies AstraeaRingPose;

export const ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES = {
  progress: 0.001,
  ringRadians: 0.001,
  pointerMeters: 0.0005,
} as const;

export const OBSERVATORY_ASTRAEA_TECHNICAL_ART = {
  visualThesis:
    "A compact celestial chart instrument layers aged pewter rings over parchment ceramic and a walnut support, reading as measured machinery rather than a glowing portal.",
  contentJob:
    "Identify ASTRAEA as the held celestial-pattern concept and provide a direct route to its evidence-limited project page without implying a shipped scientific product.",
  interactionThesis:
    "Selection aligns three marked rings and lifts one sage pointer during the existing camera focus; reduced motion resolves the same state immediately, while poster mode keeps the project link authoritative.",
  assetStrategy: "runtime-authored-procedural-geometry",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: astraeaAsset.scaleMeters,
  positionMeters: [6.1, 0, -1.2] as Vector3Tuple,
  rotationRadians: [0.04, 0.32, -0.04] as Vector3Tuple,
  chartCenterMeters: [0, 1.63, 0] as Vector3Tuple,
  interactionNodeName: "AstraeaInteraction",
  interactionTargetId: astraeaAsset.interaction!.targetId,
  accessibleLabel: astraeaAsset.interaction!.accessibleLabel,
  href: astraeaAsset.interaction!.href!,
  focusDurationMs: 760,
  maximumAnimatedFps: 24,
  colors: {
    parchment: threeMaterialPalette.observatoryArchitecture,
    pewter: threeMaterialPalette.astraea,
    walnut: threeMaterialPalette.pinaculo,
    sage: threeMaterialPalette.futureEnergy,
  },
  tiers: {
    full: {
      ringCount: 3,
      radialLineCount: 4,
      fastenerCount: 8,
      maximumTriangles: 5_000,
      maximumDrawCalls: 24,
      materials: 4,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    reduced: {
      ringCount: 2,
      radialLineCount: 3,
      fastenerCount: 4,
      maximumTriangles: 1_800,
      maximumDrawCalls: 17,
      materials: 4,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    poster: {
      ringCount: 0,
      radialLineCount: 0,
      fastenerCount: 0,
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
    "letters-or-numerals",
    "zodiac-glyphs",
    "pseudo-writing",
    "screen-ui",
    "neon-emission",
    "magical-particles",
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

function interpolate(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

export function resolveAstraeaRingPose(focusProgress: number): AstraeaRingPose {
  const progress = easeInOutCubic(focusProgress);
  return {
    outer: interpolate(REST_POSE.outer, FOCUS_POSE.outer, progress),
    middle: interpolate(REST_POSE.middle, FOCUS_POSE.middle, progress),
    inner: interpolate(REST_POSE.inner, FOCUS_POSE.inner, progress),
    pointerLift: interpolate(REST_POSE.pointerLift, FOCUS_POSE.pointerLift, progress),
  };
}

function cloneFinitePose(pose: AstraeaRingPose | null): AstraeaRingPose | null {
  if (
    !pose ||
    !Number.isFinite(pose.outer) ||
    !Number.isFinite(pose.middle) ||
    !Number.isFinite(pose.inner) ||
    !Number.isFinite(pose.pointerLift)
  ) {
    return null;
  }

  return { ...pose };
}

export function captureAstraeaDiagnostics({
  presentation,
  selected,
  progress,
  targetProgress,
  pose,
}: {
  presentation: AstraeaPresentation;
  selected: boolean;
  progress: number;
  targetProgress: number;
  pose: AstraeaRingPose | null;
}): AstraeaDiagnosticsSnapshot {
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
    };
  }

  const safeProgress = Number.isFinite(progress) ? clamp01(progress) : null;
  const safeTargetProgress = targetProgress === 0 || targetProgress === 1 ? targetProgress : null;
  const currentPose = cloneFinitePose(pose);
  const targetPose =
    safeTargetProgress === null ? null : resolveAstraeaRingPose(safeTargetProgress);
  const alignment =
    safeProgress === null || safeTargetProgress === null || !currentPose || !targetPose
      ? null
      : (() => {
          const ringErrorsRadians = {
            outer: Math.abs(currentPose.outer - targetPose.outer),
            middle: Math.abs(currentPose.middle - targetPose.middle),
            inner: Math.abs(currentPose.inner - targetPose.inner),
          };
          const progressError = Math.abs(safeProgress - safeTargetProgress);
          const maximumRingErrorRadians = Math.max(
            ringErrorsRadians.outer,
            ringErrorsRadians.middle,
            ringErrorsRadians.inner,
          );
          const pointerErrorMeters = Math.abs(currentPose.pointerLift - targetPose.pointerLift);

          return {
            settled:
              progressError <= ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.progress &&
              maximumRingErrorRadians <= ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.ringRadians &&
              pointerErrorMeters <= ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.pointerMeters,
            progressError,
            ringErrorsRadians,
            maximumRingErrorRadians,
            pointerErrorMeters,
          };
        })();
  const phase: AstraeaDiagnosticsPhase =
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
  };
}

export function resolveAstraeaPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): AstraeaPresentation {
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
