import type { ObservatoryAssetId } from "./asset-registry-schema";
import { naturalPalette } from "@/styles/palette";

export const SCENE_QUALITY_TIERS = ["static", "reduced", "full"] as const;
export type SceneQualityTier = (typeof SCENE_QUALITY_TIERS)[number];
export type InteractiveSceneQualityTier = Exclude<SceneQualityTier, "static">;

export const OBSERVATORY_SCENE_RUNTIME_BUDGETS = {
  full: {
    maximumDrawCalls: 120,
    maximumTriangles: 180_000,
    maximumMaterials: 24,
  },
  reduced: {
    maximumDrawCalls: 70,
    maximumTriangles: 90_000,
    maximumMaterials: 16,
  },
} as const satisfies Record<
  InteractiveSceneQualityTier,
  {
    maximumDrawCalls: number;
    maximumTriangles: number;
    maximumMaterials: number;
  }
>;

export const SCENE_ARTIFACT_IDS = [
  "robot-guide",
  "drone",
  "astraea",
  "pinaculo",
  "sound-lab",
  "future-energy",
  "electronics-ai",
  "water",
] as const;
export type SceneArtifactId = (typeof SCENE_ARTIFACT_IDS)[number];

export const CAMERA_VIEW_IDS = [
  "home",
  "observatory-entry",
  "astraea",
  "pinaculo",
  "sound-lab",
  "future-energy",
  "electronics-ai",
  "fallback",
] as const;
export type CameraViewId = (typeof CAMERA_VIEW_IDS)[number];

type Vector3Tuple = readonly [number, number, number];

export type CameraView = {
  id: CameraViewId;
  position: Vector3Tuple;
  target: Vector3Tuple;
  fov: number;
  near: number;
  far: number;
  durationMs: number;
};

export const CAMERA_VIEWS = {
  home: {
    id: "home",
    position: [10.5, 5.4, 15.5],
    target: [1.4, 1.05, 0],
    fov: 40,
    near: 0.1,
    far: 64,
    durationMs: 650,
  },
  "observatory-entry": {
    id: "observatory-entry",
    position: [8.4, 4.4, 12.6],
    target: [1.8, 0.85, -0.4],
    fov: 39,
    near: 0.1,
    far: 64,
    durationMs: 900,
  },
  astraea: {
    id: "astraea",
    position: [5.2, 4.2, 6],
    target: [6.1, 2.1, -1.2],
    fov: 36,
    near: 0.1,
    far: 48,
    durationMs: 760,
  },
  pinaculo: {
    id: "pinaculo",
    position: [5.1, 2.2, 7.1],
    target: [3.1, 0.55, 1.7],
    fov: 38,
    near: 0.1,
    far: 48,
    durationMs: 700,
  },
  "sound-lab": {
    id: "sound-lab",
    position: [-5.8, 2.4, 6.8],
    target: [-4.6, 0.85, 1.2],
    fov: 37,
    near: 0.1,
    far: 48,
    durationMs: 700,
  },
  "future-energy": {
    id: "future-energy",
    position: [1.2, 4.5, 8.4],
    target: [0.2, 2.2, -2.8],
    fov: 38,
    near: 0.1,
    far: 48,
    durationMs: 760,
  },
  "electronics-ai": {
    id: "electronics-ai",
    position: [-1, 2.3, 3.2],
    target: [-3.6, 0.7, -0.6],
    fov: 30,
    near: 0.1,
    far: 48,
    durationMs: 700,
  },
  fallback: {
    id: "fallback",
    position: [10.5, 5.4, 15.5],
    target: [1.4, 1.05, 0],
    fov: 40,
    near: 0.1,
    far: 64,
    durationMs: 0,
  },
} as const satisfies Record<CameraViewId, CameraView>;

