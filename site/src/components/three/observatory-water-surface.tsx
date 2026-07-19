"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, ShaderMaterial, Vector3 } from "three";

import { resolveSceneMotionMode } from "@/lib/three/scene-state";
import {
  OBSERVATORY_WATER_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER,
  OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER,
  OBSERVATORY_WATER_TECHNICAL_ART,
  OBSERVATORY_WATER_VERTEX_SHADER,
  resolveWaterPresentation,
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

function ObservatoryShaderWater({ animated }: { animated: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null);
  const tier = OBSERVATORY_WATER_TECHNICAL_ART.tiers.shader;
  const colors = OBSERVATORY_WATER_TECHNICAL_ART.colors;
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDepthColor: { value: new Color(colors.depth) },
      uSurfaceColor: { value: new Color(colors.surface) },
      uReflectionColor: { value: new Color(colors.reflection) },
      uWarmGlintColor: { value: new Color(colors.warmGlint) },
      uLightDirection: { value: new Vector3(-0.45, 0.82, 0.35).normalize() },
      uOpacity: { value: 0.46 },
    }),
    [colors],
  );

  useBoundedWaterInvalidation(animated, tier.maximumAnimatedFps);
  useFrame((_state, delta) => {
    if (animated && materialRef.current) {
      materialRef.current.uniforms.uTime!.value += Math.min(delta, 1.5 / tier.maximumAnimatedFps);
    }
  });

  return (
    <mesh
      name="ObservatoryWaterShaderSurface"
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

export function ObservatoryWaterSurface() {
  const scene = useObservatorySceneSnapshot();
  const motionMode = resolveSceneMotionMode(scene);
  const presentation = resolveWaterPresentation(scene.quality.tier, motionMode);

  if (presentation.tier === "poster") return null;
  if (presentation.tier === "simple") return <ObservatorySimpleWater />;
  return <ObservatoryShaderWater animated={presentation.animated} />;
}
