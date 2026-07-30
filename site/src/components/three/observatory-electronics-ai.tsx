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
import { InstancedMesh, Matrix4, MeshStandardMaterial, type Group } from "three";

import {
  ELECTRONICS_AI_MODULE_CONTRACT,
  OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART,
  captureElectronicsAiDiagnostics,
  resolveElectronicsAiMechanismPose,
  resolveElectronicsAiPresentation,
  type ElectronicsAiDiagnostics,
  type ElectronicsAiMechanismPose,
  type ElectronicsAiPresentation,
} from "@/lib/three/electronics-ai-system";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

function useElectronicsAiMaterials() {
  const colors = OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.colors;
  const materials = useMemo(
    () => ({
      walnut: new MeshStandardMaterial({ color: colors.walnut, roughness: 0.88 }),
      pewter: new MeshStandardMaterial({
        color: colors.pewter,
        roughness: 0.56,
        metalness: 0.56,
      }),
      graphite: new MeshStandardMaterial({ color: colors.graphite, roughness: 0.78 }),
      circuitGreen: new MeshStandardMaterial({ color: colors.circuitGreen, roughness: 0.73 }),
      indicator: new MeshStandardMaterial({ color: colors.indicator, roughness: 0.68 }),
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

type ElectronicsAiMaterials = ReturnType<typeof useElectronicsAiMaterials>;

function useBoundedElectronicsAiInvalidation(
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
      1_000 / OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.maximumAnimatedFps,
    );
    const timeoutId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      settleTransition();
      invalidate();
    }, OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.focusDurationMs);
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [animated, invalidate, selected, settleTransition, shouldTransition]);
}

function ElectronicsAiRepeatedHardware({
  reduced,
  materials,
}: {
  reduced: boolean;
  materials: ElectronicsAiMaterials;
}) {
  const controls = OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.controls;
  const boardCount = reduced ? controls.reducedBoards : controls.fullBoards;
  const grilleCount = reduced ? controls.reducedGrilleBars : controls.fullGrilleBars;
  const coolingRibCount = reduced ? controls.reducedCoolingRibs : controls.fullCoolingRibs;
  const boardRef = useRef<InstancedMesh>(null);
  const grilleRef = useRef<InstancedMesh>(null);
  const coolingRef = useRef<InstancedMesh>(null);
  const socketRef = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const boards = boardRef.current;
    const grille = grilleRef.current;
    const cooling = coolingRef.current;
    const sockets = socketRef.current;
    if (!boards || !grille || !cooling || !sockets) return;

    const matrix = new Matrix4();
    for (let index = 0; index < boardCount; index += 1) {
      const x = -0.5 + index * (1 / (boardCount - 1));
      matrix.makeTranslation(x, 0.66, 0.595);
      boards.setMatrixAt(index, matrix);
    }
    for (let index = 0; index < grilleCount; index += 1) {
      const x = -0.78 + (1.48 * index) / Math.max(grilleCount - 1, 1);
      matrix.makeTranslation(x, 0.66, 0.61);
      grille.setMatrixAt(index, matrix);
    }
    for (let index = 0; index < coolingRibCount; index += 1) {
      const x = -0.72 + (1.44 * index) / Math.max(coolingRibCount - 1, 1);
      matrix.makeTranslation(x, 1.055, -0.08);
      cooling.setMatrixAt(index, matrix);
    }
    for (let index = 0; index < controls.cableSockets; index += 1) {
      const x = -0.6 + index * 0.24;
      matrix.makeRotationX(Math.PI / 2);
      matrix.setPosition(x, 0.34, 0.63);
      sockets.setMatrixAt(index, matrix);
    }

    boards.instanceMatrix.needsUpdate = true;
    grille.instanceMatrix.needsUpdate = true;
    cooling.instanceMatrix.needsUpdate = true;
    sockets.instanceMatrix.needsUpdate = true;
    boards.computeBoundingSphere();
    grille.computeBoundingSphere();
    cooling.computeBoundingSphere();
    sockets.computeBoundingSphere();
    invalidate();
  }, [boardCount, coolingRibCount, controls.cableSockets, grilleCount, invalidate]);

  return (
    <>
      <instancedMesh
        ref={boardRef}
        name="ElectronicsProtectedModules"
        args={[undefined, undefined, boardCount]}
        material={materials.circuitGreen}
        castShadow={false}
      >
        <boxGeometry args={[0.36, 0.48, 0.035]} />
      </instancedMesh>
      <instancedMesh
        ref={grilleRef}
        name="ElectronicsProtectiveGrille"
        args={[undefined, undefined, grilleCount]}
        material={materials.pewter}
        castShadow={false}
      >
        <boxGeometry args={[0.025, 0.54, 0.025]} />
      </instancedMesh>
      <instancedMesh
        ref={coolingRef}
        name="ElectronicsCoolingRibs"
        args={[undefined, undefined, coolingRibCount]}
        material={materials.graphite}
        castShadow={false}
      >
        <boxGeometry args={[0.075, 0.055, 0.72]} />
      </instancedMesh>
      <instancedMesh
        ref={socketRef}
        name="ElectronicsCableSockets"
        args={[undefined, undefined, controls.cableSockets]}
        material={materials.graphite}
        castShadow={false}
      >
        <cylinderGeometry args={[0.055, 0.055, 0.05, reduced ? 8 : 12]} />
      </instancedMesh>
    </>
  );
}

