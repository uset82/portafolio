import { Euler, Quaternion, Vector3 } from "three";

import { OBSERVATORY_ROBOT_TECHNICAL_ART } from "./robot-system";
import type { SceneQualityTier } from "./scene-config";
import type { SceneMotionMode } from "./scene-state";
import { threeMaterialPalette } from "@/styles/palette";

export const WATER_PRESENTATION_TIERS = ["poster", "simple", "shader"] as const;
export type WaterPresentationTier = (typeof WATER_PRESENTATION_TIERS)[number];

export type WaterPresentation = {
  tier: WaterPresentationTier;
  animated: boolean;
};

type Vector2Tuple = readonly [number, number];
type Vector3Tuple = readonly [number, number, number];

export const WATER_RIPPLE_SLOT_COUNT = 5;
export const WATER_RIPPLE_MODES = {
  inactive: 0,
  transient: 1,
  repeating: 2,
} as const;

type ActiveWaterRippleMode = (typeof WATER_RIPPLE_MODES)["transient" | "repeating"];

type WaterRippleImpulse = {
  origin: Vector2Tuple;
  startedAtSeconds: number;
  strength: number;
  lifetimeSeconds: number;
  mode: ActiveWaterRippleMode;
};

export type WaterRippleSnapshot = {
  origins: readonly Vector2Tuple[];
  startedAtSeconds: readonly number[];
  strengths: readonly number[];
  lifetimesSeconds: readonly number[];
  modes: readonly number[];
};

export type WaterPointerInputResult = Readonly<{
  accepted: boolean;
  reason: "accepted" | "non-finite" | "outside-bounds" | "cooldown";
  slot: number | null;
}>;

export type WaterRippleControllerDiagnostics = Readonly<{
  version: 1;
  atSeconds: number;
  activeRippleCount: number;
  robotRipple: Readonly<{
    slot: 0;
    origin: Vector2Tuple;
    ageSeconds: number;
    cycle: number;
    strength: number;
    periodSeconds: number;
  }>;
  pointerRipples: readonly Readonly<{
    slot: number;
    origin: Vector2Tuple;
    ageSeconds: number;
    normalizedAge: number;
    remainingSeconds: number;
    envelope: number;
    strength: number;
  }>[];
  input: Readonly<{
    accepted: number;
    rejectedNonFinite: number;
    rejectedOutsideBounds: number;
    rejectedCooldown: number;
    lastAcceptedAtSeconds: number | null;
    nextPointerSlot: number;
  }>;
}>;

export type WaterSurfaceDiagnosticsSnapshot = Readonly<{
  version: 1;
  presentation: WaterPresentation;
  atSeconds: number;
  inputEnabled: boolean;
  controller: WaterRippleControllerDiagnostics | null;
}>;

export type WaterSurfaceDiagnostics = Readonly<{
  capture: () => WaterSurfaceDiagnosticsSnapshot;
}>;

const FULL_SEGMENTS = [72, 48] as const;
const SIMPLE_SEGMENTS = [1, 1] as const;

function triangleCount(segments: readonly [number, number]) {
  return segments[0] * segments[1] * 2;
}

export const OBSERVATORY_WATER_TECHNICAL_ART = {
  visualThesis:
    "A shallow slate basin catches muted sage and ivory light like a quiet geological instrument.",
  interactionThesis:
    "One repeating robot-contact impulse and primary pointer/touch presses share a bounded five-slot ripple field only in the full, visible, motion-enabled state; pause freezes the authored surface, reduced motion uses a still lit material, and static quality leaves the poster untouched.",
  assetStrategy: "procedural-shader",
  dimensionsMeters: [14, 8] as const,
  positionMeters: [0, -0.08, 0] as const,
  rotationRadians: [-Math.PI / 2, 0, 0] as const,
  robotContactWorldMeters: OBSERVATORY_ROBOT_TECHNICAL_ART.handWaterTargetMeters,
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
      reflection: "analytic-fresnel-and-directional-glint",
      refraction: "analytic-depth-cue-no-scene-sampling",
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
      reflection: "static-linear-highlight",
      refraction: "none",
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
      reflection: "poster-artwork",
      refraction: "poster-artwork",
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
  rippleContract: {
    maximumSlots: WATER_RIPPLE_SLOT_COUNT,
    robotSlot: 0,
    maximumPointerSlots: WATER_RIPPLE_SLOT_COUNT - 1,
    pointerCooldownSeconds: 0.14,
    pointerLifetimeSeconds: 1.2,
    robotPeriodSeconds: 1.2,
    boundsInsetMeters: 0.24,
    pointerStrength: 0.052,
    robotStrength: 0.034,
    acceptedPointer: "primary-pointer-down-only",
  },
} as const;

