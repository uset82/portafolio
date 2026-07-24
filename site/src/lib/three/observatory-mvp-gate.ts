import type { WebGL2Support } from "./capability-policy";
import { ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES } from "./astraea-system";
import { OBSERVATORY_CAMERA_TRANSITION } from "./camera-transition";
import { OBSERVATORY_DRONE_TECHNICAL_ART } from "./drone-system";
import {
  ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES,
  ELECTRONICS_AI_MODULE_CONTRACT,
} from "./electronics-ai-system";
import { FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES } from "./future-energy-system";
import type { ObservatoryDiagnosticsReport } from "./observatory-diagnostics";
import { PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES, PINACULO_POSITION_COUNT } from "./pinaculo-system";
import { ARTIFACT_CAMERA_VIEWS, type CameraViewId, type SceneQualityTier } from "./scene-config";
import {
  SOUND_LAB_AUDIO_CONTRACT,
  SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES,
} from "./sound-lab-system";
import { WATER_RIPPLE_SLOT_COUNT } from "./water-system";

export const OBSERVATORY_MVP_ENTRYPOINT_IDS = [
  "work",
  "laboratory",
  "sound",
  "cosmos",
  "story",
  "contact",
  "selected-systems",
  "cc-ai",
] as const;
export type ObservatoryMvpEntrypointId = (typeof OBSERVATORY_MVP_ENTRYPOINT_IDS)[number];

export const OBSERVATORY_MVP_SCENARIO_IDS = [
  "desktop-full",
  "desktop-reduced",
  "desktop-static",
  "desktop-no-webgl",
  "desktop-reduced-motion",
  "mobile-reduced",
  "mobile-static",
] as const;
export type ObservatoryMvpScenarioId = (typeof OBSERVATORY_MVP_SCENARIO_IDS)[number];

export type ObservatoryMvpScenarioRequirement = Readonly<{
  id: ObservatoryMvpScenarioId;
  deviceClass: "desktop" | "mobile";
  viewport: Readonly<{
    width: number;
    height: number;
    devicePixelRatio: number;
  }>;
  webgl2: Exclude<WebGL2Support, "unknown">;
  quality: SceneQualityTier;
  motion: "full" | "reduced";
  expectedPresentation: "canvas" | "poster";
  diagnosticsRequired: boolean;
}>;

