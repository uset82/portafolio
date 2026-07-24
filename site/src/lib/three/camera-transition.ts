import type { CameraView, CameraViewId, SceneQualityTier } from "./scene-config";

type Vector3Tuple = readonly [number, number, number];

export type CameraPose = {
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  near: number;
  far: number;
};

export type CameraTransitionMode = "animated" | "immediate" | "paused";

export type CameraTransitionState = {
  requestId: number;
  elapsedMs: number;
  durationMs: number;
  from: CameraPose;
  to: CameraPose;
};

export type CameraTransitionFrame = {
  transition: CameraTransitionState;
  pose: CameraPose;
  complete: boolean;
};

export type CameraScenePhase = "settled" | "requested" | "transitioning";

export type CameraTransitionCounters = {
  animatedStarted: number;
  animatedCompleted: number;
  immediateCompleted: number;
  interrupted: number;
};

export type CameraTransitionDiagnosticsSnapshot = Readonly<{
  version: 1;
  cameraMounted: boolean;
  viewId: CameraViewId;
  scenePhase: CameraScenePhase;
  mode: CameraTransitionMode;
  requestId: number;
  currentPose: CameraPose;
  requestedPose: CameraPose;
  alignedWithRequestedView: boolean;
  remaining: Readonly<{
    positionMeters: number;
    targetMeters: number;
    fovDegrees: number;
    nearMeters: number;
    farMeters: number;
  }>;
  activeTransition: Readonly<{
    requestId: number;
    requestMatchesScene: boolean;
    elapsedMs: number;
    durationMs: number;
    remainingMs: number;
    rawProgress: number;
    easedProgress: number;
    complete: boolean;
    from: CameraPose;
    to: CameraPose;
  }> | null;
  counters: CameraTransitionCounters;
}>;

export type CameraTransitionDiagnostics = Readonly<{
  capture: () => CameraTransitionDiagnosticsSnapshot;
}>;

export const OBSERVATORY_CAMERA_TRANSITION = {
  maximumFrameDeltaMs: 50,
  fullFps: 30,
  reducedFps: 24,
  reducedQualityDurationScale: 0.72,
  positionEpsilonMeters: 0.001,
  targetEpsilonMeters: 0.001,
  fovEpsilonDegrees: 0.001,
  clippingEpsilonMeters: 0.001,
} as const;

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function interpolateNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function interpolateTuple(from: Vector3Tuple, to: Vector3Tuple, progress: number): Vector3Tuple {
  return [
    interpolateNumber(from[0], to[0], progress),
    interpolateNumber(from[1], to[1], progress),
    interpolateNumber(from[2], to[2], progress),
  ];
}

function tupleDistance(a: Vector3Tuple, b: Vector3Tuple) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function cameraPoseFromView(view: CameraView): CameraPose {
  return {
    position: [...view.position],
    target: [...view.target],
    fov: view.fov,
    near: view.near,
    far: view.far,
  };
}

export function resolveCameraTransitionMode({
  quality,
  lifecycleReady,
  reducedMotion,
  userPaused,
  documentVisible,
}: {
  quality: SceneQualityTier;
  lifecycleReady: boolean;
  reducedMotion: boolean;
  userPaused: boolean;
  documentVisible: boolean;
}): CameraTransitionMode {
  if (!documentVisible) return "paused";
  if (quality === "static" || !lifecycleReady || reducedMotion || userPaused) return "immediate";
  return "animated";
}

export function resolveCameraTransitionDuration(view: CameraView, quality: SceneQualityTier) {
  if (quality === "static") return 0;
  const scale =
    quality === "reduced" ? OBSERVATORY_CAMERA_TRANSITION.reducedQualityDurationScale : 1;
  return Math.round(view.durationMs * scale);
}

export function resolveCameraTransitionFps(quality: SceneQualityTier) {
  return quality === "full"
    ? OBSERVATORY_CAMERA_TRANSITION.fullFps
    : OBSERVATORY_CAMERA_TRANSITION.reducedFps;
}

