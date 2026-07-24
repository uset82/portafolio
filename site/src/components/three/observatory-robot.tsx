"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { AnimationMixer, LoopRepeat, type AnimationAction } from "three";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";

import {
  OBSERVATORY_ROBOT_TECHNICAL_ART,
  captureRobotDiagnostics,
  resolveRobotPresentation,
  type RobotDiagnostics,
} from "@/lib/three/robot-system";
import { resolveSceneMotionMode, type SceneMotionMode } from "@/lib/three/scene-state";
import type { SceneQualityTier } from "@/lib/three/scene-config";
import { threeMaterialPalette } from "@/styles/palette";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

function useBoundedRobotInvalidation(active: boolean) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active) return;
    invalidate();
    const intervalId = window.setInterval(
      invalidate,
      1_000 / OBSERVATORY_ROBOT_TECHNICAL_ART.maximumAnimatedFps,
    );
    return () => window.clearInterval(intervalId);
  }, [active, invalidate]);
}

function useRobotIdle(asset: GLTF, active: boolean) {
  const actionRef = useRef<AnimationAction | null>(null);
  const elapsedSecondsRef = useRef(0);
  const mixer = useMemo(() => new AnimationMixer(asset.scene), [asset.scene]);
  const idleClip = useMemo(
    () =>
      asset.animations.find((clip) => clip.name === OBSERVATORY_ROBOT_TECHNICAL_ART.idleClipId) ??
      null,
    [asset.animations],
  );
  const shouldAnimate = active && idleClip !== null;

  useBoundedRobotInvalidation(shouldAnimate);

  useEffect(() => {
    if (!idleClip) return;
    const action = mixer.clipAction(idleClip);
    action.reset().setLoop(LoopRepeat, Infinity).play();
    action.paused = true;
    actionRef.current = action;
    elapsedSecondsRef.current = 0;

    return () => {
      action.stop();
      actionRef.current = null;
      elapsedSecondsRef.current = 0;
    };
  }, [idleClip, mixer]);

  useEffect(() => {
    if (actionRef.current) actionRef.current.paused = !active;
  }, [active, idleClip, mixer]);

  useFrame((_state, delta) => {
    if (shouldAnimate) {
      mixer.update(Math.min(delta, 1 / OBSERVATORY_ROBOT_TECHNICAL_ART.maximumAnimatedFps));
      elapsedSecondsRef.current = actionRef.current?.time ?? elapsedSecondsRef.current;
    }
  });

  useEffect(
    () => () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(asset.scene);
    },
    [asset.scene, mixer],
  );

  return elapsedSecondsRef;
}

export type ObservatoryRobotProps = {
  asset: GLTF;
  onDiagnosticsReady?: (diagnostics: RobotDiagnostics | null) => void;
};

export function ObservatoryRobot({ asset, onDiagnosticsReady }: ObservatoryRobotProps) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const presentation = useMemo(
    () => resolveRobotPresentation(asset.scene, asset.animations),
    [asset.animations, asset.scene],
  );
  const motionMode = resolveSceneMotionMode(scene);
  const selected = scene.selection.artifactId === "robot-guide";
  const diagnosticsContextRef = useRef<{
    quality: SceneQualityTier;
    motion: SceneMotionMode;
    selected: boolean;
  }>({
    quality: scene.quality.tier,
    motion: motionMode,
    selected,
  });

  const idleElapsedSecondsRef = useRobotIdle(
    asset,
    presentation !== null && scene.quality.tier === "full" && motionMode === "full",
  );

  useEffect(() => {
    diagnosticsContextRef.current = {
      quality: scene.quality.tier,
      motion: motionMode,
      selected,
    };
  }, [motionMode, scene.quality.tier, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: RobotDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return captureRobotDiagnostics({
          root: asset.scene,
          animations: asset.animations,
          quality: context.quality,
          motion: context.motion,
          selected: context.selected,
          idleElapsedSeconds: idleElapsedSecondsRef.current,
        });
      },
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [asset.animations, asset.scene, idleElapsedSecondsRef, onDiagnosticsReady]);

  if (!presentation) return null;

  const selectRobot = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "robot-guide" });
  };

  return (
    <group
      name="ObservatoryRobotPresentation"
      position={[...presentation.position]}
      rotation={[...presentation.rotation]}
      onClick={selectRobot}
      userData={{
        interactionTargetId: "robot-guide",
        canonicalTransformOwner: "loaded-gltf",
        presentationTransformOwner: "ObservatoryRobot",
        handContactWorld: [...presentation.handContactWorld],
        focusTargetWorld: [...presentation.focusTargetWorld],
      }}
    >
      <mesh
        name="ObservatoryRobotFocusRing"
        visible={selected}
        position={[0, 0.018, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.72, 0.018, 6, 36]} />
        <meshStandardMaterial
          color={threeMaterialPalette.astraea}
          metalness={0.44}
          roughness={0.48}
        />
      </mesh>
      <group scale={presentation.uniformScale}>
        <group position={[...presentation.canonicalOffset]}>
          <primitive object={asset.scene} dispose={null} />
        </group>
      </group>
    </group>
  );
}
