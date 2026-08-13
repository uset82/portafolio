import { AGENT_JSON_SCHEMA_V1, type AgentJsonDocument } from "../../manifest/schemas";

export const electronicsAgentJson: AgentJsonDocument = {
  schema: AGENT_JSON_SCHEMA_V1,
  type: "tool",
  id: "electronics-agent",
  name: "Electronics",
  repository: "uset82/TRAFFICLIGHT",
  version: "1.0.0",
  description:
    "One electronics specialist with traffic-light, FPGA/UART, microcontroller, smart-home, and watering tools. Not five LLM agents.",
  domains: ["electronics", "embedded", "iot", "fpga"],
  capabilities: ["traffic-light", "fpga-uart", "microcontroller", "smart-home", "watering-system"],
  inputs: [{ name: "query", type: "string", required: false }],
  outputs: [
    {
      name: "catalog",
      type: "object",
      description: "Host catalog card for the selected electronics tool",
    },
  ],
  permissions: ["read", "compute"],
  sensitivity: "public",
  execution: "local-function",
  timeoutMs: 5_000,
};
