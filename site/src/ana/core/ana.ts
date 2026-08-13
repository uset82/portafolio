import type { AnaMemoryStore } from "../memory";
import type { RepoAgent } from "../protocol/agent";
import type { AgentPermission } from "../protocol/schemas";
import type { AnaSandbox } from "../sandbox";
import type { RepositoryAudit } from "../repositories/schemas";
import { formatPortfolioNavigation, searchPortfolioKnowledge } from "../knowledge/portfolio";
import type { DiscoveryIndex } from "../discovery";
import { getAnaDebugStore, isAnaDebugEnabled, toDebugSnapshot, type AnaDebugStore } from "../debug";
import { ANA_DEFAULT_COST_LIMIT, executePlan, type AnaExecuteOptions } from "./executor";
import { draftPlan } from "./planner";
import { collectMissingInputs, indexRepoAgents, routeIntent, type SpecialistIndex } from "./router";
import { ANA_PORTFOLIO_BOUNDARY, type AnaRequest, type AnaResult } from "./schemas";
import { createAnaStatusEmitter, type AnaStatusListener } from "./status";
import { synthesizeAnaResult } from "./synthesizer";
import { completeVerification, emptyVerification } from "./verifier";
import { ANA_COMBINED_CONSENT_FIELD, hasExplicitPersonalConsent } from "../privacy/consent";

export type AnaRuntime = {
  agents: readonly RepoAgent[];
  signal?: AbortSignal;
  concurrencyLimit?: number;
  costLimit?: number;
  maxRetries?: number;
  memory?: AnaMemoryStore;
  sessionId?: string;
  userId?: string;
  applyUserMemory?: boolean;
  sandbox?: AnaSandbox;
  grantedPermissions?: readonly AgentPermission[];
  securityConfirmed?: boolean;
  discoveryIndex?: DiscoveryIndex;
  useDiscoveryEmbeddings?: boolean;
  debugStore?: AnaDebugStore;
  createTraceId?: () => string;
  onStatus?: AnaStatusListener;
  maxAgentDepth?: number;
  maxAgentsPerRequest?: number;
  maxRuntimeMs?: number;
  runVerificationAgent?: boolean;
  verificationAgent?: RepoAgent;
  audits?: readonly RepositoryAudit[];
  sharePersonalProfile?: boolean;
};

export const createSpecialistIndex = (runtime: AnaRuntime): SpecialistIndex =>
  indexRepoAgents(runtime.agents);

const executionOptions = (
  request: AnaRequest,
  plan: AnaResult["plan"],
  index: SpecialistIndex,
  runtime: AnaRuntime,
  sharePersonalProfile: boolean,
): AnaExecuteOptions => {
  const options: AnaExecuteOptions = {
    requestId: request.requestId,
    steps: plan.steps,
    provided: plan.provided,
    index,
  };
  if (runtime.signal) options.signal = runtime.signal;
  if (runtime.concurrencyLimit !== undefined) options.concurrencyLimit = runtime.concurrencyLimit;
  if (runtime.costLimit !== undefined) options.costLimit = runtime.costLimit;
  if (runtime.maxRetries !== undefined) options.maxRetries = runtime.maxRetries;
  if (sharePersonalProfile) options.sharePersonalProfile = true;
  if (runtime.sandbox) options.sandbox = runtime.sandbox;
  if (runtime.grantedPermissions) options.grantedPermissions = runtime.grantedPermissions;
  if (runtime.securityConfirmed) options.securityConfirmed = true;
  if (runtime.maxAgentDepth !== undefined) options.maxAgentDepth = runtime.maxAgentDepth;
  if (runtime.maxAgentsPerRequest !== undefined) {
    options.maxAgentsPerRequest = runtime.maxAgentsPerRequest;
  }
  if (runtime.maxRuntimeMs !== undefined) options.maxRuntimeMs = runtime.maxRuntimeMs;
  return options;
};

const hydrateRuntimeProvided = (
  requestProvided: Record<string, unknown>,
  runtime: AnaRuntime,
): Record<string, unknown> => {
  if (!runtime.memory) return requestProvided;
  const input: {
    requestProvided: Record<string, unknown>;
    sessionId?: string;
    userId?: string;
    applyUserMemory?: boolean;
  } = { requestProvided };
  if (runtime.sessionId) input.sessionId = runtime.sessionId;
  if (runtime.userId) input.userId = runtime.userId;
  if (runtime.applyUserMemory) input.applyUserMemory = true;
  return runtime.memory.hydrateProvided(input);
};

const resolveDebugStore = (runtime: AnaRuntime): AnaDebugStore | undefined => {
  if (runtime.debugStore) return runtime.debugStore;
  return isAnaDebugEnabled() ? getAnaDebugStore() : undefined;
};

const recordDebug = (
  request: AnaRequest,
  runtime: AnaRuntime,
  result: AnaResult,
  cost: { units: number; limit: number },
): void => {
  const store = resolveDebugStore(runtime);
  if (!store) return;
  store.record(
    toDebugSnapshot({
      result,
      message: request.message,
      cost,
    }),
  );
};

