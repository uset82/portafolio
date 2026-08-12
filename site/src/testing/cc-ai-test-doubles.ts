import type { CcAiErrorCode, CcAiRequest } from "@/lib/ai/cc-ai-contract";
import { createCcAiPostHandler } from "@/lib/ai/cc-ai-handler";
import {
  CcAiProviderError,
  type CcAiProvider,
  type CcAiProviderInput,
} from "@/lib/ai/cc-ai-service";
import { createCcAiModelPolicy } from "@/lib/ai/model-policy";

export const CC_AI_TEST_REQUEST_ID = "00000000-0000-4000-8000-000000000034";
export const CC_AI_TEST_MODEL = "test/deterministic-model";

type ProviderErrorCode = Exclude<
  CcAiErrorCode,
  "disabled" | "forbidden" | "invalid_request" | "busy"
>;

export type CcAiProviderDoubleReply =
  | { kind: "success"; text: string; model?: string }
  | { kind: "error"; code: ProviderErrorCode; retryable: boolean };

export type CcAiProviderDoubleCall = {
  messages: CcAiProviderInput["messages"];
  requestedModels: readonly string[];
  maxOutputTokens: number;
  signalAborted: boolean;
};

const defaultReply: CcAiProviderDoubleReply = {
  kind: "success",
  text: "Deterministic CACM AI test response.",
  model: CC_AI_TEST_MODEL,
};

export function createCcAiProviderDouble(
  replies: readonly CcAiProviderDoubleReply[] = [defaultReply],
) {
  if (replies.length === 0) throw new Error("The CACM AI provider double needs one reply.");
  const calls: CcAiProviderDoubleCall[] = [];
  let replyIndex = 0;

  const provider: CcAiProvider = {
    async complete(input) {
      calls.push({
        messages: input.messages.map((message) => ({ ...message })),
        requestedModels: [...input.modelPolicy.requestedModels],
        maxOutputTokens: input.maxOutputTokens,
        signalAborted: input.signal.aborted,
      });

      if (input.signal.aborted) {
        throw new CcAiProviderError("aborted", false);
      }

      const reply = replies[Math.min(replyIndex, replies.length - 1)]!;
      replyIndex += 1;
      if (reply.kind === "error") {
        throw new CcAiProviderError(reply.code, reply.retryable);
      }
      return { text: reply.text, model: reply.model ?? CC_AI_TEST_MODEL };
    },
  };

  return { provider, calls };
}

const testModelPolicy = createCcAiModelPolicy({
  CC_AI_MODE: "prototype",
  OPENROUTER_MODEL: CC_AI_TEST_MODEL,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
});

export type CcAiRouteDoubleOptions = {
  enabled?: boolean;
  replies?: readonly CcAiProviderDoubleReply[];
  requestId?: string;
};

export function createCcAiRouteDouble({
  enabled = true,
  replies,
  requestId = CC_AI_TEST_REQUEST_ID,
}: CcAiRouteDoubleOptions = {}) {
  const providerDouble = createCcAiProviderDouble(replies);
  const handle = createCcAiPostHandler({
    enabled,
    serviceOptions: { provider: providerDouble.provider, modelPolicy: testModelPolicy },
    createRequestId: () => requestId,
  });

  const createRequest = (request: Partial<CcAiRequest> = {}) =>
    new Request("http://localhost/api/cc-ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: request.message ?? "What is the Observatory?",
        history: request.history ?? [],
        locale: request.locale ?? "en",
      }),
    });

  const createFulfillResponse = async (request: Partial<CcAiRequest> = {}) => {
    const response = await handle(createRequest(request));
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.text(),
    };
  };

  return {
    handle,
    createRequest,
    createFulfillResponse,
    provider: providerDouble.provider,
    calls: providerDouble.calls,
  };
}
