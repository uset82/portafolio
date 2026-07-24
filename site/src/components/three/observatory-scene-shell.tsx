"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import type { ObservatoryAssetId } from "@/lib/three/asset-registry-schema";
import type { AstraeaDiagnostics } from "@/lib/three/astraea-system";
import {
  advanceCameraTransition,
  captureCameraTransitionDiagnostics,
  cameraPoseFromView,
  cameraPosesApproximatelyEqual,
  createCameraTransition,
  resolveCameraTransitionDuration,
  resolveCameraTransitionFps,
  resolveCameraTransitionMode,
  type CameraPose,
  type CameraScenePhase,
  type CameraTransitionCounters,
  type CameraTransitionDiagnostics,
  type CameraTransitionMode,
  type CameraTransitionState,
} from "@/lib/three/camera-transition";
import {
  CAMERA_VIEWS,
  OBSERVATORY_ENVIRONMENT,
  OBSERVATORY_LIGHT_RIG,
  SCENE_GROUPS,
  SCENE_OWNERSHIP,
} from "@/lib/three/scene-config";
import { canRenderObservatoryScene, resolveSceneMotionMode } from "@/lib/three/scene-state";
import type { DroneDiagnostics } from "@/lib/three/drone-system";
import type { ElectronicsAiDiagnostics } from "@/lib/three/electronics-ai-system";
import type { FutureEnergyDiagnostics } from "@/lib/three/future-energy-system";
import type { PinaculoDiagnostics } from "@/lib/three/pinaculo-system";
import type { RobotDiagnostics } from "@/lib/three/robot-system";
import type { SoundLabDiagnostics } from "@/lib/three/sound-lab-system";
import type { WaterSurfaceDiagnostics } from "@/lib/three/water-system";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";
import { ObservatoryAstraea } from "./observatory-astraea";
import { ObservatoryDrone } from "./observatory-drone";
import { ObservatoryElectronicsAi } from "./observatory-electronics-ai";
import { ObservatoryEnvironment } from "./observatory-environment";
import { ObservatoryFutureEnergy } from "./observatory-future-energy";
import { ObservatoryPinaculo } from "./observatory-pinaculo";
import { ObservatoryRobot } from "./observatory-robot";
import { ObservatorySoundLab } from "./observatory-sound-lab";
import { ObservatoryWaterSurface } from "./observatory-water-surface";

const EMPTY_LOADED_ASSETS = new Map<ObservatoryAssetId, GLTF>();

function readCameraPose(camera: PerspectiveCamera, target: Vector3): CameraPose {
  return {
    position: [camera.position.x, camera.position.y, camera.position.z],
    target: [target.x, target.y, target.z],
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
  };
}

function applyCameraPose(camera: PerspectiveCamera, target: Vector3, pose: CameraPose) {
  camera.position.set(...pose.position);
  target.set(...pose.target);
  camera.fov = pose.fov;
  camera.near = pose.near;
  camera.far = pose.far;
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}

function useBoundedCameraInvalidation(active: boolean, fps: number) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return;
    invalidate();
    const intervalId = window.setInterval(invalidate, 1_000 / fps);
    return () => window.clearInterval(intervalId);
  }, [active, fps, invalidate]);
}