const waterWorldToLocalRotation = new Quaternion()
  .setFromEuler(new Euler(...OBSERVATORY_WATER_TECHNICAL_ART.rotationRadians))
  .invert();

export function worldToWaterLocalPoint(worldPoint: Vector3Tuple): Vector2Tuple {
  const local = new Vector3(...worldPoint)
    .sub(new Vector3(...OBSERVATORY_WATER_TECHNICAL_ART.positionMeters))
    .applyQuaternion(waterWorldToLocalRotation);
  return [local.x, local.y];
}

export function isWaterRipplePointInside(point: Vector2Tuple) {
  const [width, height] = OBSERVATORY_WATER_TECHNICAL_ART.dimensionsMeters;
  const inset = OBSERVATORY_WATER_TECHNICAL_ART.rippleContract.boundsInsetMeters;
  return Math.abs(point[0]) <= width / 2 - inset && Math.abs(point[1]) <= height / 2 - inset;
}

function inactiveRippleSnapshotEntry() {
  return {
    origin: [0, 0] as Vector2Tuple,
    startedAtSeconds: 0,
    strength: 0,
    lifetimeSeconds: 1,
    mode: WATER_RIPPLE_MODES.inactive,
  };
}

export class WaterRippleController {
  private readonly slots: Array<WaterRippleImpulse | null> = Array.from(
    { length: WATER_RIPPLE_SLOT_COUNT },
    () => null,
  );
  private lastPointerAtSeconds = Number.NEGATIVE_INFINITY;
  private nextPointerSlot = 1;
  private readonly inputCounts = {
    accepted: 0,
    rejectedNonFinite: 0,
    rejectedOutsideBounds: 0,
    rejectedCooldown: 0,
  };

  constructor(
    robotOrigin: Vector2Tuple = worldToWaterLocalPoint(
      OBSERVATORY_WATER_TECHNICAL_ART.robotContactWorldMeters,
    ),
  ) {
    const contract = OBSERVATORY_WATER_TECHNICAL_ART.rippleContract;
    this.slots[contract.robotSlot] = {
      origin: robotOrigin,
      startedAtSeconds: 0,
      strength: contract.robotStrength,
      lifetimeSeconds: contract.robotPeriodSeconds,
      mode: WATER_RIPPLE_MODES.repeating,
    };
  }

  tryAddPointerRipple(origin: Vector2Tuple, startedAtSeconds: number): WaterPointerInputResult {
    const contract = OBSERVATORY_WATER_TECHNICAL_ART.rippleContract;
    if (!origin.every(Number.isFinite) || !Number.isFinite(startedAtSeconds)) {
      this.inputCounts.rejectedNonFinite += 1;
      return { accepted: false, reason: "non-finite", slot: null };
    }
    if (!isWaterRipplePointInside(origin)) {
      this.inputCounts.rejectedOutsideBounds += 1;
      return { accepted: false, reason: "outside-bounds", slot: null };
    }
    if (startedAtSeconds - this.lastPointerAtSeconds < contract.pointerCooldownSeconds) {
      this.inputCounts.rejectedCooldown += 1;
      return { accepted: false, reason: "cooldown", slot: null };
    }

    let targetSlot = this.nextPointerSlot;
    for (let offset = 0; offset < contract.maximumPointerSlots; offset += 1) {
      const candidate = 1 + ((this.nextPointerSlot - 1 + offset) % contract.maximumPointerSlots);
      const impulse = this.slots[candidate];
      if (!impulse || startedAtSeconds - impulse.startedAtSeconds >= impulse.lifetimeSeconds) {
        targetSlot = candidate;
        break;
      }
    }

    this.slots[targetSlot] = {
      origin: [...origin],
      startedAtSeconds,
      strength: contract.pointerStrength,
      lifetimeSeconds: contract.pointerLifetimeSeconds,
      mode: WATER_RIPPLE_MODES.transient,
    };
    this.nextPointerSlot = 1 + (targetSlot % contract.maximumPointerSlots);
    this.lastPointerAtSeconds = startedAtSeconds;
    this.inputCounts.accepted += 1;
    return { accepted: true, reason: "accepted", slot: targetSlot };
  }

