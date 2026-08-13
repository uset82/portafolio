import type { RepoAgent } from "../../protocol/agent";
import { createHostEngineAgent, type HostEngine } from "../host";
import { smartapplyAgentJson } from "./manifest";

export const createSmartapplyAgent = (options: { engine?: HostEngine } = {}): RepoAgent =>
  createHostEngineAgent(smartapplyAgentJson, options);
