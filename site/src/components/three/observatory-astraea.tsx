"use client";

import { useCallback, useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Group, MeshStandardMaterial } from "three";

import {
  OBSERVATORY_ASTRAEA_TECHNICAL_ART,
  captureAstraeaDiagnostics,
  resolveAstraeaPresentation,
  resolveAstraeaRingPose,
  type AstraeaDiagnostics,
  type AstraeaPresentation,
  type AstraeaRingPose,
} from "@/lib/three/astraea-system";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

const FULL_RING_RADII = [1.12, 0.86, 0.58] as const;
const REDUCED_RING_RADII = [1.12, 0.72] as const;

function useAstraeaMaterials() {
  const colors = OBSERVATORY_ASTRAEA_TECHNICAL_ART.colors;
  const materials = useMemo(
    () => ({
      parchment: new MeshStandardMaterial({ color: colors.parchment, roughness: 0.88 }),
      pewter: new MeshStandardMaterial({
        color: colors.pewter,
        metalness: 0.48,
        roughness: 0.52,
      }),
      walnut: new MeshStandardMaterial({ color: colors.walnut, roughness: 0.9 }),
      sage: new MeshStandardMaterial({ color: colors.sage, roughness: 0.74 }),
    }),
    [colors],
  );

  useEffect(
    () => () => {
      Object.values(materials).forEach((material) => material.dispose());
    },
    [materials],
  );

  return materials;
}

function useBoundedAstraeaInvalidation(animated: boolean, selected: boolean) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!animated) {
      invalidate();
      return;
    }

    invalidate();
    const intervalId = window.setInterval(
      invalidate,
      1_000 / OBSERVATORY_ASTRAEA_TECHNICAL_ART.maximumAnimatedFps,
    );
    const timeoutId = window.setTimeout(
      () => window.clearInterval(intervalId),
      OBSERVATORY_ASTRAEA_TECHNICAL_ART.focusDurationMs,
    );
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [animated, invalidate, selected]);
}

