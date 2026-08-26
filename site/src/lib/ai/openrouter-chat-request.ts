import type { CcAiMode } from "./model-policy";
import type { CcAiProviderInput } from "./cc-ai-service";

export const CC_AI_MAX_TIMEOUT_MS = 180_000;
export const CC_AI_PROTOTYPE_TIMEOUT_MS = 180_000;
export const CC_AI_PRODUCTION_TIMEOUT_MS = 12_000;

export function resolveCcAiTimeoutMs(mode: CcAiMode, configured: string | undefined): number {
  const fallback = mode === "production" ? CC_AI_PRODUCTION_TIMEOUT_MS : CC_AI_PROTOTYPE_TIMEOUT_MS;
  const parsed = Number.parseInt(configured ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, CC_AI_MAX_TIMEOUT_MS) : fallback;
}

export const buildOpenRouterChatRequest = ({
  messages,
  modelPolicy,
  maxOutputTokens,
}: Omit<CcAiProviderInput, "signal">) => ({
  messages,
  ...(modelPolicy.fallbackModels.length > 0
    ? { models: [...modelPolicy.requestedModels] }
    : { model: modelPolicy.primaryModel }),
  provider: { ...modelPolicy.provider },
  /* Effort is policy, not a constant: reasoning tokens are drawn from
   * `maxCompletionTokens`, so pinning every model to max effort spent the whole
   * budget on thinking and returned `finish_reason: "length"` with no content.
   * The SDK outbound schema drops `exclude`, so only `effort` is sent. */
  reasoning: { effort: modelPolicy.reasoningEffort },
  maxCompletionTokens: maxOutputTokens,
  stream: false as const,
});
