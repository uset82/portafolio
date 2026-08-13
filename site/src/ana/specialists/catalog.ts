import type { RepoAgent } from "../protocol/agent";
import type { AgentJsonDocument } from "../manifest/schemas";
import { createAstraeaAgent } from "./astraea/agent";
import { createChartEngineFromEnv } from "./astraea/engine";
import { astraeaAgentJson } from "./astraea/manifest";
import { createElectronicsAgent } from "./electronics/agent";
import { electronicsAgentJson } from "./electronics/manifest";
import { createMentoraAgent } from "./mentora/agent";
import { mentoraAgentJson } from "./mentora/manifest";
import { createPinaculoAgent } from "./pinaculo/agent";
import { pinaculoAgentJson } from "./pinaculo/manifest";
import { createSmartapplyAgent } from "./smartapply/agent";
import { smartapplyAgentJson } from "./smartapply/manifest";
import { createStillasAgent } from "./stillas/agent";
import { stillasAgentJson } from "./stillas/manifest";
import { createStrudelAgent } from "./strudel/agent";
import { createMusicEngineFromEnv } from "./strudel/engine";
import { strudelAgentJson } from "./strudel/manifest";
import { createThesisWriterAgent } from "./thesis-writer/agent";
import { thesisWriterAgentJson } from "./thesis-writer/manifest";

export type SpecialistCatalog = Readonly<Record<string, RepoAgent>>;

export type Phase6SpecialistCatalog = {
  readonly astraea: RepoAgent;
  readonly pinaculo: RepoAgent;
  readonly strudel: RepoAgent;
};

export const phase6AgentJsonDocuments: readonly AgentJsonDocument[] = [
  astraeaAgentJson,
  pinaculoAgentJson,
  strudelAgentJson,
];

export const wave2AgentJsonDocuments: readonly AgentJsonDocument[] = [
  mentoraAgentJson,
  smartapplyAgentJson,
  thesisWriterAgentJson,
  stillasAgentJson,
  electronicsAgentJson,
];

export const hostAgentJsonDocuments: readonly AgentJsonDocument[] = [
  ...phase6AgentJsonDocuments,
  ...wave2AgentJsonDocuments,
];

export const createPhase6Specialists = (
  env: Record<string, string | undefined> = process.env,
): Phase6SpecialistCatalog => ({
  astraea: createAstraeaAgent({ chartEngine: createChartEngineFromEnv(env) }),
  pinaculo: createPinaculoAgent(),
  strudel: createStrudelAgent({ musicEngine: createMusicEngineFromEnv(env) }),
});

export const createWave2Specialists = (): SpecialistCatalog => ({
  mentora: createMentoraAgent(),
  smartapply: createSmartapplyAgent(),
  "thesis-writer": createThesisWriterAgent(),
  stillas: createStillasAgent(),
  "electronics-agent": createElectronicsAgent(),
});

export const createHostSpecialists = (
  env: Record<string, string | undefined> = process.env,
): SpecialistCatalog => ({
  ...createPhase6Specialists(env),
  ...createWave2Specialists(),
});

export const specialistById = (catalog: SpecialistCatalog, id: string): RepoAgent | undefined =>
  catalog[id];
