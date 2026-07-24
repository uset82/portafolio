"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Color, Mesh, ShaderMaterial, Vector2, Vector3 } from "three";

import { resolveSceneMotionMode } from "@/lib/three/scene-state";
import {
  OBSERVATORY_WATER_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER,
  OBSERVATORY_WATER_TECHNICAL_ART,
  OBSERVATORY_WATER_VERTEX_SHADER,
  WaterRippleController,
  captureWaterSurfaceDiagnostics,
  resolveWaterPresentation,
  type WaterRippleSnapshot,
  type WaterSurfaceDiagnostics,
} from "@/lib/three/water-system";

import { useObservatorySceneSnapshot } from "./observatory-scene-provider";

function useBoundedWaterInvalidation(active: boolean, maximumFps: number) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!active || maximumFps <= 0) return;

    invalidate();
    const intervalId = window.setInterval(invalidate, 1_000 / maximumFps);
    return () => window.clearInterval(intervalId);
  }, [active, invalidate, maximumFps]);
}

function applyRippleSnapshot(material: ShaderMaterial, snapshot: WaterRippleSnapshot) {
  const origins = material.uniforms.uRippleOrigins!.value as Vector2[];
  snapshot.origins.forEach((origin, index) => origins[index]!.set(...origin));
  material.uniforms.uRippleStartedAt!.value = [...snapshot.startedAtSeconds];
  material.uniforms.uRippleStrengths!.value = [...snapshot.strengths];
  material.uniforms.uRippleLifetimes!.value = [...snapshot.lifetimesSeconds];
  material.uniforms.uRippleModes!.value = [...snapshot.modes];
}

function ObservatoryShaderWater({
  animated,
  atSecondsRef,
  controllerRef,
}: {
  animated: boolean;
  atSecondsRef: MutableRefObject<number>;
  controllerRef: MutableRefObject<WaterRippleController | null>;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  const tier = OBSERVATORY_WATER_TECHNICAL_ART.tiers.shader;
  const colors = OBSERVATORY_WATER_TECHNICAL_ART.colors;
  const rippleController = useMemo(() => new WaterRippleController(), []);
  const initialRipples = useMemo(() => rippleController.snapshot(0), [rippleController]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRippleOrigins: {
        value: initialRipples.origins.map((origin) => new Vector2(...origin)),
      },
      uRippleStartedAt: { value: [...initialRipples.startedAtSeconds] },
      uRippleStrengths: { value: [...initialRipples.strengths] },
      uRippleLifetimes: { value: [...initialRipples.lifetimesSeconds] },
      uRippleModes: { value: [...initialRipples.modes] },
      uDepthColor: { value: new Color(colors.depth) },
      uSurfaceColor: { value: new Color(colors.surface) },
      uReflectionColor: { value: new Color(colors.reflection) },
      uWarmGlintColor: { value: new Color(colors.warmGlint) },
      uLightDirection: { value: new Vector3(-0.45, 0.82, 0.35).normalize() },
      uOpacity: { value: 0.46 },
    }),
    [colors, initialRipples],
  );

  useBoundedWaterInvalidation(animated, tier.maximumAnimatedFps);
  useEffect(() => {
    controllerRef.current = rippleController;
    atSecondsRef.current = 0;
    return () => {
      if (controllerRef.current === rippleController) controllerRef.current = null;
      atSecondsRef.current = 0;
    };
  }, [atSecondsRef, controllerRef, rippleController]);

  useFrame((_state, delta) => {
    if (animated && materialRef.current) {
      materialRef.current.uniforms.uTime!.value += Math.min(delta, 1.5 / tier.maximumAnimatedFps);
      atSecondsRef.current = materialRef.current.uniforms.uTime!.value as number;
    }
  });

  const addPointerRipple = (event: ThreeEvent<PointerEvent>) => {
    if (!animated || !event.nativeEvent.isPrimary || !meshRef.current || !materialRef.current) {
      return;
    }
    const localPoint = meshRef.current.worldToLocal(event.point.clone());
    const atSeconds = materialRef.current.uniforms.uTime!.value as number;
    if (!rippleController.tryAddPointerRipple([localPoint.x, localPoint.y], atSeconds).accepted) {
      return;
    }

    event.stopPropagation();
    applyRippleSnapshot(materialRef.current, rippleController.snapshot(atSeconds));
    invalidate();
  };

  return (
    <mesh
      ref={meshRef}
      name="ObservatoryWaterShaderSurface"
      position={[...OBSERVATORY_WATER_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_WATER_TECHNICAL_ART.rotationRadians]}
      renderOrder={1}
      receiveShadow={false}
      castShadow={false}
      onPointerDown={addPointerRipple}
      userData={{
        interaction: OBSERVATORY_WATER_TECHNICAL_ART.rippleContract.acceptedPointer,
        robotContactWorld: [...OBSERVATORY_WATER_TECHNICAL_ART.robotContactWorldMeters],
      }}
    >
      <planeGeometry
        args={[
          ...OBSERVATORY_WATER_TECHNICAL_ART.dimensionsMeters,
          tier.segments[0],
          tier.segments[1],
        ]}
      />
      <shaderMaterial
        ref={materialRef}
        name="ObservatoryWaterShaderMaterial"
        uniforms={uniforms}
        vertexShader={OBSERVATORY_WATER_VERTEX_SHADER}
        fragmentShader={OBSERVATORY_WATER_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        toneMapped
      />
    </mesh>
  );
}

