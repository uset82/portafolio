import type { RepoAgent } from "../../protocol/agent";
import { createHostEngineAgent, type HostEngine } from "../host";
import { mentoraAgentJson } from "./manifest";

export const createMentoraAgent = (options: { engine?: HostEngine } = {}): RepoAgent =>
  createHostEngineAgent(mentoraAgentJson, options);
