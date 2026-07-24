export { LazyThreeCanvas } from "./lazy-three-canvas";
export {
  ObservatoryCapabilityController,
  useObservatoryExperienceControl,
} from "./observatory-capability-controller";
export {
  ObservatorySceneProvider,
  useObservatorySceneSnapshot,
  useObservatorySceneStore,
} from "./observatory-scene-provider";
export { ObservatorySceneRuntimeProvider } from "./observatory-scene-runtime-provider";
export { ObservatorySceneShell } from "./observatory-scene-shell";
export { ObservatoryExperienceControls } from "./observatory-experience-controls";
export { ObservatoryProgressiveExperience } from "./observatory-progressive-experience";
export { ObservatoryWaterSurface } from "./observatory-water-surface";
export type { ThreeCanvasProps } from "./three-canvas";
export type { ObservatorySceneProviderProps } from "./observatory-scene-provider";
export type { ObservatoryProgressiveExperienceProps } from "./observatory-progressive-experience";
export type {
  AstraeaAlignmentDiagnostics,
  AstraeaDiagnostics,
  AstraeaDiagnosticsPhase,
  AstraeaDiagnosticsSnapshot,
} from "@/lib/three/astraea-system";
export type {
  PinaculoAlignmentDiagnostics,
  PinaculoDiagnostics,
  PinaculoDiagnosticsPhase,
  PinaculoDiagnosticsSnapshot,
} from "@/lib/three/pinaculo-system";
export type {
  SoundLabAlignmentDiagnostics,
  SoundLabAudioDiagnostics,
  SoundLabDiagnostics,
  SoundLabDiagnosticsPhase,
  SoundLabDiagnosticsSnapshot,
} from "@/lib/three/sound-lab-system";
export type {
  FutureEnergyAlignmentDiagnostics,
  FutureEnergyCircuitDiagnostics,
  FutureEnergyDiagnostics,
  FutureEnergyDiagnosticsPhase,
  FutureEnergyDiagnosticsSnapshot,
} from "@/lib/three/future-energy-system";
export type {
  ElectronicsAiAlignmentDiagnostics,
  ElectronicsAiDiagnostics,
  ElectronicsAiDiagnosticsPhase,
  ElectronicsAiDiagnosticsSnapshot,
} from "@/lib/three/electronics-ai-system";
export type {
  CameraTransitionDiagnostics,
  CameraTransitionDiagnosticsSnapshot,
} from "@/lib/three/camera-transition";
export type {
  ObservatoryDiagnosticSourceId,
  ObservatoryDiagnostics,
  ObservatoryDiagnosticsReport,
  ObservatoryDiagnosticsSnapshot,
} from "@/lib/three/observatory-diagnostics";
export type {
  ObservatoryMvpEntrypointId,
  ObservatoryMvpGateIssue,
  ObservatoryMvpGateReport,
  ObservatoryMvpIssueCode,
  ObservatoryMvpScenarioEvidence,
  ObservatoryMvpScenarioId,
  ObservatoryMvpScenarioRequirement,
  ObservatoryMvpScenarioResult,
} from "@/lib/three/observatory-mvp-gate";
export type {
  ThreeRendererBudgetAssessment,
  ThreeRendererActivitySample,
  ThreeRendererDiagnostics,
  ThreeRendererDiagnosticsReport,
  ThreeRendererDiagnosticsScenario,
  ThreeRendererDiagnosticsSnapshot,
} from "@/lib/three/renderer-diagnostics";
export type {
  DroneDiagnostics,
  DroneDiagnosticsPhase,
  DroneDiagnosticsSnapshot,
  DroneSafetyDiagnostics,
} from "@/lib/three/drone-system";
export type {
  RobotDiagnostics,
  RobotDiagnosticsPhase,
  RobotDiagnosticsSnapshot,
} from "@/lib/three/robot-system";
export type {
  WaterPointerInputResult,
  WaterRippleControllerDiagnostics,
  WaterSurfaceDiagnostics,
  WaterSurfaceDiagnosticsSnapshot,
} from "@/lib/three/water-system";
