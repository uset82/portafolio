import {
  ARTIFACT_CAMERA_VIEWS,
  type CameraViewId,
  type SceneArtifactId,
  type SceneGroupId,
  type SceneQualityTier,
} from "./scene-config";
import type { ObservatoryAssetId } from "./asset-registry-schema";
import {
  INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  INITIAL_QUALITY_DECISION,
  type BrowserCapabilitySnapshot,
  type QualityDecision,
  type QualityPreference,
  type QualityReasonCode,
} from "./capability-policy";

export type SceneLifecycle =
  "poster" | "preparing" | "ready" | "error" | "unsupported" | "context-lost";

export type SceneErrorCode =
  "asset-load" | "decoder" | "webgl-unsupported" | "context-lost" | "unknown";

export type SceneMotionMode = "static" | "paused" | "reduced" | "full";

export type SceneError = {
  code: SceneErrorCode;
  message: string;
  recoverable: boolean;
  assetId: ObservatoryAssetId | null;
};

export type ObservatorySceneState = {
  version: 2;
  capabilities: BrowserCapabilitySnapshot;
  quality: {
    tier: SceneQualityTier;
    source: "automatic" | "manual";
    preference: QualityPreference;
    reasons: readonly QualityReasonCode[];
  };
  motion: {
    preference: "no-preference" | "reduce";
    userPaused: boolean;
    documentVisible: boolean;
  };
  sound: {
    status: "muted" | "playing" | "paused" | "unavailable";
    muted: boolean;
  };
  loading: {
    lifecycle: SceneLifecycle;
    loaded: number;
    total: number;
    activeGroup: SceneGroupId | null;
    attempt: number;
    error: SceneError | null;
  };
  selection: {
    artifactId: SceneArtifactId | null;
  };
  camera: {
    view: CameraViewId;
    phase: "settled" | "requested";
    requestId: number;
  };
};

export type ObservatorySceneAction =
  | { type: "quality/set"; tier: SceneQualityTier; source: "automatic" | "manual" }
  | { type: "quality/preference"; preference: QualityPreference }
  | {
      type: "capabilities/apply";
      snapshot: BrowserCapabilitySnapshot;
      decision: QualityDecision;
    }
  | { type: "motion/preference"; preference: "no-preference" | "reduce" }
  | { type: "motion/pause"; paused: boolean }
  | { type: "motion/visibility"; visible: boolean }
  | { type: "loading/start"; total: number; activeGroup: SceneGroupId | null }
  | {
      type: "loading/progress";
      loaded: number;
      total: number;
      activeGroup: SceneGroupId | null;
    }
  | { type: "loading/ready" }
  | { type: "loading/fail"; error: SceneError }
  | { type: "loading/unsupported" }
  | { type: "loading/context-lost" }
  | { type: "loading/retry"; total: number; activeGroup: SceneGroupId | null }
  | { type: "artifact/select"; artifactId: SceneArtifactId }
  | { type: "artifact/clear" }
  | { type: "camera/request"; view: CameraViewId }
  | { type: "camera/settled"; requestId: number }
  | { type: "sound/play"; userInitiated: true }
  | { type: "sound/pause" }
  | { type: "sound/mute" }
  | { type: "sound/unavailable" };

export const INITIAL_OBSERVATORY_SCENE_STATE: ObservatorySceneState = {
  version: 2,
  capabilities: INITIAL_BROWSER_CAPABILITY_SNAPSHOT,
  quality: INITIAL_QUALITY_DECISION,
  motion: {
    preference: "no-preference",
    userPaused: false,
    documentVisible: true,
  },
  sound: { status: "muted", muted: true },
  loading: {
    lifecycle: "poster",
    loaded: 0,
    total: 0,
    activeGroup: null,
    attempt: 0,
    error: null,
  },
  selection: { artifactId: null },
  camera: { view: "fallback", phase: "settled", requestId: 0 },
};

