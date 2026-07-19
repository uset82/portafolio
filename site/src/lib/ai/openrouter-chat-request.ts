import type { CcAiProviderInput } from "./cc-ai-service";

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
  maxCompletionTokens: maxOutputTokens,
  stream: false as const,
});
