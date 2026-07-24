import type { AstraeaDiagnostics, AstraeaDiagnosticsSnapshot } from "./astraea-system";
import type {
  CameraTransitionDiagnostics,
  CameraTransitionDiagnosticsSnapshot,
} from "./camera-transition";
import type { DroneDiagnostics, DroneDiagnosticsSnapshot } from "./drone-system";
import type {
  ElectronicsAiDiagnostics,
  ElectronicsAiDiagnosticsSnapshot,
} from "./electronics-ai-system";
import type {
  FutureEnergyDiagnostics,
  FutureEnergyDiagnosticsSnapshot,
} from "./future-energy-system";
import type { PinaculoDiagnostics, PinaculoDiagnosticsSnapshot } from "./pinaculo-system";
import type {
  ThreeRendererDiagnostics,
  ThreeRendererDiagnosticsReport,
  ThreeRendererDiagnosticsScenario,
  ThreeRendererDiagnosticsSnapshot,
} from "./renderer-diagnostics";
import type { RobotDiagnostics, RobotDiagnosticsSnapshot } from "./robot-system";
import type { SoundLabDiagnostics, SoundLabDiagnosticsSnapshot } from "./sound-lab-system";
import type { WaterSurfaceDiagnostics, WaterSurfaceDiagnosticsSnapshot } from "./water-system";

export const OBSERVATORY_DIAGNOSTIC_SOURCE_IDS = [
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
] as const;
export type ObservatoryDiagnosticSourceId = (typeof OBSERVATORY_DIAGNOSTIC_SOURCE_IDS)[number];

export type ObservatoryDiagnosticsSnapshot = Readonly<{
  version: 1;
  ready: boolean;
  missingSources: readonly ObservatoryDiagnosticSourceId[];
  renderer: ThreeRendererDiagnosticsSnapshot | null;
  camera: CameraTransitionDiagnosticsSnapshot | null;
  robot: RobotDiagnosticsSnapshot | null;
  astraea: AstraeaDiagnosticsSnapshot | null;
  pinaculo: PinaculoDiagnosticsSnapshot | null;
  soundLab: SoundLabDiagnosticsSnapshot | null;
  futureEnergy: FutureEnergyDiagnosticsSnapshot | null;
  electronicsAi: ElectronicsAiDiagnosticsSnapshot | null;
  drone: DroneDiagnosticsSnapshot | null;
  water: WaterSurfaceDiagnosticsSnapshot | null;
}>;

export type ObservatoryDiagnosticsReport = Readonly<{
  version: 1;
  scenario: ThreeRendererDiagnosticsScenario;
  snapshot: ObservatoryDiagnosticsSnapshot;
  rendererReport: ThreeRendererDiagnosticsReport | null;
  evidence: Readonly<{
    verdict: "pass" | "ineligible";
    blockers: readonly (
      | "renderer-unavailable"
      | "camera-unavailable"
      | "robot-unavailable"
      | "astraea-unavailable"
      | "pinaculo-unavailable"
      | "sound-lab-unavailable"
      | "future-energy-unavailable"
      | "electronics-ai-unavailable"
      | "drone-unavailable"
      | "water-unavailable"
      | "renderer-report-ineligible"
    )[];
  }>;
}>;

export type ObservatoryDiagnostics = Readonly<{
  capture: () => ObservatoryDiagnosticsSnapshot;
  reportScenario: (
    scenario: ThreeRendererDiagnosticsScenario,
    durationMs?: number,
  ) => Promise<ObservatoryDiagnosticsReport>;
}>;

export type ObservatoryDiagnosticsSources = Readonly<{
  renderer: () => ThreeRendererDiagnostics | null;
  camera: () => CameraTransitionDiagnostics | null;
  robot: () => RobotDiagnostics | null;
  astraea: () => AstraeaDiagnostics | null;
  pinaculo: () => PinaculoDiagnostics | null;
  soundLab: () => SoundLabDiagnostics | null;
  futureEnergy: () => FutureEnergyDiagnostics | null;
  electronicsAi: () => ElectronicsAiDiagnostics | null;
  drone: () => DroneDiagnostics | null;
  water: () => WaterSurfaceDiagnostics | null;
}>;

