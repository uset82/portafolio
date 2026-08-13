import type { RepoAgent } from "../../protocol/agent";
import { createHostEngineAgent, type HostEngine } from "../host";
import { thesisWriterAgentJson } from "./manifest";

export const createThesisWriterAgent = (options: { engine?: HostEngine } = {}): RepoAgent =>
  createHostEngineAgent(thesisWriterAgentJson, options);
