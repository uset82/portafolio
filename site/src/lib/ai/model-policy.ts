export const DEFAULT_CC_AI_PROTOTYPE_MODEL = "openrouter/free";

/* Reasoning tokens are billed against the same completion budget as the answer,
 * so a high effort setting can consume the whole allowance and return
 * `finish_reason: "length"` with empty content. `low` leaves room for prose on
 * every model tried so far; raise it per deployment, not in code. */
export const CC_AI_REASONING_EFFORTS = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;
export const DEFAULT_CC_AI_REASONING_EFFORT: CcAiReasoningEffort = "low";

const MAX_FALLBACK_MODELS = 4;
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;

export type CcAiMode = "prototype" | "production";
export type CcAiRoutingKind = "free-router" | "specific-free-model" | "named-model";
export type CcAiReasoningEffort = (typeof CC_AI_REASONING_EFFORTS)[number];

export type CcAiProviderPolicy = {
  allowFallbacks: true;
  dataCollection: "deny";
  zdr: boolean;
};

export type CcAiModelPolicy = {
  mode: CcAiMode;
  primaryModel: string;
  fallbackModels: string[];
  requestedModels: string[];
  routingKind: CcAiRoutingKind;
  variableSelection: boolean;
  reasoningEffort: CcAiReasoningEffort;
  provider: CcAiProviderPolicy;
};

export type CcAiModelEnvironment = {
  CC_AI_MODE: string | undefined;
  OPENROUTER_MODEL: string | undefined;
  OPENROUTER_FALLBACK_MODELS: string | undefined;
  OPENROUTER_PRODUCTION_MODEL: string | undefined;
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: string | undefined;
  CC_AI_REASONING_EFFORT: string | undefined;
};

export class CcAiModelPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CcAiModelPolicyError";
  }
}

const parseMode = (value: string | undefined): CcAiMode => {
  const mode = value?.trim() || "prototype";
  if (mode === "prototype" || mode === "production") return mode;
  throw new CcAiModelPolicyError("CC_AI_MODE must be prototype or production.");
};

const parseReasoningEffort = (value: string | undefined): CcAiReasoningEffort => {
  const effort = value?.trim().toLowerCase();
  if (!effort) return DEFAULT_CC_AI_REASONING_EFFORT;

  const match = CC_AI_REASONING_EFFORTS.find((candidate) => candidate === effort);
  if (!match) {
    throw new CcAiModelPolicyError(
      `CC_AI_REASONING_EFFORT must be one of ${CC_AI_REASONING_EFFORTS.join(", ")}.`,
    );
  }
  return match;
};

const parseModel = (value: string, variableName: string) => {
  const model = value.trim();
  if (!MODEL_ID_PATTERN.test(model)) {
    throw new CcAiModelPolicyError(`${variableName} contains an invalid model ID.`);
  }
  return model;
};

const parseFallbacks = (value: string | undefined, variableName: string) => {
  if (!value?.trim()) return [];

  const models = value
    .split(",")
    .map((model) => parseModel(model, variableName))
    .filter((model, index, allModels) => allModels.indexOf(model) === index);

  if (models.length > MAX_FALLBACK_MODELS) {
    throw new CcAiModelPolicyError(
      `${variableName} must contain at most ${MAX_FALLBACK_MODELS} unique models.`,
    );
  }

  return models;
};

const isFreeModel = (model: string) => model === "openrouter/free" || model.endsWith(":free");

const getRoutingKind = (model: string): CcAiRoutingKind => {
  if (model === "openrouter/free") return "free-router";
  if (model.endsWith(":free")) return "specific-free-model";
  return "named-model";
};

export function createCcAiModelPolicy(environment: CcAiModelEnvironment): CcAiModelPolicy {
  const mode = parseMode(environment.CC_AI_MODE);
  const primaryVariable =
    mode === "production" ? "OPENROUTER_PRODUCTION_MODEL" : "OPENROUTER_MODEL";
  const fallbackVariable =
    mode === "production" ? "OPENROUTER_PRODUCTION_FALLBACK_MODELS" : "OPENROUTER_FALLBACK_MODELS";
  const configuredPrimary =
    mode === "production"
      ? environment.OPENROUTER_PRODUCTION_MODEL
      : environment.OPENROUTER_MODEL || DEFAULT_CC_AI_PROTOTYPE_MODEL;

  if (!configuredPrimary?.trim()) {
    throw new CcAiModelPolicyError(
      "OPENROUTER_PRODUCTION_MODEL is required when CC_AI_MODE is production.",
    );
  }

  const primaryModel = parseModel(configuredPrimary, primaryVariable);
  const configuredFallbacks =
    mode === "production"
      ? environment.OPENROUTER_PRODUCTION_FALLBACK_MODELS
      : environment.OPENROUTER_FALLBACK_MODELS;
  const fallbackModels = parseFallbacks(configuredFallbacks, fallbackVariable).filter(
    (model) => model !== primaryModel,
  );

  if (mode === "production" && [primaryModel, ...fallbackModels].some(isFreeModel)) {
    throw new CcAiModelPolicyError(
      "Production model policy requires paid named models; free routes belong to prototype mode.",
    );
  }

  /* A named prototype model can be withdrawn by the provider without notice.
   * `stealth/ox-alpha` was: it left OpenRouter's catalogue entirely, so every
   * request 404'd, fell through to the unavailable branch, and found an empty
   * fallback list behind it. The assistant answered nothing until someone
   * noticed and changed an environment variable.
   *
   * So prototype mode keeps the free router as a last resort whenever no
   * fallbacks are configured. A withdrawn model now degrades instead of taking
   * the assistant down, and an operator who does configure fallbacks still gets
   * exactly the chain they asked for.
   *
   * Production is deliberately untouched: it rejects free routes a few lines
   * above, and a paid fleet's fallbacks are a billing decision, not a default. */
  const resolvedFallbacks =
    mode === "prototype" &&
    fallbackModels.length === 0 &&
    primaryModel !== DEFAULT_CC_AI_PROTOTYPE_MODEL
      ? [DEFAULT_CC_AI_PROTOTYPE_MODEL]
      : fallbackModels;

  return {
    mode,
    primaryModel,
    fallbackModels: resolvedFallbacks,
    requestedModels: [primaryModel, ...resolvedFallbacks],
    routingKind: getRoutingKind(primaryModel),
    variableSelection: primaryModel === "openrouter/free",
    reasoningEffort: parseReasoningEffort(environment.CC_AI_REASONING_EFFORT),
    provider: {
      allowFallbacks: true,
      // Never let a provider retain prompts for training, in either mode.
      dataCollection: "deny",
      /* Zero data retention is required of the paid production fleet. Requiring
       * it of the free prototype router matches zero endpoints much of the time
       * ("No endpoints found matching your data policy"), so prototype keeps the
       * no-training guarantee without the stricter retention filter. The panel's
       * privacy note already tells visitors their question is processed under
       * the selected provider's terms. */
      zdr: mode === "production",
    },
  };
}
