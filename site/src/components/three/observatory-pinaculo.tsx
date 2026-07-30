"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  Euler,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";

import {
  OBSERVATORY_PINACULO_TECHNICAL_ART,
  PINACULO_MASTER_GROOVE_COUNT,
  PINACULO_MASTER_PATTERN_STATIONS,
  PINACULO_POSITION_COUNT,
  capturePinaculoDiagnostics,
  resolvePinaculoMechanismPose,
  resolvePinaculoPresentation,
  type PinaculoDiagnostics,
  type PinaculoMechanismPose,
  type PinaculoPresentation,
} from "@/lib/three/pinaculo-system";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

const MARKER_RADIUS = 1.07;

function usePinaculoMaterials() {
  const colors = OBSERVATORY_PINACULO_TECHNICAL_ART.colors;
  const materials = useMemo(
    () => ({
      walnut: new MeshStandardMaterial({ color: colors.walnut, roughness: 0.9 }),
      clay: new MeshStandardMaterial({ color: colors.clay, roughness: 0.84 }),
      buff: new MeshStandardMaterial({ color: colors.buff, roughness: 0.88 }),
      espresso: new MeshStandardMaterial({ color: colors.espresso, roughness: 0.92 }),
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

type PinaculoMaterials = ReturnType<typeof usePinaculoMaterials>;

function useBoundedPinaculoInvalidation(
  animated: boolean,
  selected: boolean,
  shouldTransition: () => boolean,
  settleTransition: () => void,
) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!animated || !shouldTransition()) {
      invalidate();
      return;
    }

    invalidate();
    const intervalId = window.setInterval(
      invalidate,
      1_000 / OBSERVATORY_PINACULO_TECHNICAL_ART.maximumAnimatedFps,
    );
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      settleTransition();
      invalidate();
    }, OBSERVATORY_PINACULO_TECHNICAL_ART.focusDurationMs);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [animated, invalidate, selected, settleTransition, shouldTransition]);
}

function PinaculoMarkerInstances({
  reduced,
  materials,
}: {
  reduced: boolean;
  materials: PinaculoMaterials;
}) {
  const markerRef = useRef<InstancedMesh>(null);
  const grooveRef = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const markerMesh = markerRef.current;
    const grooveMesh = grooveRef.current;
    if (!markerMesh || !grooveMesh) return;

    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3(1, 1, 1);
    const rotation = new Quaternion();

    for (let index = 0; index < PINACULO_POSITION_COUNT; index += 1) {
      const angle = (Math.PI * 2 * index) / PINACULO_POSITION_COUNT;
      position.set(Math.cos(angle) * MARKER_RADIUS, 0.425, Math.sin(angle) * MARKER_RADIUS);
      rotation.identity();
      matrix.compose(position, rotation, scale);
      markerMesh.setMatrixAt(index, matrix);
    }

    let grooveInstance = 0;
    for (const station of PINACULO_MASTER_PATTERN_STATIONS) {
      for (const markerIndex of station.markerIndices) {
        const angle = (Math.PI * 2 * markerIndex) / PINACULO_POSITION_COUNT;
        for (let grooveIndex = 0; grooveIndex < station.groovesPerMarker; grooveIndex += 1) {
          const offset = (grooveIndex - (station.groovesPerMarker - 1) / 2) * 0.025;
          position.set(
            Math.cos(angle) * MARKER_RADIUS - Math.sin(angle) * offset,
            0.505,
            Math.sin(angle) * MARKER_RADIUS + Math.cos(angle) * offset,
          );
          rotation.setFromEuler(new Euler(0, -angle - Math.PI / 2, 0));
          matrix.compose(position, rotation, scale);
          grooveMesh.setMatrixAt(grooveInstance, matrix);
          grooveInstance += 1;
        }
      }
    }

    markerMesh.instanceMatrix.needsUpdate = true;
    grooveMesh.instanceMatrix.needsUpdate = true;
    markerMesh.computeBoundingSphere();
    grooveMesh.computeBoundingSphere();
    invalidate();
  }, [invalidate]);

  return (
    <>
      <instancedMesh
        ref={markerRef}
        name="PinaculoMarkers"
        args={[undefined, undefined, PINACULO_POSITION_COUNT]}
        material={materials.walnut}
        castShadow={false}
      >
        <cylinderGeometry args={[0.065, 0.072, 0.15, reduced ? 6 : 10]} />
      </instancedMesh>
      <instancedMesh
        ref={grooveRef}
        name="PinaculoMasterPatternGrooves"
        args={[undefined, undefined, PINACULO_MASTER_GROOVE_COUNT]}
        material={materials.buff}
        castShadow={false}
      >
        <boxGeometry args={[0.012, 0.01, 0.05]} />
      </instancedMesh>
    </>
  );
}

