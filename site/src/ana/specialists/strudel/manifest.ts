import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const strudelAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "agent",
  id: "strudel",
  name: "STRUDEL",
  repository: "uset82/StrudelAI",
  version: "1.0.0",
  description:
    "Music specialist that delegates pattern generation to the StrudelAI music-agent pipeline.",
  domains: ["music"],
  capabilities: ["pattern-generate"],
  inputs: [
    { name: "prompt", type: "string", required: true },
    { name: "bpm", type: "number", required: false },
  ],
  outputs: [
    {
      name: "tracks",
      type: "object",
      description: "Track-separated Strudel expressions from the music agent",
    },
  ],
  permissions: ["read", "compute", "network"],
  sensitivity: "public",
  execution: "http",
  timeoutMs: 30_000,
};
