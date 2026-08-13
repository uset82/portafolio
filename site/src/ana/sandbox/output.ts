import { parseAgentResponse } from "../protocol/agent";
import type { AgentResponse } from "../protocol/schemas";
import { ANA_SANDBOX_LIMITS } from "./schemas";
import { containsSecretLeak } from "./secrets";

const DANGEROUS_KEY = /^(?:__proto__|prototype|constructor)$/;

export class SandboxOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SandboxOutputError";
  }
}

export const validateSandboxOutput = (
  value: unknown,
  maxOutputBytes: number = ANA_SANDBOX_LIMITS.maxOutputBytes,
): AgentResponse => {
  const response = parseAgentResponse(value);
  let serialized: string;
  try {
    serialized = JSON.stringify(response);
  } catch {
    throw new SandboxOutputError("Sandbox output is not JSON-serializable.");
  }
  if (Buffer.byteLength(serialized, "utf8") > maxOutputBytes) {
    throw new SandboxOutputError("Sandbox output exceeds the size limit.");
  }
  if (containsDangerousKeys(response) || containsSecretLeak(response)) {
    throw new SandboxOutputError("Sandbox output contains forbidden keys or secrets.");
  }
  return structuredClone(response);
};

const containsDangerousKeys = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsDangerousKeys);
  if (value && typeof value === "object") {
    return Object.keys(value).some(
      (key) =>
        DANGEROUS_KEY.test(key) || containsDangerousKeys((value as Record<string, unknown>)[key]),
    );
  }
  return false;
};
