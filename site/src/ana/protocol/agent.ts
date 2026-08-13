import {
  agentHealthSchema,
  agentManifestSchema,
  agentRequestSchema,
  agentResponseSchema,
  type AgentHealth,
  type AgentManifest,
  type AgentRequest,
  type AgentResponse,
  type AgentValueType,
} from "./schemas";

export interface RepoAgent {
  manifest(): AgentManifest;
  health(): Promise<AgentHealth>;
  execute(request: AgentRequest): Promise<AgentResponse>;
}

export class AgentProtocolError extends Error {
  readonly code:
    | "invalid_manifest"
    | "invalid_request"
    | "invalid_response"
    | "invalid_health"
    | "capability_mismatch";

  constructor(code: AgentProtocolError["code"], message: string) {
    super(message);
    this.name = "AgentProtocolError";
    this.code = code;
  }
}

const formatZodError = (error: { issues: readonly { path: PropertyKey[]; message: string }[] }) =>
  error.issues
    .map(
      (issue) =>
        `${issue.path.length === 0 ? "record" : issue.path.map(String).join(".")}: ${issue.message}`,
    )
    .join("; ");

export const parseAgentManifest = (value: unknown): AgentManifest => {
  const parsed = agentManifestSchema.safeParse(value);
  if (!parsed.success) {
    throw new AgentProtocolError("invalid_manifest", formatZodError(parsed.error));
  }
  return parsed.data;
};

export const parseAgentRequest = (value: unknown): AgentRequest => {
  const parsed = agentRequestSchema.safeParse(value);
  if (!parsed.success) {
    throw new AgentProtocolError("invalid_request", formatZodError(parsed.error));
  }
  return parsed.data;
};

export const parseAgentHealth = (value: unknown): AgentHealth => {
  const parsed = agentHealthSchema.safeParse(value);
  if (!parsed.success) {
    throw new AgentProtocolError("invalid_health", formatZodError(parsed.error));
  }
  return parsed.data;
};

export const matchesAgentValueType = (value: unknown, type: AgentValueType): boolean => {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && Number.isFinite(value);
    case "boolean":
      return typeof value === "boolean";
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "array":
      return Array.isArray(value);
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const resultMatchesManifestOutputs = (manifest: AgentManifest, result: unknown): boolean => {
  const outputs = manifest.outputs;
  if (outputs.length === 0) return true;
  if (isRecord(result)) {
    const named = outputs.every(
      (output) => output.name in result && matchesAgentValueType(result[output.name], output.type),
    );
    if (named) return true;
  }
  const only = outputs[0];
  return outputs.length === 1 && only !== undefined && matchesAgentValueType(result, only.type);
};

export const parseAgentResponse = (value: unknown): AgentResponse => {
  const parsed = agentResponseSchema.safeParse(value);
  if (!parsed.success) {
    throw new AgentProtocolError("invalid_response", formatZodError(parsed.error));
  }
  return parsed.data;
};

export const assertRequestMatchesManifest = (manifest: AgentManifest, request: AgentRequest) => {
  if (!manifest.capabilities.includes(request.capability)) {
    throw new AgentProtocolError(
      "capability_mismatch",
      `Capability ${request.capability} is not provided by ${manifest.id}`,
    );
  }

  const allowed = new Set(manifest.inputs.map((input) => input.name));
  for (const name of Object.keys(request.input)) {
    if (!allowed.has(name)) {
      throw new AgentProtocolError(
        "invalid_request",
        `Input ${name} is not declared by ${manifest.id}`,
      );
    }
  }

  for (const input of manifest.inputs) {
    if (!(input.name in request.input) || request.input[input.name] === undefined) {
      if (input.required) {
        throw new AgentProtocolError(
          "invalid_request",
          `Missing required input ${input.name} for ${request.capability}`,
        );
      }
      continue;
    }
    if (!matchesAgentValueType(request.input[input.name], input.type)) {
      throw new AgentProtocolError("invalid_request", `Input ${input.name} must be ${input.type}`);
    }
  }
};

export const defineRepoAgent = (agent: RepoAgent): RepoAgent => {
  parseAgentManifest(agent.manifest());
  return agent;
};

export const invokeRepoAgent = async (
  agent: RepoAgent,
  request: unknown,
): Promise<AgentResponse> => {
  const manifest = parseAgentManifest(agent.manifest());
  const parsedRequest = parseAgentRequest(request);
  assertRequestMatchesManifest(manifest, parsedRequest);
  const response = parseAgentResponse(await agent.execute(parsedRequest));
  if (response.agentId !== manifest.id) {
    throw new AgentProtocolError(
      "invalid_response",
      `Response agentId ${response.agentId} does not match manifest ${manifest.id}`,
    );
  }
  return response;
};
