export const DEFAULT_CC_AI_PROTOTYPE_MODEL = "openrouter/free";

const MAX_FALLBACK_MODELS = 4;
const MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/;

export type CcAiMode = "prototype" | "production";
export type CcAiRoutingKind = "free-router" | "specific-free-model" | "named-model";

export type CcAiProviderPolicy = {
  allowFallbacks: true;
  dataCollection: "deny";
  zdr: true;
};

export type CcAiModelPolicy = {
  mode: CcAiMode;
  primaryModel: string;
  fallbackModels: string[];
  requestedModels: string[];
  routingKind: CcAiRoutingKind;
  variableSelection: boolean;
  provider: CcAiProviderPolicy;
};

export type CcAiModelEnvironment = {
  CC_AI_MODE: string | undefined;
  OPENROUTER_MODEL: string | undefined;
  OPENROUTER_FALLBACK_MODELS: string | undefined;
  OPENROUTER_PRODUCTION_MODEL: string | undefined;
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: string | undefined;
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

  return {
    mode,
    primaryModel,
    fallbackModels,
    requestedModels: [primaryModel, ...fallbackModels],
    routingKind: getRoutingKind(primaryModel),
    variableSelection: primaryModel === "openrouter/free",
    provider: {
      allowFallbacks: true,
      dataCollection: "deny",
      zdr: true,
    },
  };
}
