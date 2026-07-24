"use client";

import { useEffect, useMemo } from "react";
import { DoubleSide, MeshStandardMaterial, Path, Shape, type Material } from "three";

import {
  OBSERVATORY_ENVIRONMENT_TECHNICAL_ART,
  resolveObservatoryEnvironmentPresentation,
} from "@/lib/three/observatory-environment";
import type { SceneQualityTier } from "@/lib/three/scene-config";

type EnvironmentMaterials = ReturnType<typeof createEnvironmentMaterials>;

function createEnvironmentMaterials() {
  const palette = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.materials;

  return {
    plaster: new MeshStandardMaterial({
      color: palette.plaster,
      roughness: 0.94,
      metalness: 0,
      side: DoubleSide,
    }),
    floor: new MeshStandardMaterial({ color: palette.floor, roughness: 0.9, metalness: 0 }),
    stone: new MeshStandardMaterial({ color: palette.stone, roughness: 0.82, metalness: 0 }),
    warmTrim: new MeshStandardMaterial({
      color: palette.warmTrim,
      roughness: 0.72,
      metalness: 0.04,
    }),
    windowGlass: new MeshStandardMaterial({
      color: palette.windowGlass,
      roughness: 0.34,
      metalness: 0.06,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
      side: DoubleSide,
    }),
    timber: new MeshStandardMaterial({ color: palette.timber, roughness: 0.74, metalness: 0 }),
    metal: new MeshStandardMaterial({ color: palette.metal, roughness: 0.38, metalness: 0.58 }),
    waterDepth: new MeshStandardMaterial({
      color: palette.waterDepth,
      roughness: 0.48,
      metalness: 0.05,
      side: DoubleSide,
    }),
    structureShadow: new MeshStandardMaterial({
      color: palette.structureShadow,
      roughness: 0.88,
      metalness: 0,
    }),
  };
}

function useEnvironmentMaterials() {
  const materials = useMemo(() => createEnvironmentMaterials(), []);

  useEffect(
    () => () => {
      Object.values(materials).forEach((material: Material) => material.dispose());
    },
    [materials],
  );

  return materials;
}

function ellipseShape(radiusX: number, radiusY: number) {
  const shape = new Shape();
  shape.absellipse(0, 0, radiusX, radiusY, 0, Math.PI * 2, false, 0);
  return shape;
}

function ellipseRingShape(
  outerRadius: readonly [number, number],
  innerRadius: readonly [number, number],
) {
  const shape = ellipseShape(outerRadius[0], outerRadius[1]);
  const hole = new Path();
  hole.absellipse(0, 0, innerRadius[0], innerRadius[1], 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);
  return shape;
}

function polarPosition(angle: number, radius: number, y: number) {
  return [Math.sin(angle) * radius, y, Math.cos(angle) * radius] as const;
}

function ObservatoryWindowBay({
  angle,
  materials,
  segments,
}: {
  angle: number;
  materials: EnvironmentMaterials;
  segments: number;
}) {
  const roomRadius = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.dimensionsMeters.roomRadius;

  return (
    <group
      name="ObservatoryRoundWindowBay"
      position={[...polarPosition(angle, roomRadius - 0.1, 2.48)]}
      rotation={[0, angle + Math.PI, 0]}
    >
      <mesh name="ObservatoryWindowGlass" material={materials.windowGlass}>
        <circleGeometry args={[1.02, segments]} />
      </mesh>
      <mesh name="ObservatoryWindowFrame" material={materials.timber} position={[0, 0, 0.035]}>
        <torusGeometry args={[1.08, 0.11, 8, segments]} />
      </mesh>
      <mesh
        name="ObservatoryWindowVerticalMullion"
        material={materials.metal}
        position={[0, 0, 0.07]}
      >
        <boxGeometry args={[0.075, 1.72, 0.055]} />
      </mesh>
      <mesh
        name="ObservatoryWindowHorizontalMullion"
        material={materials.metal}
        position={[0, 0, 0.07]}
      >
        <boxGeometry args={[1.72, 0.075, 0.055]} />
      </mesh>
      <mesh
        name="ObservatoryWindowControlledShadow"
        material={materials.structureShadow}
        position={[0, -1.18, -0.02]}
      >
        <boxGeometry args={[1.65, 0.1, 0.14]} />
      </mesh>
    </group>
  );
}

