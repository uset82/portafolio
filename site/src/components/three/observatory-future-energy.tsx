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
  CatmullRomCurve3,
  InstancedMesh,
  Matrix4,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Vector3,
  type Group,
} from "three";

import {
  FLOW_BATTERY_CIRCUITS,
  OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART,
  captureFutureEnergyDiagnostics,
  resolveFutureEnergyMechanismPose,
  resolveFutureEnergyPresentation,
  type FutureEnergyDiagnostics,
  type FutureEnergyMechanismPose,
  type FutureEnergyPresentation,
} from "@/lib/three/future-energy-system";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

const GUARD_POST_POSITIONS = [
  [-1.03, 1.28, -0.2],
  [-0.41, 1.28, -0.2],
  [-1.03, 1.28, 0.36],
  [-0.41, 1.28, 0.36],
  [0.41, 1.28, -0.2],
  [1.03, 1.28, -0.2],
  [0.41, 1.28, 0.36],
  [1.03, 1.28, 0.36],
] as const;

const RESERVOIR_CAP_POSITIONS = [
  [-0.72, 0.61, 0.08],
  [-0.72, 1.94, 0.08],
  [0.72, 0.61, 0.08],
  [0.72, 1.94, 0.08],
] as const;

function useFutureEnergyMaterials() {
  const colors = OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.colors;
  const materials = useMemo(
    () => ({
      walnut: new MeshStandardMaterial({ color: colors.walnut, roughness: 0.88 }),
      pewter: new MeshStandardMaterial({
        color: colors.pewter,
        roughness: 0.55,
        metalness: 0.58,
      }),
      glass: new MeshPhysicalMaterial({
        color: colors.glass,
        roughness: 0.18,
        metalness: 0,
        transmission: 0,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      }),
      sageLiquid: new MeshStandardMaterial({
        color: colors.sageLiquid,
        roughness: 0.42,
        transparent: true,
        opacity: 0.86,
      }),
      teaLiquid: new MeshStandardMaterial({
        color: colors.teaLiquid,
        roughness: 0.46,
        transparent: true,
        opacity: 0.84,
      }),
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

type FutureEnergyMaterials = ReturnType<typeof useFutureEnergyMaterials>;

function useBoundedFutureEnergyInvalidation(animated: boolean, selected: boolean) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!animated) {
      invalidate();
      return;
    }

    invalidate();
    const intervalId = window.setInterval(
      invalidate,
      1_000 / OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.maximumAnimatedFps,
    );
    const timeoutId = window.setTimeout(
      () => window.clearInterval(intervalId),
      OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.focusDurationMs,
    );
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [animated, invalidate, selected]);
}

function FutureEnergyRepeatedHardware({
  reduced,
  materials,
}: {
  reduced: boolean;
  materials: FutureEnergyMaterials;
}) {
  const tier = reduced
    ? OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.tiers.reduced
    : OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.tiers.full;
  const guardRef = useRef<InstancedMesh>(null);
  const capRef = useRef<InstancedMesh>(null);
  const stackPlateRef = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const guards = guardRef.current;
    const caps = capRef.current;
    const stackPlates = stackPlateRef.current;
    if (!guards || !caps || !stackPlates) return;

    const matrix = new Matrix4();
    const guardPositions = reduced
      ? [
          GUARD_POST_POSITIONS[0],
          GUARD_POST_POSITIONS[2],
          GUARD_POST_POSITIONS[4],
          GUARD_POST_POSITIONS[6],
        ]
      : GUARD_POST_POSITIONS;
    guardPositions.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      guards.setMatrixAt(index, matrix);
    });
    RESERVOIR_CAP_POSITIONS.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      caps.setMatrixAt(index, matrix);
    });
    for (let index = 0; index < tier.stackPlates; index += 1) {
      const y = 0.79 + (0.78 * index) / Math.max(tier.stackPlates - 1, 1);
      matrix.makeTranslation(0, y, 0.29);
      stackPlates.setMatrixAt(index, matrix);
    }

    guards.instanceMatrix.needsUpdate = true;
    caps.instanceMatrix.needsUpdate = true;
    stackPlates.instanceMatrix.needsUpdate = true;
    guards.computeBoundingSphere();
    caps.computeBoundingSphere();
    stackPlates.computeBoundingSphere();
    invalidate();
  }, [invalidate, reduced, tier.stackPlates]);

  return (
    <>
      <instancedMesh
        ref={guardRef}
        name="FutureEnergyReservoirGuards"
        args={[undefined, undefined, tier.guardPosts]}
        material={materials.pewter}
        castShadow={false}
      >
        <cylinderGeometry args={[0.025, 0.025, 1.48, reduced ? 6 : 10]} />
      </instancedMesh>
      <instancedMesh
        ref={capRef}
        name="FutureEnergyReservoirCaps"
        args={[undefined, undefined, RESERVOIR_CAP_POSITIONS.length]}
        material={materials.pewter}
        castShadow={false}
      >
        <cylinderGeometry args={[0.37, 0.37, 0.09, reduced ? 16 : 28]} />
      </instancedMesh>
      <instancedMesh
        ref={stackPlateRef}
        name="FutureEnergyCellStackPlates"
        args={[undefined, undefined, tier.stackPlates]}
        material={materials.pewter}
        castShadow={false}
      >
        <boxGeometry args={[0.46, 0.045, 0.04]} />
      </instancedMesh>
    </>
  );
}

