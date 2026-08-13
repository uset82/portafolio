import type { RepoAgent } from "../../protocol/agent";
import { createCatalogToolAgent } from "../host";
import { STILLAS_TOOL_CARD } from "../wave2";
import { stillasAgentJson } from "./manifest";

export const createStillasAgent = (): RepoAgent =>
  createCatalogToolAgent(stillasAgentJson, [STILLAS_TOOL_CARD]);
