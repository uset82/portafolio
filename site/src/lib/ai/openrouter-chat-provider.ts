import "server-only";

import { createOpenRouterClient } from "./openrouter-client";
import { CcAiProviderError, type CcAiProvider, type CcAiProviderResult } from "./cc-ai-service";
import { buildOpenRouterChatRequest } from "./openrouter-chat-request";
import { OpenRouterConfigurationError, type OpenRouterEnvironment } from "./openrouter-boundary";

const getStatusCode = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
};

const normalizeProviderError = (error: unknown): CcAiProviderError => {
  if (error instanceof OpenRouterConfigurationError) {
    return new CcAiProviderError("configuration", false);
  }

  const statusCode = getStatusCode(error);
  if (statusCode === 402) return new CcAiProviderError("payment_required", false);
  if (statusCode === 429) return new CcAiProviderError("rate_limited", true);
  if (statusCode === 401 || statusCode === 403) {
    return new CcAiProviderError("configuration", false);
  }

  const errorName = error instanceof Error ? error.name : "";
  if (errorName === "RequestAbortedError") return new CcAiProviderError("aborted", false);
  if (errorName === "RequestTimeoutError") return new CcAiProviderError("timeout", true);

  return new CcAiProviderError("provider_unavailable", true);
};

export function createOpenRouterChatProvider(environment?: OpenRouterEnvironment): CcAiProvider {
  return {
    async complete(input): Promise<CcAiProviderResult> {
      try {
        const client = createOpenRouterClient(environment);
        const response = await client.chat.send(
          {
            chatRequest: buildOpenRouterChatRequest(input),
          },
          { signal: input.signal },
        );

        if (!("choices" in response)) throw new CcAiProviderError("invalid_response", true);
        const content = response.choices[0]?.message.content;

        if (typeof content !== "string") {
          throw new CcAiProviderError("invalid_response", true);
        }

        return { text: content, model: response.model };
      } catch (error) {
        if (error instanceof CcAiProviderError) throw error;
        throw normalizeProviderError(error);
      }
    },
  };
}
