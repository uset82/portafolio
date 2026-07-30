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

type DroneCycleClockState = {
  startedAtMs: number | null;
  pausedAtMs: number | null;
};

type DroneRuntimeTimingState = {
  appliedPoseCount: number;
  activePoseCount: number;
  restPoseCount: number;
  lastAppliedAtMs: number | null;
  minimumActiveApplyIntervalMs: number | null;
  lastActiveAppliedAtMs: number | null;
};

function readDroneCycleClock(clock: DroneCycleClockState, nowMs = performance.now()) {
  if (clock.startedAtMs === null) {
    return { elapsedSeconds: 0, cycleCount: 0 };
  }

  const sampledAtMs = clock.pausedAtMs ?? nowMs;
  const totalElapsedSeconds = Math.max(0, sampledAtMs - clock.startedAtMs) / 1_000;
  const cycleSeconds = OBSERVATORY_DRONE_TECHNICAL_ART.motion.cycleSeconds;
  return {
    elapsedSeconds: totalElapsedSeconds % cycleSeconds,
    cycleCount: Math.floor(totalElapsedSeconds / cycleSeconds),
  };
}

function useSparseDroneInvalidation(animated: boolean) {
  const invalidate = useThree((state) => state.invalidate);
  const clockRef = useRef<DroneCycleClockState>({
    startedAtMs: null,
    pausedAtMs: null,
  });

  useEffect(() => {
    if (!animated) {
      if (clockRef.current.startedAtMs !== null && clockRef.current.pausedAtMs === null) {
        clockRef.current.pausedAtMs = performance.now();
      }
      invalidate();
      return;
    }

    const resumedAtMs = performance.now();
    if (clockRef.current.startedAtMs === null) {
      clockRef.current.startedAtMs = resumedAtMs;
    } else if (clockRef.current.pausedAtMs !== null) {
      clockRef.current.startedAtMs += resumedAtMs - clockRef.current.pausedAtMs;
    }
    clockRef.current.pausedAtMs = null;

    let intervalId: number | null = null;
    let phaseTimeoutId: number | null = null;
    let cancelled = false;
    const frameIntervalMs = 1_000 / OBSERVATORY_DRONE_TECHNICAL_ART.maximumAnimatedFps;

    const scheduleCurrentPhase = () => {
      if (cancelled) return;
      if (intervalId !== null) window.clearInterval(intervalId);
      if (phaseTimeoutId !== null) window.clearTimeout(phaseTimeoutId);
      intervalId = null;
      phaseTimeoutId = null;

      const { elapsedSeconds } = readDroneCycleClock(clockRef.current);
      const { activeSeconds, cycleSeconds } = OBSERVATORY_DRONE_TECHNICAL_ART.motion;
      invalidate();

      if (elapsedSeconds < activeSeconds) {
        intervalId = window.setInterval(invalidate, frameIntervalMs);
        phaseTimeoutId = window.setTimeout(
          scheduleCurrentPhase,
          Math.max(1, (activeSeconds - elapsedSeconds) * 1_000),
        );
        return;
      }

      phaseTimeoutId = window.setTimeout(
        scheduleCurrentPhase,
        Math.max(1, (cycleSeconds - elapsedSeconds) * 1_000),
      );
    };

    scheduleCurrentPhase();
    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
      if (phaseTimeoutId !== null) window.clearTimeout(phaseTimeoutId);
    };
  }, [animated, invalidate]);

  return clockRef;
}

