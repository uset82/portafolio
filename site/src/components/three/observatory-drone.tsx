"use client";

import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";

import { createObservatoryDroneModel } from "@/lib/three/create-observatory-drone-model";
import {
  OBSERVATORY_DRONE_TECHNICAL_ART,
  captureDroneDiagnostics,
  resolveDroneAmbientPose,
  resolveDronePresentation,
  type DroneAmbientPose,
  type DroneDiagnostics,
  type DronePresentation,
} from "@/lib/three/drone-system";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

function useSparseDroneInvalidation(animated: boolean) {
  const invalidate = useThree((state) => state.invalidate);
  const cycleStartedAtRef = useRef(0);

  useEffect(() => {
    if (!animated) {
      invalidate();
      return;
    }

    let intervalId: number | null = null;
    let activeTimeoutId: number | null = null;
    let restTimeoutId: number | null = null;
    let cancelled = false;

    const beginCycle = () => {
      if (cancelled) return;
      cycleStartedAtRef.current = performance.now();
      invalidate();
      intervalId = window.setInterval(
        invalidate,
        1_000 / OBSERVATORY_DRONE_TECHNICAL_ART.maximumAnimatedFps,
      );
      activeTimeoutId = window.setTimeout(() => {
        if (intervalId !== null) window.clearInterval(intervalId);
        intervalId = null;
        invalidate();
        restTimeoutId = window.setTimeout(
          beginCycle,
          OBSERVATORY_DRONE_TECHNICAL_ART.motion.restSeconds * 1_000,
        );
      }, OBSERVATORY_DRONE_TECHNICAL_ART.motion.activeSeconds * 1_000);
    };

    beginCycle();
    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
      if (activeTimeoutId !== null) window.clearTimeout(activeTimeoutId);
      if (restTimeoutId !== null) window.clearTimeout(restTimeoutId);
    };
  }, [animated, invalidate]);

  return cycleStartedAtRef;
}

function DroneModel({
  tier,
  animated,
  settleImmediately,
  elapsedSecondsRef,
  poseRef,
}: {
  tier: "full" | "reduced";
  animated: boolean;
  settleImmediately: boolean;
  elapsedSecondsRef: MutableRefObject<number>;
  poseRef: MutableRefObject<DroneAmbientPose>;
}) {
  const model = useMemo(() => createObservatoryDroneModel(tier), [tier]);
  const hoverRef = useRef<Group>(null);
  const rotorPivotsRef = useRef(model.rotorPivots);
  const cameraGimbalRef = useRef(model.cameraGimbal);
  const cycleStartedAtRef = useSparseDroneInvalidation(animated);

  const applyPose = useCallback(
    (pose: DroneAmbientPose, elapsedSeconds: number) => {
      elapsedSecondsRef.current = elapsedSeconds;
      poseRef.current = {
        offsetMeters: [...pose.offsetMeters],
        rotationRadians: [...pose.rotationRadians],
        rotorRotationRadians: pose.rotorRotationRadians,
        active: pose.active,
      };

      const hover = hoverRef.current;
      if (!hover) return;
      hover.position.set(...pose.offsetMeters);
      hover.rotation.set(...pose.rotationRadians);
      rotorPivotsRef.current.forEach((rotor, index) => {
        rotor.rotation.y = pose.rotorRotationRadians * (index % 2 === 0 ? 1 : -1);
      });
      cameraGimbalRef.current.rotation.x = pose.rotationRadians[0] * -0.45;
    },
    [elapsedSecondsRef, poseRef],
  );

  useEffect(() => {
    rotorPivotsRef.current = model.rotorPivots;
    cameraGimbalRef.current = model.cameraGimbal;
    return () => model.dispose();
  }, [model]);

  useEffect(() => {
    if (settleImmediately) applyPose(resolveDroneAmbientPose(0), 0);
  }, [applyPose, settleImmediately]);

  useFrame(() => {
    if (!animated) return;
    const elapsedSeconds = Math.min(
      (performance.now() - cycleStartedAtRef.current) / 1_000,
      OBSERVATORY_DRONE_TECHNICAL_ART.motion.activeSeconds,
    );
    applyPose(resolveDroneAmbientPose(elapsedSeconds), elapsedSeconds);
  });

  return (
    <group ref={hoverRef} name="DroneHoverController">
      <primitive object={model.root} />
    </group>
  );
}

export type ObservatoryDroneProps = {
  onDiagnosticsReady?: (diagnostics: DroneDiagnostics | null) => void;
};

export function ObservatoryDrone({ onDiagnosticsReady }: ObservatoryDroneProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveDronePresentation(scene.quality.tier, motionMode, compactViewport);
  const presentationRef = useRef<DronePresentation>(presentation);
  const elapsedSecondsRef = useRef(0);
  const poseRef = useRef<DroneAmbientPose>(resolveDroneAmbientPose(0));
  const selected = scene.selection.artifactId === "drone";

  useEffect(() => {
    presentationRef.current = presentation;
  }, [presentation]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: DroneDiagnostics = {
      capture: () =>
        captureDroneDiagnostics({
          presentation: presentationRef.current,
          elapsedSeconds: elapsedSecondsRef.current,
          pose: poseRef.current,
        }),
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [onDiagnosticsReady]);

  if (presentation.tier === "poster") return null;

  const selectDrone = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "drone" });
  };

  return (
    <group
      name="ObservatoryDrone"
      position={[...OBSERVATORY_DRONE_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_DRONE_TECHNICAL_ART.rotationRadians]}
      onClick={selectDrone}
      userData={{
        interactionTargetId: OBSERVATORY_DRONE_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_DRONE_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_DRONE_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
        fidelityClaim: OBSERVATORY_DRONE_TECHNICAL_ART.fidelityClaim,
        motionPattern: "four-seconds-active-eight-seconds-rest",
        visibilityPauseOwner: "ObservatoryCapabilityController",
      }}
    >
      <DroneModel
        tier={presentation.tier}
        animated={presentation.animated}
        settleImmediately={presentation.settleImmediately}
        elapsedSecondsRef={elapsedSecondsRef}
        poseRef={poseRef}
      />
    </group>
  );
}
