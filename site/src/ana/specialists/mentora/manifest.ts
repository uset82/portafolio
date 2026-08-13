import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const mentoraAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "agent",
  id: "mentora",
  name: "Mentora",
  repository: "uset82/mentora",
  version: "1.0.0",
  description:
    "Education specialist host adapter for the Mentora study platform. Remote app code is not executed.",
  domains: ["education"],
  capabilities: ["career-analysis"],
  inputs: [
    { name: "fieldOfStudy", type: "string", required: false },
    { name: "education", type: "string", required: false },
    { name: "skills", type: "string", required: false },
    { name: "goals", type: "string", required: false },
    { name: "interests", type: "string", required: false },
  ],
  outputs: [
    {
      name: "advice",
      type: "object",
      description: "Education/career payload from an injected engine, never invented here",
    },
  ],
  permissions: ["read", "compute"],
  sensitivity: "personal",
  execution: "local-function",
  timeoutMs: 15_000,
};
