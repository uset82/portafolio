import { naturalPalette } from "@/styles/palette";

import { getObservatoryAsset } from "./asset-registry";
import type { SceneQualityTier } from "./scene-config";
import type { ObservatorySceneState, SceneMotionMode } from "./scene-state";

type Vector3Tuple = readonly [number, number, number];

export type SoundLabTrackMetadata = {
  id: string;
  title: string;
  artistOrCredit: string;
  durationSeconds: number;
  rightsLabel: string;
  availability: "approved-local" | "approved-external";
  transcriptOrNotes: string;
  sourceUrl: string;
  waveformSource: "approved-amplitude-data" | "static-progress-rule";
};

export type SoundLabMechanismPose = {
  dialRotation: number;
  dialLift: number;
  sliderOffset: number;
  signalLift: number;
};

export const SOUND_LAB_PRESENTATION_TIERS = ["poster", "reduced", "full"] as const;
export type SoundLabPresentationTier = (typeof SOUND_LAB_PRESENTATION_TIERS)[number];

export type SoundLabPresentation = {
  tier: SoundLabPresentationTier;
  animated: boolean;
  settleImmediately: boolean;
};

export type SoundLabDiagnosticsPhase = "poster" | "reduced" | "animating" | "settled" | "paused";

export type SoundLabAlignmentDiagnostics = Readonly<{
  settled: boolean;
  progressError: number;
  dialRotationErrorRadians: number;
  dialLiftErrorMeters: number;
  sliderErrorMeters: number;
  signalErrorMeters: number;
}>;

export type SoundLabAudioDiagnostics = Readonly<{
  sourceStatus: "awaiting-approved-sources";
  catalogTrackCount: number;
  playerAvailable: boolean;
  defaultMuted: boolean;
  autoplay: boolean;
  preload: "none";
  soundStatus: ObservatorySceneState["sound"]["status"] | null;
  muted: boolean | null;
  approvedAmplitude: number | null;
  responseActive: boolean;
}>;

export type SoundLabDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: SoundLabPresentation;
  phase: SoundLabDiagnosticsPhase;
  selected: boolean;
  progress: number | null;
  targetProgress: 0 | 1 | null;
  currentPose: SoundLabMechanismPose | null;
  targetPose: SoundLabMechanismPose | null;
  alignment: SoundLabAlignmentDiagnostics | null;
  audio: SoundLabAudioDiagnostics;
}>;

export type SoundLabDiagnostics = Readonly<{
  capture: () => SoundLabDiagnosticsSnapshot;
}>;

const soundLabAsset = getObservatoryAsset("sound-lab");

/**
 * Intentionally empty. Tracks enter this catalog only after task 2.29 records
 * their source, rights, duration, credit, notes, and real waveform policy.
 */
export const SOUND_LAB_AUDIO_CATALOG: readonly SoundLabTrackMetadata[] = [];

export const SOUND_LAB_AUDIO_CONTRACT = {
  sourceStatus: "awaiting-approved-sources",
  defaultMuted: true,
  autoplay: false,
  preload: "none",
  playerAvailable: false,
  trackCount: SOUND_LAB_AUDIO_CATALOG.length,
  requiredMetadata: [
    "title",
    "artist-or-credit",
    "duration",
    "rights-and-availability",
    "transcript-or-notes",
    "approved-source",
    "waveform-source",
  ],
  waveformFallback: "static-progress-rule",
  responsePolicy: "approved-amplitude-only-while-playing",
} as const;

export const SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES = {
  progress: 0.001,
  dialRadians: 0.001,
  motionMeters: 0.0005,
} as const;