function FutureEnergyPipeCircuits({
  reduced,
  materials,
}: {
  reduced: boolean;
  materials: FutureEnergyMaterials;
}) {
  const curves = useMemo(
    () =>
      FLOW_BATTERY_CIRCUITS.map(
        (circuit) =>
          new CatmullRomCurve3(
            circuit.pathMeters.map(([x, y, z]) => new Vector3(x, y, z)),
            circuit.closed,
            "catmullrom",
            0.2,
          ),
      ),
    [],
  );

  return (
    <group name="FutureEnergyIndependentPipeCircuits">
      {FLOW_BATTERY_CIRCUITS.map((circuit, index) => (
        <mesh
          key={circuit.id}
          name={`${circuit.id}Circuit`}
          material={materials.pewter}
          castShadow={false}
          userData={{
            circuitId: circuit.id,
            closed: circuit.closed,
            connectsToCircuitIds: [...circuit.connectsToCircuitIds],
            reservoirNode: circuit.reservoirNode,
            stackPortNode: circuit.stackPortNode,
          }}
        >
          <tubeGeometry args={[curves[index]!, reduced ? 32 : 52, 0.025, reduced ? 5 : 8, true]} />
        </mesh>
      ))}
    </group>
  );
}

function FutureEnergyMechanism({
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
  poseRef: MutableRefObject<FutureEnergyMechanismPose>;
}) {
  const materials = useFutureEnergyMaterials();
  const sagePumpRef = useRef<Group>(null);
  const teaPumpRef = useRef<Group>(null);
  const sageSurfaceRef = useRef<Group>(null);
  const teaSurfaceRef = useRef<Group>(null);
  const latchRef = useRef<Group>(null);
  const initialPose = resolveFutureEnergyMechanismPose(selected ? 1 : 0);

  const applyPose = useCallback(
    (focusProgress: number) => {
      const pose = resolveFutureEnergyMechanismPose(focusProgress);
      poseRef.current = { ...pose };
      if (sagePumpRef.current) sagePumpRef.current.rotation.z = pose.sagePumpRotation;
      if (teaPumpRef.current) teaPumpRef.current.rotation.z = pose.teaPumpRotation;
      if (sageSurfaceRef.current) sageSurfaceRef.current.rotation.z = pose.sageSurfaceTilt;
      if (teaSurfaceRef.current) teaSurfaceRef.current.rotation.z = pose.teaSurfaceTilt;
      if (latchRef.current) latchRef.current.position.y = 1.23 + pose.serviceLatchLift;
    },
    [poseRef],
  );

  useBoundedFutureEnergyInvalidation(animated, selected);

  useEffect(() => {
    targetProgressRef.current = selected ? 1 : 0;
    if (settleImmediately) progressRef.current = targetProgressRef.current;
    applyPose(progressRef.current);
  }, [applyPose, progressRef, selected, settleImmediately, targetProgressRef]);

  useFrame((_state, delta) => {
    if (!animated || progressRef.current === targetProgressRef.current) return;
    const direction = Math.sign(targetProgressRef.current - progressRef.current);
    const step =
      Math.min(delta, 1 / 12) / (OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.focusDurationMs / 1_000);
    progressRef.current = Math.min(Math.max(progressRef.current + direction * step, 0), 1);
    if (Math.abs(progressRef.current - targetProgressRef.current) < 0.001) {
      progressRef.current = targetProgressRef.current;
    }
    applyPose(progressRef.current);
  });

  return (
    <>
      <group name="FutureEnergyBase">
        <mesh material={materials.walnut} position={[0, 0.14, 0]} castShadow={false}>
          <boxGeometry args={[2.5, 0.28, 1.6]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 0.315, 0]} castShadow={false}>
          <boxGeometry args={[2.4, 0.08, 1.5]} />
        </mesh>
      </group>

      <FutureEnergyRepeatedHardware reduced={reduced} materials={materials} />
      <FutureEnergyPipeCircuits reduced={reduced} materials={materials} />

      <group name="FutureEnergyVessels">
        <mesh
          name="FutureEnergySageReservoir"
          material={materials.glass}
          position={[-0.72, 1.28, 0.08]}
          renderOrder={2}
          castShadow={false}
        >
          <cylinderGeometry args={[0.34, 0.34, 1.28, reduced ? 20 : 36]} />
        </mesh>
        <mesh
          name="FutureEnergyTeaReservoir"
          material={materials.glass}
          position={[0.72, 1.28, 0.08]}
          renderOrder={2}
          castShadow={false}
        >
          <cylinderGeometry args={[0.34, 0.34, 1.28, reduced ? 20 : 36]} />
        </mesh>
        <mesh material={materials.sageLiquid} position={[-0.72, 1.08, 0.08]} castShadow={false}>
          <cylinderGeometry args={[0.3, 0.3, 0.84, reduced ? 18 : 32]} />
        </mesh>
        <mesh material={materials.teaLiquid} position={[0.72, 1.02, 0.08]} castShadow={false}>
          <cylinderGeometry args={[0.3, 0.3, 0.72, reduced ? 18 : 32]} />
        </mesh>
        <group
          ref={sageSurfaceRef}
          name="FutureEnergySageSurfaceCue"
          position={[-0.72, 1.5, 0.08]}
          rotation={[0, 0, initialPose.sageSurfaceTilt]}
        >
          <mesh material={materials.sageLiquid} castShadow={false}>
            <cylinderGeometry args={[0.302, 0.302, 0.018, reduced ? 18 : 32]} />
          </mesh>
        </group>
        <group
          ref={teaSurfaceRef}
          name="FutureEnergyTeaSurfaceCue"
          position={[0.72, 1.38, 0.08]}
          rotation={[0, 0, initialPose.teaSurfaceTilt]}
        >
          <mesh material={materials.teaLiquid} castShadow={false}>
            <cylinderGeometry args={[0.302, 0.302, 0.018, reduced ? 18 : 32]} />
          </mesh>
        </group>
      </group>

      <group name="FutureEnergyPumps">
        {([-0.5, 0.5] as const).map((x, index) => (
          <group key={x} position={[x, 0.53, 0.49]}>
            <mesh
              name={index === 0 ? "FutureEnergySagePump" : "FutureEnergyTeaPump"}
              material={materials.pewter}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow={false}
            >
              <cylinderGeometry args={[0.16, 0.16, 0.18, reduced ? 12 : 20]} />
            </mesh>
            <group
              ref={index === 0 ? sagePumpRef : teaPumpRef}
              position={[0, 0, 0.1]}
              rotation={[
                0,
                0,
                index === 0 ? initialPose.sagePumpRotation : initialPose.teaPumpRotation,
              ]}
            >
              <mesh material={materials.walnut} castShadow={false}>
                <boxGeometry args={[0.2, 0.035, 0.035]} />
              </mesh>
              <mesh material={materials.walnut} rotation={[0, 0, Math.PI / 2]} castShadow={false}>
                <boxGeometry args={[0.2, 0.035, 0.035]} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      <group name="FutureEnergyCellStack" position={[0, 0, 0]}>
        <mesh material={materials.walnut} position={[0, 1.18, -0.04]} castShadow={false}>
          <boxGeometry args={[0.58, 1.02, 0.56]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 1.18, 0.255]} castShadow={false}>
          <boxGeometry args={[0.46, 0.74, 0.04]} />
        </mesh>
        <group
          ref={latchRef}
          name="FutureEnergyServiceLatch"
          position={[0, 1.23 + initialPose.serviceLatchLift, 0.3]}
        >
          <mesh material={materials.walnut} castShadow={false}>
            <boxGeometry args={[0.18, 0.07, 0.055]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export type ObservatoryFutureEnergyProps = {
  onDiagnosticsReady?: (diagnostics: FutureEnergyDiagnostics | null) => void;
};

export function ObservatoryFutureEnergy({ onDiagnosticsReady }: ObservatoryFutureEnergyProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveFutureEnergyPresentation(
    scene.quality.tier,
    motionMode,
    compactViewport,
  );
  const selected = scene.selection.artifactId === "future-energy";
  const diagnosticsContextRef = useRef<{
    presentation: FutureEnergyPresentation;
    selected: boolean;
  }>({ presentation, selected });
  const progressRef = useRef(selected ? 1 : 0);
  const targetProgressRef = useRef(selected ? 1 : 0);
  const poseRef = useRef<FutureEnergyMechanismPose>(
    resolveFutureEnergyMechanismPose(selected ? 1 : 0),
  );

  useEffect(() => {
    diagnosticsContextRef.current = { presentation, selected };
  }, [presentation, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: FutureEnergyDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return captureFutureEnergyDiagnostics({
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

  const selectFutureEnergy = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "future-energy" });
  };

  return (
    <group
      name="FutureEnergyRoot"
      position={[...OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.rotationRadians]}
      onClick={selectFutureEnergy}
      userData={{
        interactionTargetId: OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_FUTURE_ENERGY_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
        conceptScope: "visual-and-navigational-only",
        circuitIds: FLOW_BATTERY_CIRCUITS.map((circuit) => circuit.id),
        independentCircuits: true,
      }}
    >
      <FutureEnergyMechanism
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
