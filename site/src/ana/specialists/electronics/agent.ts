import type { RepoAgent } from "../../protocol/agent";
import { createCatalogToolAgent } from "../host";
import { ELECTRONICS_TOOL_CARDS } from "../wave2";
import { electronicsAgentJson } from "./manifest";

export const createElectronicsAgent = (): RepoAgent =>
  createCatalogToolAgent(electronicsAgentJson, ELECTRONICS_TOOL_CARDS);
