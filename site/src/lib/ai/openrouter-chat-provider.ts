import "server-only";

import { createOpenRouterClient } from "./openrouter-client";
import { CcAiProviderError, type CcAiProvider, type CcAiProviderResult } from "./cc-ai-service";
import { buildOpenRouterChatRequest } from "./openrouter-chat-request";
import { OpenRouterConfigurationError, type OpenRouterEnvironment } from "./openrouter-boundary";

const getStatusCode = (error: unknown) => {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
};

/* Every provider failure used to reach the visitor as one opaque sentence with
 * nothing written server-side, so a retired model slug and a revoked API key
 * were indistinguishable from the outside. Log the cause, never the credential
 * or the visitor's question. */
const logProviderFailure = (code: CcAiProviderError["code"], detail: Record<string, unknown>) => {
  console.error("[cc-ai] provider failure", { code, ...detail });
};

const describeError = (error: unknown) => ({
  name: error instanceof Error ? error.name : typeof error,
  statusCode: getStatusCode(error),
  message: error instanceof Error ? error.message.slice(0, 500) : undefined,
});

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

        if (!("choices" in response)) {
          logProviderFailure("invalid_response", { reason: "response carried no choices" });
          throw new CcAiProviderError("invalid_response", true);
        }

        const choice = response.choices[0];
        const content = choice?.message.content;

        if (typeof content !== "string" || content.trim() === "") {
          /* `length` here means the model spent the whole completion budget on
           * reasoning tokens and never started the answer, so the logged effort
           * and token budget are the two dials that resolve it. */
          logProviderFailure("invalid_response", {
            reason:
              choice?.finishReason === "length"
                ? "completion budget exhausted before any answer text"
                : "message content was not usable text",
            finishReason: choice?.finishReason ?? null,
            model: response.model,
            maxOutputTokens: input.maxOutputTokens,
            reasoningEffort: input.modelPolicy.reasoningEffort,
          });
          throw new CcAiProviderError("invalid_response", true);
        }

        return { text: content, model: response.model };
      } catch (error) {
        if (error instanceof CcAiProviderError) throw error;

        const normalized = normalizeProviderError(error);
        logProviderFailure(normalized.code, {
          ...describeError(error),
          requestedModels: input.modelPolicy.requestedModels,
        });
        throw normalized;
      }
    },
  };
}
