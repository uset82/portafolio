import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const stillasAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "tool",
  id: "stillas",
  name: "Stillas Calculator",
  repository: "uset82/StillasCalculator",
  version: "1.0.0",
  description:
    "Scaffolding calculator tool card. Host catalog only; load formulas are not extracted.",
  domains: ["construction"],
  capabilities: ["scaffolding-info"],
  inputs: [{ name: "query", type: "string", required: false }],
  outputs: [
    {
      name: "catalog",
      type: "object",
      description: "Verified project facts about the scaffolding calculator",
    },
  ],
  permissions: ["read", "compute"],
  sensitivity: "public",
  execution: "local-function",
  timeoutMs: 5_000,
};
