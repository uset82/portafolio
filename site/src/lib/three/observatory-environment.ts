import type { SceneQualityTier } from "./scene-config";
import { naturalPalette } from "@/styles/palette";

type InteractiveEnvironmentTier = Exclude<SceneQualityTier, "static">;

function spreadAngles(count: number, start: number, end: number) {
  if (count <= 1) return [(start + end) / 2];
  return Array.from({ length: count }, (_, index) => start + ((end - start) * index) / (count - 1));
}

const openArc = {
  start: Math.PI * 0.28,
  length: Math.PI * 1.44,
} as const;

const structureArcInset = Math.PI * 0.42;
const structureArc = {
  start: openArc.start + structureArcInset,
  end: openArc.start + openArc.length - structureArcInset,
} as const;

export const OBSERVATORY_ENVIRONMENT_TECHNICAL_ART = {
  visualThesis:
    "A sunlit circular workshop cut open toward the visitor, where linen plaster, sage glass and water, walnut structure, and restrained pewter detail form one calm instrument.",
  contentPlan:
    "The open room frames the editorial safe zone first, the elliptical water basin establishes the center, round windows and the oculus create depth, and future project artifacts occupy the perimeter without changing the room hierarchy.",
  interactionThesis:
    "The environment itself is non-interactive and demand-rendered; later artifact focus may change the authored camera, while reduced quality preserves the same silhouette with fewer structural repetitions.",
  assetStrategy: "procedural-threejs-no-external-textures",
  shot: {
    subject: "open circular observatory, basin, and oculus",
    focalLengthIntent: "wide 35–45mm equivalent",
    horizonMeters: 1.05,
    textSafeZone: "left editorial field remains DOM-owned",
    cameraMotion: "state-owned cuts or cancellable focus transitions; no auto-orbit",
  },
  dimensionsMeters: {
    roomRadius: 8.4,
    floorY: -0.34,
    wallHeight: 5.4,
    wallCenterY: 2.36,
    roofY: 5.04,
    skylightInnerRadius: 2.38,
    skylightOuterRadius: 2.82,
    basinOuterRadius: [7.05, 4.18] as const,
    basinInnerRadius: [6.48, 3.58] as const,
  },
  openArc,
  structureArcInset,
  materials: {
    plaster: naturalPalette.parchment,
    floor: naturalPalette.offWhite,
    stone: naturalPalette.linen,
    warmTrim: naturalPalette.buff,
    windowGlass: naturalPalette.paleSage,
    timber: naturalPalette.walnut,
    metal: naturalPalette.pewter,
    waterDepth: naturalPalette.waterSlate,
    structureShadow: naturalPalette.espresso,
  },
  renderer: {
    outputColorSpace: "srgb",
    toneMapping: "aces-filmic",
    exposure: 1.08,
    background: "transparent",
    shadows: false,
    postPasses: 0,
  },
  tiers: {
    full: {
      radialSegments: 64,
      windowSegments: 40,
      windowAngles: spreadAngles(5, Math.PI * 0.58, Math.PI * 1.42),
      wallRibAngles: spreadAngles(11, structureArc.start, structureArc.end),
      roofBeamAngles: spreadAngles(9, structureArc.start, structureArc.end),
      budget: {
        maximumDrawCalls: 58,
        maximumTriangles: 18_000,
        maximumGeometries: 58,
        maximumMaterials: 9,
        maximumTextures: 0,
        shadowCastingLights: 0,
        postPasses: 0,
      },
    },
    reduced: {
      radialSegments: 32,
      windowSegments: 24,
      windowAngles: spreadAngles(3, Math.PI * 0.7, Math.PI * 1.3),
      wallRibAngles: spreadAngles(7, structureArc.start, structureArc.end),
      roofBeamAngles: spreadAngles(5, structureArc.start, structureArc.end),
      budget: {
        maximumDrawCalls: 38,
        maximumTriangles: 7_500,
        maximumGeometries: 38,
        maximumMaterials: 9,
        maximumTextures: 0,
        shadowCastingLights: 0,
        postPasses: 0,
      },
    },
  } satisfies Record<InteractiveEnvironmentTier, unknown>,
} as const;

export function resolveObservatoryEnvironmentPresentation(quality: SceneQualityTier) {
  if (quality === "static") return null;
  return OBSERVATORY_ENVIRONMENT_TECHNICAL_ART.tiers[quality];
}
