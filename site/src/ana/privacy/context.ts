import { AGENT_FIELD_ALLOWLISTS, isPersonalProfileField, isSecretField } from "./allowlists";

export type ContextFilterOptions = {
  consent?: boolean;
};

const hasValue = (value: unknown) => value !== undefined && value !== "";

export const contextFilter = (
  agentId: string,
  userContext: Record<string, unknown>,
  options: ContextFilterOptions = {},
): Record<string, unknown> => {
  const consent = options.consent === true;
  const allowlist = AGENT_FIELD_ALLOWLISTS[agentId];
  const allowed = new Set(allowlist ?? []);
  const filtered: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(userContext)) {
    if (!hasValue(value) || isSecretField(field)) continue;
    if (isPersonalProfileField(field)) {
      if (!consent || !allowlist || !allowed.has(field)) continue;
    }
    filtered[field] = value;
  }
  return filtered;
};

export const selectAgentInput = (
  agentId: string,
  provided: Record<string, unknown>,
  manifestInputNames: readonly string[],
  options: ContextFilterOptions = {},
): Record<string, unknown> => {
  const filtered = contextFilter(agentId, provided, options);
  const declared = new Set(manifestInputNames);
  const input: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(filtered)) {
    if (declared.has(name) && hasValue(value)) input[name] = value;
  }
  return input;
};