function ObservatoryCamera({
  onDiagnosticsReady,
}: {
  onDiagnosticsReady?: (diagnostics: CameraTransitionDiagnostics | null) => void;
}) {
  const cameraRef = useRef<PerspectiveCamera>(null);
  const targetRef = useRef(new Vector3(...CAMERA_VIEWS.fallback.target));
  const transitionRef = useRef<CameraTransitionState | null>(null);
  const countersRef = useRef<CameraTransitionCounters>({
    animatedStarted: 0,
    animatedCompleted: 0,
    immediateCompleted: 0,
    interrupted: 0,
  });
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const setRootState = useThree((state) => state.set);
  const invalidate = useThree((state) => state.invalidate);
  const view = CAMERA_VIEWS[scene.camera.view];
  const transitionMode = resolveCameraTransitionMode({
    quality: scene.quality.tier,
    lifecycleReady: scene.loading.lifecycle === "ready",
    reducedMotion: scene.motion.preference === "reduce",
    userPaused: scene.motion.userPaused,
    documentVisible: scene.motion.documentVisible,
  });
  const transitionFps = resolveCameraTransitionFps(scene.quality.tier);
  const transitionActive = scene.camera.phase === "transitioning" && transitionMode === "animated";
  const diagnosticsContextRef = useRef<{
    view: (typeof CAMERA_VIEWS)[keyof typeof CAMERA_VIEWS];
    scenePhase: CameraScenePhase;
    mode: CameraTransitionMode;
    requestId: number;
  }>({
    view,
    scenePhase: scene.camera.phase,
    mode: transitionMode,
    requestId: scene.camera.requestId,
  });

  useBoundedCameraInvalidation(transitionActive, transitionFps);

  useEffect(() => {
    diagnosticsContextRef.current = {
      view,
      scenePhase: scene.camera.phase,
      mode: transitionMode,
      requestId: scene.camera.requestId,
    };
  }, [scene.camera.phase, scene.camera.requestId, transitionMode, view]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: CameraTransitionDiagnostics = {
      capture: () => {
        const camera = cameraRef.current;
        const context = diagnosticsContextRef.current;
        return captureCameraTransitionDiagnostics({
          cameraMounted: camera !== null,
          view: context.view,
          scenePhase: context.scenePhase,
          mode: context.mode,
          requestId: context.requestId,
          currentPose: camera
            ? readCameraPose(camera, targetRef.current)
            : cameraPoseFromView(CAMERA_VIEWS.fallback),
          transition: transitionRef.current,
          counters: countersRef.current,
        });
      },
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [onDiagnosticsReady]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    applyCameraPose(camera, targetRef.current, cameraPoseFromView(CAMERA_VIEWS.fallback));
    setRootState({ camera });
    invalidate();
  }, [invalidate, setRootState]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera || scene.camera.phase !== "requested" || transitionMode === "paused") return;

    const previousTransition = transitionRef.current;
    if (previousTransition && previousTransition.requestId !== scene.camera.requestId) {
      countersRef.current.interrupted += 1;
    }
    const from = readCameraPose(camera, targetRef.current);
    const to = cameraPoseFromView(view);
    const durationMs = resolveCameraTransitionDuration(view, scene.quality.tier);
    if (
      transitionMode === "immediate" ||
      durationMs === 0 ||
      cameraPosesApproximatelyEqual(from, to)
    ) {
      transitionRef.current = null;
      applyCameraPose(camera, targetRef.current, to);
      countersRef.current.immediateCompleted += 1;
      invalidate();
      store.dispatch({ type: "camera/settled", requestId: scene.camera.requestId });
      return;
    }

    transitionRef.current = createCameraTransition(scene.camera.requestId, from, to, durationMs);
    countersRef.current.animatedStarted += 1;
    store.dispatch({ type: "camera/started", requestId: scene.camera.requestId });
    invalidate();
  }, [
    invalidate,
    scene.camera.phase,
    scene.camera.requestId,
    scene.quality.tier,
    store,
    transitionMode,
    view,
  ]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera || scene.camera.phase !== "transitioning" || transitionMode !== "immediate") {
      return;
    }
    transitionRef.current = null;
    applyCameraPose(camera, targetRef.current, cameraPoseFromView(view));
    countersRef.current.immediateCompleted += 1;
    invalidate();
    store.dispatch({ type: "camera/settled", requestId: scene.camera.requestId });
  }, [invalidate, scene.camera.phase, scene.camera.requestId, store, transitionMode, view]);

  useFrame((_state, delta) => {
    const camera = cameraRef.current;
    const transition = transitionRef.current;
    if (
      !camera ||
      !transition ||
      scene.camera.phase !== "transitioning" ||
      transitionMode !== "animated" ||
      transition.requestId !== scene.camera.requestId
    ) {
      return;
    }

    const frame = advanceCameraTransition(transition, delta * 1_000);
    transitionRef.current = frame.complete ? null : frame.transition;
    applyCameraPose(camera, targetRef.current, frame.pose);
    if (frame.complete) {
      countersRef.current.animatedCompleted += 1;
      store.dispatch({ type: "camera/settled", requestId: transition.requestId });
    }
  });

  return (
    <perspectiveCamera
      ref={cameraRef}
      name="ObservatoryCamera"
      fov={CAMERA_VIEWS.fallback.fov}
      near={CAMERA_VIEWS.fallback.near}
      far={CAMERA_VIEWS.fallback.far}
      position={[...CAMERA_VIEWS.fallback.position]}
    />
  );
}

function ObservatoryLights() {
  return (
    <group name="ObservatoryLightRig" userData={{ owner: SCENE_OWNERSHIP.scene }}>
      {OBSERVATORY_LIGHT_RIG.map((light) =>
        light.kind === "hemisphere" ? (
          <hemisphereLight
            key={light.id}
            name="ObservatoryHemisphereLight"
            color={light.color}
            groundColor={light.groundColor}
            intensity={light.intensity}
          />
        ) : (
          <directionalLight
            key={light.id}
            name={`Observatory${light.id}Light`}
            color={light.color}
            intensity={light.intensity}
            position={[...light.position]}
            castShadow={light.castShadow}
          />
        ),
      )}
    </group>
  );
}

