import type { RepoAgent } from "../protocol/agent";
import type { AgentPermission } from "../protocol/schemas";
import { selectAgentInput } from "../privacy";
import { createAnaSandbox, type AnaSandbox } from "../sandbox";
import { evaluateSecurityGate, VISITOR_PERMISSIONS } from "../security";
import type { AgentResponse } from "../protocol/schemas";
import { planExecutionWaves, stepId } from "./dag";
import {
  ANA_DEFAULT_MAX_AGENT_DEPTH,
  ANA_DEFAULT_MAX_AGENTS_PER_REQUEST,
  ANA_DEFAULT_MAX_RUNTIME_MS,
  runWithAnaDelegation,
  type SpecialistDelegationRequest,
} from "./delegation";
import type { SpecialistIndex } from "./router";
import type { AnaPlanStep, AnaTraceEvent } from "./schemas";

export const ANA_DEFAULT_CONCURRENCY_LIMIT = 3;
export const ANA_DEFAULT_COST_LIMIT = 8;
export const ANA_DEFAULT_MAX_RETRIES = 1;
export {
  ANA_DEFAULT_MAX_AGENT_DEPTH,
  ANA_DEFAULT_MAX_AGENTS_PER_REQUEST,
  ANA_DEFAULT_MAX_RUNTIME_MS,
};

export type AnaExecuteOptions = {
  requestId: string;
  steps: readonly AnaPlanStep[];
  provided: Record<string, unknown>;
  index: SpecialistIndex;
  signal?: AbortSignal;
  concurrencyLimit?: number;
  costLimit?: number;
  maxRetries?: number;
  sharePersonalProfile?: boolean;
  sandbox?: AnaSandbox;
  grantedPermissions?: readonly AgentPermission[];
  securityConfirmed?: boolean;
  onTrace?: (event: AnaTraceEvent) => void;
  maxAgentDepth?: number;
  maxAgentsPerRequest?: number;
  maxRuntimeMs?: number;
};

export type AnaExecutionResult = {
  responses: AgentResponse[];
  traces: AnaTraceEvent[];
  cost: { units: number; limit: number };
};

