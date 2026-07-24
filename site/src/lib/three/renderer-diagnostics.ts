import type { BufferGeometry, Material, Object3D, Scene, WebGLRenderer } from "three";

import {
  OBSERVATORY_SCENE_RUNTIME_BUDGETS,
  type InteractiveSceneQualityTier,
  type SceneArtifactId,
} from "./scene-config";

const DEFAULT_ACTIVITY_SAMPLE_MS = 1_000;
const MIN_ACTIVITY_SAMPLE_MS = 250;
const MAX_ACTIVITY_SAMPLE_MS = 5_000;

type RenderableObject = Object3D & {
  geometry: BufferGeometry;
  material: Material | Material[];
};

export type ThreeRendererDiagnosticsSnapshot = Readonly<{
  version: 1;
  capturedAtMs: number;
  canvas: Readonly<{
    cssWidth: number;
    cssHeight: number;
    drawingBufferWidth: number;
    drawingBufferHeight: number;
    pixelRatio: number;
  }>;
  render: Readonly<{
    frame: number;
    calls: number;
    triangles: number;
    points: number;
    lines: number;
  }>;
  gpuMemory: Readonly<{
    geometries: number;
    textures: number;
    programs: number;
  }>;
  visibleScene: Readonly<{
    renderableObjects: number;
    geometries: number;
    materials: number;
  }>;
}>;

export type ThreeRendererActivitySample = Readonly<{
  requestedDurationMs: number;
  observedDurationMs: number;
  startFrame: number;
  endFrame: number;
  observedFrames: number;
  observedRenderRate: number;
  meanObservedIntervalMs: number | null;
  forcedFrames: false;
}>;

export type ThreeRendererDiagnosticsScenario = Readonly<{
  id: string;
  buildMode: "development" | "production";
  browser: string;
  deviceClass: "desktop" | "mobile";
  route: string;
  viewport: Readonly<{
    width: number;
    height: number;
    devicePixelRatio: number;
  }>;
  quality: InteractiveSceneQualityTier;
  motion: "full" | "reduced" | "paused";
  selectedArtifact: SceneArtifactId | null;
  console: Readonly<{
    warnings: number;
    errors: number;
  }>;
}>;

export type ThreeRendererBudgetAssessment = Readonly<{
  quality: InteractiveSceneQualityTier;
  verdict: "pass" | "fail";
  checks: readonly Readonly<{
    metric: "drawCalls" | "triangles" | "materials";
    actual: number;
    maximum: number;
    overBy: number;
    passed: boolean;
  }>[];
}>;

export type ThreeRendererDiagnosticsReport = Readonly<{
  version: 1;
  scenario: ThreeRendererDiagnosticsScenario;
  snapshot: ThreeRendererDiagnosticsSnapshot;
  activity: ThreeRendererActivitySample;
  budget: ThreeRendererBudgetAssessment;
  evidence: Readonly<{
    verdict: "pass" | "ineligible";
    blockers: readonly ("development-build" | "console-errors" | "scene-budget-exceeded")[];
  }>;
  limitations: readonly [
    "cpu-frame-time-not-collected",
    "gpu-frame-time-not-collected",
    "texture-memory-mb-not-collected",
  ];
}>;

export type ThreeRendererDiagnostics = Readonly<{
  capture: () => ThreeRendererDiagnosticsSnapshot;
  sampleActivity: (durationMs?: number) => Promise<ThreeRendererActivitySample>;
  reportScenario: (
    scenario: ThreeRendererDiagnosticsScenario,
    durationMs?: number,
  ) => Promise<ThreeRendererDiagnosticsReport>;
}>;

export type ThreeRendererDiagnosticsClock = Readonly<{
  now: () => number;
  wait: (durationMs: number) => Promise<void>;
}>;