export const OBSERVATORY_SOUND_LAB_TECHNICAL_ART = {
  visualThesis:
    "A low walnut instrument uses one aged-metal harmonic dial, sparse graphite controls, buff working surfaces, and a restrained sage signal instead of a keyboard, screen, or nightclub interface.",
  contentJob:
    "Identify the Sound Lab as a harmonic-instrument study, expose the verified Sound destination, and keep playback visibly unavailable until every source and credit is approved.",
  interactionThesis:
    "Selection turns and lifts the central dial while advancing one physical slider; future audio response accepts only real approved amplitude while playing and never starts from focus.",
  assetStrategy: "runtime-authored-procedural-geometry",
  worldBasis: {
    handedness: "right-handed",
    units: "meters",
    up: "+Y",
    right: "+X",
    forward: "-Z",
  },
  dimensionsMeters: soundLabAsset.scaleMeters,
  positionMeters: [-4.6, 0.02, 1.2] as Vector3Tuple,
  rotationRadians: [0, 0.16, 0] as Vector3Tuple,
  interactionTargetId: soundLabAsset.interaction!.targetId,
  accessibleLabel: soundLabAsset.interaction!.accessibleLabel,
  href: soundLabAsset.interaction!.href!,
  focusDurationMs: 700,
  maximumAnimatedFps: 24,
  colors: {
    walnut: naturalPalette.walnut,
    buff: naturalPalette.buff,
    graphite: naturalPalette.deepEspresso,
    pewter: naturalPalette.pewter,
    sage: naturalPalette.mutedSage,
  },
  controls: {
    fullKnobs: 4,
    reducedKnobs: 2,
    fullSliders: 2,
    reducedSliders: 1,
  },
  tiers: {
    full: {
      maximumTriangles: 6_500,
      maximumDrawCalls: 18,
      materials: 5,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
    },
    reduced: {
      maximumTriangles: 2_700,
      maximumDrawCalls: 14,
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
  prohibitedDetails: [
    "keyboard",
    "dj-brand-mimicry",
    "words-or-pseudo-writing",
    "fabricated-waveform-geometry",
    "autoplay-cue",
    "dense-control-wall",
    "neon-or-rapid-flashing",
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

export function resolveSoundLabAudioAmplitude(
  sound: ObservatorySceneState["sound"],
  motion: SceneMotionMode,
  measuredAmplitude: number,
) {
  if (
    sound.status !== "playing" ||
    sound.muted ||
    motion !== "full" ||
    !Number.isFinite(measuredAmplitude)
  ) {
    return 0;
  }
  return clamp01(measuredAmplitude);
}

export function resolveSoundLabMechanismPose(
  focusProgress: number,
  approvedAmplitude = 0,
): SoundLabMechanismPose {
  const focus = easeInOutCubic(focusProgress);
  const amplitude = clamp01(Number.isFinite(approvedAmplitude) ? approvedAmplitude : 0);
  return {
    dialRotation: focus * (Math.PI / 10) + amplitude * (Math.PI / 40),
    dialLift: focus * 0.045 + amplitude * 0.018,
    sliderOffset: focus * 0.16 + amplitude * 0.055,
    signalLift: focus * 0.035 + amplitude * 0.012,
  };
}

function cloneFinitePose(pose: SoundLabMechanismPose | null): SoundLabMechanismPose | null {
  if (
    !pose ||
    !Number.isFinite(pose.dialRotation) ||
    !Number.isFinite(pose.dialLift) ||
    !Number.isFinite(pose.sliderOffset) ||
    !Number.isFinite(pose.signalLift)
  ) {
    return null;
  }

  return { ...pose };
}

function captureSoundLabAudioDiagnostics(
  sound: ObservatorySceneState["sound"],
  approvedAmplitude: number,
): SoundLabAudioDiagnostics {
  const validSoundStatuses: readonly ObservatorySceneState["sound"]["status"][] = [
    "muted",
    "playing",
    "paused",
    "unavailable",
  ];
  const soundStatus = validSoundStatuses.includes(sound.status) ? sound.status : null;
  const muted = typeof sound.muted === "boolean" ? sound.muted : null;
  const safeApprovedAmplitude = Number.isFinite(approvedAmplitude)
    ? clamp01(approvedAmplitude)
    : null;

  return {
    sourceStatus: SOUND_LAB_AUDIO_CONTRACT.sourceStatus,
    catalogTrackCount: SOUND_LAB_AUDIO_CONTRACT.trackCount,
    playerAvailable: SOUND_LAB_AUDIO_CONTRACT.playerAvailable,
    defaultMuted: SOUND_LAB_AUDIO_CONTRACT.defaultMuted,
    autoplay: SOUND_LAB_AUDIO_CONTRACT.autoplay,
    preload: SOUND_LAB_AUDIO_CONTRACT.preload,
    soundStatus,
    muted,
    approvedAmplitude: safeApprovedAmplitude,
    responseActive: safeApprovedAmplitude !== null && safeApprovedAmplitude > 0,
  };
}

export function captureSoundLabDiagnostics({
  presentation,
  selected,
  progress,
  targetProgress,
  pose,
  sound,
  approvedAmplitude,
}: {
  presentation: SoundLabPresentation;
  selected: boolean;
  progress: number;
  targetProgress: number;
  pose: SoundLabMechanismPose | null;
  sound: ObservatorySceneState["sound"];
  approvedAmplitude: number;
}): SoundLabDiagnosticsSnapshot {
  const audio = captureSoundLabAudioDiagnostics(sound, approvedAmplitude);

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
      audio,
    };
  }

  const safeProgress = Number.isFinite(progress) ? clamp01(progress) : null;
  const safeTargetProgress = targetProgress === 0 || targetProgress === 1 ? targetProgress : null;
  const currentPose = cloneFinitePose(pose);
  const targetPose =
    safeTargetProgress === null || audio.approvedAmplitude === null
      ? null
      : resolveSoundLabMechanismPose(safeTargetProgress, audio.approvedAmplitude);
  const alignment =
    safeProgress === null || safeTargetProgress === null || !currentPose || !targetPose
      ? null
      : (() => {
          const progressError = Math.abs(safeProgress - safeTargetProgress);
          const dialRotationErrorRadians = Math.abs(
            currentPose.dialRotation - targetPose.dialRotation,
          );
          const dialLiftErrorMeters = Math.abs(currentPose.dialLift - targetPose.dialLift);
          const sliderErrorMeters = Math.abs(currentPose.sliderOffset - targetPose.sliderOffset);
          const signalErrorMeters = Math.abs(currentPose.signalLift - targetPose.signalLift);

          return {
            settled:
              progressError <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.progress &&
              dialRotationErrorRadians <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.dialRadians &&
              dialLiftErrorMeters <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters &&
              sliderErrorMeters <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters &&
              signalErrorMeters <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters,
            progressError,
            dialRotationErrorRadians,
            dialLiftErrorMeters,
            sliderErrorMeters,
            signalErrorMeters,
          };
        })();
  const phase: SoundLabDiagnosticsPhase =
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
    audio,
  };
}

export function resolveSoundLabPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
  compactViewport: boolean,
): SoundLabPresentation {
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