export const OBSERVATORY_MVP_SCENARIOS = [
  {
    id: "desktop-full",
    deviceClass: "desktop",
    viewport: { width: 1_440, height: 900, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "full",
    motion: "full",
    expectedPresentation: "canvas",
    diagnosticsRequired: true,
  },
  {
    id: "desktop-reduced",
    deviceClass: "desktop",
    viewport: { width: 1_440, height: 900, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "reduced",
    motion: "full",
    expectedPresentation: "canvas",
    diagnosticsRequired: true,
  },
  {
    id: "desktop-static",
    deviceClass: "desktop",
    viewport: { width: 1_440, height: 900, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "static",
    motion: "full",
    expectedPresentation: "poster",
    diagnosticsRequired: false,
  },
  {
    id: "desktop-no-webgl",
    deviceClass: "desktop",
    viewport: { width: 1_440, height: 900, devicePixelRatio: 1 },
    webgl2: "unsupported",
    quality: "static",
    motion: "full",
    expectedPresentation: "poster",
    diagnosticsRequired: false,
  },
  {
    id: "desktop-reduced-motion",
    deviceClass: "desktop",
    viewport: { width: 1_440, height: 900, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "reduced",
    motion: "reduced",
    expectedPresentation: "canvas",
    diagnosticsRequired: true,
  },
  {
    id: "mobile-reduced",
    deviceClass: "mobile",
    viewport: { width: 390, height: 844, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "reduced",
    motion: "full",
    expectedPresentation: "canvas",
    diagnosticsRequired: true,
  },
  {
    id: "mobile-static",
    deviceClass: "mobile",
    viewport: { width: 390, height: 844, devicePixelRatio: 1 },
    webgl2: "supported",
    quality: "static",
    motion: "full",
    expectedPresentation: "poster",
    diagnosticsRequired: false,
  },
] as const satisfies readonly ObservatoryMvpScenarioRequirement[];

export type ObservatoryMvpScenarioEvidence = Readonly<{
  scenarioId: string;
  buildMode: "development" | "production";
  browser: string;
  deviceClass: "desktop" | "mobile";
  route: string;
  viewport: Readonly<{
    width: number;
    height: number;
    devicePixelRatio: number;
  }>;
  webgl2: Exclude<WebGL2Support, "unknown">;
  quality: SceneQualityTier;
  motion: "full" | "reduced";
  presentation: "canvas" | "poster";
  semantic: Readonly<{
    identityVisible: boolean;
    supportingCopyVisible: boolean;
    primaryVisualNonBlank: boolean;
    statusUnderstandable: boolean;
    noHorizontalOverflow: boolean;
  }>;
  entrypoints: readonly ObservatoryMvpEntrypointId[];
  journeys: Readonly<{
    projectEntryActivated: boolean;
    navigationEntryActivated: boolean;
    chatEntryActivated: boolean;
    canvasFocusReset: boolean | null;
  }>;
  console: Readonly<{
    warnings: number;
    errors: number;
  }>;
  diagnostics: ObservatoryDiagnosticsReport | null;
}>;

export const OBSERVATORY_MVP_ISSUE_CODES = [
  "unknown-scenario",
  "missing-scenario",
  "duplicate-scenario",
  "development-build",
  "scenario-context-mismatch",
  "presentation-mismatch",
  "semantic-content-missing",
  "entrypoints-missing",
  "primary-journey-failed",
  "canvas-focus-reset-failed",
  "horizontal-overflow",
  "console-errors",
  "diagnostics-missing",
  "diagnostics-unexpected",
  "diagnostics-ineligible",
  "diagnostics-context-mismatch",
  "camera-state-invalid",
  "robot-state-invalid",
  "astraea-state-invalid",
  "pinaculo-state-invalid",
  "sound-lab-state-invalid",
  "future-energy-state-invalid",
  "electronics-ai-state-invalid",
  "drone-state-invalid",
  "water-state-invalid",
  "canvas-size-invalid",
] as const;
export type ObservatoryMvpIssueCode = (typeof OBSERVATORY_MVP_ISSUE_CODES)[number];

export type ObservatoryMvpGateIssue = Readonly<{
  scenarioId: string;
  code: ObservatoryMvpIssueCode;
  details: readonly string[];
}>;

export type ObservatoryMvpScenarioResult = Readonly<{
  scenarioId: ObservatoryMvpScenarioId;
  verdict: "pass" | "incomplete";
  issues: readonly ObservatoryMvpGateIssue[];
}>;

export type ObservatoryMvpGateReport = Readonly<{
  version: 1;
  verdict: "pass" | "incomplete";
  expectedScenarioIds: readonly ObservatoryMvpScenarioId[];
  observedScenarioIds: readonly string[];
  scenarioResults: readonly ObservatoryMvpScenarioResult[];
  issues: readonly ObservatoryMvpGateIssue[];
}>;

function issue(
  scenarioId: string,
  code: ObservatoryMvpIssueCode,
  details: readonly string[] = [],
): ObservatoryMvpGateIssue {
  return { scenarioId, code, details };
}

function sameViewport(
  actual: ObservatoryMvpScenarioEvidence["viewport"],
  expected: ObservatoryMvpScenarioRequirement["viewport"],
) {
  return (
    actual.width === expected.width &&
    actual.height === expected.height &&
    actual.devicePixelRatio === expected.devicePixelRatio
  );
}

function assessScenario(
  requirement: ObservatoryMvpScenarioRequirement,
  evidence: ObservatoryMvpScenarioEvidence,
) {
  const issues: ObservatoryMvpGateIssue[] = [];
  const contextMismatches = [
    ...(evidence.browser.trim() ? [] : ["browser"]),
    ...(evidence.deviceClass === requirement.deviceClass ? [] : ["deviceClass"]),
    ...(evidence.route === "/" ? [] : ["route"]),
    ...(sameViewport(evidence.viewport, requirement.viewport) ? [] : ["viewport"]),
    ...(evidence.webgl2 === requirement.webgl2 ? [] : ["webgl2"]),
    ...(evidence.quality === requirement.quality ? [] : ["quality"]),
    ...(evidence.motion === requirement.motion ? [] : ["motion"]),
  ];

  if (evidence.buildMode !== "production") {
    issues.push(issue(requirement.id, "development-build"));
  }
  if (contextMismatches.length > 0) {
    issues.push(issue(requirement.id, "scenario-context-mismatch", contextMismatches));
  }
  if (evidence.presentation !== requirement.expectedPresentation) {
    issues.push(
      issue(requirement.id, "presentation-mismatch", [
        `expected:${requirement.expectedPresentation}`,
        `actual:${evidence.presentation}`,
      ]),
    );
  }

  const missingSemanticContent = [
    ...(evidence.semantic.identityVisible ? [] : ["identity"]),
    ...(evidence.semantic.supportingCopyVisible ? [] : ["supporting-copy"]),
    ...(evidence.semantic.primaryVisualNonBlank ? [] : ["primary-visual"]),
    ...(evidence.semantic.statusUnderstandable ? [] : ["status"]),
  ];
  if (missingSemanticContent.length > 0) {
    issues.push(issue(requirement.id, "semantic-content-missing", missingSemanticContent));
  }
  if (!evidence.semantic.noHorizontalOverflow) {
    issues.push(issue(requirement.id, "horizontal-overflow"));
  }

  const missingEntrypoints = OBSERVATORY_MVP_ENTRYPOINT_IDS.filter(
    (entrypointId) => !evidence.entrypoints.includes(entrypointId),
  );
  if (missingEntrypoints.length > 0) {
    issues.push(issue(requirement.id, "entrypoints-missing", missingEntrypoints));
  }

  const failedJourneys = [
    ...(evidence.journeys.projectEntryActivated ? [] : ["project"]),
    ...(evidence.journeys.navigationEntryActivated ? [] : ["navigation"]),
    ...(evidence.journeys.chatEntryActivated ? [] : ["chat"]),
  ];
  if (failedJourneys.length > 0) {
    issues.push(issue(requirement.id, "primary-journey-failed", failedJourneys));
  }
  if (
    requirement.expectedPresentation === "canvas" &&
    evidence.journeys.canvasFocusReset !== true
  ) {
    issues.push(issue(requirement.id, "canvas-focus-reset-failed"));
  }
  if (evidence.console.errors > 0) {
    issues.push(issue(requirement.id, "console-errors", [`count:${evidence.console.errors}`]));
  }

  if (!requirement.diagnosticsRequired) {
    if (evidence.diagnostics) {
      issues.push(issue(requirement.id, "diagnostics-unexpected"));
    }
    return issues;
  }

  if (!evidence.diagnostics) {
    issues.push(issue(requirement.id, "diagnostics-missing"));
    return issues;
  }

  const { diagnostics } = evidence;
  if (diagnostics.evidence.verdict !== "pass") {
    issues.push(issue(requirement.id, "diagnostics-ineligible", diagnostics.evidence.blockers));
  }

  const diagnosticsScenario = diagnostics.scenario;
  const diagnosticsContextMismatches = [
    ...(diagnosticsScenario.id === requirement.id ? [] : ["scenarioId"]),
    ...(diagnosticsScenario.buildMode === "production" ? [] : ["buildMode"]),
    ...(diagnosticsScenario.deviceClass === requirement.deviceClass ? [] : ["deviceClass"]),
    ...(diagnosticsScenario.route === "/" ? [] : ["route"]),
    ...(sameViewport(diagnosticsScenario.viewport, requirement.viewport) ? [] : ["viewport"]),
    ...(diagnosticsScenario.quality === requirement.quality ? [] : ["quality"]),
    ...(diagnosticsScenario.motion === requirement.motion ? [] : ["motion"]),
  ];
  if (diagnosticsContextMismatches.length > 0) {
    issues.push(
      issue(requirement.id, "diagnostics-context-mismatch", diagnosticsContextMismatches),
    );
  }

  const camera = diagnostics.snapshot.camera;
  const expectedCameraViewId: CameraViewId = diagnosticsScenario.selectedArtifact
    ? ARTIFACT_CAMERA_VIEWS[diagnosticsScenario.selectedArtifact]
    : "home";
  const expectedCameraMode = requirement.motion === "reduced" ? "immediate" : "animated";
  const cameraRemainingFinite = camera
    ? Object.values(camera.remaining).every(Number.isFinite)
    : false;
  const cameraJourneyCount =
    expectedCameraMode === "animated"
      ? Math.min(camera?.counters.animatedStarted ?? 0, camera?.counters.animatedCompleted ?? 0)
      : (camera?.counters.immediateCompleted ?? 0);
  const cameraStateIssues = [
    ...(camera ? [] : ["missing"]),
    ...(camera?.cameraMounted ? [] : ["unmounted"]),
    ...(camera?.viewId === expectedCameraViewId ? [] : ["view"]),
    ...(camera?.scenePhase === "settled" ? [] : ["phase"]),
    ...(camera?.mode === expectedCameraMode ? [] : ["mode"]),
    ...(camera?.alignedWithRequestedView ? [] : ["alignment"]),
    ...(camera?.activeTransition === null ? [] : ["active-transition"]),
    ...(cameraRemainingFinite ? [] : ["remaining"]),
    ...(camera &&
    camera.remaining.positionMeters <= OBSERVATORY_CAMERA_TRANSITION.positionEpsilonMeters &&
    camera.remaining.targetMeters <= OBSERVATORY_CAMERA_TRANSITION.targetEpsilonMeters &&
    camera.remaining.fovDegrees <= OBSERVATORY_CAMERA_TRANSITION.fovEpsilonDegrees &&
    camera.remaining.nearMeters <= OBSERVATORY_CAMERA_TRANSITION.clippingEpsilonMeters &&
    camera.remaining.farMeters <= OBSERVATORY_CAMERA_TRANSITION.clippingEpsilonMeters
      ? []
      : ["pose-tolerance"]),
    ...(cameraJourneyCount >= 2 ? [] : ["reversible-journey-count"]),
  ];
  if (cameraStateIssues.length > 0) {
    issues.push(issue(requirement.id, "camera-state-invalid", cameraStateIssues));
  }

  const robot = diagnostics.snapshot.robot;
  const expectedRobotPhase =
    requirement.quality === "full" && requirement.motion === "full" ? "active" : "reduced";
  const robotStateIssues = [
    ...(robot ? [] : ["missing"]),
    ...(robot?.contract.valid ? [] : ["contract"]),
    ...(robot?.presentation ? [] : ["presentation"]),
    ...(robot?.phase === expectedRobotPhase ? [] : ["phase"]),
    ...(robot?.presentation &&
    Number.isFinite(robot.presentation.handAlignmentErrorMeters) &&
    robot.presentation.handAlignmentErrorMeters <= 0.005
      ? []
      : ["hand-alignment"]),
    ...(robot?.idle.active === (expectedRobotPhase === "active") ? [] : ["idle-state"]),
  ];
  if (robotStateIssues.length > 0) {
    issues.push(issue(requirement.id, "robot-state-invalid", robotStateIssues));
  }

  const astraea = diagnostics.snapshot.astraea;
  const expectedAstraeaTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const expectedAstraeaPhase = expectedAstraeaTier === "full" ? "settled" : "reduced";
  const expectedAstraeaSelection = diagnosticsScenario.selectedArtifact === "astraea";
  const expectedAstraeaProgress = expectedAstraeaSelection ? 1 : 0;
  const astraeaPoseFinite = astraea?.currentPose
    ? Object.values(astraea.currentPose).every(Number.isFinite)
    : false;
  const astraeaStateIssues = [
    ...(astraea ? [] : ["missing"]),
    ...(astraea?.presentation.tier === expectedAstraeaTier ? [] : ["presentation-tier"]),
    ...(astraea?.presentation.animated === (expectedAstraeaTier === "full")
      ? []
      : ["animation-state"]),
    ...(astraea?.phase === expectedAstraeaPhase ? [] : ["phase"]),
    ...(astraea?.selected === expectedAstraeaSelection ? [] : ["selection"]),
    ...(astraea?.targetProgress === expectedAstraeaProgress ? [] : ["target-progress"]),
    ...(astraeaPoseFinite ? [] : ["pose"]),
    ...(astraea?.alignment ? [] : ["alignment"]),
    ...(astraea?.alignment?.settled ? [] : ["unsettled"]),
    ...(astraea?.alignment &&
    Number.isFinite(astraea.alignment.maximumRingErrorRadians) &&
    astraea.alignment.maximumRingErrorRadians <= ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.ringRadians
      ? []
      : ["ring-alignment"]),
    ...(astraea?.alignment &&
    Number.isFinite(astraea.alignment.pointerErrorMeters) &&
    astraea.alignment.pointerErrorMeters <= ASTRAEA_DIAGNOSTIC_SETTLE_TOLERANCES.pointerMeters
      ? []
      : ["pointer-alignment"]),
  ];
  if (astraeaStateIssues.length > 0) {
    issues.push(issue(requirement.id, "astraea-state-invalid", astraeaStateIssues));
  }

  const pinaculo = diagnostics.snapshot.pinaculo;
  const expectedPinaculoTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const expectedPinaculoPhase = expectedPinaculoTier === "full" ? "settled" : "reduced";
  const expectedPinaculoSelection = diagnosticsScenario.selectedArtifact === "pinaculo";
  const expectedPinaculoProgress = expectedPinaculoSelection ? 1 : 0;
  const expectedOnePositionRadians = (Math.PI * 2) / PINACULO_POSITION_COUNT;
  const pinaculoPoseFinite = pinaculo?.currentPose
    ? Object.values(pinaculo.currentPose).every(Number.isFinite)
    : false;
  const pinaculoStateIssues = [
    ...(pinaculo ? [] : ["missing"]),
    ...(pinaculo?.presentation.tier === expectedPinaculoTier ? [] : ["presentation-tier"]),
    ...(pinaculo?.presentation.animated === (expectedPinaculoTier === "full")
      ? []
      : ["animation-state"]),
    ...(pinaculo?.phase === expectedPinaculoPhase ? [] : ["phase"]),
    ...(pinaculo?.selected === expectedPinaculoSelection ? [] : ["selection"]),
    ...(pinaculo?.positionCount === PINACULO_POSITION_COUNT ? [] : ["position-count"]),
    ...(pinaculo &&
    Number.isFinite(pinaculo.onePositionRadians) &&
    Math.abs(pinaculo.onePositionRadians - expectedOnePositionRadians) <= 1e-12
      ? []
      : ["position-angle"]),
    ...(pinaculo?.targetProgress === expectedPinaculoProgress ? [] : ["target-progress"]),
    ...(pinaculo?.targetPositionOffset === expectedPinaculoProgress ? [] : ["target-position"]),
    ...(pinaculo &&
    typeof pinaculo.currentPositionOffset === "number" &&
    Number.isFinite(pinaculo.currentPositionOffset) &&
    Math.abs(pinaculo.currentPositionOffset - expectedPinaculoProgress) <=
      PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.progress
      ? []
      : ["current-position"]),
    ...(pinaculoPoseFinite ? [] : ["pose"]),
    ...(pinaculo?.alignment ? [] : ["alignment"]),
    ...(pinaculo?.alignment?.settled ? [] : ["unsettled"]),
    ...(pinaculo?.alignment &&
    Number.isFinite(pinaculo.alignment.carrierErrorRadians) &&
    pinaculo.alignment.carrierErrorRadians <= PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.carrierRadians
      ? []
      : ["carrier-alignment"]),
    ...(pinaculo?.alignment &&
    Number.isFinite(pinaculo.alignment.latchErrorMeters) &&
    pinaculo.alignment.latchErrorMeters <= PINACULO_DIAGNOSTIC_SETTLE_TOLERANCES.latchMeters
      ? []
      : ["latch-alignment"]),
  ];
  if (pinaculoStateIssues.length > 0) {
    issues.push(issue(requirement.id, "pinaculo-state-invalid", pinaculoStateIssues));
  }

  const soundLab = diagnostics.snapshot.soundLab;
  const expectedSoundLabTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const expectedSoundLabPhase = expectedSoundLabTier === "full" ? "settled" : "reduced";
  const expectedSoundLabSelection = diagnosticsScenario.selectedArtifact === "sound-lab";
  const expectedSoundLabProgress = expectedSoundLabSelection ? 1 : 0;
  const soundLabPoseFinite = soundLab?.currentPose
    ? Object.values(soundLab.currentPose).every(Number.isFinite)
    : false;
  const soundLabStateIssues = [
    ...(soundLab ? [] : ["missing"]),
    ...(soundLab?.presentation.tier === expectedSoundLabTier ? [] : ["presentation-tier"]),
    ...(soundLab?.presentation.animated === (expectedSoundLabTier === "full")
      ? []
      : ["animation-state"]),
    ...(soundLab?.phase === expectedSoundLabPhase ? [] : ["phase"]),
    ...(soundLab?.selected === expectedSoundLabSelection ? [] : ["selection"]),
    ...(soundLab?.targetProgress === expectedSoundLabProgress ? [] : ["target-progress"]),
    ...(soundLabPoseFinite ? [] : ["pose"]),
    ...(soundLab?.alignment ? [] : ["alignment"]),
    ...(soundLab?.alignment?.settled ? [] : ["unsettled"]),
    ...(soundLab?.alignment &&
    Number.isFinite(soundLab.alignment.dialRotationErrorRadians) &&
    soundLab.alignment.dialRotationErrorRadians <=
      SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.dialRadians
      ? []
      : ["dial-alignment"]),
    ...(soundLab?.alignment &&
    Number.isFinite(soundLab.alignment.dialLiftErrorMeters) &&
    Number.isFinite(soundLab.alignment.sliderErrorMeters) &&
    Number.isFinite(soundLab.alignment.signalErrorMeters) &&
    Math.max(
      soundLab.alignment.dialLiftErrorMeters,
      soundLab.alignment.sliderErrorMeters,
      soundLab.alignment.signalErrorMeters,
    ) <= SOUND_LAB_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters
      ? []
      : ["linear-alignment"]),
    ...(soundLab?.audio.sourceStatus === SOUND_LAB_AUDIO_CONTRACT.sourceStatus
      ? []
      : ["audio-source-status"]),
    ...(soundLab?.audio.catalogTrackCount === SOUND_LAB_AUDIO_CONTRACT.trackCount
      ? []
      : ["audio-catalog"]),
    ...(soundLab?.audio.playerAvailable === SOUND_LAB_AUDIO_CONTRACT.playerAvailable
      ? []
      : ["audio-player"]),
    ...(soundLab?.audio.defaultMuted === SOUND_LAB_AUDIO_CONTRACT.defaultMuted &&
    soundLab?.audio.autoplay === SOUND_LAB_AUDIO_CONTRACT.autoplay &&
    soundLab?.audio.preload === SOUND_LAB_AUDIO_CONTRACT.preload
      ? []
      : ["audio-policy"]),
    ...(soundLab?.audio.soundStatus === "muted" && soundLab.audio.muted === true
      ? []
      : ["audio-runtime-state"]),
    ...(soundLab?.audio.approvedAmplitude === 0 && soundLab.audio.responseActive === false
      ? []
      : ["audio-response"]),
  ];
  if (soundLabStateIssues.length > 0) {
    issues.push(issue(requirement.id, "sound-lab-state-invalid", soundLabStateIssues));
  }

  const futureEnergy = diagnostics.snapshot.futureEnergy;
  const expectedFutureEnergyTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const expectedFutureEnergyPhase = expectedFutureEnergyTier === "full" ? "settled" : "reduced";
  const expectedFutureEnergySelection = diagnosticsScenario.selectedArtifact === "future-energy";
  const expectedFutureEnergyProgress = expectedFutureEnergySelection ? 1 : 0;
  const futureEnergyPoseFinite = futureEnergy?.currentPose
    ? Object.values(futureEnergy.currentPose).every(Number.isFinite)
    : false;
  const futureEnergyStateIssues = [
    ...(futureEnergy ? [] : ["missing"]),
    ...(futureEnergy?.presentation.tier === expectedFutureEnergyTier ? [] : ["presentation-tier"]),
    ...(futureEnergy?.presentation.animated === (expectedFutureEnergyTier === "full")
      ? []
      : ["animation-state"]),
    ...(futureEnergy?.phase === expectedFutureEnergyPhase ? [] : ["phase"]),
    ...(futureEnergy?.selected === expectedFutureEnergySelection ? [] : ["selection"]),
    ...(futureEnergy?.targetProgress === expectedFutureEnergyProgress ? [] : ["target-progress"]),
    ...(futureEnergyPoseFinite ? [] : ["pose"]),
    ...(futureEnergy?.alignment ? [] : ["alignment"]),
    ...(futureEnergy?.alignment?.settled ? [] : ["unsettled"]),
    ...(futureEnergy?.alignment &&
    Number.isFinite(futureEnergy.alignment.sagePumpErrorRadians) &&
    Number.isFinite(futureEnergy.alignment.teaPumpErrorRadians) &&
    Number.isFinite(futureEnergy.alignment.sageSurfaceErrorRadians) &&
    Number.isFinite(futureEnergy.alignment.teaSurfaceErrorRadians) &&
    Math.max(
      futureEnergy.alignment.sagePumpErrorRadians,
      futureEnergy.alignment.teaPumpErrorRadians,
      futureEnergy.alignment.sageSurfaceErrorRadians,
      futureEnergy.alignment.teaSurfaceErrorRadians,
    ) <= FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES.rotationRadians
      ? []
      : ["rotation-alignment"]),
    ...(futureEnergy?.alignment &&
    Number.isFinite(futureEnergy.alignment.serviceLatchErrorMeters) &&
    futureEnergy.alignment.serviceLatchErrorMeters <=
      FUTURE_ENERGY_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters
      ? []
      : ["latch-alignment"]),
    ...(futureEnergy?.circuits.circuitCount === 2 &&
    futureEnergy.circuits.allClosed &&
    futureEnergy.circuits.independent &&
    futureEnergy.circuits.crossConnectionCount === 0 &&
    futureEnergy.circuits.distinctReservoirCount === 2 &&
    futureEnergy.circuits.distinctPumpCount === 2 &&
    futureEnergy.circuits.distinctStackPortCount === 2
      ? []
      : ["circuit-contract"]),
  ];
  if (futureEnergyStateIssues.length > 0) {
    issues.push(issue(requirement.id, "future-energy-state-invalid", futureEnergyStateIssues));
  }

  const electronicsAi = diagnostics.snapshot.electronicsAi;
  const expectedElectronicsAiTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const expectedElectronicsAiPhase = expectedElectronicsAiTier === "full" ? "settled" : "reduced";
  const expectedElectronicsAiSelection = diagnosticsScenario.selectedArtifact === "electronics-ai";
  const expectedElectronicsAiProgress = expectedElectronicsAiSelection ? 1 : 0;
  const electronicsAiPoseFinite = electronicsAi?.currentPose
    ? Object.values(electronicsAi.currentPose).every(Number.isFinite)
    : false;
  const electronicsAiStateIssues = [
    ...(electronicsAi ? [] : ["missing"]),
    ...(electronicsAi?.presentation.tier === expectedElectronicsAiTier
      ? []
      : ["presentation-tier"]),
    ...(electronicsAi?.presentation.animated === (expectedElectronicsAiTier === "full")
      ? []
      : ["animation-state"]),
    ...(electronicsAi?.phase === expectedElectronicsAiPhase ? [] : ["phase"]),
    ...(electronicsAi?.selected === expectedElectronicsAiSelection ? [] : ["selection"]),
    ...(electronicsAi?.targetProgress === expectedElectronicsAiProgress ? [] : ["target-progress"]),
    ...(electronicsAiPoseFinite ? [] : ["pose"]),
    ...(electronicsAi?.alignment ? [] : ["alignment"]),
    ...(electronicsAi?.alignment?.settled ? [] : ["unsettled"]),
    ...(electronicsAi?.alignment &&
    Number.isFinite(electronicsAi.alignment.controlErrorRadians) &&
    electronicsAi.alignment.controlErrorRadians <=
      ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.rotationRadians
      ? []
      : ["control-alignment"]),
    ...(electronicsAi?.alignment &&
    Number.isFinite(electronicsAi.alignment.servicePanelErrorMeters) &&
    Number.isFinite(electronicsAi.alignment.indicatorErrorMeters) &&
    Math.max(
      electronicsAi.alignment.servicePanelErrorMeters,
      electronicsAi.alignment.indicatorErrorMeters,
    ) <= ELECTRONICS_AI_DIAGNOSTIC_SETTLE_TOLERANCES.motionMeters
      ? []
      : ["linear-alignment"]),
    ...(electronicsAi?.conceptContract.functioningHardwareClaim ===
      ELECTRONICS_AI_MODULE_CONTRACT.functioningHardwareClaim &&
    electronicsAi?.conceptContract.aiInferenceClaim ===
      ELECTRONICS_AI_MODULE_CONTRACT.aiInferenceClaim &&
    electronicsAi?.conceptContract.liveDataClaim === ELECTRONICS_AI_MODULE_CONTRACT.liveDataClaim &&
    electronicsAi?.conceptContract.statusWindow === ELECTRONICS_AI_MODULE_CONTRACT.statusWindow &&
    electronicsAi?.conceptContract.protectedModules ===
      ELECTRONICS_AI_MODULE_CONTRACT.protectedModules &&
    electronicsAi?.conceptContract.rapidFlashing === ELECTRONICS_AI_MODULE_CONTRACT.rapidFlashing
      ? []
      : ["concept-contract"]),
  ];
  if (electronicsAiStateIssues.length > 0) {
    issues.push(issue(requirement.id, "electronics-ai-state-invalid", electronicsAiStateIssues));
  }

  const drone = diagnostics.snapshot.drone;
  const expectedDroneTier =
    requirement.quality === "full" &&
    requirement.motion === "full" &&
    requirement.deviceClass === "desktop"
      ? "full"
      : "reduced";
  const validDronePhase =
    expectedDroneTier === "full"
      ? drone?.phase === "active" || drone?.phase === "rest"
      : drone?.phase === "reduced";
  const dronePoseFinite = drone?.pose
    ? [
        ...drone.pose.offsetMeters,
        ...drone.pose.rotationRadians,
        drone.pose.rotorRotationRadians,
      ].every(Number.isFinite)
    : false;
  const droneWorldPositionFinite = drone?.worldPositionMeters
    ? drone.worldPositionMeters.every(Number.isFinite)
    : false;
  const droneSafetyFinite = drone?.safety
    ? [
        drone.safety.corridorMarginMeters,
        drone.safety.roofClearanceMeters,
        drone.safety.minimumRequiredRoofClearanceMeters,
        drone.safety.robotDistanceMeters,
        drone.safety.robotClearanceMeters,
        drone.safety.attitudeMarginRadians,
      ].every(Number.isFinite)
    : false;
  const droneStateIssues = [
    ...(drone ? [] : ["missing"]),
    ...(drone?.presentation.tier === expectedDroneTier ? [] : ["presentation-tier"]),
    ...(drone?.presentation.animated === (expectedDroneTier === "full") ? [] : ["animation-state"]),
    ...(validDronePhase ? [] : ["phase"]),
    ...(Number.isFinite(drone?.elapsedSeconds) ? [] : ["elapsed"]),
    ...(dronePoseFinite ? [] : ["pose"]),
    ...(droneWorldPositionFinite ? [] : ["world-position"]),
    ...(drone?.safety ? [] : ["safety"]),
    ...(droneSafetyFinite ? [] : ["safety-measurements"]),
    ...(drone?.safety?.inspection.safe &&
    drone.safety.inspection.withinHoverCorridor &&
    drone.safety.inspection.withinRoofClearance &&
    drone.safety.inspection.clearOfRobotSilhouette &&
    drone.safety.inspection.withinAttitudeLimits
      ? []
      : ["safety-inspection"]),
    ...(drone?.safety &&
    drone.safety.corridorMarginMeters >= 0 &&
    drone.safety.roofClearanceMeters >=
      OBSERVATORY_DRONE_TECHNICAL_ART.safety.minimumRoofClearanceMeters &&
    drone.safety.robotClearanceMeters >= 0 &&
    drone.safety.attitudeMarginRadians >= 0
      ? []
      : ["safety-margins"]),
    ...(expectedDroneTier === "reduced" && drone?.pose?.active !== false
      ? ["reduced-motion-state"]
      : []),
  ];
  if (droneStateIssues.length > 0) {
    issues.push(issue(requirement.id, "drone-state-invalid", droneStateIssues));
  }

  const water = diagnostics.snapshot.water;
  const expectedWaterTier =
    requirement.quality === "full" && requirement.motion === "full" ? "shader" : "simple";
  const expectedWaterAnimated = expectedWaterTier === "shader";
  const waterController = water?.controller;
  const waterControllerFinite = waterController
    ? [
        waterController.atSeconds,
        waterController.activeRippleCount,
        waterController.robotRipple.ageSeconds,
        waterController.robotRipple.cycle,
        waterController.robotRipple.strength,
        waterController.robotRipple.periodSeconds,
        waterController.input.accepted,
        waterController.input.rejectedNonFinite,
        waterController.input.rejectedOutsideBounds,
        waterController.input.rejectedCooldown,
        waterController.input.nextPointerSlot,
      ].every(Number.isFinite)
    : expectedWaterTier === "simple";
  const waterPointerStateValid =
    waterController?.pointerRipples.every(
      (ripple) =>
        ripple.slot > 0 &&
        ripple.slot < WATER_RIPPLE_SLOT_COUNT &&
        ripple.origin.every(Number.isFinite) &&
        [
          ripple.ageSeconds,
          ripple.normalizedAge,
          ripple.remainingSeconds,
          ripple.envelope,
          ripple.strength,
        ].every(Number.isFinite) &&
        ripple.normalizedAge >= 0 &&
        ripple.normalizedAge <= 1 &&
        ripple.remainingSeconds >= 0 &&
        ripple.envelope >= 0 &&
        ripple.envelope <= 1,
    ) ?? expectedWaterTier === "simple";
  const waterStateIssues = [
    ...(water ? [] : ["missing"]),
    ...(water?.presentation.tier === expectedWaterTier ? [] : ["presentation-tier"]),
    ...(water?.presentation.animated === expectedWaterAnimated ? [] : ["animation-state"]),
    ...(water?.inputEnabled === expectedWaterAnimated ? [] : ["input-state"]),
    ...(Number.isFinite(water?.atSeconds) ? [] : ["elapsed"]),
    ...(expectedWaterTier === "shader" && !waterController ? ["controller"] : []),
    ...(expectedWaterTier === "simple" && waterController ? ["unexpected-controller"] : []),
    ...(waterControllerFinite ? [] : ["controller-measurements"]),
    ...(waterController &&
    waterController.activeRippleCount >= 1 &&
    waterController.activeRippleCount <= WATER_RIPPLE_SLOT_COUNT &&
    waterController.robotRipple.slot === 0 &&
    waterController.pointerRipples.length <= WATER_RIPPLE_SLOT_COUNT - 1 &&
    waterController.input.nextPointerSlot > 0 &&
    waterController.input.nextPointerSlot < WATER_RIPPLE_SLOT_COUNT
      ? []
      : expectedWaterTier === "simple"
        ? []
        : ["ripple-bounds"]),
    ...(waterPointerStateValid ? [] : ["pointer-ripples"]),
  ];
  if (waterStateIssues.length > 0) {
    issues.push(issue(requirement.id, "water-state-invalid", waterStateIssues));
  }

  const renderer = diagnostics.snapshot.renderer;
  if (
    !renderer ||
    renderer.canvas.cssWidth <= 0 ||
    renderer.canvas.cssHeight <= 0 ||
    renderer.canvas.drawingBufferWidth <= 0 ||
    renderer.canvas.drawingBufferHeight <= 0
  ) {
    issues.push(issue(requirement.id, "canvas-size-invalid"));
  }

  return issues;
}

export function assessObservatoryMvpGate(
  evidenceSet: readonly ObservatoryMvpScenarioEvidence[],
): ObservatoryMvpGateReport {
  const issues: ObservatoryMvpGateIssue[] = [];
  const scenarioResults: ObservatoryMvpScenarioResult[] = [];
  const requirementsById = new Map<string, ObservatoryMvpScenarioRequirement>(
    OBSERVATORY_MVP_SCENARIOS.map((requirement) => [requirement.id, requirement]),
  );

  evidenceSet.forEach((evidence) => {
    if (!requirementsById.has(evidence.scenarioId)) {
      issues.push(issue(evidence.scenarioId, "unknown-scenario"));
    }
  });

  OBSERVATORY_MVP_SCENARIOS.forEach((requirement) => {
    const matchingEvidence = evidenceSet.filter(
      (evidence) => evidence.scenarioId === requirement.id,
    );
    const scenarioIssues: ObservatoryMvpGateIssue[] = [];

    if (matchingEvidence.length === 0) {
      scenarioIssues.push(issue(requirement.id, "missing-scenario"));
    } else {
      if (matchingEvidence.length > 1) {
        scenarioIssues.push(
          issue(requirement.id, "duplicate-scenario", [`count:${matchingEvidence.length}`]),
        );
      }
      scenarioIssues.push(...assessScenario(requirement, matchingEvidence[0]!));
    }

    issues.push(...scenarioIssues);
    scenarioResults.push({
      scenarioId: requirement.id,
      verdict: scenarioIssues.length === 0 ? "pass" : "incomplete",
      issues: scenarioIssues,
    });
  });

  return {
    version: 1,
    verdict: issues.length === 0 ? "pass" : "incomplete",
    expectedScenarioIds: OBSERVATORY_MVP_SCENARIO_IDS,
    observedScenarioIds: evidenceSet.map((evidence) => evidence.scenarioId),
    scenarioResults,
    issues,
  };
}
