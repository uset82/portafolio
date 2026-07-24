import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  cameraPoseFromView,
  captureCameraTransitionDiagnostics,
} from "@/lib/three/camera-transition";
import {
  captureAstraeaDiagnostics,
  resolveAstraeaPresentation,
  resolveAstraeaRingPose,
} from "@/lib/three/astraea-system";
import {
  captureDroneDiagnostics,
  resolveDroneAmbientPose,
  resolveDronePresentation,
} from "@/lib/three/drone-system";
import {
  captureElectronicsAiDiagnostics,
  resolveElectronicsAiMechanismPose,
  resolveElectronicsAiPresentation,
} from "@/lib/three/electronics-ai-system";
import {
  captureFutureEnergyDiagnostics,
  resolveFutureEnergyMechanismPose,
  resolveFutureEnergyPresentation,
} from "@/lib/three/future-energy-system";
import { createObservatoryDiagnostics } from "@/lib/three/observatory-diagnostics";
import {
  capturePinaculoDiagnostics,
  resolvePinaculoMechanismPose,
  resolvePinaculoPresentation,
} from "@/lib/three/pinaculo-system";
import {
  createThreeRendererDiagnosticsReport,
  type ThreeRendererActivitySample,
  type ThreeRendererDiagnostics,
  type ThreeRendererDiagnosticsScenario,
  type ThreeRendererDiagnosticsSnapshot,
} from "@/lib/three/renderer-diagnostics";
import { captureRobotDiagnostics } from "@/lib/three/robot-system";
import { CAMERA_VIEWS } from "@/lib/three/scene-config";
import {
  captureSoundLabDiagnostics,
  resolveSoundLabMechanismPose,
  resolveSoundLabPresentation,
} from "@/lib/three/sound-lab-system";
import {
  WaterRippleController,
  captureWaterSurfaceDiagnostics,
  resolveWaterPresentation,
} from "@/lib/three/water-system";
import {
  OBSERVATORY_TEST_ASSET_ROOT,
  createObservatoryTestGltf,
} from "@/testing/observatory-test-doubles";

const workspaceRoot = process.cwd();

function readSource(relativePath: string) {
  return readFileSync(path.join(workspaceRoot, relativePath), "utf8");
}

const rendererSnapshot: ThreeRendererDiagnosticsSnapshot = {
  version: 1,
  capturedAtMs: 1_000,
  canvas: {
    cssWidth: 1_440,
    cssHeight: 900,
    drawingBufferWidth: 1_440,
    drawingBufferHeight: 900,
    pixelRatio: 1,
  },
  render: {
    frame: 12,
    calls: 1,
    triangles: 100,
    points: 0,
    lines: 0,
  },
  gpuMemory: {
    geometries: 1,
    textures: 0,
    programs: 1,
  },
  visibleScene: {
    renderableObjects: 1,
    geometries: 1,
    materials: 1,
  },
};

const activity: ThreeRendererActivitySample = {
  requestedDurationMs: 1_000,
  observedDurationMs: 1_000,
  startFrame: 12,
  endFrame: 12,
  observedFrames: 0,
  observedRenderRate: 0,
  meanObservedIntervalMs: null,
  forcedFrames: false,
};

const scenario: ThreeRendererDiagnosticsScenario = {
  id: "observatory-full-home",
  buildMode: "production",
  browser: "Chromium",
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

function createRendererFacade(): ThreeRendererDiagnostics {
  return {
    capture: () => rendererSnapshot,
    sampleActivity: async () => activity,
    reportScenario: async (nextScenario) =>
      createThreeRendererDiagnosticsReport({
        scenario: nextScenario,
        snapshot: rendererSnapshot,
        activity,
      }),
  };
}

function createCompleteObservatoryDiagnostics() {
  const camera = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.home,
    scenePhase: "settled",
    mode: "animated",
    requestId: 1,
    currentPose: cameraPoseFromView(CAMERA_VIEWS.home),
    transition: null,
    counters: {
      animatedStarted: 0,
      animatedCompleted: 0,
      immediateCompleted: 1,
      interrupted: 0,
    },
  });
  const drone = captureDroneDiagnostics({
    presentation: resolveDronePresentation("full", "full", false),
    elapsedSeconds: 1,
    pose: resolveDroneAmbientPose(1),
  });
  const robotAsset = createObservatoryTestGltf(
    `${OBSERVATORY_TEST_ASSET_ROOT}/robot-guide-lod-0.glb`,
  );
  const robot = captureRobotDiagnostics({
    root: robotAsset.scene,
    animations: robotAsset.animations,
    quality: "full",
    motion: "full",
    selected: false,
    idleElapsedSeconds: 1,
  });
  const astraea = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveAstraeaRingPose(0),
  });
  const pinaculo = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolvePinaculoMechanismPose(0),
  });
  const soundLab = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveSoundLabMechanismPose(0),
    sound: { status: "muted", muted: true },
    approvedAmplitude: 0,
  });
  const futureEnergy = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveFutureEnergyMechanismPose(0),
  });
  const electronicsAi = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation("full", "full", false),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveElectronicsAiMechanismPose(0),
  });
  const waterController = new WaterRippleController();
  const water = captureWaterSurfaceDiagnostics({
    presentation: resolveWaterPresentation("full", "full"),
    atSeconds: 1,
    controller: waterController,
  });

  return createObservatoryDiagnostics({
    renderer: () => createRendererFacade(),
    camera: () => ({ capture: () => camera }),
    robot: () => ({ capture: () => robot }),
    astraea: () => ({ capture: () => astraea }),
    pinaculo: () => ({ capture: () => pinaculo }),
    soundLab: () => ({ capture: () => soundLab }),
    futureEnergy: () => ({ capture: () => futureEnergy }),
    electronicsAi: () => ({ capture: () => electronicsAi }),
    drone: () => ({ capture: () => drone }),
    water: () => ({ capture: () => water }),
  });
}

