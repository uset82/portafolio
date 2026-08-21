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
  /* Ox Alpha cannot disable thinking. The free preview is requested at max
   * effort; the 180 s prototype budget is what lets that finish. The SDK
   * outbound schema drops `exclude`, so only `effort` is sent. */
  reasoning: { effort: "max" as const },
  maxCompletionTokens: maxOutputTokens,
  stream: false as const,
});