const recordSession = (
  request: AnaRequest,
  runtime: AnaRuntime,
  provided: Record<string, unknown>,
  status: AnaResult["status"],
): void => {
  if (!runtime.memory || !runtime.sessionId) return;
  runtime.memory.rememberSessionTurn({
    sessionId: runtime.sessionId,
    requestId: request.requestId,
    message: request.message,
    provided,
    status,
  });
};

export async function runAna(request: AnaRequest, runtime: AnaRuntime): Promise<AnaResult> {
  const traceId = runtime.createTraceId?.() ?? crypto.randomUUID();
  const status = createAnaStatusEmitter({
    requestId: request.requestId,
    traceId,
    ...(runtime.onStatus ? { onStatus: runtime.onStatus } : {}),
  });
  status.understanding();

  const drafted = draftPlan(request);
  const provided = hydrateRuntimeProvided(drafted.provided, runtime);
  const draftedWithMemory = { ...drafted, provided };
  const index = createSpecialistIndex(runtime);
  const routed = routeIntent(draftedWithMemory, index, request.message, {
    ...(runtime.discoveryIndex ? { discoveryIndex: runtime.discoveryIndex } : {}),
    ...(runtime.useDiscoveryEmbeddings === false ? { useEmbeddings: false } : {}),
  });
  const combined = draftedWithMemory.goals.includes("combined-analysis");
  const consented = hasExplicitPersonalConsent(request, runtime);
  let missingInputs = collectMissingInputs(routed.steps, provided, index);
  if (combined && !consented) {
    missingInputs = [ANA_COMBINED_CONSENT_FIELD];
  }
  const plan = { ...draftedWithMemory, ...routed, missingInputs };
  status.planning();
  const idleCost = {
    units: 0,
    limit: runtime.costLimit ?? ANA_DEFAULT_COST_LIMIT,
  };

  if (plan.kind === "portfolio-fact") {
    if (plan.goals.includes("ask-portfolio")) {
      status.combining();
      const hits = searchPortfolioKnowledge(request.message, runtime.audits ?? []);
      const navigated = formatPortfolioNavigation({
        query: request.message,
        hits,
        ...(runtime.agents.some((agent) => agent.manifest().id === "electronics-agent")
          ? { electronicsRegistered: true }
          : {}),
      });
      const answered: AnaResult = {
        requestId: request.requestId,
        traceId,
        kind: plan.kind,
        status: "answered",
        answer: navigated.answer,
        plan,
        responses: [],
        provenance: navigated.provenance,
        warnings: [],
        assumptions: navigated.assumptions,
        traces: [],
      };
      recordSession(request, runtime, provided, answered.status);
      recordDebug(request, runtime, answered, idleCost);
      return answered;
    }
    const deferred: AnaResult = {
      requestId: request.requestId,
      traceId,
      kind: plan.kind,
      status: "deferred",
      answer: ANA_PORTFOLIO_BOUNDARY,
      plan,
      responses: [],
      provenance: [],
      warnings: [],
      assumptions: ["Portfolio facts remain behind CC AI's public-knowledge boundary."],
      traces: [],
    };
    recordSession(request, runtime, provided, deferred.status);
    recordDebug(request, runtime, deferred, idleCost);
    return deferred;
  }

  const shouldExecute =
    plan.kind === "specialist" && plan.steps.length > 0 && missingInputs.length === 0;
  const sharePersonalProfile = combined ? consented : true;
  const executeOptions = executionOptions(request, plan, index, runtime, sharePersonalProfile);
  if (runtime.onStatus) {
    executeOptions.onTrace = (event) => status.fromTrace(event);
  }
  const executed = shouldExecute
    ? await executePlan(executeOptions)
    : { responses: [], traces: [], cost: idleCost };

  if (shouldExecute) status.combining();

  const verification = shouldExecute
    ? await completeVerification({
        plan,
        responses: executed.responses,
        requestId: request.requestId,
        index,
        ...(runtime.runVerificationAgent ? { runVerificationAgent: true } : {}),
        ...(runtime.verificationAgent ? { verificationAgent: runtime.verificationAgent } : {}),
        ...(runtime.sandbox ? { sandbox: runtime.sandbox } : {}),
      })
    : emptyVerification();
  const synthesized = synthesizeAnaResult({
    plan,
    responses: executed.responses,
    verification,
    index,
    traces: executed.traces,
  });

  const result: AnaResult = {
    requestId: request.requestId,
    traceId,
    kind: plan.kind,
    status: synthesized.status,
    answer: synthesized.answer,
    plan,
    responses: executed.responses,
    provenance: synthesized.provenance,
    warnings: verification.warnings,
    assumptions: verification.assumptions,
    traces: executed.traces,
  };

  recordSession(request, runtime, provided, result.status);
  recordDebug(request, runtime, result, executed.cost);
  return result;
}