export const ARTIFACT_CAMERA_VIEWS = {
  "robot-guide": "home",
  drone: "home",
  astraea: "astraea",
  pinaculo: "pinaculo",
  "sound-lab": "sound-lab",
  "future-energy": "future-energy",
  "electronics-ai": "electronics-ai",
  water: "observatory-entry",
} as const satisfies Record<SceneArtifactId, CameraViewId>;

export const SCENE_GROUP_IDS = [
  "architecture",
  "water",
  "guide",
  "artifacts",
  "context",
  "environment",
  "camera",
] as const;
export type SceneGroupId = (typeof SCENE_GROUP_IDS)[number];

type SceneGroupDefinition = {
  id: SceneGroupId;
  name: string;
  loadingPriority: "hero-critical" | "deferred" | "on-demand";
  assetIds: readonly ObservatoryAssetId[];
};

export const SCENE_GROUPS = {
  architecture: {
    id: "architecture",
    name: "ObservatoryArchitecture",
    loadingPriority: "hero-critical",
    assetIds: ["observatory-shell"],
  },
  water: {
    id: "water",
    name: "ObservatoryWater",
    loadingPriority: "hero-critical",
    assetIds: ["water-basin"],
  },
  guide: {
    id: "guide",
    name: "ObservatoryGuide",
    loadingPriority: "hero-critical",
    assetIds: ["robot-guide"],
  },
  artifacts: {
    id: "artifacts",
    name: "ObservatoryArtifacts",
    loadingPriority: "on-demand",
    assetIds: [
      "drone",
      "astraea",
      "pinaculo",
      "sound-lab",
      "future-energy",
      "electronics-ai-module",
    ],
  },
  context: {
    id: "context",
    name: "ObservatoryContext",
    loadingPriority: "deferred",
    assetIds: ["props-and-plants"],
  },
  environment: {
    id: "environment",
    name: "ObservatoryEnvironment",
    loadingPriority: "hero-critical",
    assetIds: ["lighting-environment"],
  },
  camera: {
    id: "camera",
    name: "ObservatoryCameraRig",
    loadingPriority: "hero-critical",
    assetIds: ["camera-rig"],
  },
} as const satisfies Record<SceneGroupId, SceneGroupDefinition>;

export type ObservatoryLight =
  | {
      id: "hemisphere";
      kind: "hemisphere";
      color: string;
      groundColor: string;
      intensity: number;
    }
  | {
      id: "key" | "fill" | "rim";
      kind: "directional";
      color: string;
      intensity: number;
      position: Vector3Tuple;
      castShadow: false;
    };

export const OBSERVATORY_LIGHT_RIG = [
  {
    id: "hemisphere",
    kind: "hemisphere",
    color: naturalPalette.warmIvory,
    groundColor: naturalPalette.mutedSage,
    intensity: 0.9,
  },
  {
    id: "key",
    kind: "directional",
    color: naturalPalette.warmIvory,
    intensity: 2.05,
    position: [-5, 9, 7],
    castShadow: false,
  },
  {
    id: "fill",
    kind: "directional",
    color: naturalPalette.buff,
    intensity: 0.72,
    position: [7, 4, 6],
    castShadow: false,
  },
  {
    id: "rim",
    kind: "directional",
    color: naturalPalette.silver,
    intensity: 0.92,
    position: [0, 7, -8],
    castShadow: false,
  },
] as const satisfies readonly ObservatoryLight[];

export const OBSERVATORY_ENVIRONMENT = {
  owner: "ObservatorySceneShell",
  mode: "local-light-rig",
  background: "transparent",
  environmentMapUrl: null,
  fog: null,
  colorSpace: "srgb",
} as const;

export const SCENE_OWNERSHIP = {
  renderer: "ThreeCanvas",
  camera: "ObservatoryCamera",
  scene: "ObservatorySceneShell",
  state: "ObservatorySceneStore",
  assetLifecycle: "gltf-runtime",
  frameLoop: "ReactThreeFiber",
  semanticControls: "DOM",
} as const;
