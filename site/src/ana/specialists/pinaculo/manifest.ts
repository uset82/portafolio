import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const pinaculoAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "agent",
  id: "pinaculo",
  name: "PINÁCULO",
  repository: "uset82/pinaculo",
  version: "1.0.0",
  description:
    "Numerology specialist wrapping the Pináculo 24-position calculator. Symbolic, not scientific.",
  domains: ["numerology"],
  capabilities: ["numerology-profile", "master-numbers", "life-cycles", "pinnacle-cycles"],
  inputs: [
    { name: "fullName", type: "string", required: true, sensitivity: "personal" },
    { name: "birthDate", type: "string", required: true, sensitivity: "sensitive" },
  ],
  outputs: [
    { name: "profile", type: "object", description: "Pináculo positions and derived sets" },
  ],
  permissions: ["read", "compute"],
  sensitivity: "sensitive",
  execution: "local-function",
  timeoutMs: 5_000,
};
