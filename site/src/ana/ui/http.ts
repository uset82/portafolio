import { parseAnaRequest, runAna, type AnaResult, type AnaRuntime } from "../core";
import { getAnaDebugStore, isAnaDebugEnabled } from "../debug";
import { VISITOR_PERMISSIONS } from "../security";
import { encodeSseEvent, type AnaStatusEvent } from "../../lib/ai/ana-status";
import type { CcAiAbuseGuard } from "../../lib/ai/cc-ai-abuse-control";
import { CcAiAbuseError } from "../../lib/ai/cc-ai-abuse-control";

export type AnaPostHandlerOptions = {
  enabled: boolean;
  runtime: Omit<AnaRuntime, "debugStore" | "onStatus">;
  createRequestId?: () => string;
  abuseGuard?: CcAiAbuseGuard;
};

const jsonResponse = (body: unknown, status: number, extraHeaders?: HeadersInit) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extraHeaders },
  });

const publicAnaFields = (result: AnaResult) => ({
  requestId: result.requestId,
  traceId: result.traceId,
  answer: result.answer,
  status: result.status,
  active: [...new Set(result.plan.steps.map((step) => step.agentId))],
});

const wantsSse = (request: Request) =>
  request.headers.get("accept")?.toLowerCase().includes("text/event-stream") === true;

export function createAnaPostHandler({
  enabled,
  runtime,
  createRequestId = () => crypto.randomUUID(),
  abuseGuard,
}: AnaPostHandlerOptions) {
  return async function handleAnaPost(request: Request) {
    const fallbackId = createRequestId();
    if (!enabled) {
      return jsonResponse(
        {
          ok: false,
          requestId: fallbackId,
          error: {
            code: "disabled",
            message: "ANA orchestrator is disabled.",
            retryable: false,
          },
        },
        503,
      );
    }

    let lease: { responseHeaders: HeadersInit; release(): void } | undefined;
    if (abuseGuard) {
      try {
        lease = abuseGuard.acquire(request);
      } catch (error) {
        if (error instanceof CcAiAbuseError) {
          return jsonResponse(
            {
              ok: false,
              requestId: fallbackId,
              error: {
                code: error.code,
                message: error.message,
                retryable: error.retryable,
              },
            },
            error.code === "forbidden" ? 403 : error.code === "busy" ? 503 : 429,
          );
        }
        throw error;
      }
    }

    const respond = (body: unknown, status: number) =>
      jsonResponse(body, status, lease?.responseHeaders);

    let streamOwnsLease = false;
    try {
      if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
        return respond(
          {
            ok: false,
            requestId: fallbackId,
            error: { code: "invalid_request", message: "Expected JSON.", retryable: false },
          },
          415,
        );
      }

      let payload: unknown;
      try {
        payload = JSON.parse(await request.text()) as unknown;
      } catch {
        return respond(
          {
            ok: false,
            requestId: fallbackId,
            error: { code: "invalid_request", message: "Invalid JSON.", retryable: false },
          },
          400,
        );
      }

      const record =
        payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
      const parsed = (() => {
        try {
          return parseAnaRequest({
            requestId:
              typeof record.requestId === "string" && record.requestId.trim()
                ? record.requestId
                : fallbackId,
            message: record.message,
          });
        } catch {
          return undefined;
        }
      })();

      if (!parsed) {
        return respond(
          {
            ok: false,
            requestId: fallbackId,
            error: { code: "invalid_request", message: "Invalid ANA request.", retryable: false },
          },
          400,
        );
      }

      const runOptions: AnaRuntime = {
        ...runtime,
        grantedPermissions: runtime.grantedPermissions ?? VISITOR_PERMISSIONS,
        ...(isAnaDebugEnabled() ? { debugStore: getAnaDebugStore() } : {}),
        ...(request.signal ? { signal: request.signal } : {}),
      };

      if (!wantsSse(request)) {
        const result = await runAna(parsed, runOptions);
        return respond({ ok: true, ...publicAnaFields(result) }, 200);
      }

      streamOwnsLease = true;
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (event: unknown) => {
            controller.enqueue(encoder.encode(encodeSseEvent(event)));
          };
          try {
            const result = await runAna(parsed, {
              ...runOptions,
              onStatus: (event: AnaStatusEvent) => send(event),
            });
            send({ type: "complete", ok: true, ...publicAnaFields(result) });
          } catch {
            send({
              type: "error",
              ok: false,
              requestId: parsed.requestId,
              error: {
                code: "provider_unavailable",
                message: "ANA could not complete that request.",
                retryable: true,
              },
            });
          } finally {
            controller.close();
            lease?.release();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store",
          Connection: "keep-alive",
          ...lease?.responseHeaders,
        },
      });
    } finally {
      if (!streamOwnsLease) lease?.release();
    }
  };
}