function AstraeaMechanism({
  reduced,
  selected,
  animated,
  settleImmediately,
  progressRef,
  targetProgressRef,
  poseRef,
}: {
  reduced: boolean;
  selected: boolean;
  animated: boolean;
  settleImmediately: boolean;
  progressRef: MutableRefObject<number>;
  targetProgressRef: MutableRefObject<number>;
  poseRef: MutableRefObject<AstraeaRingPose>;
}) {
  const materials = useAstraeaMaterials();
  const ringRefs = useRef<Array<Group | null>>([]);
  const pointerRef = useRef<Group>(null);
  const ringRadii = reduced ? REDUCED_RING_RADII : FULL_RING_RADII;
  const initialPose = resolveAstraeaRingPose(selected ? 1 : 0);
  const initialRotations = [initialPose.outer, initialPose.middle, initialPose.inner];
  const tier = reduced
    ? OBSERVATORY_ASTRAEA_TECHNICAL_ART.tiers.reduced
    : OBSERVATORY_ASTRAEA_TECHNICAL_ART.tiers.full;

  const applyPose = useCallback(
    (focusProgress: number) => {
      const pose = resolveAstraeaRingPose(focusProgress);
      poseRef.current = { ...pose };
      const rotations = [pose.outer, pose.middle, pose.inner];
      ringRefs.current.forEach((ring, index) => {
        if (ring) ring.rotation.z = rotations[index] ?? pose.middle;
      });
      if (pointerRef.current) pointerRef.current.position.z = 0.2 + pose.pointerLift;
    },
    [poseRef],
  );

  useBoundedAstraeaInvalidation(animated, selected);

  useEffect(() => {
    targetProgressRef.current = selected ? 1 : 0;
    if (settleImmediately) {
      progressRef.current = targetProgressRef.current;
      applyPose(progressRef.current);
    }
  }, [applyPose, progressRef, selected, settleImmediately, targetProgressRef]);

  useFrame((_state, delta) => {
    if (!animated || progressRef.current === targetProgressRef.current) return;
    const direction = Math.sign(targetProgressRef.current - progressRef.current);
    const step =
      Math.min(delta, 1 / 12) / (OBSERVATORY_ASTRAEA_TECHNICAL_ART.focusDurationMs / 1_000);
    progressRef.current = Math.min(Math.max(progressRef.current + direction * step, 0), 1);
    if (Math.abs(progressRef.current - targetProgressRef.current) < 0.001) {
      progressRef.current = targetProgressRef.current;
    }
    applyPose(progressRef.current);
  });

  return (
    <>
      <group name="AstraeaStand">
        <mesh material={materials.walnut} position={[0, 0.11, 0]} castShadow={false}>
          <boxGeometry args={[1.82, 0.22, 0.66]} />
        </mesh>
        <mesh
          material={materials.walnut}
          position={[-0.68, 0.84, 0.02]}
          rotation={[0, 0, -0.17]}
          castShadow={false}
        >
          <boxGeometry args={[0.14, 1.55, 0.18]} />
        </mesh>
        <mesh
          material={materials.walnut}
          position={[0.68, 0.84, 0.02]}
          rotation={[0, 0, 0.17]}
          castShadow={false}
        >
          <boxGeometry args={[0.14, 1.55, 0.18]} />
        </mesh>
      </group>

      <group
        name="AstraeaChart"
        position={[...OBSERVATORY_ASTRAEA_TECHNICAL_ART.chartCenterMeters]}
      >
        <mesh material={materials.parchment} rotation={[Math.PI / 2, 0, 0]} castShadow={false}>
          <cylinderGeometry args={[0.76, 0.76, 0.08, reduced ? 24 : 32]} />
        </mesh>

        {Array.from({ length: tier.radialLineCount }, (_, index) => (
          <mesh
            key={`radial-${index}`}
            name="AstraeaRadialLine"
            material={materials.pewter}
            position={[0, 0, 0.075]}
            rotation={[0, 0, (Math.PI * index) / tier.radialLineCount]}
            castShadow={false}
          >
            <boxGeometry args={[0.018, 2.03, 0.025]} />
          </mesh>
        ))}

        {ringRadii.map((radius, index) => {
          return (
            <group
              key={radius}
              ref={(ring) => {
                ringRefs.current[index] = ring;
              }}
              name={`AstraeaRing${index + 1}`}
              position={[0, 0, 0.11 + index * 0.035]}
              rotation={[0, 0, initialRotations[index] ?? initialPose.middle]}
            >
              <mesh material={materials.pewter} castShadow={false}>
                <torusGeometry
                  args={[radius, index === 0 ? 0.045 : 0.034, reduced ? 6 : 8, reduced ? 32 : 48]}
                />
              </mesh>
              <mesh material={materials.sage} position={[0, radius, 0]} castShadow={false}>
                <boxGeometry args={[index === 0 ? 0.14 : 0.1, 0.075, 0.055]} />
              </mesh>
            </group>
          );
        })}

        {Array.from({ length: tier.fastenerCount }, (_, index) => {
          const angle = (Math.PI * 2 * index) / tier.fastenerCount;
          return (
            <mesh
              key={`fastener-${index}`}
              name="AstraeaFastener"
              material={materials.pewter}
              position={[Math.cos(angle) * 0.96, Math.sin(angle) * 0.96, 0.18]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow={false}
            >
              <cylinderGeometry args={[0.035, 0.035, 0.045, reduced ? 8 : 10]} />
            </mesh>
          );
        })}

        <group ref={pointerRef} name="AstraeaFocusPointer" position={[0, 0, 0.2]}>
          <mesh material={materials.sage} position={[0, 0.43, 0]} castShadow={false}>
            <boxGeometry args={[0.035, 0.78, 0.035]} />
          </mesh>
          <mesh material={materials.pewter} rotation={[Math.PI / 2, 0, 0]} castShadow={false}>
            <cylinderGeometry args={[0.095, 0.095, 0.08, 16]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export type ObservatoryAstraeaProps = {
  onDiagnosticsReady?: (diagnostics: AstraeaDiagnostics | null) => void;
};

export function ObservatoryAstraea({ onDiagnosticsReady }: ObservatoryAstraeaProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveAstraeaPresentation(scene.quality.tier, motionMode, compactViewport);
  const selected = scene.selection.artifactId === "astraea";
  const diagnosticsContextRef = useRef<{
    presentation: AstraeaPresentation;
    selected: boolean;
  }>({ presentation, selected });
  const progressRef = useRef(selected ? 1 : 0);
  const targetProgressRef = useRef(selected ? 1 : 0);
  const poseRef = useRef<AstraeaRingPose>(resolveAstraeaRingPose(selected ? 1 : 0));

  useEffect(() => {
    diagnosticsContextRef.current = { presentation, selected };
  }, [presentation, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: AstraeaDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return captureAstraeaDiagnostics({
          presentation: context.presentation,
          selected: context.selected,
          progress: progressRef.current,
          targetProgress: targetProgressRef.current,
          pose: poseRef.current,
        });
      },
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [onDiagnosticsReady]);

  if (presentation.tier === "poster") return null;

  const selectAstraea = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "astraea" });
  };

  return (
    <group
      name="AstraeaRoot"
      position={[...OBSERVATORY_ASTRAEA_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_ASTRAEA_TECHNICAL_ART.rotationRadians]}
      onClick={selectAstraea}
      userData={{
        interactionTargetId: OBSERVATORY_ASTRAEA_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_ASTRAEA_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_ASTRAEA_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
      }}
    >
      <AstraeaMechanism
        reduced={presentation.tier === "reduced"}
        selected={selected}
        animated={presentation.animated}
        settleImmediately={presentation.settleImmediately}
        progressRef={progressRef}
        targetProgressRef={targetProgressRef}
        poseRef={poseRef}
      />
    </group>
  );
}
