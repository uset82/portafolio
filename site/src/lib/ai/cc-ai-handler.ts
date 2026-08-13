import { isAskPortfolioQuestion } from "@/ana/core/intent";
import { formatPortfolioNavigation, searchPortfolioKnowledge } from "@/ana/knowledge";
import type { RepositoryAudit } from "@/ana/repositories/schemas";

import { ccAiRequestSchema, type CcAiErrorResponse, type CcAiResponse } from "./cc-ai-contract";
import { CcAiAbuseError, type CcAiAbuseGuard } from "./cc-ai-abuse-control";
import {
  CcAiServiceError,
  getCcAiPublicErrorMessage,
  type CcAiServiceOptions,
  runCcAiCompletion,
} from "./cc-ai-service";

type CcAiHandlerOptions = {
  enabled: boolean;
  serviceOptions: Omit<CcAiServiceOptions, "requestId" | "requestSignal">;
  abuseGuard?: CcAiAbuseGuard;
  createRequestId?: () => string;
  portfolioAudits?: readonly RepositoryAudit[];
};

const jsonResponse = (body: CcAiResponse, status: number, extraHeaders?: HeadersInit) => {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  headers.set("Vary", "Origin, Sec-Fetch-Site");
  return Response.json(body, {
    status,
    headers,
  });
};

const errorStatus: Record<CcAiServiceError["code"], number> = {
  disabled: 503,
  forbidden: 403,
  invalid_request: 400,
  configuration: 503,
  timeout: 504,
  aborted: 499,
  rate_limited: 429,
  payment_required: 503,
  provider_unavailable: 503,
  busy: 503,
  invalid_response: 502,
};

const createError = (
  requestId: string,
  code: CcAiServiceError["code"],
  retryable: boolean,
): CcAiErrorResponse => ({
  ok: false,
  requestId,
  error: { code, message: getCcAiPublicErrorMessage(code), retryable },
});

export function createCcAiPostHandler({
  enabled,
  serviceOptions,
  abuseGuard,
  createRequestId = () => crypto.randomUUID(),
  portfolioAudits = [],
}: CcAiHandlerOptions) {
  return async function handleCcAiPost(request: Request) {
    const requestId = createRequestId();

    if (!enabled) return jsonResponse(createError(requestId, "disabled", false), 503);

    let lease;
    try {
      lease = abuseGuard?.acquire(request);
    } catch (error) {
      if (!(error instanceof CcAiAbuseError)) {
        return jsonResponse(createError(requestId, "busy", true), errorStatus.busy, {
          "Retry-After": "1",
        });
      }
      return jsonResponse(
        createError(requestId, error.code, error.retryable),
        errorStatus[error.code],
        {
          ...(error.retryAfterSeconds ? { "Retry-After": String(error.retryAfterSeconds) } : {}),
        },
      );
    }

    const respond = (body: CcAiResponse, status: number) =>
      jsonResponse(body, status, lease?.responseHeaders);

    try {
      if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
        return respond(createError(requestId, "invalid_request", false), 415);
      }

      const contentLength = Number(request.headers.get("content-length") ?? 0);
      if (Number.isFinite(contentLength) && contentLength > 16_384) {
        return respond(createError(requestId, "invalid_request", false), 413);
      }

      let input: unknown;
      try {
        const body = await request.text();
        if (body.length > 16_384) {
          return respond(createError(requestId, "invalid_request", false), 413);
        }
        input = JSON.parse(body);
      } catch {
        return respond(createError(requestId, "invalid_request", false), 400);
      }

      const parsed = ccAiRequestSchema.safeParse(input);
      if (!parsed.success) {
        return respond(createError(requestId, "invalid_request", false), 400);
      }

      if (portfolioAudits.length > 0 && isAskPortfolioQuestion(parsed.data.message)) {
        const hits = searchPortfolioKnowledge(parsed.data.message, portfolioAudits);
        const navigated = formatPortfolioNavigation({
          query: parsed.data.message,
          hits,
        });
        return respond(
          {
            ok: true,
            requestId,
            answer: navigated.answer,
            truncated: false,
            model: {
              requested: serviceOptions.modelPolicy.primaryModel,
              fallbacks: serviceOptions.modelPolicy.fallbackModels,
              responded: "ana-knowledge",
              selection: serviceOptions.modelPolicy.routingKind,
              variable: serviceOptions.modelPolicy.variableSelection,
            },
            knowledge: {
              records: hits.length,
              sourceIds: hits.map((hit) => hit.repository),
              truncated: false,
            },
          },
          200,
        );
      }

      try {
        const response = await runCcAiCompletion(parsed.data, {
          ...serviceOptions,
          requestId,
          requestSignal: request.signal,
        });
        return respond(response, 200);
      } catch (error) {
        const normalized =
          error instanceof CcAiServiceError
            ? error
            : new CcAiServiceError(
                "provider_unavailable",
                getCcAiPublicErrorMessage("provider_unavailable"),
                true,
              );

        return respond(
          createError(requestId, normalized.code, normalized.retryable),
          errorStatus[normalized.code],
        );
      }
    } finally {
      lease?.release();
    }
  };
}
