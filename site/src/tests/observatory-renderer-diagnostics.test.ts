import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Scene, type WebGLRenderer } from "three";

import {
  assessThreeRendererDiagnostics,
  captureThreeRendererDiagnostics,
  createThreeRendererDiagnostics,
  createThreeRendererDiagnosticsReport,
  resolveRendererActivitySampleDuration,
  type ThreeRendererActivitySample,
  type ThreeRendererDiagnosticsScenario,
} from "@/lib/three/renderer-diagnostics";
import { OBSERVATORY_SCENE_RUNTIME_BUDGETS } from "@/lib/three/scene-config";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

function createRendererDouble() {
  const info = {
    memory: { geometries: 7, textures: 2 },
    programs: [{}, {}, {}],
    render: {
      frame: 18,
      calls: 9,
      triangles: 12_480,
      points: 0,
      lines: 4,
    },
  };
  const renderer = {
    domElement: {
      clientWidth: 375,
      clientHeight: 212,
      width: 563,
      height: 318,
    },
    getPixelRatio: () => 1.5,
    info,
  } as unknown as WebGLRenderer;

  return { info, renderer };
}

const productionFullScenario: ThreeRendererDiagnosticsScenario = {
  id: "desktop-home-full",
  buildMode: "production",
  browser: "Chromium QA",
  deviceClass: "desktop",
  route: "/",
  viewport: {
    width: 1_440,
    height: 900,
    devicePixelRatio: 1,
  },
  quality: "full",
  motion: "full",
  selectedArtifact: null,
  console: {
    warnings: 0,
    errors: 0,
  },
};

const settledActivity: ThreeRendererActivitySample = {
  requestedDurationMs: 1_000,
  observedDurationMs: 1_000,
  startFrame: 18,
  endFrame: 18,
  observedFrames: 0,
  observedRenderRate: 0,
  meanObservedIntervalMs: null,
  forcedFrames: false,
};

test("renderer diagnostics capture canvas, completed-render, GPU, and visible-scene evidence", () => {
  const { renderer } = createRendererDouble();
  const scene = new Scene();
  const sharedGeometry = new BoxGeometry();
  const sharedMaterial = new MeshStandardMaterial();
  const visibleGroup = new Group();
  visibleGroup.add(new Mesh(sharedGeometry, sharedMaterial));
  visibleGroup.add(new Mesh(sharedGeometry, sharedMaterial));
  scene.add(visibleGroup);

  const hiddenGroup = new Group();
  hiddenGroup.visible = false;
  hiddenGroup.add(new Mesh(new BoxGeometry(), new MeshStandardMaterial()));
  scene.add(hiddenGroup);

  const snapshot = captureThreeRendererDiagnostics(renderer, scene, 125.5);

  assert.deepEqual(snapshot.canvas, {
    cssWidth: 375,
    cssHeight: 212,
    drawingBufferWidth: 563,
    drawingBufferHeight: 318,
    pixelRatio: 1.5,
  });
  assert.deepEqual(snapshot.render, {
    frame: 18,
    calls: 9,
    triangles: 12_480,
    points: 0,
    lines: 4,
  });
  assert.deepEqual(snapshot.gpuMemory, {
    geometries: 7,
    textures: 2,
    programs: 3,
  });
  assert.deepEqual(snapshot.visibleScene, {
    renderableObjects: 2,
    geometries: 1,
    materials: 1,
  });

  sharedGeometry.dispose();
  sharedMaterial.dispose();
});

test("activity sampling is bounded and observes demand-rendered frames without forcing work", async () => {
  const { info, renderer } = createRendererDouble();
  const scene = new Scene();
  let now = 4_000;
  let waitedFor = 0;
  const diagnostics = createThreeRendererDiagnostics({
    renderer,
    scene,
    clock: {
      now: () => now,
      wait: async (durationMs) => {
        waitedFor = durationMs;
        now += durationMs;
        info.render.frame += 8;
      },
    },
  });

  const sample = await diagnostics.sampleActivity(10);

  assert.equal(resolveRendererActivitySampleDuration(10), 250);
  assert.equal(resolveRendererActivitySampleDuration(60_000), 5_000);
  assert.equal(waitedFor, 250);
  assert.deepEqual(sample, {
    requestedDurationMs: 250,
    observedDurationMs: 250,
    startFrame: 18,
    endFrame: 26,
    observedFrames: 8,
    observedRenderRate: 32,
    meanObservedIntervalMs: 31.25,
    forcedFrames: false,
  });
});