function ObservatoryBasinArchitecture({
  materials,
  segments,
}: {
  materials: EnvironmentMaterials;
  segments: number;
}) {
  const dimensions = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.dimensionsMeters;
  const basinFloor = useMemo(
    () => ellipseShape(dimensions.basinInnerRadius[0], dimensions.basinInnerRadius[1]),
    [dimensions.basinInnerRadius],
  );
  const basinRim = useMemo(
    () => ellipseRingShape(dimensions.basinOuterRadius, dimensions.basinInnerRadius),
    [dimensions.basinInnerRadius, dimensions.basinOuterRadius],
  );
  const basinTrim = useMemo(
    () =>
      ellipseRingShape(
        [dimensions.basinInnerRadius[0] + 0.2, dimensions.basinInnerRadius[1] + 0.2],
        [dimensions.basinInnerRadius[0] + 0.06, dimensions.basinInnerRadius[1] + 0.06],
      ),
    [dimensions.basinInnerRadius],
  );

  return (
    <group name="ObservatoryBasinArchitecture">
      <mesh
        name="ObservatoryBasinDepth"
        material={materials.waterDepth}
        position={[0, -0.23, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[basinFloor, segments]} />
      </mesh>
      <mesh
        name="ObservatoryBasinStoneRim"
        material={materials.stone}
        position={[0, -0.11, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[basinRim, segments]} />
      </mesh>
      <mesh
        name="ObservatoryBasinPewterTrim"
        material={materials.metal}
        position={[0, -0.075, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <shapeGeometry args={[basinTrim, segments]} />
      </mesh>
    </group>
  );
}

function ObservatorySkylight({
  beamAngles,
  materials,
  segments,
}: {
  beamAngles: readonly number[];
  materials: EnvironmentMaterials;
  segments: number;
}) {
  const dimensions = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.dimensionsMeters;
  const beamRadius = (dimensions.roomRadius + dimensions.skylightOuterRadius) / 2;
  const beamLength = dimensions.roomRadius - dimensions.skylightOuterRadius - 0.35;

  return (
    <group name="ObservatorySkylight">
      <mesh
        name="ObservatoryOculusGlass"
        material={materials.windowGlass}
        position={[0, dimensions.roofY + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[dimensions.skylightInnerRadius, segments]} />
      </mesh>
      <mesh
        name="ObservatoryOculusWalnutRing"
        material={materials.timber}
        position={[0, dimensions.roofY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[dimensions.skylightOuterRadius, 0.18, 8, segments]} />
      </mesh>
      <mesh
        name="ObservatoryOculusPewterRing"
        material={materials.metal}
        position={[0, dimensions.roofY - 0.04, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[dimensions.skylightInnerRadius, 0.075, 6, segments]} />
      </mesh>
      {beamAngles.map((angle, index) => (
        <mesh
          key={angle}
          name={`ObservatoryRoofBeam${index + 1}`}
          material={materials.timber}
          position={[...polarPosition(angle, beamRadius, dimensions.roofY - 0.14)]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.16, 0.18, beamLength]} />
        </mesh>
      ))}
    </group>
  );
}

export function ObservatoryEnvironment({ quality }: { quality: SceneQualityTier }) {
  const presentation = resolveObservatoryEnvironmentPresentation(quality);
  const materials = useEnvironmentMaterials();
  const dimensions = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.dimensionsMeters;
  const arc = OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.openArc;

  if (!presentation) return null;

  return (
    <group
      name="ObservatoryProceduralEnvironment"
      userData={{
        assetStrategy: OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.assetStrategy,
        quality,
        maximumDrawCalls: presentation.budget.maximumDrawCalls,
        maximumTriangles: presentation.budget.maximumTriangles,
      }}
    >
      <mesh
        name="ObservatoryFloor"
        material={materials.floor}
        position={[0, dimensions.floorY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[dimensions.roomRadius, presentation.radialSegments]} />
      </mesh>
      <mesh
        name="ObservatoryPlasterWall"
        material={materials.plaster}
        position={[0, dimensions.wallCenterY, 0]}
      >
        <cylinderGeometry
          args={[
            dimensions.roomRadius,
            dimensions.roomRadius,
            dimensions.wallHeight,
            presentation.radialSegments,
            1,
            true,
            arc.start,
            arc.length,
          ]}
        />
      </mesh>
      <mesh
        name="ObservatoryRoofAnnulus"
        material={materials.plaster}
        position={[0, dimensions.roofY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            dimensions.skylightOuterRadius,
            dimensions.roomRadius,
            presentation.radialSegments,
            1,
            arc.start,
            arc.length,
          ]}
        />
      </mesh>
      {presentation.wallRibAngles.map((angle, index) => (
        <mesh
          key={angle}
          name={`ObservatoryWalnutRib${index + 1}`}
          material={materials.timber}
          position={[...polarPosition(angle, dimensions.roomRadius - 0.16, 2.38)]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.2, dimensions.wallHeight - 0.34, 0.28]} />
        </mesh>
      ))}
      {presentation.windowAngles.map((angle) => (
        <ObservatoryWindowBay
          key={angle}
          angle={angle}
          materials={materials}
          segments={presentation.windowSegments}
        />
      ))}
      <ObservatoryBasinArchitecture materials={materials} segments={presentation.radialSegments} />
      <ObservatorySkylight
        beamAngles={presentation.roofBeamAngles}
        materials={materials}
        segments={presentation.radialSegments}
      />
    </group>
  );
}
