import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const smartapplyAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "agent",
  id: "smartapply",
  name: "SmartApply",
  repository: "uset82/smartapply-app",
  version: "1.0.0",
  description:
    "Career specialist host adapter for SmartApply. Cover letters and tracking are not invented here.",
  domains: ["career"],
  capabilities: ["application-track"],
  inputs: [
    { name: "fieldOfStudy", type: "string", required: false },
    { name: "education", type: "string", required: false },
    { name: "skills", type: "string", required: false },
    { name: "goals", type: "string", required: false },
    { name: "experience", type: "string", required: false },
  ],
  outputs: [
    {
      name: "applications",
      type: "object",
      description: "Application-tracking payload from an injected engine",
    },
  ],
  permissions: ["read", "compute"],
  sensitivity: "personal",
  execution: "local-function",
  timeoutMs: 15_000,
};
