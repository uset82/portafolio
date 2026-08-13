import {
  invokeRepoAgent,
  parseAgentResponse,
  resultMatchesManifestOutputs,
  type RepoAgent,
} from "../protocol/agent";
import type { AgentResponse } from "../protocol/schemas";
import type { AnaSandbox } from "../sandbox";
import type { SpecialistIndex } from "./router";
import type { AnaPlan } from "./schemas";
import {
  ANA_VERIFICATION_AGENT_ID,
  ANA_VERIFICATION_CAPABILITY,
  createAnaVerificationAgent,
} from "./verification-agent";

export const ANA_LOW_CONFIDENCE_THRESHOLD = 0.7;

export const ANA_VERIFICATION_CODES = [
  "unanswered-capability",
  "invalid-output",
  "execution-failure",
  "undeclared-assumptions",
  "contradiction",
  "low-confidence",
] as const;

export type AnaVerificationCode = (typeof ANA_VERIFICATION_CODES)[number];

export type AnaVerificationFinding = {
  code: AnaVerificationCode;
  message: string;
  agentId?: string;
  capability?: string;
};

export type AnaVerification = {
  warnings: string[];
  assumptions: string[];
  contradictions: string[];
  failedAgentIds: string[];
  invalidAgentIds: string[];
  unansweredAgentIds: string[];
  lowConfidenceAgentIds: string[];
  findings: AnaVerificationFinding[];
  verifierAgentId?: string;
  verifierSummary?: string;
};

export type VerifyResponsesOptions = {
  index?: SpecialistIndex;
};

export type CompleteVerificationOptions = VerifyResponsesOptions & {
  plan: AnaPlan;
  responses: readonly AgentResponse[];
  requestId: string;
  runVerificationAgent?: boolean;
  verificationAgent?: RepoAgent;
  sandbox?: AnaSandbox;
};

const unique = (values: readonly string[]) => [
  ...new Set(values.filter((value) => value.length > 0)),
];