  addPointerRipple(origin: Vector2Tuple, startedAtSeconds: number) {
    return this.tryAddPointerRipple(origin, startedAtSeconds).accepted;
  }

  snapshot(atSeconds: number): WaterRippleSnapshot {
    const entries = this.slots.map((impulse) => {
      if (
        !impulse ||
        (impulse.mode === WATER_RIPPLE_MODES.transient &&
          atSeconds - impulse.startedAtSeconds >= impulse.lifetimeSeconds)
      ) {
        return inactiveRippleSnapshotEntry();
      }
      return impulse;
    });

    return {
      origins: entries.map((entry) => entry.origin),
      startedAtSeconds: entries.map((entry) => entry.startedAtSeconds),
      strengths: entries.map((entry) => entry.strength),
      lifetimesSeconds: entries.map((entry) => entry.lifetimeSeconds),
      modes: entries.map((entry) => entry.mode),
    };
  }

  diagnostics(atSeconds: number): WaterRippleControllerDiagnostics {
    const safeAtSeconds = Number.isFinite(atSeconds) ? Math.max(0, atSeconds) : 0;
    const snapshot = this.snapshot(safeAtSeconds);
    const robotOrigin = snapshot.origins[0]!;
    const robotStartedAt = snapshot.startedAtSeconds[0]!;
    const robotStrength = snapshot.strengths[0]!;
    const robotPeriodSeconds = snapshot.lifetimesSeconds[0]!;
    const robotAgeSeconds = Math.max(0, safeAtSeconds - robotStartedAt);
    const pointerRipples = snapshot.modes.flatMap((mode, slot) => {
      if (slot === 0 || mode !== WATER_RIPPLE_MODES.transient) return [];
      const startedAt = snapshot.startedAtSeconds[slot]!;
      const lifetime = snapshot.lifetimesSeconds[slot]!;
      const ageSeconds = Math.max(0, safeAtSeconds - startedAt);
      const normalizedAge = Math.min(1, ageSeconds / lifetime);
      return [
        {
          slot,
          origin: snapshot.origins[slot]!,
          ageSeconds,
          normalizedAge,
          remainingSeconds: Math.max(0, lifetime - ageSeconds),
          envelope: Math.max(0, 1 - normalizedAge),
          strength: snapshot.strengths[slot]!,
        },
      ];
    });

    return {
      version: 1,
      atSeconds: safeAtSeconds,
      activeRippleCount: 1 + pointerRipples.length,
      robotRipple: {
        slot: 0,
        origin: robotOrigin,
        ageSeconds: robotAgeSeconds,
        cycle: (robotAgeSeconds / robotPeriodSeconds) % 1,
        strength: robotStrength,
        periodSeconds: robotPeriodSeconds,
      },
      pointerRipples,
      input: {
        ...this.inputCounts,
        lastAcceptedAtSeconds: Number.isFinite(this.lastPointerAtSeconds)
          ? this.lastPointerAtSeconds
          : null,
        nextPointerSlot: this.nextPointerSlot,
      },
    };
  }
}