function ObservatorySimpleWater() {
  const tier = OBSERVATORY_WATER_TECHNICAL_ART.tiers.simple;
  const colors = OBSERVATORY_WATER_TECHNICAL_ART.colors;
  const uniforms = useMemo(
    () => ({
      uSurfaceColor: { value: new Color(colors.surface) },
      uReflectionColor: { value: new Color(colors.reflection) },
      uOpacity: { value: 0.34 },
    }),
    [colors],
  );

  return (
    <mesh
      name="ObservatoryWaterSimpleSurface"
      position={[...OBSERVATORY_WATER_TECHNICAL_ART.positionMeters]}
      rotation={[...OBSERVATORY_WATER_TECHNICAL_ART.rotationRadians]}
      renderOrder={1}
      receiveShadow={false}
      castShadow={false}
    >
      <planeGeometry
        args={[
          ...OBSERVATORY_WATER_TECHNICAL_ART.dimensionsMeters,
          tier.segments[0],
          tier.segments[1],
        ]}
      />
      <shaderMaterial
        name="ObservatoryWaterSimpleMaterial"
        uniforms={uniforms}
        vertexShader={OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER}
        fragmentShader={OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        toneMapped
      />
    </mesh>
  );
}

export type ObservatoryWaterSurfaceProps = {
  onDiagnosticsReady?: (diagnostics: WaterSurfaceDiagnostics | null) => void;
};

export function ObservatoryWaterSurface({ onDiagnosticsReady }: ObservatoryWaterSurfaceProps = {}) {
  const scene = useObservatorySceneSnapshot();
  const motionMode = resolveSceneMotionMode(scene);
  const presentation = resolveWaterPresentation(scene.quality.tier, motionMode);
  const presentationRef = useRef(presentation);
  const atSecondsRef = useRef(0);
  const controllerRef = useRef<WaterRippleController | null>(null);

  useEffect(() => {
    presentationRef.current = presentation;
  }, [presentation]);

  useEffect(() => {
    if (!onDiagnosticsReady) return;
    const diagnostics: WaterSurfaceDiagnostics = {
      capture: () =>
        captureWaterSurfaceDiagnostics({
          presentation: presentationRef.current,
          atSeconds: atSecondsRef.current,
          controller: controllerRef.current,
        }),
    };
    onDiagnosticsReady(diagnostics);
    return () => onDiagnosticsReady(null);
  }, [onDiagnosticsReady]);

  if (presentation.tier === "poster") return null;
  if (presentation.tier === "simple") return <ObservatorySimpleWater />;
  return (
    <ObservatoryShaderWater
      animated={presentation.animated}
      atSecondsRef={atSecondsRef}
      controllerRef={controllerRef}
    />
  );
}
