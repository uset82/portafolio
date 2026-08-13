export const ANA_SANDBOX_LIMITS = {
  timeoutMs: 15_000,
  memoryMb: 128,
  cpuMs: 8_000,
  maxOutputBytes: 262_144,
} as const;

export type AnaSandboxLimits = {
  timeoutMs: number;
  memoryMb: number;
  cpuMs: number;
  maxOutputBytes: number;
};

export type SandboxJob = {
  agentId: string;
  capability: string;
  execution: "local-function" | "http" | "container" | "external-api";
  limits: AnaSandboxLimits;
};

export const TRUSTED_LOCAL_AGENT_IDS = ["pinaculo"] as const;

export const SANDBOX_DENIED_REPOSITORY =
  "Repository code cannot run inside the portfolio Node process.";

export const SANDBOX_DENIED_CONTAINER = "Container sandbox is not configured.";

export const SANDBOX_DENIED_OUTPUT = "Sandbox output failed validation.";

export const SANDBOX_DENIED_ISOLATION = "Sandbox denied a filesystem, network, or secret access.";