const finding = (
  code: AnaVerificationCode,
  message: string,
  extra?: { agentId?: string; capability?: string },
): AnaVerificationFinding => {
  const item: AnaVerificationFinding = { code, message };
  if (extra?.agentId) item.agentId = extra.agentId;
  if (extra?.capability) item.capability = extra.capability;
  return item;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isErrorOnlyPayload = (result: unknown): boolean => {
  if (result == null) return true;
  if (!isRecord(result)) return false;
  const keys = Object.keys(result);
  return keys.length === 1 && keys[0] === "error";
};

const requestedCapability = (plan: AnaPlan, agentId: string): string | undefined =>
  plan.steps.find((step) => step.agentId === agentId)?.capability;

const pushId = (ids: string[], agentId: string) => {
  if (!ids.includes(agentId)) ids.push(agentId);
};

const envelopeOf = (response: AgentResponse): AgentResponse | undefined => {
  try {
    return parseAgentResponse(response);
  } catch {
    return undefined;
  }
};

export const verifyResponses = (
  plan: AnaPlan,
  responses: readonly AgentResponse[],
  options: VerifyResponsesOptions = {},
): AnaVerification => {
  const findings: AnaVerificationFinding[] = [];
  const invalidAgentIds: string[] = [];
  const unansweredAgentIds: string[] = [];
  const lowConfidenceAgentIds: string[] = [];
  const failedAgentIds: string[] = [];

  const warnings = unique(responses.flatMap((response) => response.warnings ?? []));
  const assumptions = unique(responses.flatMap((response) => response.assumptions ?? []));

  for (const step of plan.steps) {
    if (responses.some((response) => response.agentId === step.agentId)) continue;
    pushId(unansweredAgentIds, step.agentId);
    findings.push(
      finding(
        "unanswered-capability",
        `${step.agentId} did not return a result for ${step.capability}.`,
        { agentId: step.agentId, capability: step.capability },
      ),
    );
  }

  for (const response of responses) {
    const capability = requestedCapability(plan, response.agentId);
    const extra = {
      agentId: response.agentId,
      ...(capability ? { capability } : {}),
    };

    if (!envelopeOf(response)) {
      pushId(invalidAgentIds, response.agentId);
      findings.push(
        finding("invalid-output", `${response.agentId} returned an invalid agent response.`, extra),
      );
      continue;
    }

    if (response.status === "failed") {
      pushId(failedAgentIds, response.agentId);
      findings.push(
        finding(
          "execution-failure",
          capability
            ? `${response.agentId} failed to execute ${capability}.`
            : `${response.agentId} failed to execute.`,
          extra,
        ),
      );
      continue;
    }

    const agent = options.index?.getById(response.agentId);
    if (agent && !resultMatchesManifestOutputs(agent.manifest(), response.result)) {
      pushId(invalidAgentIds, response.agentId);
      findings.push(
        finding(
          "invalid-output",
          `${response.agentId} returned output that does not match its declared schema.`,
          extra,
        ),
      );
    }

    if (capability) {
      const claimed =
        isRecord(response.result) && typeof response.result.capability === "string"
          ? response.result.capability
          : undefined;
      if (claimed && claimed !== capability) {
        pushId(unansweredAgentIds, response.agentId);
        findings.push(
          finding(
            "unanswered-capability",
            `${response.agentId} did not answer the requested capability ${capability}.`,
            extra,
          ),
        );
      } else if (isErrorOnlyPayload(response.result)) {
        pushId(unansweredAgentIds, response.agentId);
        findings.push(
          finding(
            "unanswered-capability",
            `${response.agentId} did not answer ${capability}.`,
            extra,
          ),
        );
      }
    }

    if (response.status === "partial" && (response.assumptions?.length ?? 0) === 0) {
      findings.push(
        finding(
          "undeclared-assumptions",
          `${response.agentId} returned a partial result without declared assumptions.`,
          extra,
        ),
      );
    }

    if (response.confidence !== undefined && response.confidence < ANA_LOW_CONFIDENCE_THRESHOLD) {
      pushId(lowConfidenceAgentIds, response.agentId);
      findings.push(
        finding(
          "low-confidence",
          capability
            ? `${response.agentId} reported low confidence for ${capability}.`
            : `${response.agentId} reported low confidence.`,
          extra,
        ),
      );
    }
  }

  const byCapability = new Map<string, string[]>();
  for (const step of plan.steps) {
    const response = responses.find((entry) => entry.agentId === step.agentId);
    if (!response || response.status !== "success") continue;
    if (
      invalidAgentIds.includes(response.agentId) ||
      unansweredAgentIds.includes(response.agentId)
    ) {
      continue;
    }
    const summaries = byCapability.get(step.capability) ?? [];
    summaries.push(response.summary);
    byCapability.set(step.capability, summaries);
  }
  const contradictions: string[] = [];
  for (const [capability, summaries] of byCapability) {
    if (new Set(summaries).size > 1) {
      const message = `Specialists disagreed on ${capability}.`;
      contradictions.push(message);
      findings.push(finding("contradiction", message, { capability }));
    }
  }

  return {
    warnings: unique([...warnings, ...findings.map((item) => item.message)]),
    assumptions,
    contradictions,
    failedAgentIds,
    invalidAgentIds,
    unansweredAgentIds,
    lowConfidenceAgentIds,
    findings,
  };
};

const reviewInput = (verification: AnaVerification) => ({
  findings: verification.findings.map((item) => {
    const row: { code: string; agentId?: string; capability?: string } = { code: item.code };
    if (item.agentId) row.agentId = item.agentId;
    if (item.capability) row.capability = item.capability;
    return row;
  }),
  failedAgentIds: [...verification.failedAgentIds],
  contradictionCount: verification.contradictions.length,
});

export const applyOptionalVerificationAgent = async (options: {
  verification: AnaVerification;
  agent: RepoAgent;
  requestId: string;
  sandbox?: AnaSandbox;
}): Promise<AnaVerification> => {
  const manifest = options.agent.manifest();
  if (!manifest.capabilities.includes(ANA_VERIFICATION_CAPABILITY)) {
    return options.verification;
  }

  const request = {
    requestId: `${options.requestId}:${ANA_VERIFICATION_AGENT_ID}`,
    capability: ANA_VERIFICATION_CAPABILITY,
    input: reviewInput(options.verification),
  };

  try {
    const response = options.sandbox
      ? await options.sandbox.runAgent({ agent: options.agent, request })
      : await invokeRepoAgent(options.agent, request);
    if (response.status === "failed") {
      return {
        ...options.verification,
        warnings: unique([
          ...options.verification.warnings,
          "Optional verification agent did not complete.",
        ]),
      };
    }
    const next: AnaVerification = {
      ...options.verification,
      warnings: unique([...options.verification.warnings, response.summary]),
      verifierAgentId: manifest.id,
      verifierSummary: response.summary,
    };
    return next;
  } catch {
    return {
      ...options.verification,
      warnings: unique([
        ...options.verification.warnings,
        "Optional verification agent did not complete.",
      ]),
    };
  }
};

export const emptyVerification = (): AnaVerification => ({
  warnings: [],
  assumptions: [],
  contradictions: [],
  failedAgentIds: [],
  invalidAgentIds: [],
  unansweredAgentIds: [],
  lowConfidenceAgentIds: [],
  findings: [],
});

export const completeVerification = async (
  options: CompleteVerificationOptions,
): Promise<AnaVerification> => {
  const verification = verifyResponses(options.plan, options.responses, {
    ...(options.index ? { index: options.index } : {}),
  });
  if (!options.runVerificationAgent && !options.verificationAgent) return verification;
  return applyOptionalVerificationAgent({
    verification,
    agent: options.verificationAgent ?? createAnaVerificationAgent(),
    requestId: options.requestId,
    ...(options.sandbox ? { sandbox: options.sandbox } : {}),
  });
};
