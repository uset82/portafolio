import type { CcAiErrorCode, CcAiRequest, CcAiSuccessResponse } from "./cc-ai-contract";
import { EMPTY_CC_AI_KNOWLEDGE_CONTEXT, type CcAiKnowledgeContext } from "./cc-ai-knowledge";
import type { CcAiModelPolicy } from "./model-policy";

export type CcAiProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CcAiProviderInput = {
  messages: CcAiProviderMessage[];
  modelPolicy: CcAiModelPolicy;
  maxOutputTokens: number;
  signal: AbortSignal;
};

export type CcAiProviderResult = {
  text: string;
  model: string;
};

export interface CcAiProvider {
  complete(input: CcAiProviderInput): Promise<CcAiProviderResult>;
}

export class CcAiServiceError extends Error {
  readonly code: CcAiErrorCode;
  readonly retryable: boolean;

  constructor(code: CcAiErrorCode, message: string, retryable: boolean) {
    super(message);
    this.name = "CcAiServiceError";
    this.code = code;
    this.retryable = retryable;
  }
}

export class CcAiProviderError extends Error {
  readonly code: Exclude<CcAiErrorCode, "disabled" | "forbidden" | "invalid_request" | "busy">;
  readonly retryable: boolean;

  constructor(
    code: Exclude<CcAiErrorCode, "disabled" | "forbidden" | "invalid_request" | "busy">,
    retryable: boolean,
  ) {
    super(code);
    this.name = "CcAiProviderError";
    this.code = code;
    this.retryable = retryable;
  }
}

export type CcAiServiceOptions = {
  provider: CcAiProvider;
  modelPolicy: CcAiModelPolicy;
  knowledgeContext?: CcAiKnowledgeContext;
  requestId: string;
  requestSignal?: AbortSignal;
  timeoutMs?: number;
  maxOutputTokens?: number;
  maxOutputCharacters?: number;
};

const publicErrorMessages: Record<CcAiServiceError["code"], string> = {
  disabled: "CACM AI is not available yet.",
  forbidden: "This request cannot be accepted from its current origin.",
  invalid_request: "The question could not be read. Please review it and try again.",
  configuration: "CACM AI is temporarily unavailable because its server is not configured.",
  timeout: "CACM AI took too long to respond. Please try again.",
  aborted: "The request was stopped.",
  rate_limited: "CACM AI has reached its current request limit. Please try again later.",
  payment_required: "CACM AI has reached its current usage allowance.",
  provider_unavailable: "The selected model provider is unavailable. Please try again later.",
  busy: "CACM AI is helping other visitors right now. Please try again shortly.",
  invalid_response: "CACM AI returned an unusable response. Please try again.",
};

export const getCcAiPublicErrorMessage = (code: CcAiErrorCode) => publicErrorMessages[code];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* The system prompt asks for `[source-id]` citations so the model stays anchored
 * to approved records, but those markers are provenance plumbing, not prose —
 * and models improvise the delimiters (`[x]`, `【source-id:x】`, `(source: x)`).
 * Only bracketed groups whose contents resolve to real approved source IDs are
 * removed, so ordinary brackets in an answer survive untouched. The response
 * still reports every source separately in `knowledge.sourceIds`. */
export function stripSourceCitations(text: string, sourceIds: readonly string[]) {
  if (sourceIds.length === 0) return text;

  const ids = sourceIds.map(escapeRegExp).join("|");
  const label = `(?:sources?(?:[-_ ]?ids?)?\\s*[:=]?\\s*)?`;
  const list = `${label}(?:${ids})(?:\\s*[,;、]\\s*${label}(?:${ids}))*`;
  const citation = new RegExp(`\\s*[[(【〔]\\s*${list}\\s*[\\])】〕]`, "gi");

  return text
    .replace(citation, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:!?])/g, "$1")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

export async function runCcAiCompletion(
  request: CcAiRequest,
  {
    provider,
    modelPolicy,
    knowledgeContext = EMPTY_CC_AI_KNOWLEDGE_CONTEXT,
    requestId,
    requestSignal,
    timeoutMs = 180_000,
    maxOutputTokens = 4_000,
    maxOutputCharacters = 40_000,
  }: CcAiServiceOptions,
): Promise<CcAiSuccessResponse> {
  if (requestSignal?.aborted) {
    throw new CcAiServiceError("aborted", publicErrorMessages.aborted, false);
  }

  const controller = new AbortController();
  let timedOut = false;
  const stopForRequest = () => controller.abort(requestSignal?.reason);
  requestSignal?.addEventListener("abort", stopForRequest, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException("CACM AI timeout", "TimeoutError"));
  }, timeoutMs);

  try {
    const result = await provider.complete({
      messages: [
        { role: "system", content: knowledgeContext.systemMessage },
        ...request.history,
        { role: "user", content: request.message },
      ],
      modelPolicy,
      maxOutputTokens,
      signal: controller.signal,
    });
    const sourceIds = knowledgeContext.sources.map((source) => source.id);
    /* Models cite whichever identifier is nearest in the context, so record IDs
     * such as `profile-carlos-carpio` appear as often as the source IDs. Both
     * are plumbing and both get stripped from the prose. */
    const citableIds = [...new Set([...sourceIds, ...knowledgeContext.entries.map((e) => e.id)])];
    const text = stripSourceCitations(result.text.trim(), citableIds);

    if (!text || !result.model.trim()) {
      throw new CcAiServiceError("invalid_response", publicErrorMessages.invalid_response, true);
    }

    const truncated = text.length > maxOutputCharacters;

    return {
      ok: true,
      requestId,
      answer: truncated ? text.slice(0, maxOutputCharacters).trimEnd() : text,
      truncated,
      model: {
        requested: modelPolicy.primaryModel,
        fallbacks: modelPolicy.fallbackModels,
        responded: result.model,
        selection: modelPolicy.routingKind,
        variable: modelPolicy.variableSelection,
      },
      knowledge: {
        records: knowledgeContext.entries.length,
        sourceIds,
        truncated: knowledgeContext.truncated,
      },
    };
  } catch (error) {
    if (error instanceof CcAiServiceError) throw error;
    if (timedOut) {
      throw new CcAiServiceError("timeout", publicErrorMessages.timeout, true);
    }
    if (requestSignal?.aborted) {
      throw new CcAiServiceError("aborted", publicErrorMessages.aborted, false);
    }
    if (error instanceof CcAiProviderError) {
      throw new CcAiServiceError(error.code, publicErrorMessages[error.code], error.retryable);
    }

    throw new CcAiServiceError(
      "provider_unavailable",
      publicErrorMessages.provider_unavailable,
      true,
    );
  } finally {
    clearTimeout(timeout);
    requestSignal?.removeEventListener("abort", stopForRequest);
  }
}