test("scene budgets produce an explicit pass or fail without hiding overages", () => {
  const { renderer } = createRendererDouble();
  const passingSnapshot = captureThreeRendererDiagnostics(renderer, new Scene(), 200);
  const passing = assessThreeRendererDiagnostics(passingSnapshot, "full");
  assert.equal(passing.verdict, "pass");
  assert.deepEqual(
    passing.checks.map(({ metric, maximum, passed }) => ({ metric, maximum, passed })),
    [
      { metric: "drawCalls", maximum: 120, passed: true },
      { metric: "triangles", maximum: 180_000, passed: true },
      { metric: "materials", maximum: 24, passed: true },
    ],
  );

  const failing = assessThreeRendererDiagnostics(
    {
      ...passingSnapshot,
      render: {
        ...passingSnapshot.render,
        calls: 127,
        triangles: 194_000,
      },
      visibleScene: {
        ...passingSnapshot.visibleScene,
        materials: 27,
      },
    },
    "full",
  );

  assert.equal(failing.verdict, "fail");
  assert.deepEqual(
    failing.checks.map(({ metric, overBy, passed }) => ({ metric, overBy, passed })),
    [
      { metric: "drawCalls", overBy: 7, passed: false },
      { metric: "triangles", overBy: 14_000, passed: false },
      { metric: "materials", overBy: 3, passed: false },
    ],
  );
});

test("runtime scene budgets stay aligned with the approved provider-neutral manifest", () => {
  const manifest = JSON.parse(
    readFileSync(path.join(workspaceRoot, "../docs/assets/observatory-3d-manifest.json"), "utf8"),
  ) as {
    sceneBudgets: Record<
      "full" | "reduced",
      { visibleTriangles: number; drawCalls: number; materials: number }
    >;
  };

  for (const quality of ["full", "reduced"] as const) {
    assert.deepEqual(OBSERVATORY_SCENE_RUNTIME_BUDGETS[quality], {
      maximumDrawCalls: manifest.sceneBudgets[quality].drawCalls,
      maximumTriangles: manifest.sceneBudgets[quality].visibleTriangles,
      maximumMaterials: manifest.sceneBudgets[quality].materials,
    });
  }
});

test("scenario reports preserve production context and state unmeasured limitations", async () => {
  const { renderer } = createRendererDouble();
  const scene = new Scene();
  const snapshot = captureThreeRendererDiagnostics(renderer, scene, 500);
  const report = createThreeRendererDiagnosticsReport({
    scenario: productionFullScenario,
    snapshot,
    activity: settledActivity,
  });

  assert.equal(report.scenario.buildMode, "production");
  assert.equal(report.scenario.viewport.width, 1_440);
  assert.equal(report.budget.verdict, "pass");
  assert.deepEqual(report.evidence, {
    verdict: "pass",
    blockers: [],
  });
  assert.deepEqual(report.limitations, [
    "cpu-frame-time-not-collected",
    "gpu-frame-time-not-collected",
    "texture-memory-mb-not-collected",
  ]);

  let now = 1_000;
  const diagnostics = createThreeRendererDiagnostics({
    renderer,
    scene,
    clock: {
      now: () => now,
      wait: async (durationMs) => {
        now += durationMs;
      },
    },
  });
  const generated = await diagnostics.reportScenario(productionFullScenario, 250);
  assert.equal(generated.activity.forcedFrames, false);
  assert.equal(generated.scenario.id, "desktop-home-full");
  assert.equal(generated.budget.verdict, "pass");
  assert.equal(generated.evidence.verdict, "pass");
});

test("development, console-error, and over-budget captures cannot become evidence", () => {
  const { renderer } = createRendererDouble();
  const snapshot = captureThreeRendererDiagnostics(renderer, new Scene(), 500);
  const report = createThreeRendererDiagnosticsReport({
    scenario: {
      ...productionFullScenario,
      buildMode: "development",
      console: {
        warnings: 1,
        errors: 2,
      },
    },
    snapshot: {
      ...snapshot,
      render: {
        ...snapshot.render,
        calls: 121,
      },
    },
    activity: settledActivity,
  });

  assert.deepEqual(report.evidence, {
    verdict: "ineligible",
    blockers: ["development-build", "console-errors", "scene-budget-exceeded"],
  });
});

test("the diagnostics seam is opt-in and does not publish a production global", () => {
  const canvasSource = readSource("src/components/three/three-canvas.tsx");
  const progressiveSource = readSource(
    "src/components/three/observatory-progressive-experience.tsx",
  );

  assert.match(
    canvasSource,
    /onDiagnosticsReady\?: \(diagnostics: ThreeRendererDiagnostics \| null\)/,
  );
  assert.match(canvasSource, /diagnosticsRef/);
  assert.match(canvasSource, /const diagnostics = createThreeRendererDiagnostics/);
  assert.match(canvasSource, /onDiagnosticsReady\?\.\(diagnostics\)/);
  assert.match(canvasSource, /onDiagnosticsReady\?\.\(null\)/);
  assert.match(progressiveSource, /handleRendererDiagnosticsReady/);
  assert.doesNotMatch(canvasSource, /window\.__|globalThis\.__/);
  assert.doesNotMatch(progressiveSource, /window\.__|globalThis\.__/);
});
