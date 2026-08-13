import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const thesisWriterAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "agent",
  id: "thesis-writer",
  name: "Thesis Writer Kit",
  repository: "uset82/Thesis-Writer-Kit",
  version: "1.0.0",
  description:
    "Research specialist host adapter for Thesis Writer Kit. Drafts and citations are not invented here.",
  domains: ["research"],
  capabilities: ["thesis-outline"],
  inputs: [
    { name: "fieldOfStudy", type: "string", required: false },
    { name: "education", type: "string", required: false },
    { name: "goals", type: "string", required: false },
    { name: "topic", type: "string", required: false },
  ],
  outputs: [
    {
      name: "outline",
      type: "object",
      description: "Thesis outline payload from an injected engine",
    },
  ],
  permissions: ["read", "compute"],
  sensitivity: "personal",
  execution: "local-function",
  timeoutMs: 15_000,
};