function ElectronicsAiMechanism({
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
  poseRef: MutableRefObject<ElectronicsAiMechanismPose>;
}) {
  const materials = useElectronicsAiMaterials();
  const controlRef = useRef<Group>(null);
  const servicePanelRef = useRef<Group>(null);
  const indicatorRef = useRef<Group>(null);

  const applyPose = useCallback(
    (focusProgress: number) => {
      const pose = resolveElectronicsAiMechanismPose(focusProgress);
      poseRef.current = { ...pose };
      if (controlRef.current) controlRef.current.rotation.z = pose.controlRotation;
      if (servicePanelRef.current) {
        servicePanelRef.current.position.y = 1.025 + pose.servicePanelLift;
      }
      if (indicatorRef.current) indicatorRef.current.position.y = 0.82 + pose.indicatorLift;
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

  useBoundedElectronicsAiInvalidation(animated, selected, shouldTransition, settleTransition);

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
      Math.min(delta, 1 / 12) / (OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.focusDurationMs / 1_000);
    progressRef.current = Math.min(Math.max(progressRef.current + direction * step, 0), 1);
    if (Math.abs(progressRef.current - targetProgressRef.current) < 0.001) {
      progressRef.current = targetProgressRef.current;
    }
    applyPose(progressRef.current);
  });

  return (
    <>
      <group name="ElectronicsChassis">
        <mesh material={materials.walnut} position={[0, 0.12, 0]} castShadow={false}>
          <boxGeometry args={[2.2, 0.24, 1.3]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 0.59, 0]} castShadow={false}>
          <boxGeometry args={[2.04, 0.76, 1.12]} />
        </mesh>
        <mesh material={materials.graphite} position={[0, 0.65, 0.575]} castShadow={false}>
          <boxGeometry args={[1.84, 0.62, 0.025]} />
        </mesh>
      </group>

      <ElectronicsAiRepeatedHardware reduced={reduced} materials={materials} />

      <group position={[0, 0, -0.02]}>
        <group
          ref={(node) => {
            servicePanelRef.current = node;
            if (node) {
              node.position.y =
                1.025 + resolveElectronicsAiMechanismPose(progressRef.current).servicePanelLift;
            }
          }}
          name="ElectronicsServicePanel"
        >
          <mesh material={materials.walnut} castShadow={false}>
            <boxGeometry args={[1.82, 0.075, 0.94]} />
          </mesh>
          <mesh material={materials.pewter} position={[0, 0.047, 0]} castShadow={false}>
            <boxGeometry args={[1.62, 0.02, 0.76]} />
          </mesh>
        </group>
      </group>

      <group position={[0.82, 0.39, 0.64]}>
        <group
          ref={(node) => {
            controlRef.current = node;
            if (node) {
              node.rotation.z = resolveElectronicsAiMechanismPose(
                progressRef.current,
              ).controlRotation;
            }
          }}
          name="ElectronicsTactileControl"
        >
          <mesh material={materials.pewter} rotation={[Math.PI / 2, 0, 0]} castShadow={false}>
            <cylinderGeometry args={[0.14, 0.14, 0.08, reduced ? 14 : 24]} />
          </mesh>
          <mesh material={materials.graphite} position={[0, 0.075, 0.05]} castShadow={false}>
            <boxGeometry args={[0.035, 0.15, 0.035]} />
          </mesh>
        </group>
      </group>

      <group name="ElectronicsIndicators" position={[0.8, 0, 0.635]}>
        <group
          ref={(node) => {
            indicatorRef.current = node;
            if (node) {
              node.position.y =
                0.82 + resolveElectronicsAiMechanismPose(progressRef.current).indicatorLift;
            }
          }}
          name="ElectronicsBlankStatusWindow"
          userData={{
            statusWindow: ELECTRONICS_AI_MODULE_CONTRACT.statusWindow,
            emissive: false,
            liveData: false,
          }}
        >
          <mesh material={materials.pewter} castShadow={false}>
            <boxGeometry args={[0.3, 0.23, 0.035]} />
          </mesh>
          <mesh material={materials.indicator} position={[0, 0, 0.022]} castShadow={false}>
            <boxGeometry args={[0.2, 0.13, 0.025]} />
          </mesh>
        </group>
      </group>
    </>
  );
}

