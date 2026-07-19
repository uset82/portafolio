import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";
import { threeMaterialPalette } from "@/styles/palette";

export const WATER_PRESENTATION_TIERS = ["poster", "simple", "shader"] as const;
export type WaterPresentationTier = (typeof WATER_PRESENTATION_TIERS)[number];

export type WaterPresentation = {
  tier: WaterPresentationTier;
  animated: boolean;
};

const FULL_SEGMENTS = [72, 48] as const;
const SIMPLE_SEGMENTS = [1, 1] as const;

function triangleCount(segments: readonly [number, number]) {
  return segments[0] * segments[1] * 2;
}

export const OBSERVATORY_WATER_TECHNICAL_ART = {
  visualThesis:
    "A shallow slate basin catches muted sage and ivory light like a quiet geological instrument.",
  interactionThesis:
    "Ambient ripples run only in the full, visible, motion-enabled state; pause freezes the authored surface, reduced motion uses a still lit material, and static quality leaves the poster untouched.",
  assetStrategy: "procedural-shader",
  dimensionsMeters: [14, 8] as const,
  positionMeters: [0, -0.08, 0] as const,
  rotationRadians: [-Math.PI / 2, 0, 0] as const,
  colors: {
    depth: threeMaterialPalette.waterBasin,
    surface: threeMaterialPalette.waterHighlight,
    reflection: threeMaterialPalette.ceramicRobot,
    warmGlint: threeMaterialPalette.warmIndicator,
  },
  tiers: {
    shader: {
      segments: FULL_SEGMENTS,
      triangles: triangleCount(FULL_SEGMENTS),
      drawCalls: 1,
      geometries: 1,
      materials: 1,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      maximumAnimatedFps: 30,
    },
    simple: {
      segments: SIMPLE_SEGMENTS,
      triangles: triangleCount(SIMPLE_SEGMENTS),
      drawCalls: 1,
      geometries: 1,
      materials: 1,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      maximumAnimatedFps: 0,
    },
    poster: {
      triangles: 0,
      drawCalls: 0,
      geometries: 0,
      materials: 0,
      textures: 0,
      renderTargets: 0,
      postPasses: 0,
      shadowCasters: 0,
      maximumAnimatedFps: 0,
    },
  },
  structuralBudget: {
    maximumShaderTriangles: 7_000,
    maximumSimpleTriangles: 2,
    maximumDrawCalls: 1,
    maximumTextures: 0,
    maximumRenderTargets: 0,
    maximumPostPasses: 0,
  },
} as const;

export function resolveWaterPresentation(
  quality: SceneQualityTier,
  motion: SceneMotionMode,
): WaterPresentation {
  if (quality === "static" || motion === "static") {
    return { tier: "poster", animated: false };
  }
  if (quality === "reduced" || motion === "reduced") {
    return { tier: "simple", animated: false };
  }
  return { tier: "shader", animated: motion === "full" };
}

export const OBSERVATORY_WATER_VERTEX_SHADER = /* glsl */ `
  uniform float uTime;

  varying vec2 vWaterUv;
  varying vec3 vWaterWorldPosition;
  varying vec3 vWaterNormal;
  varying float vWaterHeight;

  float waterHeight(vec2 point) {
    float longWave = sin(point.x * 1.35 + uTime * 0.55) * 0.045;
    float crossWave = sin(point.y * 1.7 - uTime * 0.4) * 0.028;
    vec2 rippleOffset = point - vec2(1.2, -0.7);
    float rippleDistance = length(rippleOffset);
    float ripple = sin(rippleDistance * 3.4 - uTime * 1.1)
      * exp(-rippleDistance * 0.22)
      * 0.038;
    return longWave + crossWave + ripple;
  }

  void main() {
    vWaterUv = uv;

    float sampleStep = 0.06;
    float height = waterHeight(position.xy);
    float heightX = waterHeight(position.xy + vec2(sampleStep, 0.0));
    float heightY = waterHeight(position.xy + vec2(0.0, sampleStep));

    vec3 displaced = position;
    displaced.z += height;

    vec3 objectNormal = normalize(vec3(height - heightX, height - heightY, sampleStep));
    vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);

    vWaterHeight = height;
    vWaterWorldPosition = worldPosition.xyz;
    vWaterNormal = normalize(mat3(modelMatrix) * objectNormal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const OBSERVATORY_WATER_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uDepthColor;
  uniform vec3 uSurfaceColor;
  uniform vec3 uReflectionColor;
  uniform vec3 uWarmGlintColor;
  uniform vec3 uLightDirection;
  uniform float uOpacity;

  varying vec2 vWaterUv;
  varying vec3 vWaterWorldPosition;
  varying vec3 vWaterNormal;
  varying float vWaterHeight;

  void main() {
    vec3 normal = normalize(vWaterNormal);
    vec3 viewDirection = normalize(cameraPosition - vWaterWorldPosition);
    vec3 reflectedLight = reflect(-normalize(uLightDirection), normal);

    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 3.0);
    float glint = pow(max(dot(reflectedLight, viewDirection), 0.0), 42.0);
    float crest = smoothstep(0.025, 0.08, vWaterHeight);
    float basinFalloff = smoothstep(0.0, 0.34, min(min(vWaterUv.x, 1.0 - vWaterUv.x), min(vWaterUv.y, 1.0 - vWaterUv.y)));

    vec3 basinColor = mix(uDepthColor, uSurfaceColor, basinFalloff * 0.58 + crest * 0.18);
    vec3 reflectedColor = mix(basinColor, uReflectionColor, fresnel * 0.62);
    vec3 finalColor = reflectedColor + uWarmGlintColor * glint * 0.28;

    gl_FragColor = vec4(finalColor, uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
