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
import type { ObservatoryDiagnosticsReport } from "@/lib/three/observatory-diagnostics";
import {
  assessObservatoryMvpGate,
  OBSERVATORY_MVP_ENTRYPOINT_IDS,
  OBSERVATORY_MVP_SCENARIOS,
  OBSERVATORY_MVP_SCENARIO_IDS,
  type ObservatoryMvpScenarioEvidence,
  type ObservatoryMvpScenarioRequirement,
} from "@/lib/three/observatory-mvp-gate";
import {
  capturePinaculoDiagnostics,
  resolvePinaculoMechanismPose,
  resolvePinaculoPresentation,
} from "@/lib/three/pinaculo-system";
import {
  createThreeRendererDiagnosticsReport,
  type ThreeRendererActivitySample,
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
  captureWaterSurfaceDiagnostics,
  resolveWaterPresentation,
  WaterRippleController,
} from "@/lib/three/water-system";
import {
  OBSERVATORY_TEST_ASSET_ROOT,
  createObservatoryTestGltf,
} from "@/testing/observatory-test-doubles";

const workspaceRoot = process.cwd();

function createRendererSnapshot(
  requirement: ObservatoryMvpScenarioRequirement,
): ThreeRendererDiagnosticsSnapshot {
  return {
    version: 1,
    capturedAtMs: 1_000,
    canvas: {
      cssWidth: requirement.viewport.width,
      cssHeight: requirement.viewport.height,
      drawingBufferWidth: requirement.viewport.width,
      drawingBufferHeight: requirement.viewport.height,
      pixelRatio: requirement.viewport.devicePixelRatio,
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
}

const settledActivity: ThreeRendererActivitySample = {
  requestedDurationMs: 1_000,
  observedDurationMs: 1_000,
  startFrame: 12,
  endFrame: 12,
  observedFrames: 0,
  observedRenderRate: 0,
  meanObservedIntervalMs: null,
  forcedFrames: false,
};

function createDiagnostics(
  requirement: ObservatoryMvpScenarioRequirement,
): ObservatoryDiagnosticsReport | null {
  if (!requirement.diagnosticsRequired || requirement.quality === "static") return null;

  const scenario: ThreeRendererDiagnosticsScenario = {
    id: requirement.id,
    buildMode: "production",
    browser: "Chromium QA",
    deviceClass: requirement.deviceClass,
    route: "/",
    viewport: requirement.viewport,
    quality: requirement.quality,
    motion: requirement.motion,
    selectedArtifact: null,
    console: {
      warnings: 0,
      errors: 0,
    },
  };
  const rendererSnapshot = createRendererSnapshot(requirement);
  const rendererReport = createThreeRendererDiagnosticsReport({
    scenario,
    snapshot: rendererSnapshot,
    activity: settledActivity,
  });
  const camera = captureCameraTransitionDiagnostics({
    cameraMounted: true,
    view: CAMERA_VIEWS.home,
    scenePhase: "settled",
    mode: requirement.motion === "reduced" ? "immediate" : "animated",
    requestId: 1,
    currentPose: cameraPoseFromView(CAMERA_VIEWS.home),
    transition: null,
    counters: {
      animatedStarted: requirement.motion === "full" ? 2 : 0,
      animatedCompleted: requirement.motion === "full" ? 2 : 0,
      immediateCompleted: requirement.motion === "reduced" ? 2 : 0,
      interrupted: 0,
    },
  });
  const drone = captureDroneDiagnostics({
    presentation: resolveDronePresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    elapsedSeconds: 1,
    pose: resolveDroneAmbientPose(1),
  });
  const robotAsset = createObservatoryTestGltf(
    `${OBSERVATORY_TEST_ASSET_ROOT}/robot-guide-lod-0.glb`,
  );
  const robot = captureRobotDiagnostics({
    root: robotAsset.scene,
    animations: robotAsset.animations,
    quality: requirement.quality,
    motion: requirement.motion,
    selected: false,
    idleElapsedSeconds: 1,
  });
  const astraea = captureAstraeaDiagnostics({
    presentation: resolveAstraeaPresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveAstraeaRingPose(0),
  });
  const pinaculo = capturePinaculoDiagnostics({
    presentation: resolvePinaculoPresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolvePinaculoMechanismPose(0),
  });
  const soundLab = captureSoundLabDiagnostics({
    presentation: resolveSoundLabPresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveSoundLabMechanismPose(0),
    sound: { status: "muted", muted: true },
    approvedAmplitude: 0,
  });
  const futureEnergy = captureFutureEnergyDiagnostics({
    presentation: resolveFutureEnergyPresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveFutureEnergyMechanismPose(0),
  });
  const electronicsAi = captureElectronicsAiDiagnostics({
    presentation: resolveElectronicsAiPresentation(
      requirement.quality,
      requirement.motion,
      requirement.deviceClass === "mobile",
    ),
    selected: false,
    progress: 0,
    targetProgress: 0,
    pose: resolveElectronicsAiMechanismPose(0),
  });
  const water = captureWaterSurfaceDiagnostics({
    presentation: resolveWaterPresentation(requirement.quality, requirement.motion),
    atSeconds: 1,
    controller: new WaterRippleController(),
  });

  return {
    version: 1,
    scenario,
    snapshot: {
      version: 1,
      ready: true,
      missingSources: [],
      renderer: rendererSnapshot,
      camera,
      robot,
      astraea,
      pinaculo,
      soundLab,
      futureEnergy,
      electronicsAi,
      drone,
      water,
    },
    rendererReport,
    evidence: {
      verdict: "pass",
      blockers: [],
    },
  };
}

function createEvidence(
  requirement: ObservatoryMvpScenarioRequirement,
): ObservatoryMvpScenarioEvidence {
  return {
    scenarioId: requirement.id,
    buildMode: "production",
    browser: "Chromium QA",
    deviceClass: requirement.deviceClass,
    route: "/",
    viewport: requirement.viewport,
    webgl2: requirement.webgl2,
    quality: requirement.quality,
    motion: requirement.motion,
    presentation: requirement.expectedPresentation,
    semantic: {
      identityVisible: true,
      supportingCopyVisible: true,
      primaryVisualNonBlank: true,
      statusUnderstandable: true,
      noHorizontalOverflow: true,
    },
    entrypoints: OBSERVATORY_MVP_ENTRYPOINT_IDS,
    journeys: {
      projectEntryActivated: true,
      navigationEntryActivated: true,
      chatEntryActivated: true,
      canvasFocusReset: requirement.expectedPresentation === "canvas" ? true : null,
    },
    console: {
      warnings: 0,
      errors: 0,
    },
    diagnostics: createDiagnostics(requirement),
  };
}

function createCompleteEvidenceSet() {
  return OBSERVATORY_MVP_SCENARIOS.map(createEvidence);
}

function issuesFor(report: ReturnType<typeof assessObservatoryMvpGate>, scenarioId: string) {
  return report.issues
    .filter((candidate) => candidate.scenarioId === scenarioId)
    .map((candidate) => candidate.code);
}

test("the MVP matrix covers desktop and mobile interactive, static, no-WebGL, and reduced-motion states", () => {
  assert.deepEqual(
    OBSERVATORY_MVP_SCENARIOS.map(({ id }) => id),
    OBSERVATORY_MVP_SCENARIO_IDS,
  );
  assert.equal(
    OBSERVATORY_MVP_SCENARIOS.some(
      ({ deviceClass, quality }) => deviceClass === "mobile" && quality === "reduced",
    ),
    true,
  );
  assert.equal(
    OBSERVATORY_MVP_SCENARIOS.some(
      ({ deviceClass, quality }) => deviceClass === "mobile" && quality === "static",
    ),
    true,
  );
  assert.equal(
    OBSERVATORY_MVP_SCENARIOS.some(({ webgl2 }) => webgl2 === "unsupported"),
    true,
  );
  assert.equal(
    OBSERVATORY_MVP_SCENARIOS.some(({ motion }) => motion === "reduced"),
    true,
  );
  OBSERVATORY_MVP_SCENARIOS.filter(({ quality }) => quality === "static").forEach((requirement) => {
    assert.equal(requirement.expectedPresentation, "poster");
    assert.equal(requirement.diagnosticsRequired, false);
  });
});

test("a complete production matrix passes only with every semantic entrypoint and journey", () => {
  const report = assessObservatoryMvpGate(createCompleteEvidenceSet());

  assert.equal(report.version, 1);
  assert.equal(report.verdict, "pass");
  assert.deepEqual(report.expectedScenarioIds, OBSERVATORY_MVP_SCENARIO_IDS);
  assert.deepEqual(report.issues, []);
  assert.equal(
    report.scenarioResults.every(({ verdict }) => verdict === "pass"),
    true,
  );
});

test("missing content, entrypoints, journeys, overflow, console, and scenario evidence fail closed", () => {
  const evidence = createCompleteEvidenceSet()
    .filter(({ scenarioId }) => scenarioId !== "mobile-static")
    .map((candidate) =>
      candidate.scenarioId === "desktop-static"
        ? {
            ...candidate,
            semantic: {
              ...candidate.semantic,
              identityVisible: false,
              noHorizontalOverflow: false,
            },
            entrypoints: candidate.entrypoints.filter((entrypoint) => entrypoint !== "cc-ai"),
            journeys: {
              ...candidate.journeys,
              chatEntryActivated: false,
            },
            console: {
              warnings: 0,
              errors: 2,
            },
          }
        : candidate,
    );
  const report = assessObservatoryMvpGate(evidence);

  assert.equal(report.verdict, "incomplete");
  assert.deepEqual(issuesFor(report, "desktop-static"), [
    "semantic-content-missing",
    "horizontal-overflow",
    "entrypoints-missing",
    "primary-journey-failed",
    "console-errors",
  ]);
  assert.deepEqual(issuesFor(report, "mobile-static"), ["missing-scenario"]);
});

test("interactive diagnostics are required and contextual while poster scenarios reject them", () => {
  const complete = createCompleteEvidenceSet();
  const desktopFullDiagnostics = complete.find(
    ({ scenarioId }) => scenarioId === "desktop-full",
  )?.diagnostics;
  assert.ok(desktopFullDiagnostics);

  const evidence = complete.map((candidate) => {
    if (candidate.scenarioId === "desktop-full") {
      return { ...candidate, diagnostics: null };
    }
    if (candidate.scenarioId === "desktop-static") {
      return { ...candidate, diagnostics: desktopFullDiagnostics };
    }
    if (candidate.scenarioId === "desktop-reduced" && candidate.diagnostics) {
      return {
        ...candidate,
        diagnostics: {
          ...candidate.diagnostics,
          scenario: {
            ...candidate.diagnostics.scenario,
            id: "wrong-scenario",
            quality: "full" as const,
          },
          snapshot: {
            ...candidate.diagnostics.snapshot,
            robot: candidate.diagnostics.snapshot.robot
              ? {
                  ...candidate.diagnostics.snapshot.robot,
                  phase: "active" as const,
                  contract: {
                    ...candidate.diagnostics.snapshot.robot.contract,
                    valid: false,
                    issues: ["synthetic contract failure"],
                  },
                  presentation: null,
                }
              : null,
            astraea: candidate.diagnostics.snapshot.astraea
              ? {
                  ...candidate.diagnostics.snapshot.astraea,
                  phase: "animating" as const,
                  selected: true,
                  targetProgress: 1 as const,
                  currentPose: null,
                  alignment: null,
                }
              : null,
            pinaculo: candidate.diagnostics.snapshot.pinaculo
              ? {
                  ...candidate.diagnostics.snapshot.pinaculo,
                  phase: "animating" as const,
                  selected: true,
                  targetProgress: 1 as const,
                  targetPositionOffset: 1 as const,
                  currentPositionOffset: null,
                  currentPose: null,
                  alignment: null,
                }
              : null,
            soundLab: candidate.diagnostics.snapshot.soundLab
              ? {
                  ...candidate.diagnostics.snapshot.soundLab,
                  phase: "animating" as const,
                  selected: true,
                  targetProgress: 1 as const,
                  currentPose: null,
                  alignment: null,
                  audio: {
                    ...candidate.diagnostics.snapshot.soundLab.audio,
                    soundStatus: "playing" as const,
                    muted: false,
                    approvedAmplitude: 0.6,
                    responseActive: true,
                  },
                }
              : null,
            futureEnergy: candidate.diagnostics.snapshot.futureEnergy
              ? {
                  ...candidate.diagnostics.snapshot.futureEnergy,
                  phase: "animating" as const,
                  selected: true,
                  targetProgress: 1 as const,
                  currentPose: null,
                  alignment: null,
                }
              : null,
            electronicsAi: candidate.diagnostics.snapshot.electronicsAi
              ? {
                  ...candidate.diagnostics.snapshot.electronicsAi,
                  phase: "animating" as const,
                  selected: true,
                  targetProgress: 1 as const,
                  currentPose: null,
                  alignment: null,
                }
              : null,
          },
        },
      };
    }
    if (candidate.scenarioId === "mobile-reduced" && candidate.diagnostics) {
      return {
        ...candidate,
        diagnostics: {
          ...candidate.diagnostics,
          snapshot: {
            ...candidate.diagnostics.snapshot,
            renderer: candidate.diagnostics.snapshot.renderer
              ? {
                  ...candidate.diagnostics.snapshot.renderer,
                  canvas: {
                    ...candidate.diagnostics.snapshot.renderer.canvas,
                    cssWidth: 0,
                  },
                }
              : null,
          },
        },
      };
    }
    return candidate;
  });
  const report = assessObservatoryMvpGate(evidence);

  assert.deepEqual(issuesFor(report, "desktop-full"), ["diagnostics-missing"]);
  assert.deepEqual(issuesFor(report, "desktop-static"), ["diagnostics-unexpected"]);
  assert.deepEqual(issuesFor(report, "desktop-reduced"), [
    "diagnostics-context-mismatch",
    "robot-state-invalid",
    "astraea-state-invalid",
    "pinaculo-state-invalid",
    "sound-lab-state-invalid",
    "future-energy-state-invalid",
    "electronics-ai-state-invalid",
  ]);
  assert.deepEqual(issuesFor(report, "mobile-reduced"), ["canvas-size-invalid"]);
});

test("camera, drone, and water runtime state must corroborate an interactive MVP journey", () => {
  const evidence = createCompleteEvidenceSet().map((candidate) => {
    if (candidate.scenarioId !== "desktop-full" || !candidate.diagnostics) return candidate;

    return {
      ...candidate,
      diagnostics: {
        ...candidate.diagnostics,
        snapshot: {
          ...candidate.diagnostics.snapshot,
          camera: candidate.diagnostics.snapshot.camera
            ? {
                ...candidate.diagnostics.snapshot.camera,
                cameraMounted: false,
                viewId: "astraea" as const,
                scenePhase: "transitioning" as const,
                alignedWithRequestedView: false,
                counters: {
                  animatedStarted: 1,
                  animatedCompleted: 0,
                  immediateCompleted: 0,
                  interrupted: 0,
                },
              }
            : null,
          drone: candidate.diagnostics.snapshot.drone
            ? {
                ...candidate.diagnostics.snapshot.drone,
                phase: "reduced" as const,
                pose: null,
                worldPositionMeters: null,
                safety: null,
              }
            : null,
          water: candidate.diagnostics.snapshot.water
            ? {
                ...candidate.diagnostics.snapshot.water,
                presentation: { tier: "simple" as const, animated: false },
                inputEnabled: false,
                controller: null,
              }
            : null,
        },
      },
    };
  });
  const report = assessObservatoryMvpGate(evidence);

  assert.deepEqual(issuesFor(report, "desktop-full"), [
    "camera-state-invalid",
    "drone-state-invalid",
    "water-state-invalid",
  ]);
});

test("unknown and duplicate evidence cannot pass, and the assessor owns no browser side effects", () => {
  const complete = createCompleteEvidenceSet();
  const firstScenario = complete[0];
  assert.ok(firstScenario);
  const report = assessObservatoryMvpGate([
    ...complete,
    firstScenario,
    { ...firstScenario, scenarioId: "future-tablet" },
  ]);
  const source = readFileSync(
    path.join(workspaceRoot, "src/lib/three/observatory-mvp-gate.ts"),
    "utf8",
  );

  assert.equal(report.verdict, "incomplete");
  assert.deepEqual(issuesFor(report, "desktop-full"), ["duplicate-scenario"]);
  assert.deepEqual(issuesFor(report, "future-tablet"), ["unknown-scenario"]);
  assert.doesNotMatch(
    source,
    /window\.|globalThis\.|requestAnimationFrame|setInterval|invalidate\(/,
  );
});