class ExecutionTimeoutError extends Error {
  readonly timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Timed out after ${timeoutMs}ms.`);
    this.name = "ExecutionTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

class ExecutionCancelledError extends Error {
  constructor() {
    super("Cancelled.");
    this.name = "ExecutionCancelledError";
  }
}

const specialistInput = (
  agent: RepoAgent,
  provided: Record<string, unknown>,
  sharePersonalProfile: boolean,
): Record<string, unknown> => {
  const options = sharePersonalProfile ? { consent: true as const } : {};
  return selectAgentInput(
    agent.manifest().id,
    provided,
    agent.manifest().inputs.map((input) => input.name),
    options,
  );
};

const failedResponse = (agentId: string, summary: string, runtimeMs: number): AgentResponse => ({
  agentId,
  status: "failed",
  result: { error: summary },
  summary,
  runtimeMs,
});

const isoNow = () => new Date().toISOString();

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  signal: AbortSignal | undefined,
): Promise<T> => {
  if (signal?.aborted) throw new ExecutionCancelledError();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ExecutionTimeoutError(timeoutMs)), timeoutMs);
  });
  const abort = signal
    ? new Promise<never>((_, reject) => {
        const onAbort = () => reject(new ExecutionCancelledError());
        if (signal.aborted) {
          onAbort();
          return;
        }
        signal.addEventListener("abort", onAbort, { once: true });
      })
    : undefined;
  try {
    return await Promise.race(abort ? [promise, timeout, abort] : [promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

type AttemptOutcome =
  | { kind: "response"; response: AgentResponse; runtimeMs: number }
  | { kind: "timeout"; runtimeMs: number; timeoutMs: number }
  | { kind: "cancelled"; runtimeMs: number }
  | { kind: "error"; runtimeMs: number; message: string };

const toFailed = (agentId: string, outcome: AttemptOutcome): AgentResponse => {
  if (outcome.kind === "response") return outcome.response;
  if (outcome.kind === "timeout") {
    return failedResponse(agentId, `Timed out after ${outcome.timeoutMs}ms.`, outcome.runtimeMs);
  }
  if (outcome.kind === "cancelled") {
    return failedResponse(agentId, "Cancelled.", outcome.runtimeMs);
  }
  return failedResponse(agentId, outcome.message, outcome.runtimeMs);
};

const traceEvent = (
  step: AnaPlanStep,
  event: AnaTraceEvent["event"],
  attempt: number,
  runtimeMs?: number,
  extra?: Pick<AnaTraceEvent, "via" | "depth" | "reason">,
): AnaTraceEvent => {
  const eventRecord: AnaTraceEvent = {
    at: isoNow(),
    agentId: step.agentId,
    capability: step.capability,
    event,
    attempt,
  };
  if (runtimeMs !== undefined) eventRecord.runtimeMs = runtimeMs;
  if (extra?.via) eventRecord.via = extra.via;
  if (extra?.depth !== undefined) eventRecord.depth = extra.depth;
  if (extra?.reason) eventRecord.reason = extra.reason;
  return eventRecord;
};

export const executePlan = async (options: AnaExecuteOptions): Promise<AnaExecutionResult> => {
  const concurrencyLimit = options.concurrencyLimit ?? ANA_DEFAULT_CONCURRENCY_LIMIT;
  const costLimit = options.costLimit ?? ANA_DEFAULT_COST_LIMIT;
  const maxRetries = options.maxRetries ?? ANA_DEFAULT_MAX_RETRIES;
  const maxAgentDepth = options.maxAgentDepth ?? ANA_DEFAULT_MAX_AGENT_DEPTH;
  const maxAgentsPerRequest = options.maxAgentsPerRequest ?? ANA_DEFAULT_MAX_AGENTS_PER_REQUEST;
  const maxRuntimeMs = options.maxRuntimeMs ?? ANA_DEFAULT_MAX_RUNTIME_MS;
  const sharePersonalProfile = options.sharePersonalProfile === true;
  const sandbox = options.sandbox ?? createAnaSandbox();
  const deadline = new AbortController();
  const runtimeTimer = setTimeout(() => deadline.abort(), maxRuntimeMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, deadline.signal])
    : deadline.signal;
  const traces: AnaTraceEvent[] = [];
  const recordTrace = (...args: Parameters<typeof traceEvent>) => {
    const event = traceEvent(...args);
    traces.push(event);
    options.onTrace?.(event);
  };
  let costUsed = 0;
  let agentsStarted = 0;
  const charge = () => {
    if (costUsed >= costLimit) return false;
    costUsed += 1;
    return true;
  };

  const stepsByKey = new Map(options.steps.map((step) => [stepId(step), step]));
  const byKey = new Map<string, AgentResponse>();
  const stack: string[] = [];

  const denyDelegation = (
    from: AnaPlanStep,
    request: SpecialistDelegationRequest,
    reason: string,
    depth: number,
  ): AgentResponse => {
    const deniedStep: AnaPlanStep = {
      agentId: request.agentId,
      capability: request.capability,
      domain: from.domain,
      dependsOn: [],
    };
    recordTrace(deniedStep, "delegate-denied", 0, 0, {
      via: from.agentId,
      depth,
      reason,
    });
    return failedResponse(request.agentId, reason, 0);
  };

  const delegateFrom = async (
    from: AnaPlanStep,
    depth: number,
    request: SpecialistDelegationRequest,
  ): Promise<AgentResponse> => {
    const nextDepth = depth + 1;
    if (signal.aborted) {
      return denyDelegation(from, request, "max-runtime", nextDepth);
    }
    if (nextDepth > maxAgentDepth) {
      return denyDelegation(from, request, "max-depth", nextDepth);
    }
    if (stack.includes(request.agentId)) {
      return denyDelegation(from, request, "recursion", nextDepth);
    }
    const agent = options.index.getById(request.agentId);
    if (!agent) {
      return denyDelegation(from, request, "unknown-agent", nextDepth);
    }
    if (!agent.manifest().capabilities.includes(request.capability)) {
      return denyDelegation(from, request, "capability-mismatch", nextDepth);
    }
    const domain = agent.manifest().domains[0];
    if (!domain) {
      return denyDelegation(from, request, "unknown-agent", nextDepth);
    }
    const nextStep: AnaPlanStep = {
      agentId: request.agentId,
      capability: request.capability,
      domain,
      dependsOn: [],
    };
    const existing = byKey.get(stepId(nextStep));
    if (existing) {
      recordTrace(nextStep, "delegate", 0, 0, {
        via: from.agentId,
        depth: nextDepth,
        reason: "already-ran",
      });
      return existing;
    }
    if (agentsStarted >= maxAgentsPerRequest) {
      return denyDelegation(from, request, "max-agents", nextDepth);
    }
    recordTrace(nextStep, "delegate", 0, 0, { via: from.agentId, depth: nextDepth });
    const response = await runStep(nextStep, nextDepth, from.agentId);
    byKey.set(stepId(nextStep), response);
    return response;
  };

  const runAttempt = async (step: AnaPlanStep, depth: number): Promise<AttemptOutcome> => {
    const agent = options.index.getById(step.agentId);
    if (!agent) {
      return { kind: "error", runtimeMs: 0, message: "Agent not registered." };
    }
    const started = Date.now();
    try {
      const response = await withTimeout(
        runWithAnaDelegation(
          (request) => delegateFrom(step, depth, request),
          () =>
            sandbox.runAgent({
              agent,
              request: {
                requestId: `${options.requestId}:${step.agentId}:${step.capability}`,
                capability: step.capability,
                input: specialistInput(agent, options.provided, sharePersonalProfile),
              },
            }),
        ),
        Math.min(agent.manifest().timeoutMs, sandbox.limits.timeoutMs),
        signal,
      );
      return { kind: "response", response, runtimeMs: Date.now() - started };
    } catch (error) {
      const runtimeMs = Date.now() - started;
      if (error instanceof ExecutionCancelledError || signal.aborted) {
        return { kind: "cancelled", runtimeMs };
      }
      if (error instanceof ExecutionTimeoutError) {
        return { kind: "timeout", runtimeMs, timeoutMs: error.timeoutMs };
      }
      const message = error instanceof Error ? error.message.slice(0, 300) : "Specialist failed.";
      return { kind: "error", runtimeMs, message };
    }
  };

  async function runStep(step: AnaPlanStep, depth: number, via?: string): Promise<AgentResponse> {
    const extra = {
      ...(via ? { via } : {}),
      depth,
    };
    if (signal.aborted) {
      recordTrace(step, "cancelled", 0, 0, extra);
      return failedResponse(step.agentId, "Cancelled.", 0);
    }
    if (agentsStarted >= maxAgentsPerRequest) {
      recordTrace(step, "delegate-denied", 0, 0, { ...extra, reason: "max-agents" });
      return failedResponse(step.agentId, "max-agents", 0);
    }
    agentsStarted += 1;
    const agent = options.index.getById(step.agentId);
    if (agent) {
      const input = specialistInput(agent, options.provided, sharePersonalProfile);
      const decision = evaluateSecurityGate({
        agent,
        input,
        granted: options.grantedPermissions ?? VISITOR_PERMISSIONS,
        ...(options.securityConfirmed ? { confirmed: true } : {}),
        ...(sharePersonalProfile ? { sharePersonalProfile: true } : {}),
      });
      if (!decision.allowed) {
        recordTrace(step, "failed", 0, 0, extra);
        return failedResponse(step.agentId, decision.reasons[0] ?? "Security gate denied.", 0);
      }
    }
    stack.push(step.agentId);
    try {
      let lastOutcome: AttemptOutcome | undefined;
      for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
        if (signal.aborted) {
          recordTrace(step, "cancelled", attempt, 0, extra);
          return failedResponse(step.agentId, "Cancelled.", 0);
        }
        if (!charge()) {
          recordTrace(step, "skipped-cost", attempt, undefined, extra);
          if (lastOutcome) return toFailed(step.agentId, lastOutcome);
          return failedResponse(step.agentId, "Cost limit reached.", 0);
        }
        recordTrace(step, attempt === 1 ? "start" : "retry", attempt, undefined, extra);
        const outcome = await runAttempt(step, depth);
        lastOutcome = outcome;
        if (outcome.kind === "response") {
          recordTrace(
            step,
            outcome.response.status === "success" || outcome.response.status === "partial"
              ? "success"
              : "failed",
            attempt,
            outcome.runtimeMs,
            extra,
          );
          return outcome.response;
        }
        recordTrace(
          step,
          outcome.kind === "timeout"
            ? "timeout"
            : outcome.kind === "cancelled"
              ? "cancelled"
              : "failed",
          attempt,
          outcome.runtimeMs,
          extra,
        );
        const retryable = outcome.kind === "timeout" || outcome.kind === "error";
        if (!retryable || attempt > maxRetries || signal.aborted) {
          return toFailed(step.agentId, outcome);
        }
      }
      return failedResponse(step.agentId, "Specialist failed.", 0);
    } finally {
      stack.pop();
    }
  }

  try {
    const { waves, cycles } = planExecutionWaves(options.steps);
    const limit = Math.max(1, concurrencyLimit);

    for (const cycle of cycles) {
      for (const id of cycle) {
        const step = stepsByKey.get(id);
        if (!step) continue;
        recordTrace(step, "failed", 0, 0);
        byKey.set(id, failedResponse(step.agentId, "Circular dependency.", 0));
      }
    }

    for (const wave of waves) {
      const waveSteps = wave.flatMap((id) => {
        const step = stepsByKey.get(id);
        return step ? [step] : [];
      });
      const tasks = waveSteps.map((step) => () => runStep(step, 1));
      const waveResponses = await runPool(tasks, limit);
      for (const [index, step] of waveSteps.entries()) {
        byKey.set(
          stepId(step),
          waveResponses[index] ?? failedResponse(step.agentId, "Specialist failed.", 0),
        );
      }
    }

    return {
      responses: options.steps.map(
        (step) => byKey.get(stepId(step)) ?? failedResponse(step.agentId, "Specialist failed.", 0),
      ),
      traces,
      cost: { units: costUsed, limit: costLimit },
    };
  } finally {
    clearTimeout(runtimeTimer);
  }
};

const runPool = async (
  tasks: readonly (() => Promise<AgentResponse>)[],
  limit: number,
): Promise<(AgentResponse | undefined)[]> => {
  if (tasks.length === 0) return [];
  const results: (AgentResponse | undefined)[] = Array.from({ length: tasks.length });
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= tasks.length) return;
      const task = tasks[index];
      if (!task) return;
      const settled = await Promise.allSettled([task()]);
      const outcome = settled[0];
      results[index] =
        outcome?.status === "fulfilled"
          ? outcome.value
          : failedResponse("unknown", "Specialist failed.", 0);
    }
  };
  await Promise.allSettled(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  return results;
};
