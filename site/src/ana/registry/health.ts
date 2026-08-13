import { parseAgentHealth } from "../protocol/agent";
import type { AgentHealth } from "../protocol/schemas";
import type { AgentRegistryAvailability } from "./schemas";

export type AgentHealthProbe = (input: { id: string; repository: string }) => Promise<AgentHealth>;

export const utcTimestamp = (date = new Date()): string => date.toISOString();

export const availabilityFromHealth = (health: AgentHealth): AgentRegistryAvailability =>
  health.status === "unavailable" ? "unavailable" : "available";

export const noAdapterHealthProbe: AgentHealthProbe = async ({ id }) =>
  parseAgentHealth({
    agentId: id,
    status: "unavailable",
    checkedAt: utcTimestamp(),
    message: "No runtime adapter registered",
  });

export const staticHealthProbe =
  (health: Omit<AgentHealth, "agentId">): AgentHealthProbe =>
  async ({ id }) =>
    parseAgentHealth({ ...health, agentId: id });
