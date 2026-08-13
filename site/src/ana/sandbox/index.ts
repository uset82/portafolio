import { invokeRepoAgent, type RepoAgent } from "../protocol/agent";
import type { AgentRequest, AgentResponse } from "../protocol/schemas";
import { containsForbiddenFsReference } from "./filesystem";
import { inspectSandboxUrl } from "./network";
import { SandboxOutputError, validateSandboxOutput } from "./output";
import {
  ANA_SANDBOX_LIMITS,
  SANDBOX_DENIED_CONTAINER,
  SANDBOX_DENIED_ISOLATION,
  SANDBOX_DENIED_OUTPUT,
  SANDBOX_DENIED_REPOSITORY,
  type AnaSandboxLimits,
  type SandboxJob,
} from "./schemas";
import { containsSecretLeak, createSandboxEnv } from "./secrets";

export type RepositorySandboxRequest = {
  repository: string;
  path: string;
  capability: string;
};

export type RunAgentSandboxInput = {
  agent: RepoAgent;
  request: AgentRequest;
};

export type AnaSandbox = {
  limits: AnaSandboxLimits;
  env: Record<string, string>;
  inspectUrl: typeof inspectSandboxUrl;
  runAgent: (input: RunAgentSandboxInput) => Promise<AgentResponse>;
  runRepository: (input: RepositorySandboxRequest) => Promise<AgentResponse>;
  runContainer: (job: SandboxJob) => Promise<AgentResponse>;
};

export type CreateAnaSandboxOptions = {
  limits?: Partial<AnaSandboxLimits>;
  env?: Record<string, string | undefined>;
};

const failed = (agentId: string, summary: string): AgentResponse => ({
  agentId,
  status: "failed",
  result: { error: summary },
  summary,
  runtimeMs: 0,
});

const jobFor = (
  agentId: string,
  capability: string,
  execution: SandboxJob["execution"],
  limits: AnaSandboxLimits,
): SandboxJob => ({
  agentId,
  capability,
  execution,
  limits,
});

export const createAnaSandbox = (options: CreateAnaSandboxOptions = {}): AnaSandbox => {
  const limits: AnaSandboxLimits = {
    timeoutMs: options.limits?.timeoutMs ?? ANA_SANDBOX_LIMITS.timeoutMs,
    memoryMb: options.limits?.memoryMb ?? ANA_SANDBOX_LIMITS.memoryMb,
    cpuMs: options.limits?.cpuMs ?? ANA_SANDBOX_LIMITS.cpuMs,
    maxOutputBytes: options.limits?.maxOutputBytes ?? ANA_SANDBOX_LIMITS.maxOutputBytes,
  };
  const env = createSandboxEnv(options.env);

  const runRepository = async (input: RepositorySandboxRequest): Promise<AgentResponse> => {
    const job = jobFor(input.repository, input.capability, "container", limits);
    return {
      ...failed("sandbox", SANDBOX_DENIED_REPOSITORY),
      result: { error: SANDBOX_DENIED_REPOSITORY, limits: job.limits },
    };
  };

  const runContainer = async (job: SandboxJob): Promise<AgentResponse> =>
    failed(job.agentId, SANDBOX_DENIED_CONTAINER);

  const runAgent = async ({ agent, request }: RunAgentSandboxInput): Promise<AgentResponse> => {
    const manifest = agent.manifest();
    if (
      containsForbiddenFsReference(request.input) ||
      containsSecretLeak(request.input) ||
      containsSecretLeak(env)
    ) {
      return failed(manifest.id, SANDBOX_DENIED_ISOLATION);
    }
    if (manifest.execution === "container") {
      return runContainer(jobFor(manifest.id, request.capability, "container", limits));
    }
    try {
      const response = await invokeRepoAgent(agent, request);
      return validateSandboxOutput(response, limits.maxOutputBytes);
    } catch (error) {
      if (error instanceof SandboxOutputError) {
        return failed(manifest.id, SANDBOX_DENIED_OUTPUT);
      }
      throw error;
    }
  };

  return {
    limits,
    env,
    inspectUrl: inspectSandboxUrl,
    runAgent,
    runRepository,
    runContainer,
  };
};

export {
  ANA_SANDBOX_LIMITS,
  SANDBOX_DENIED_CONTAINER,
  SANDBOX_DENIED_ISOLATION,
  SANDBOX_DENIED_OUTPUT,
  SANDBOX_DENIED_REPOSITORY,
  TRUSTED_LOCAL_AGENT_IDS,
  type AnaSandboxLimits,
  type SandboxJob,
} from "./schemas";
export { inspectSandboxUrl, SANDBOX_DENIED_URL } from "./network";
export { containsForbiddenFsReference } from "./filesystem";
export { createSandboxEnv } from "./secrets";
export { SandboxOutputError, validateSandboxOutput } from "./output";