export function captureWaterSurfaceDiagnostics({
  presentation,
  atSeconds,
  controller,
}: {
  presentation: WaterPresentation;
  atSeconds: number;
  controller: WaterRippleController | null;
}): WaterSurfaceDiagnosticsSnapshot {
  const shaderReady = presentation.tier === "shader" && controller !== null;
  const safeAtSeconds = shaderReady && Number.isFinite(atSeconds) ? Math.max(0, atSeconds) : 0;

  return {
    version: 1,
    presentation,
    atSeconds: safeAtSeconds,
    inputEnabled: shaderReady && presentation.animated,
    controller: shaderReady ? controller.diagnostics(safeAtSeconds) : null,
  };
}

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
  uniform vec2 uRippleOrigins[5];
  uniform float uRippleStartedAt[5];
  uniform float uRippleStrengths[5];
  uniform float uRippleLifetimes[5];
  uniform float uRippleModes[5];

  varying vec2 vWaterUv;
  varying vec3 vWaterWorldPosition;
  varying vec3 vWaterNormal;
  varying float vWaterHeight;

  float rippleField(vec2 point) {
    float field = 0.0;
    for (int index = 0; index < 5; index += 1) {
      float mode = uRippleModes[index];
      if (mode > 0.5) {
        float lifetime = max(uRippleLifetimes[index], 0.001);
        float age = max(uTime - uRippleStartedAt[index], 0.0);
        float normalizedAge = age / lifetime;
        float transientActive = 1.0 - step(1.0, normalizedAge);
        float rippleActive = mode > 1.5 ? 1.0 : transientActive;
        float cycle = mode > 1.5 ? fract(normalizedAge) : clamp(normalizedAge, 0.0, 1.0);
        float envelope = (1.0 - cycle) * rippleActive;
        float distanceToOrigin = length(point - uRippleOrigins[index]);
        field += sin(distanceToOrigin * 8.5 - cycle * 6.2831853)
          * exp(-distanceToOrigin * 1.45)
          * envelope
          * uRippleStrengths[index];
      }
    }
    return field;
  }

  float waterHeight(vec2 point) {
    float longWave = sin(point.x * 1.35 + uTime * 0.55) * 0.045;
    float crossWave = sin(point.y * 1.7 - uTime * 0.4) * 0.028;
    return longWave + crossWave + rippleField(point);
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
    vec3 refractedView = refract(-viewDirection, normal, 0.75);

    float fresnel = pow(1.0 - max(dot(viewDirection, normal), 0.0), 3.0);
    float glint = pow(max(dot(reflectedLight, viewDirection), 0.0), 42.0);
    float crest = smoothstep(0.025, 0.08, vWaterHeight);
    float refractionDepthCue = clamp(0.5 - refractedView.y * 0.32 + vWaterHeight * 1.8, 0.0, 1.0);
    float basinFalloff = smoothstep(0.0, 0.34, min(min(vWaterUv.x, 1.0 - vWaterUv.x), min(vWaterUv.y, 1.0 - vWaterUv.y)));
    float edgeFeather = smoothstep(0.0, 0.55, basinFalloff);

    vec3 basinColor = mix(
      uDepthColor,
      uSurfaceColor,
      basinFalloff * 0.5 + refractionDepthCue * 0.16 + crest * 0.18
    );
    vec3 reflectedColor = mix(basinColor, uReflectionColor, fresnel * 0.62);
    vec3 finalColor = reflectedColor + uWarmGlintColor * glint * 0.28;
    float reflectedOpacity = uOpacity * edgeFeather * (0.62 + fresnel * 0.28 + crest * 0.1);

    gl_FragColor = vec4(finalColor, reflectedOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const OBSERVATORY_WATER_SIMPLE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vWaterUv;

  void main() {
    vWaterUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const OBSERVATORY_WATER_SIMPLE_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uSurfaceColor;
  uniform vec3 uReflectionColor;
  uniform float uOpacity;

  varying vec2 vWaterUv;

  void main() {
    float edgeDistance = min(min(vWaterUv.x, 1.0 - vWaterUv.x), min(vWaterUv.y, 1.0 - vWaterUv.y));
    float edgeFeather = smoothstep(0.0, 0.18, edgeDistance);
    float quietReflection = smoothstep(0.12, 0.88, vWaterUv.y) * 0.14;
    vec3 finalColor = mix(uSurfaceColor, uReflectionColor, quietReflection);

    gl_FragColor = vec4(finalColor, uOpacity * edgeFeather);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