function createObservatoryDiagnosticsSnapshot({
  renderer,
  camera,
  robot,
  astraea,
  pinaculo,
  soundLab,
  futureEnergy,
  electronicsAi,
  drone,
  water,
}: {
  renderer: ThreeRendererDiagnosticsSnapshot | null;
  camera: CameraTransitionDiagnosticsSnapshot | null;
  robot: RobotDiagnosticsSnapshot | null;
  astraea: AstraeaDiagnosticsSnapshot | null;
  pinaculo: PinaculoDiagnosticsSnapshot | null;
  soundLab: SoundLabDiagnosticsSnapshot | null;
  futureEnergy: FutureEnergyDiagnosticsSnapshot | null;
  electronicsAi: ElectronicsAiDiagnosticsSnapshot | null;
  drone: DroneDiagnosticsSnapshot | null;
  water: WaterSurfaceDiagnosticsSnapshot | null;
}): ObservatoryDiagnosticsSnapshot {
  const snapshots = {
    renderer,
    camera,
    robot,
    astraea,
    pinaculo,
    soundLab,
    futureEnergy,
    electronicsAi,
    drone,
    water,
  };
  const missingSources = OBSERVATORY_DIAGNOSTIC_SOURCE_IDS.filter(
    (sourceId) => snapshots[sourceId] === null,
  );

  return {
    version: 1,
    ready: missingSources.length === 0,
    missingSources,
    ...snapshots,
  };
}

export function createObservatoryDiagnostics(
  sources: ObservatoryDiagnosticsSources,
): ObservatoryDiagnostics {
  const capture = () =>
    createObservatoryDiagnosticsSnapshot({
      renderer: sources.renderer()?.capture() ?? null,
      camera: sources.camera()?.capture() ?? null,
      robot: sources.robot()?.capture() ?? null,
      astraea: sources.astraea()?.capture() ?? null,
      pinaculo: sources.pinaculo()?.capture() ?? null,
      soundLab: sources.soundLab()?.capture() ?? null,
      futureEnergy: sources.futureEnergy()?.capture() ?? null,
      electronicsAi: sources.electronicsAi()?.capture() ?? null,
      drone: sources.drone()?.capture() ?? null,
      water: sources.water()?.capture() ?? null,
    });

  return {
    capture,
    async reportScenario(scenario, durationMs) {
      const renderer = sources.renderer();
      const rendererReport = renderer ? await renderer.reportScenario(scenario, durationMs) : null;
      const snapshot = createObservatoryDiagnosticsSnapshot({
        renderer: rendererReport?.snapshot ?? null,
        camera: sources.camera()?.capture() ?? null,
        robot: sources.robot()?.capture() ?? null,
        astraea: sources.astraea()?.capture() ?? null,
        pinaculo: sources.pinaculo()?.capture() ?? null,
        soundLab: sources.soundLab()?.capture() ?? null,
        futureEnergy: sources.futureEnergy()?.capture() ?? null,
        electronicsAi: sources.electronicsAi()?.capture() ?? null,
        drone: sources.drone()?.capture() ?? null,
        water: sources.water()?.capture() ?? null,
      });
      const evidenceBlockers: ObservatoryDiagnosticsReport["evidence"]["blockers"] = [
        ...(snapshot.renderer ? [] : (["renderer-unavailable"] as const)),
        ...(snapshot.camera ? [] : (["camera-unavailable"] as const)),
        ...(snapshot.robot ? [] : (["robot-unavailable"] as const)),
        ...(snapshot.astraea ? [] : (["astraea-unavailable"] as const)),
        ...(snapshot.pinaculo ? [] : (["pinaculo-unavailable"] as const)),
        ...(snapshot.soundLab ? [] : (["sound-lab-unavailable"] as const)),
        ...(snapshot.futureEnergy ? [] : (["future-energy-unavailable"] as const)),
        ...(snapshot.electronicsAi ? [] : (["electronics-ai-unavailable"] as const)),
        ...(snapshot.drone ? [] : (["drone-unavailable"] as const)),
        ...(snapshot.water ? [] : (["water-unavailable"] as const)),
        ...(rendererReport === null || rendererReport.evidence.verdict === "pass"
          ? []
          : (["renderer-report-ineligible"] as const)),
      ];

      return {
        version: 1,
        scenario,
        snapshot,
        rendererReport,
        evidence: {
          verdict: evidenceBlockers.length === 0 ? "pass" : "ineligible",
          blockers: evidenceBlockers,
        },
      };
    },
  };
}