export function cameraPosesApproximatelyEqual(a: CameraPose, b: CameraPose) {
  return (
    tupleDistance(a.position, b.position) <= OBSERVATORY_CAMERA_TRANSITION.positionEpsilonMeters &&
    tupleDistance(a.target, b.target) <= OBSERVATORY_CAMERA_TRANSITION.targetEpsilonMeters &&
    Math.abs(a.fov - b.fov) <= OBSERVATORY_CAMERA_TRANSITION.fovEpsilonDegrees &&
    Math.abs(a.near - b.near) <= OBSERVATORY_CAMERA_TRANSITION.clippingEpsilonMeters &&
    Math.abs(a.far - b.far) <= OBSERVATORY_CAMERA_TRANSITION.clippingEpsilonMeters
  );
}

export function easeCameraTransitionProgress(value: number) {
  const progress = clamp01(value);
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function createCameraTransition(
  requestId: number,
  from: CameraPose,
  to: CameraPose,
  durationMs: number,
): CameraTransitionState {
  return {
    requestId,
    elapsedMs: 0,
    durationMs: Math.max(0, durationMs),
    from,
    to,
  };
}

export function advanceCameraTransition(
  transition: CameraTransitionState,
  deltaMs: number,
): CameraTransitionFrame {
  const boundedDelta = Math.min(
    Math.max(Number.isFinite(deltaMs) ? deltaMs : 0, 0),
    OBSERVATORY_CAMERA_TRANSITION.maximumFrameDeltaMs,
  );
  const elapsedMs = Math.min(transition.durationMs, transition.elapsedMs + boundedDelta);
  const rawProgress = transition.durationMs === 0 ? 1 : clamp01(elapsedMs / transition.durationMs);
  const progress = easeCameraTransitionProgress(rawProgress);
  const complete = rawProgress >= 1;
  const nextTransition = { ...transition, elapsedMs };

  return {
    transition: nextTransition,
    complete,
    pose: complete
      ? transition.to
      : {
          position: interpolateTuple(transition.from.position, transition.to.position, progress),
          target: interpolateTuple(transition.from.target, transition.to.target, progress),
          fov: interpolateNumber(transition.from.fov, transition.to.fov, progress),
          near: interpolateNumber(transition.from.near, transition.to.near, progress),
          far: interpolateNumber(transition.from.far, transition.to.far, progress),
        },
  };
}

function cloneCameraPose(pose: CameraPose): CameraPose {
  return {
    position: [...pose.position],
    target: [...pose.target],
    fov: pose.fov,
    near: pose.near,
    far: pose.far,
  };
}

export function captureCameraTransitionDiagnostics({
  cameraMounted,
  view,
  scenePhase,
  mode,
  requestId,
  currentPose,
  transition,
  counters,
}: {
  cameraMounted: boolean;
  view: CameraView;
  scenePhase: CameraScenePhase;
  mode: CameraTransitionMode;
  requestId: number;
  currentPose: CameraPose;
  transition: CameraTransitionState | null;
  counters: CameraTransitionCounters;
}): CameraTransitionDiagnosticsSnapshot {
  const requestedPose = cameraPoseFromView(view);
  const safeCurrentPose = cloneCameraPose(currentPose);
  const rawProgress = transition
    ? transition.durationMs === 0
      ? 1
      : clamp01(transition.elapsedMs / transition.durationMs)
    : 0;

  return {
    version: 1,
    cameraMounted,
    viewId: view.id,
    scenePhase,
    mode,
    requestId,
    currentPose: safeCurrentPose,
    requestedPose,
    alignedWithRequestedView: cameraPosesApproximatelyEqual(safeCurrentPose, requestedPose),
    remaining: {
      positionMeters: tupleDistance(safeCurrentPose.position, requestedPose.position),
      targetMeters: tupleDistance(safeCurrentPose.target, requestedPose.target),
      fovDegrees: Math.abs(safeCurrentPose.fov - requestedPose.fov),
      nearMeters: Math.abs(safeCurrentPose.near - requestedPose.near),
      farMeters: Math.abs(safeCurrentPose.far - requestedPose.far),
    },
    activeTransition: transition
      ? {
          requestId: transition.requestId,
          requestMatchesScene: transition.requestId === requestId,
          elapsedMs: transition.elapsedMs,
          durationMs: transition.durationMs,
          remainingMs: Math.max(0, transition.durationMs - transition.elapsedMs),
          rawProgress,
          easedProgress: easeCameraTransitionProgress(rawProgress),
          complete: rawProgress >= 1,
          from: cloneCameraPose(transition.from),
          to: cloneCameraPose(transition.to),
        }
      : null,
    counters: { ...counters },
  };
}