function requestCamera(state: ObservatorySceneState, view: CameraViewId): ObservatorySceneState {
  return {
    ...state,
    camera: {
      view,
      phase: "requested",
      requestId: state.camera.requestId + 1,
    },
  };
}

function normalizeProgress(loaded: number, total: number) {
  const safeTotal = Math.max(0, Math.floor(total));
  return {
    loaded: Math.min(Math.max(0, Math.floor(loaded)), safeTotal),
    total: safeTotal,
  };
}

function qualityReasonForSet(
  tier: SceneQualityTier,
  source: "automatic" | "manual",
): QualityReasonCode {
  if (source === "automatic") return tier === "static" ? "webgl2-unknown" : "balanced-default";
  if (tier === "static") return "manual-static";
  if (tier === "reduced") return "manual-reduced";
  return "manual-full";
}

function applyQualityDecision(
  state: ObservatorySceneState,
  decision: QualityDecision,
  capabilities: BrowserCapabilitySnapshot = state.capabilities,
): ObservatorySceneState {
  const quality = {
    tier: decision.tier,
    source: decision.source,
    preference: decision.preference,
    reasons: decision.reasons,
  };
  const unsupported = decision.reasons.includes("webgl2-unsupported");
  const nextState = { ...state, capabilities, quality };

  if (decision.tier !== "static") {
    if (state.loading.lifecycle !== "unsupported") return nextState;
    return {
      ...nextState,
      loading: { ...state.loading, lifecycle: "poster", error: null },
    };
  }

  const cameraAlreadyFallback =
    state.camera.view === "fallback" && state.camera.phase === "settled";
  return {
    ...nextState,
    sound: { status: "muted", muted: true },
    loading: {
      ...state.loading,
      lifecycle: unsupported ? "unsupported" : "poster",
      activeGroup: null,
      error: unsupported
        ? {
            code: "webgl-unsupported",
            message:
              "The interactive Observatory is unavailable; the complete poster experience remains.",
            recoverable: false,
            assetId: null,
          }
        : null,
    },
    camera: cameraAlreadyFallback
      ? state.camera
      : {
          view: "fallback",
          phase: "settled",
          requestId: state.camera.requestId + 1,
        },
  };
}