function DroneModel({
  tier,
  animated,
  settleImmediately,
  clockRef,
  poseRef,
  timingRef,
}: {
  tier: "full" | "reduced";
  animated: boolean;
  settleImmediately: boolean;
  clockRef: MutableRefObject<DroneCycleClockState>;
  poseRef: MutableRefObject<DroneAmbientPose>;
  timingRef: MutableRefObject<DroneRuntimeTimingState>;
}) {
  const model = useMemo(() => createObservatoryDroneModel(tier), [tier]);
  const hoverRef = useRef<Group>(null);
  const rotorPivotsRef = useRef(model.rotorPivots);
  const cameraGimbalRef = useRef(model.cameraGimbal);
  const appliedPhaseRef = useRef<"active" | "rest" | null>(null);
  const appliedCycleRef = useRef(-1);

  const applyPose = useCallback(
    (pose: DroneAmbientPose, appliedAtMs: number) => {
      const hover = hoverRef.current;
      if (!hover) return;
      hover.position.set(...pose.offsetMeters);
      hover.rotation.set(...pose.rotationRadians);
      rotorPivotsRef.current.forEach((rotor, index) => {
        rotor.rotation.y = pose.rotorRotationRadians * (index % 2 === 0 ? 1 : -1);
      });
      cameraGimbalRef.current.rotation.x = pose.rotationRadians[0] * -0.45;

      poseRef.current = {
        offsetMeters: [...pose.offsetMeters],
        rotationRadians: [...pose.rotationRadians],
        rotorRotationRadians: pose.rotorRotationRadians,
        active: pose.active,
      };
      const timing = timingRef.current;
      timing.appliedPoseCount += 1;
      timing.lastAppliedAtMs = appliedAtMs;
      if (pose.active) {
        timing.activePoseCount += 1;
        if (timing.lastActiveAppliedAtMs !== null) {
          const intervalMs = appliedAtMs - timing.lastActiveAppliedAtMs;
          timing.minimumActiveApplyIntervalMs =
            timing.minimumActiveApplyIntervalMs === null
              ? intervalMs
              : Math.min(timing.minimumActiveApplyIntervalMs, intervalMs);
        }
        timing.lastActiveAppliedAtMs = appliedAtMs;
      } else {
        timing.restPoseCount += 1;
      }
    },
    [poseRef, timingRef],
  );

  useEffect(() => {
    rotorPivotsRef.current = model.rotorPivots;
    cameraGimbalRef.current = model.cameraGimbal;
    return () => model.dispose();
  }, [model]);

  useEffect(() => {
    if (settleImmediately) {
      applyPose(resolveDroneAmbientPose(0), performance.now());
      appliedPhaseRef.current = "rest";
      appliedCycleRef.current = readDroneCycleClock(clockRef.current).cycleCount;
    }
  }, [applyPose, clockRef, settleImmediately]);

  useFrame(() => {
    if (!animated) return;
    const nowMs = performance.now();
    const { elapsedSeconds, cycleCount } = readDroneCycleClock(clockRef.current, nowMs);
    const { activeSeconds } = OBSERVATORY_DRONE_TECHNICAL_ART.motion;
    const minimumIntervalMs = 1_000 / OBSERVATORY_DRONE_TECHNICAL_ART.maximumAnimatedFps;

    if (elapsedSeconds >= activeSeconds) {
      if (appliedPhaseRef.current !== "rest" || appliedCycleRef.current !== cycleCount) {
        applyPose(resolveDroneAmbientPose(activeSeconds), nowMs);
        appliedPhaseRef.current = "rest";
        appliedCycleRef.current = cycleCount;
      }
      return;
    }

    if (activeSeconds - elapsedSeconds < minimumIntervalMs / 1_000) return;
    const lastAppliedAtMs = timingRef.current.lastAppliedAtMs;
    if (lastAppliedAtMs !== null && nowMs - lastAppliedAtMs < minimumIntervalMs) return;

    applyPose(resolveDroneAmbientPose(elapsedSeconds), nowMs);
    appliedPhaseRef.current = "active";
    appliedCycleRef.current = cycleCount;
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
  const droneMotionMode = scene.motion.preference === "reduce" ? "reduced" : motionMode;
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveDronePresentation(
    scene.quality.tier,
    droneMotionMode,
    compactViewport,
  );
  const presentationRef = useRef<DronePresentation>(presentation);
  const poseRef = useRef<DroneAmbientPose>(resolveDroneAmbientPose(0));
  const timingRef = useRef<DroneRuntimeTimingState>({
    appliedPoseCount: 0,
    activePoseCount: 0,
    restPoseCount: 0,
    lastAppliedAtMs: null,
    minimumActiveApplyIntervalMs: null,
    lastActiveAppliedAtMs: null,
  });
  const clockRef = useSparseDroneInvalidation(presentation.animated);
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
          elapsedSeconds: readDroneCycleClock(clockRef.current).elapsedSeconds,
          pose: poseRef.current,
          timing: {
            appliedPoseCount: timingRef.current.appliedPoseCount,
            activePoseCount: timingRef.current.activePoseCount,
            restPoseCount: timingRef.current.restPoseCount,
            cycleCount: readDroneCycleClock(clockRef.current).cycleCount,
            lastAppliedAtMs: timingRef.current.lastAppliedAtMs,
            minimumActiveApplyIntervalMs: timingRef.current.minimumActiveApplyIntervalMs,
          },
        }),
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [clockRef, onDiagnosticsReady]);

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
        interactionNodeName: OBSERVATORY_DRONE_TECHNICAL_ART.interactionNodeName,
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
      <mesh
        name={OBSERVATORY_DRONE_TECHNICAL_ART.interactionNodeName}
        visible={false}
        userData={{
          interactionTargetId: OBSERVATORY_DRONE_TECHNICAL_ART.interactionTargetId,
          accessibleLabel: OBSERVATORY_DRONE_TECHNICAL_ART.accessibleLabel,
          dimensionsMeters: [...OBSERVATORY_DRONE_TECHNICAL_ART.interactionDimensionsMeters],
        }}
      >
        <boxGeometry args={[...OBSERVATORY_DRONE_TECHNICAL_ART.interactionDimensionsMeters]} />
      </mesh>
      <DroneModel
        tier={presentation.tier}
        animated={presentation.animated}
        settleImmediately={presentation.settleImmediately}
        clockRef={clockRef}
        poseRef={poseRef}
        timingRef={timingRef}
      />
    </group>
  );
}