export function ObservatorySceneShell({
  loadedAssets = EMPTY_LOADED_ASSETS,
  onAstraeaDiagnosticsReady,
  onCameraDiagnosticsReady,
  onDroneDiagnosticsReady,
  onElectronicsAiDiagnosticsReady,
  onFutureEnergyDiagnosticsReady,
  onPinaculoDiagnosticsReady,
  onRobotDiagnosticsReady,
  onSoundLabDiagnosticsReady,
  onWaterDiagnosticsReady,
}: {
  loadedAssets?: ReadonlyMap<ObservatoryAssetId, GLTF>;
  onAstraeaDiagnosticsReady?: (diagnostics: AstraeaDiagnostics | null) => void;
  onCameraDiagnosticsReady?: (diagnostics: CameraTransitionDiagnostics | null) => void;
  onDroneDiagnosticsReady?: (diagnostics: DroneDiagnostics | null) => void;
  onElectronicsAiDiagnosticsReady?: (diagnostics: ElectronicsAiDiagnostics | null) => void;
  onFutureEnergyDiagnosticsReady?: (diagnostics: FutureEnergyDiagnostics | null) => void;
  onPinaculoDiagnosticsReady?: (diagnostics: PinaculoDiagnostics | null) => void;
  onRobotDiagnosticsReady?: (diagnostics: RobotDiagnostics | null) => void;
  onSoundLabDiagnosticsReady?: (diagnostics: SoundLabDiagnostics | null) => void;
  onWaterDiagnosticsReady?: (diagnostics: WaterSurfaceDiagnostics | null) => void;
}) {
  const scene = useObservatorySceneSnapshot();
  const sceneVisible = canRenderObservatoryScene(scene);
  const motionMode = resolveSceneMotionMode(scene);

  return (
    <>
      <ObservatoryCamera
        {...(onCameraDiagnosticsReady ? { onDiagnosticsReady: onCameraDiagnosticsReady } : {})}
      />
      <ObservatoryLights />
      <group
        name="ObservatorySceneRoot"
        visible={sceneVisible}
        userData={{
          owner: SCENE_OWNERSHIP.scene,
          environment: OBSERVATORY_ENVIRONMENT.mode,
          qualityTier: scene.quality.tier,
          motionMode,
          selectedArtifact: scene.selection.artifactId,
        }}
      >
        {Object.values(SCENE_GROUPS).map((group) => (
          <group
            key={group.id}
            name={group.name}
            userData={{
              groupId: group.id,
              loadingPriority: group.loadingPriority,
              assetIds: [...group.assetIds],
            }}
          >
            {group.id === "architecture" ? (
              <ObservatoryEnvironment quality={scene.quality.tier} />
            ) : null}
            {group.id === "guide" && loadedAssets.has("robot-guide") ? (
              <ObservatoryRobot
                asset={loadedAssets.get("robot-guide")!}
                {...(onRobotDiagnosticsReady
                  ? { onDiagnosticsReady: onRobotDiagnosticsReady }
                  : {})}
              />
            ) : null}
            {group.id === "water" ? (
              <ObservatoryWaterSurface
                {...(onWaterDiagnosticsReady
                  ? { onDiagnosticsReady: onWaterDiagnosticsReady }
                  : {})}
              />
            ) : null}
            {group.id === "artifacts" ? (
              <>
                <ObservatoryDrone
                  {...(onDroneDiagnosticsReady
                    ? { onDiagnosticsReady: onDroneDiagnosticsReady }
                    : {})}
                />
                <ObservatoryAstraea
                  {...(onAstraeaDiagnosticsReady
                    ? { onDiagnosticsReady: onAstraeaDiagnosticsReady }
                    : {})}
                />
                <ObservatoryPinaculo
                  {...(onPinaculoDiagnosticsReady
                    ? { onDiagnosticsReady: onPinaculoDiagnosticsReady }
                    : {})}
                />
                <ObservatorySoundLab
                  {...(onSoundLabDiagnosticsReady
                    ? { onDiagnosticsReady: onSoundLabDiagnosticsReady }
                    : {})}
                />
                <ObservatoryFutureEnergy
                  {...(onFutureEnergyDiagnosticsReady
                    ? { onDiagnosticsReady: onFutureEnergyDiagnosticsReady }
                    : {})}
                />
                <ObservatoryElectronicsAi
                  {...(onElectronicsAiDiagnosticsReady
                    ? { onDiagnosticsReady: onElectronicsAiDiagnosticsReady }
                    : {})}
                />
              </>
            ) : null}
          </group>
        ))}
      </group>
    </>
  );
}