export function observatorySceneReducer(
  state: ObservatorySceneState,
  action: ObservatorySceneAction,
): ObservatorySceneState {
  switch (action.type) {
    case "quality/set": {
      return applyQualityDecision(state, {
        tier: action.tier,
        source: action.source,
        preference: action.source === "manual" ? action.tier : state.quality.preference,
        reasons: [qualityReasonForSet(action.tier, action.source)],
      });
    }
    case "quality/preference":
      if (state.quality.preference === action.preference) return state;
      return { ...state, quality: { ...state.quality, preference: action.preference } };
    case "capabilities/apply":
      return applyQualityDecision(state, action.decision, action.snapshot);
    case "motion/preference":
      return { ...state, motion: { ...state.motion, preference: action.preference } };
    case "motion/pause":
      return { ...state, motion: { ...state.motion, userPaused: action.paused } };
    case "motion/visibility":
      return { ...state, motion: { ...state.motion, documentVisible: action.visible } };
    case "loading/start": {
      const progress = normalizeProgress(0, action.total);
      return {
        ...state,
        loading: {
          ...state.loading,
          ...progress,
          lifecycle: state.quality.tier === "static" ? "poster" : "preparing",
          activeGroup: action.activeGroup,
          error: null,
        },
      };
    }
    case "loading/progress": {
      if (state.loading.lifecycle === "error") return state;
      return {
        ...state,
        loading: {
          ...state.loading,
          ...normalizeProgress(action.loaded, action.total),
          lifecycle: state.quality.tier === "static" ? "poster" : "preparing",
          activeGroup: action.activeGroup,
          error: null,
        },
      };
    }
    case "loading/ready": {
      if (state.quality.tier === "static") return state;
      const readyState: ObservatorySceneState = {
        ...state,
        loading: {
          ...state.loading,
          lifecycle: "ready",
          loaded: state.loading.total,
          activeGroup: null,
          error: null,
        },
      };
      return requestCamera(
        readyState,
        state.selection.artifactId ? ARTIFACT_CAMERA_VIEWS[state.selection.artifactId] : "home",
      );
    }
    case "loading/fail":
      return {
        ...state,
        sound: { status: "muted", muted: true },
        loading: {
          ...state.loading,
          lifecycle: "error",
          activeGroup: null,
          error: action.error,
        },
      };
    case "loading/unsupported":
      return applyQualityDecision(
        state,
        {
          tier: "static",
          source: "automatic",
          preference: state.quality.preference,
          reasons: ["webgl2-unsupported"],
        },
        { ...state.capabilities, webgl2: "unsupported" },
      );
    case "loading/context-lost":
      return {
        ...state,
        sound: { status: "muted", muted: true },
        loading: {
          ...state.loading,
          lifecycle: "context-lost",
          activeGroup: null,
          error: {
            code: "context-lost",
            message: "The interactive Observatory paused after a graphics reset.",
            recoverable: true,
            assetId: null,
          },
        },
      };
    case "loading/retry": {
      const progress = normalizeProgress(0, action.total);
      return {
        ...state,
        loading: {
          ...state.loading,
          ...progress,
          lifecycle: state.quality.tier === "static" ? "poster" : "preparing",
          activeGroup: action.activeGroup,
          attempt: state.loading.attempt + 1,
          error: null,
        },
      };
    }
    case "artifact/select": {
      const nextState = {
        ...state,
        selection: { artifactId: action.artifactId },
      };
      return requestCamera(
        nextState,
        state.quality.tier === "static" ? "fallback" : ARTIFACT_CAMERA_VIEWS[action.artifactId],
      );
    }
    case "artifact/clear":
      return requestCamera(
        { ...state, selection: { artifactId: null } },
        state.quality.tier === "static" ? "fallback" : "home",
      );
    case "camera/request":
      return requestCamera(state, state.quality.tier === "static" ? "fallback" : action.view);
    case "camera/settled":
      if (state.camera.phase !== "requested" || action.requestId !== state.camera.requestId) {
        return state;
      }
      return { ...state, camera: { ...state.camera, phase: "settled" } };
    case "sound/play":
      if (!action.userInitiated || state.sound.status === "unavailable") return state;
      return { ...state, sound: { status: "playing", muted: false } };
    case "sound/pause":
      if (state.sound.status === "unavailable") return state;
      return { ...state, sound: { status: "paused", muted: state.sound.muted } };
    case "sound/mute":
      if (state.sound.status === "unavailable") return state;
      return { ...state, sound: { status: "muted", muted: true } };
    case "sound/unavailable":
      return { ...state, sound: { status: "unavailable", muted: true } };
  }
}

export function resolveSceneMotionMode(state: ObservatorySceneState): SceneMotionMode {
  if (state.quality.tier === "static" || state.loading.lifecycle !== "ready") return "static";
  if (state.motion.userPaused || !state.motion.documentVisible) return "paused";
  if (state.motion.preference === "reduce") return "reduced";
  return "full";
}

export function canRenderObservatoryScene(state: ObservatorySceneState) {
  return state.quality.tier !== "static" && state.loading.lifecycle === "ready";
}

export type ObservatorySceneStore = {
  getSnapshot: () => ObservatorySceneState;
  subscribe: (listener: () => void) => () => void;
  dispatch: (action: ObservatorySceneAction) => ObservatorySceneState;
};

export function createObservatorySceneStore(
  initialState: ObservatorySceneState = INITIAL_OBSERVATORY_SCENE_STATE,
): ObservatorySceneStore {
  let state = initialState;
  const listeners = new Set<() => void>();

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch(action) {
      const nextState = observatorySceneReducer(state, action);
      if (nextState !== state) {
        state = nextState;
        listeners.forEach((listener) => listener());
      }
      return state;
    },
  };
}
