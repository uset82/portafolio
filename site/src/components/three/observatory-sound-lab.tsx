"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { InstancedMesh, Matrix4, MeshStandardMaterial, Vector3, type Group } from "three";

import {
  OBSERVATORY_SOUND_LAB_TECHNICAL_ART,
  captureSoundLabDiagnostics,
  resolveSoundLabAudioAmplitude,
  resolveSoundLabMechanismPose,
  resolveSoundLabPresentation,
  type SoundLabDiagnostics,
  type SoundLabMechanismPose,
  type SoundLabPresentation,
} from "@/lib/three/sound-lab-system";
import type { ObservatorySceneState } from "@/lib/three/scene-state";
import { resolveSceneMotionMode } from "@/lib/three/scene-state";

import {
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";

const KNOB_POSITIONS = [
  [-0.84, 0.52, -0.42],
  [-0.84, 0.52, 0.42],
  [0.84, 0.52, -0.42],
  [0.84, 0.52, 0.42],
] as const;

const CORNER_POSITIONS = [
  [-1.13, 0.45, -0.73],
  [-1.13, 0.45, 0.73],
  [1.13, 0.45, -0.73],
  [1.13, 0.45, 0.73],
] as const;

const DIAL_TICK_COUNT = 16;

function useSoundLabMaterials() {
  const colors = OBSERVATORY_SOUND_LAB_TECHNICAL_ART.colors;
  const materials = useMemo(
    () => ({
      walnut: new MeshStandardMaterial({ color: colors.walnut, roughness: 0.88 }),
      buff: new MeshStandardMaterial({ color: colors.buff, roughness: 0.82 }),
      graphite: new MeshStandardMaterial({ color: colors.graphite, roughness: 0.76 }),
      pewter: new MeshStandardMaterial({ color: colors.pewter, roughness: 0.56, metalness: 0.58 }),
      sage: new MeshStandardMaterial({ color: colors.sage, roughness: 0.72 }),
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

type SoundLabMaterials = ReturnType<typeof useSoundLabMaterials>;

function useBoundedSoundLabInvalidation(animated: boolean, selected: boolean) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!animated) {
      invalidate();
      return;
    }

    invalidate();
    const intervalId = window.setInterval(
      invalidate,
      1_000 / OBSERVATORY_SOUND_LAB_TECHNICAL_ART.maximumAnimatedFps,
    );
    const timeoutId = window.setTimeout(
      () => window.clearInterval(intervalId),
      OBSERVATORY_SOUND_LAB_TECHNICAL_ART.focusDurationMs,
    );
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [animated, invalidate, selected]);
}

function SoundLabHardware({
  reduced,
  materials,
}: {
  reduced: boolean;
  materials: SoundLabMaterials;
}) {
  const knobCount = reduced
    ? OBSERVATORY_SOUND_LAB_TECHNICAL_ART.controls.reducedKnobs
    : OBSERVATORY_SOUND_LAB_TECHNICAL_ART.controls.fullKnobs;
  const knobRef = useRef<InstancedMesh>(null);
  const cornerRef = useRef<InstancedMesh>(null);
  const tickRef = useRef<InstancedMesh>(null);
  const invalidate = useThree((state) => state.invalidate);

  useLayoutEffect(() => {
    const knobMesh = knobRef.current;
    const cornerMesh = cornerRef.current;
    const tickMesh = tickRef.current;
    if (!knobMesh || !cornerMesh || !tickMesh) return;

    const matrix = new Matrix4();
    const position = new Vector3();

    KNOB_POSITIONS.slice(0, knobCount).forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      knobMesh.setMatrixAt(index, matrix);
    });

    CORNER_POSITIONS.forEach(([x, y, z], index) => {
      matrix.makeTranslation(x, y, z);
      cornerMesh.setMatrixAt(index, matrix);
    });

    for (let index = 0; index < DIAL_TICK_COUNT; index += 1) {
      const angle = (Math.PI * 2 * index) / DIAL_TICK_COUNT;
      position.set(Math.cos(angle) * 0.57, 0.535, -0.04 + Math.sin(angle) * 0.57);
      matrix.makeTranslation(position.x, position.y, position.z);
      tickMesh.setMatrixAt(index, matrix);
    }

    knobMesh.instanceMatrix.needsUpdate = true;
    cornerMesh.instanceMatrix.needsUpdate = true;
    tickMesh.instanceMatrix.needsUpdate = true;
    knobMesh.computeBoundingSphere();
    cornerMesh.computeBoundingSphere();
    tickMesh.computeBoundingSphere();
    invalidate();
  }, [invalidate, knobCount]);

  return (
    <>
      <instancedMesh
        ref={knobRef}
        name="SoundLabTactileKnobs"
        args={[undefined, undefined, knobCount]}
        material={materials.graphite}
        castShadow={false}
      >
        <cylinderGeometry args={[0.075, 0.082, 0.13, reduced ? 10 : 16]} />
      </instancedMesh>
      <instancedMesh
        ref={cornerRef}
        name="SoundLabCornerHardware"
        args={[undefined, undefined, CORNER_POSITIONS.length]}
        material={materials.pewter}
        castShadow={false}
      >
        <cylinderGeometry args={[0.035, 0.035, 0.035, reduced ? 8 : 12]} />
      </instancedMesh>
      <instancedMesh
        ref={tickRef}
        name="SoundLabHarmonicDialTicks"
        args={[undefined, undefined, DIAL_TICK_COUNT]}
        material={materials.pewter}
        castShadow={false}
      >
        <cylinderGeometry args={[0.014, 0.014, 0.016, reduced ? 6 : 8]} />
      </instancedMesh>
    </>
  );
}