export type ObservatoryElectronicsAiProps = {
  onDiagnosticsReady?: (diagnostics: ElectronicsAiDiagnostics | null) => void;
};

export function ObservatoryElectronicsAi({
  onDiagnosticsReady,
}: ObservatoryElectronicsAiProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveElectronicsAiPresentation(
    scene.quality.tier,
    motionMode,
    compactViewport,
  );
  const selected = scene.selection.artifactId === "electronics-ai";
  const diagnosticsContextRef = useRef<{
    presentation: ElectronicsAiPresentation;
    selected: boolean;
  }>({ presentation, selected });
  const progressRef = useRef(selected ? 1 : 0);
  const targetProgressRef = useRef(selected ? 1 : 0);
  const poseRef = useRef<ElectronicsAiMechanismPose>(
    resolveElectronicsAiMechanismPose(selected ? 1 : 0),
  );

  useEffect(() => {
    diagnosticsContextRef.current = { presentation, selected };
  }, [presentation, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: ElectronicsAiDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return captureElectronicsAiDiagnostics({
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

  const selectElectronicsAi = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "electronics-ai" });
  };

  return (
    <group
      name="ElectronicsRoot"
      position={[...OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.rotationRadians]}
      onClick={selectElectronicsAi}
      userData={{
        interactionNodeName: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionNodeName,
        interactionTargetId: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
        conceptScope: "visual-and-navigational-only",
        ...ELECTRONICS_AI_MODULE_CONTRACT,
      }}
    >
      <mesh
        name={OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionNodeName}
        position={[0, 0.7, 0]}
        visible={false}
        userData={{
          interactionTargetId: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.interactionTargetId,
          accessibleLabel: OBSERVATORY_ELECTRONICS_AI_TECHNICAL_ART.accessibleLabel,
        }}
      >
        <boxGeometry args={[2.4, 1.4, 1.5]} />
      </mesh>
      <ElectronicsAiMechanism
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