function PinaculoMechanism({
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
  poseRef: MutableRefObject<PinaculoMechanismPose>;
}) {
  const materials = usePinaculoMaterials();
  const carrierRef = useRef<Group>(null);
  const latchRef = useRef<Group>(null);
  const tier = reduced
    ? OBSERVATORY_PINACULO_TECHNICAL_ART.tiers.reduced
    : OBSERVATORY_PINACULO_TECHNICAL_ART.tiers.full;

  const applyPose = useCallback(
    (focusProgress: number) => {
      const pose = resolvePinaculoMechanismPose(focusProgress);
      poseRef.current = { ...pose };
      if (carrierRef.current) carrierRef.current.rotation.y = pose.carrierRotation;
      if (latchRef.current) latchRef.current.position.y = 0.43 + pose.latchLift;
    },
    [poseRef],
  );

  const settleTransition = useCallback(() => {
    progressRef.current = targetProgressRef.current;
    applyPose(progressRef.current);
  }, [applyPose, progressRef, targetProgressRef]);
  const shouldTransition = useCallback(
    () => progressRef.current !== (selected ? 1 : 0),
    [progressRef, selected],
  );

  useBoundedPinaculoInvalidation(animated, selected, shouldTransition, settleTransition);

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
      Math.min(delta, 1 / 12) / (OBSERVATORY_PINACULO_TECHNICAL_ART.focusDurationMs / 1_000);
    progressRef.current = Math.min(Math.max(progressRef.current + direction * step, 0), 1);
    if (Math.abs(progressRef.current - targetProgressRef.current) < 0.001) {
      progressRef.current = targetProgressRef.current;
    }
    applyPose(progressRef.current);
  });

  return (
    <>
      <group name="PinaculoBody">
        <mesh material={materials.walnut} position={[0, 0.11, 0]} castShadow={false}>
          <cylinderGeometry args={[1.28, 1.24, 0.22, reduced ? 32 : 64]} />
        </mesh>
        <mesh material={materials.clay} position={[0, 0.245, 0]} castShadow={false}>
          <cylinderGeometry args={[1.19, 1.19, 0.09, reduced ? 32 : 64]} />
        </mesh>
        <mesh material={materials.buff} position={[0, 0.315, 0]} castShadow={false}>
          <cylinderGeometry args={[1.1, 1.1, 0.06, reduced ? 32 : 64]} />
        </mesh>
      </group>

      <group
        ref={(carrier) => {
          carrierRef.current = carrier;
          if (carrier) {
            carrier.rotation.y = resolvePinaculoMechanismPose(progressRef.current).carrierRotation;
          }
        }}
        name="PinaculoRing"
      >
        {Array.from({ length: tier.constructionRingCount }, (_, index) => (
          <mesh
            key={`construction-ring-${index}`}
            name="PinaculoConstructionRing"
            material={materials.espresso}
            position={[0, 0.355 + index * 0.008, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={false}
          >
            <torusGeometry
              args={[0.45 + index * 0.27, 0.012, reduced ? 6 : 8, reduced ? 32 : 64]}
            />
          </mesh>
        ))}
        <PinaculoMarkerInstances reduced={reduced} materials={materials} />
      </group>

      <mesh material={materials.espresso} position={[0, 0.39, 0]} castShadow={false}>
        <cylinderGeometry args={[0.105, 0.105, 0.15, reduced ? 12 : 16]} />
      </mesh>

      <group
        ref={(latch) => {
          latchRef.current = latch;
          if (latch) {
            latch.position.y = 0.43 + resolvePinaculoMechanismPose(progressRef.current).latchLift;
          }
        }}
        name="PinaculoSelectionLatch"
      >
        <mesh material={materials.clay} position={[0, 0, 0.69]} castShadow={false}>
          <boxGeometry args={[0.11, 0.06, 0.72]} />
        </mesh>
        <mesh
          material={materials.espresso}
          position={[0, 0.015, 1.06]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.09, 0.09, 0.08, reduced ? 10 : 14]} />
        </mesh>
      </group>
    </>
  );
}

export type ObservatoryPinaculoProps = {
  onDiagnosticsReady?: (diagnostics: PinaculoDiagnostics | null) => void;
};

export function ObservatoryPinaculo({ onDiagnosticsReady }: ObservatoryPinaculoProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolvePinaculoPresentation(scene.quality.tier, motionMode, compactViewport);
  const selected = scene.selection.artifactId === "pinaculo";
  const diagnosticsContextRef = useRef<{
    presentation: PinaculoPresentation;
    selected: boolean;
  }>({ presentation, selected });
  const progressRef = useRef(selected ? 1 : 0);
  const targetProgressRef = useRef(selected ? 1 : 0);
  const poseRef = useRef<PinaculoMechanismPose>(resolvePinaculoMechanismPose(selected ? 1 : 0));

  useEffect(() => {
    diagnosticsContextRef.current = { presentation, selected };
  }, [presentation, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: PinaculoDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return capturePinaculoDiagnostics({
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

  const selectPinaculo = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "pinaculo" });
  };

  return (
    <group
      name="PinaculoRoot"
      position={[...OBSERVATORY_PINACULO_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_PINACULO_TECHNICAL_ART.rotationRadians]}
      onClick={selectPinaculo}
      userData={{
        interactionNodeName: OBSERVATORY_PINACULO_TECHNICAL_ART.interactionNodeName,
        interactionTargetId: OBSERVATORY_PINACULO_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_PINACULO_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_PINACULO_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
        positionCount: PINACULO_POSITION_COUNT,
        masterReferences: PINACULO_MASTER_PATTERN_STATIONS.map((station) => station.reference),
      }}
    >
      <mesh
        name={OBSERVATORY_PINACULO_TECHNICAL_ART.interactionNodeName}
        position={[0, 0.325, 0]}
        visible={false}
        userData={{
          interactionTargetId: OBSERVATORY_PINACULO_TECHNICAL_ART.interactionTargetId,
          accessibleLabel: OBSERVATORY_PINACULO_TECHNICAL_ART.accessibleLabel,
        }}
      >
        <boxGeometry args={[2.7, 0.65, 2.7]} />
      </mesh>
      <PinaculoMechanism
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