test("the unified Observatory snapshot captures every existing runtime owner", () => {
  const diagnostics = createCompleteObservatoryDiagnostics();
  const snapshot = diagnostics.capture();

  assert.equal(snapshot.version, 1);
  assert.equal(snapshot.ready, true);
  assert.deepEqual(snapshot.missingSources, []);
  assert.equal(snapshot.renderer?.render.calls, 1);
  assert.equal(snapshot.camera?.viewId, "home");
  assert.equal(snapshot.robot?.phase, "active");
  assert.equal(snapshot.astraea?.phase, "settled");
  assert.equal(snapshot.pinaculo?.phase, "settled");
  assert.equal(snapshot.soundLab?.phase, "settled");
  assert.equal(snapshot.soundLab?.audio.sourceStatus, "awaiting-approved-sources");
  assert.equal(snapshot.futureEnergy?.phase, "settled");
  assert.equal(snapshot.futureEnergy?.circuits.independent, true);
  assert.equal(snapshot.electronicsAi?.phase, "settled");
  assert.equal(snapshot.electronicsAi?.conceptContract.aiInferenceClaim, false);
  assert.equal(snapshot.drone?.phase, "active");
  assert.equal(snapshot.water?.presentation.tier, "shader");
  assert.equal(JSON.stringify(snapshot).includes('"ready":true'), true);
});

test("one Observatory scenario report preserves renderer eligibility and companion state", async () => {
  const report = await createCompleteObservatoryDiagnostics().reportScenario(scenario, 1_000);

  assert.equal(report.version, 1);
  assert.equal(report.rendererReport?.evidence.verdict, "pass");
  assert.equal(report.snapshot.ready, true);
  assert.equal(report.snapshot.renderer, report.rendererReport?.snapshot);
  assert.deepEqual(report.evidence, {
    verdict: "pass",
    blockers: [],
  });
});

test("missing runtime owners fail closed instead of producing partial evidence", async () => {
  const diagnostics = createObservatoryDiagnostics({
    renderer: () => null,
    camera: () => null,
    robot: () => null,
    astraea: () => null,
    pinaculo: () => null,
    soundLab: () => null,
    futureEnergy: () => null,
    electronicsAi: () => null,
    drone: () => null,
    water: () => null,
  });
  const snapshot = diagnostics.capture();
  const report = await diagnostics.reportScenario(scenario);

  assert.equal(snapshot.ready, false);
  assert.deepEqual(snapshot.missingSources, [
    "renderer",
    "camera",
    "robot",
    "astraea",
    "pinaculo",
    "soundLab",
    "futureEnergy",
    "electronicsAi",
    "drone",
    "water",
  ]);
  assert.equal(report.rendererReport, null);
  assert.deepEqual(report.evidence, {
    verdict: "ineligible",
    blockers: [
      "renderer-unavailable",
      "camera-unavailable",
      "robot-unavailable",
      "astraea-unavailable",
      "pinaculo-unavailable",
      "sound-lab-unavailable",
      "future-energy-unavailable",
      "electronics-ai-unavailable",
      "drone-unavailable",
      "water-unavailable",
    ],
  });
});

test("the unified facade is opt-in, clears stale Canvas ownership, and adds no loop", () => {
  const progressive = readSource("src/components/three/observatory-progressive-experience.tsx");
  const canvas = readSource("src/components/three/three-canvas.tsx");
  const diagnostics = readSource("src/lib/three/observatory-diagnostics.ts");

  assert.match(progressive, /onObservatoryDiagnosticsReady/);
  assert.match(progressive, /createObservatoryDiagnostics/);
  assert.match(progressive, /rendererDiagnosticsRef/);
  assert.match(progressive, /cameraDiagnosticsRef/);
  assert.match(progressive, /robotDiagnosticsRef/);
  assert.match(progressive, /astraeaDiagnosticsRef/);
  assert.match(progressive, /pinaculoDiagnosticsRef/);
  assert.match(progressive, /soundLabDiagnosticsRef/);
  assert.match(progressive, /futureEnergyDiagnosticsRef/);
  assert.match(progressive, /electronicsAiDiagnosticsRef/);
  assert.match(progressive, /droneDiagnosticsRef/);
  assert.match(progressive, /waterDiagnosticsRef/);
  assert.match(canvas, /diagnosticsRef/);
  assert.match(canvas, /onDiagnosticsReady\?\.\(null\)/);
  assert.doesNotMatch(
    `${progressive}\n${canvas}\n${diagnostics}`,
    /window\.__|globalThis\.__|requestAnimationFrame|setInterval|invalidate\(/,
  );
});