function SoundLabSlider({
  index,
  materials,
  handleRef,
}: {
  index: number;
  materials: SoundLabMaterials;
  handleRef?: RefObject<Group | null>;
}) {
  const x = index === 0 ? -0.96 : 0.96;
  return (
    <group name="SoundLabSlider" position={[x, 0, 0.1]}>
      <mesh material={materials.pewter} position={[0, 0.485, 0]} castShadow={false}>
        <boxGeometry args={[0.045, 0.025, 0.5]} />
      </mesh>
      <group
        {...(handleRef ? { ref: handleRef } : {})}
        name="SoundLabSliderHandle"
        position={[0, 0.535, -0.12]}
      >
        <mesh material={materials.graphite} castShadow={false}>
          <boxGeometry args={[0.12, 0.09, 0.16]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 0.052, 0]} castShadow={false}>
          <boxGeometry args={[0.045, 0.014, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

function SoundLabMechanism({
  reduced,
  selected,
  animated,
  settleImmediately,
  approvedAmplitude,
  progressRef,
  targetProgressRef,
  poseRef,
}: {
  reduced: boolean;
  selected: boolean;
  animated: boolean;
  settleImmediately: boolean;
  approvedAmplitude: number;
  progressRef: MutableRefObject<number>;
  targetProgressRef: MutableRefObject<number>;
  poseRef: MutableRefObject<SoundLabMechanismPose>;
}) {
  const materials = useSoundLabMaterials();
  const dialRef = useRef<Group>(null);
  const sliderRef = useRef<Group>(null);
  const signalRef = useRef<Group>(null);
  const sliderCount = reduced
    ? OBSERVATORY_SOUND_LAB_TECHNICAL_ART.controls.reducedSliders
    : OBSERVATORY_SOUND_LAB_TECHNICAL_ART.controls.fullSliders;
  const initialPose = resolveSoundLabMechanismPose(selected ? 1 : 0, approvedAmplitude);

  const applyPose = useCallback(
    (focusProgress: number) => {
      const pose = resolveSoundLabMechanismPose(focusProgress, approvedAmplitude);
      poseRef.current = { ...pose };
      if (dialRef.current) {
        dialRef.current.rotation.y = pose.dialRotation;
        dialRef.current.position.y = 0.455 + pose.dialLift;
      }
      if (sliderRef.current) sliderRef.current.position.z = -0.12 + pose.sliderOffset;
      if (signalRef.current) signalRef.current.position.y = 0.565 + pose.signalLift;
    },
    [approvedAmplitude, poseRef],
  );

  useBoundedSoundLabInvalidation(animated, selected);

  useEffect(() => {
    targetProgressRef.current = selected ? 1 : 0;
    if (settleImmediately) progressRef.current = targetProgressRef.current;
    applyPose(progressRef.current);
  }, [applyPose, progressRef, selected, settleImmediately, targetProgressRef]);

  useFrame((_state, delta) => {
    if (!animated || progressRef.current === targetProgressRef.current) return;
    const direction = Math.sign(targetProgressRef.current - progressRef.current);
    const step =
      Math.min(delta, 1 / 12) / (OBSERVATORY_SOUND_LAB_TECHNICAL_ART.focusDurationMs / 1_000);
    progressRef.current = Math.min(Math.max(progressRef.current + direction * step, 0), 1);
    if (Math.abs(progressRef.current - targetProgressRef.current) < 0.001) {
      progressRef.current = targetProgressRef.current;
    }
    applyPose(progressRef.current);
  });

  return (
    <>
      <group name="SoundLabBody">
        <mesh material={materials.walnut} position={[0, 0.14, 0]} castShadow={false}>
          <boxGeometry args={[2.5, 0.28, 1.7]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 0.315, 0]} castShadow={false}>
          <boxGeometry args={[2.42, 0.09, 1.62]} />
        </mesh>
        <mesh material={materials.buff} position={[0, 0.395, 0]} castShadow={false}>
          <boxGeometry args={[2.28, 0.08, 1.48]} />
        </mesh>
      </group>

      <SoundLabHardware reduced={reduced} materials={materials} />

      <group
        ref={dialRef}
        name="SoundLabHarmonicDial"
        position={[0, 0.455 + initialPose.dialLift, -0.04]}
        rotation={[0, initialPose.dialRotation, 0]}
      >
        <mesh material={materials.graphite} castShadow={false}>
          <cylinderGeometry args={[0.66, 0.69, 0.12, reduced ? 32 : 64]} />
        </mesh>
        <mesh material={materials.pewter} position={[0, 0.075, 0]} castShadow={false}>
          <cylinderGeometry args={[0.59, 0.59, 0.035, reduced ? 32 : 64]} />
        </mesh>
        {Array.from({ length: reduced ? 1 : 2 }, (_, index) => (
          <mesh
            key={`harmonic-ring-${index}`}
            name="SoundLabHarmonicRing"
            material={materials.graphite}
            position={[0, 0.1 + index * 0.008, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow={false}
          >
            <torusGeometry
              args={[0.27 + index * 0.19, 0.014, reduced ? 6 : 8, reduced ? 32 : 64]}
            />
          </mesh>
        ))}
      </group>

      <group
        ref={signalRef}
        name="SoundLabSelectionSignal"
        position={[0, 0.565 + initialPose.signalLift, -0.04]}
      >
        <mesh material={materials.sage} castShadow={false}>
          <cylinderGeometry args={[0.095, 0.095, 0.055, reduced ? 12 : 20]} />
        </mesh>
      </group>

      {Array.from({ length: sliderCount }, (_, index) => (
        <SoundLabSlider
          key={`sound-lab-slider-${index}`}
          index={index}
          materials={materials}
          {...(index === 0 ? { handleRef: sliderRef } : {})}
        />
      ))}
    </>
  );
}

export type ObservatorySoundLabProps = {
  measuredAmplitude?: number;
  onDiagnosticsReady?: (diagnostics: SoundLabDiagnostics | null) => void;
};

export function ObservatorySoundLab({
  measuredAmplitude = 0,
  onDiagnosticsReady,
}: ObservatorySoundLabProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const store = useObservatorySceneStore();
  const motionMode = resolveSceneMotionMode(scene);
  const compactViewport =
    scene.capabilities.viewport.width > 0 && scene.capabilities.viewport.width < 768;
  const presentation = resolveSoundLabPresentation(scene.quality.tier, motionMode, compactViewport);
  const selected = scene.selection.artifactId === "sound-lab";
  const approvedAmplitude = resolveSoundLabAudioAmplitude(
    scene.sound,
    motionMode,
    measuredAmplitude,
  );
  const diagnosticsContextRef = useRef<{
    presentation: SoundLabPresentation;
    selected: boolean;
    sound: ObservatorySceneState["sound"];
    approvedAmplitude: number;
  }>({
    presentation,
    selected,
    sound: { ...scene.sound },
    approvedAmplitude,
  });
  const progressRef = useRef(selected ? 1 : 0);
  const targetProgressRef = useRef(selected ? 1 : 0);
  const poseRef = useRef<SoundLabMechanismPose>(
    resolveSoundLabMechanismPose(selected ? 1 : 0, approvedAmplitude),
  );

  useEffect(() => {
    diagnosticsContextRef.current = {
      presentation,
      selected,
      sound: { ...scene.sound },
      approvedAmplitude,
    };
  }, [approvedAmplitude, presentation, scene.sound, selected]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: SoundLabDiagnostics = {
      capture: () => {
        const context = diagnosticsContextRef.current;
        return captureSoundLabDiagnostics({
          presentation: context.presentation,
          selected: context.selected,
          progress: progressRef.current,
          targetProgress: targetProgressRef.current,
          pose: poseRef.current,
          sound: context.sound,
          approvedAmplitude: context.approvedAmplitude,
        });
      },
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [onDiagnosticsReady]);

  if (presentation.tier === "poster") return null;

  const selectSoundLab = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    store.dispatch({ type: "artifact/select", artifactId: "sound-lab" });
  };

  return (
    <group
      name="SoundLabRoot"
      position={[...OBSERVATORY_SOUND_LAB_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_SOUND_LAB_TECHNICAL_ART.rotationRadians]}
      onClick={selectSoundLab}
      userData={{
        interactionTargetId: OBSERVATORY_SOUND_LAB_TECHNICAL_ART.interactionTargetId,
        accessibleLabel: OBSERVATORY_SOUND_LAB_TECHNICAL_ART.accessibleLabel,
        href: OBSERVATORY_SOUND_LAB_TECHNICAL_ART.href,
        selected,
        presentationTier: presentation.tier,
        audioSourceStatus: "awaiting-approved-sources",
        audioResponseActive: approvedAmplitude > 0,
      }}
    >
      <SoundLabMechanism
        reduced={presentation.tier === "reduced"}
        selected={selected}
        animated={presentation.animated}
        settleImmediately={presentation.settleImmediately}
        approvedAmplitude={approvedAmplitude}
        progressRef={progressRef}
        targetProgressRef={targetProgressRef}
        poseRef={poseRef}
      />
    </group>
  );
}