function normalizeCount(value: number) {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function normalizeMeasurement(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function isRenderableObject(object: Object3D): object is RenderableObject {
  return "geometry" in object && "material" in object;
}

function countVisibleSceneResources(scene: Scene) {
  const geometries = new Set<string>();
  const materials = new Set<string>();
  let renderableObjects = 0;

  scene.traverseVisible((object) => {
    if (!isRenderableObject(object)) return;
    renderableObjects += 1;
    geometries.add(object.geometry.uuid);
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
    objectMaterials.forEach((material) => materials.add(material.uuid));
  });

  return {
    renderableObjects,
    geometries: geometries.size,
    materials: materials.size,
  };
}

export function resolveRendererActivitySampleDuration(durationMs = DEFAULT_ACTIVITY_SAMPLE_MS) {
  if (!Number.isFinite(durationMs)) return DEFAULT_ACTIVITY_SAMPLE_MS;
  return Math.min(MAX_ACTIVITY_SAMPLE_MS, Math.max(MIN_ACTIVITY_SAMPLE_MS, Math.round(durationMs)));
}

export function captureThreeRendererDiagnostics(
  renderer: WebGLRenderer,
  scene: Scene,
  capturedAtMs: number,
): ThreeRendererDiagnosticsSnapshot {
  const { domElement, info } = renderer;
  const visibleScene = countVisibleSceneResources(scene);

  return {
    version: 1,
    capturedAtMs: normalizeMeasurement(capturedAtMs),
    canvas: {
      cssWidth: normalizeCount(domElement.clientWidth),
      cssHeight: normalizeCount(domElement.clientHeight),
      drawingBufferWidth: normalizeCount(domElement.width),
      drawingBufferHeight: normalizeCount(domElement.height),
      pixelRatio: normalizeMeasurement(renderer.getPixelRatio()),
    },
    render: {
      frame: normalizeCount(info.render.frame),
      calls: normalizeCount(info.render.calls),
      triangles: normalizeCount(info.render.triangles),
      points: normalizeCount(info.render.points),
      lines: normalizeCount(info.render.lines),
    },
    gpuMemory: {
      geometries: normalizeCount(info.memory.geometries),
      textures: normalizeCount(info.memory.textures),
      programs: normalizeCount(info.programs?.length ?? 0),
    },
    visibleScene,
  };
}

export function assessThreeRendererDiagnostics(
  snapshot: ThreeRendererDiagnosticsSnapshot,
  quality: InteractiveSceneQualityTier,
): ThreeRendererBudgetAssessment {
  const budget = OBSERVATORY_SCENE_RUNTIME_BUDGETS[quality];
  const checks: ThreeRendererBudgetAssessment["checks"] = [
    {
      metric: "drawCalls",
      actual: snapshot.render.calls,
      maximum: budget.maximumDrawCalls,
      overBy: Math.max(0, snapshot.render.calls - budget.maximumDrawCalls),
      passed: snapshot.render.calls <= budget.maximumDrawCalls,
    },
    {
      metric: "triangles",
      actual: snapshot.render.triangles,
      maximum: budget.maximumTriangles,
      overBy: Math.max(0, snapshot.render.triangles - budget.maximumTriangles),
      passed: snapshot.render.triangles <= budget.maximumTriangles,
    },
    {
      metric: "materials",
      actual: snapshot.visibleScene.materials,
      maximum: budget.maximumMaterials,
      overBy: Math.max(0, snapshot.visibleScene.materials - budget.maximumMaterials),
      passed: snapshot.visibleScene.materials <= budget.maximumMaterials,
    },
  ];

  return {
    quality,
    verdict: checks.every((check) => check.passed) ? "pass" : "fail",
    checks,
  };
}

export function createThreeRendererDiagnosticsReport({
  scenario,
  snapshot,
  activity,
}: {
  scenario: ThreeRendererDiagnosticsScenario;
  snapshot: ThreeRendererDiagnosticsSnapshot;
  activity: ThreeRendererActivitySample;
}): ThreeRendererDiagnosticsReport {
  const budget = assessThreeRendererDiagnostics(snapshot, scenario.quality);
  const evidenceBlockers: ThreeRendererDiagnosticsReport["evidence"]["blockers"] = [
    ...(scenario.buildMode === "production" ? [] : (["development-build"] as const)),
    ...(scenario.console.errors === 0 ? [] : (["console-errors"] as const)),
    ...(budget.verdict === "pass" ? [] : (["scene-budget-exceeded"] as const)),
  ];

  return {
    version: 1,
    scenario,
    snapshot,
    activity,
    budget,
    evidence: {
      verdict: evidenceBlockers.length === 0 ? "pass" : "ineligible",
      blockers: evidenceBlockers,
    },
    limitations: [
      "cpu-frame-time-not-collected",
      "gpu-frame-time-not-collected",
      "texture-memory-mb-not-collected",
    ],
  };
}

const browserDiagnosticsClock: ThreeRendererDiagnosticsClock = {
  now: () => globalThis.performance.now(),
  wait: (durationMs) =>
    new Promise((resolve) => {
      globalThis.setTimeout(resolve, durationMs);
    }),
};

export function createThreeRendererDiagnostics({
  renderer,
  scene,
  clock = browserDiagnosticsClock,
}: {
  renderer: WebGLRenderer;
  scene: Scene;
  clock?: ThreeRendererDiagnosticsClock;
}): ThreeRendererDiagnostics {
  const capture = () => captureThreeRendererDiagnostics(renderer, scene, clock.now());
  const sampleActivity = async (durationMs?: number) => {
    const requestedDurationMs = resolveRendererActivitySampleDuration(durationMs);
    const start = capture();
    await clock.wait(requestedDurationMs);
    const end = capture();
    const observedDurationMs = Math.max(1, end.capturedAtMs - start.capturedAtMs);
    const observedFrames = Math.max(0, end.render.frame - start.render.frame);

    return {
      requestedDurationMs,
      observedDurationMs,
      startFrame: start.render.frame,
      endFrame: end.render.frame,
      observedFrames,
      observedRenderRate: (observedFrames * 1_000) / observedDurationMs,
      meanObservedIntervalMs: observedFrames > 0 ? observedDurationMs / observedFrames : null,
      forcedFrames: false,
    } satisfies ThreeRendererActivitySample;
  };

  return {
    capture,
    sampleActivity,
    async reportScenario(scenario, durationMs) {
      const activity = await sampleActivity(durationMs);
      return createThreeRendererDiagnosticsReport({
        scenario,
        snapshot: capture(),
        activity,
      });
    },
  };
}
