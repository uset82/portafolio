import {
  isAnaStreamCompleteEvent,
  isAnaStreamErrorEvent,
  isAnaStatusEvent,
  splitSseBuffer,
  type AnaStatusEvent,
} from "./ana-status";

export type AnaChatSuccess = {
  ok: true;
  requestId: string;
  traceId: string;
  answer: string;
  status: string;
  active: string[];
};

export type AnaChatError = {
  ok: false;
  requestId: string;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type AnaChatResponse = AnaChatSuccess | AnaChatError;

export type AnaChatRequest = {
  message: string;
  requestId?: string;
};

export type AnaStatusHandler = (event: AnaStatusEvent) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isAnaChatResponse = (value: unknown): value is AnaChatResponse => {
  if (!isRecord(value) || typeof value.ok !== "boolean" || typeof value.requestId !== "string") {
    return false;
  }
  if (value.ok) {
    return (
      typeof value.traceId === "string" &&
      typeof value.answer === "string" &&
      value.answer.trim().length > 0 &&
      typeof value.status === "string" &&
      Array.isArray(value.active) &&
      value.active.every((item) => typeof item === "string")
    );
  }
  return (
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    typeof value.error.message === "string" &&
    typeof value.error.retryable === "boolean"
  );
};

const anaBody = (request: AnaChatRequest): Record<string, string> => {
  const body: Record<string, string> = { message: request.message };
  if (request.requestId) body.requestId = request.requestId;
  return body;
};

type FetchAna = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, "json">>;

export async function requestAna(
  request: AnaChatRequest,
  signal: AbortSignal,
  fetchAna: FetchAna = fetch,
): Promise<AnaChatResponse> {
  const response = await fetchAna("/api/ana", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(anaBody(request)),
    cache: "no-store",
    signal,
  });
  const payload: unknown = await response.json();
  if (!isAnaChatResponse(payload)) {
    throw new Error("ANA returned an invalid response.");
  }
  return payload;
}

type FetchAnaStream = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Pick<Response, "json" | "body" | "headers">>;

const readAnaSse = async (
  stream: ReadableStream<Uint8Array>,
  onStatus: AnaStatusHandler | undefined,
  signal: AbortSignal,
): Promise<AnaChatResponse> => {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let complete: AnaChatResponse | undefined;
  const abort = () => {
    void reader.cancel();
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    while (!complete) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value ?? new Uint8Array(), { stream: !done });
      const { frames, rest } = splitSseBuffer(buffer, done);
      buffer = rest;
      for (const frame of frames) {
        if (isAnaStatusEvent(frame)) {
          onStatus?.(frame);
          continue;
        }
        if (isAnaStreamCompleteEvent(frame)) {
          complete = {
            ok: true,
            requestId: frame.requestId,
            traceId: frame.traceId,
            answer: frame.answer,
            status: frame.status,
            active: frame.active,
          };
          break;
        }
        if (isAnaStreamErrorEvent(frame)) {
          complete = {
            ok: false,
            requestId: frame.requestId,
            error: frame.error,
          };
          break;
        }
      }
      if (done) break;
    }
  } finally {
    signal.removeEventListener("abort", abort);
    reader.releaseLock();
  }
  if (!complete) {
    throw new Error("ANA returned an invalid response.");
  }
  return complete;
};

export async function requestAnaStream(
  request: AnaChatRequest,
  signal: AbortSignal,
  onStatus?: AnaStatusHandler,
  fetchAna: FetchAnaStream = fetch,
): Promise<AnaChatResponse> {
  const response = await fetchAna("/api/ana", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "text/event-stream",
    },
    body: JSON.stringify(anaBody(request)),
    cache: "no-store",
    signal,
  });
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("text/event-stream")) {
    if (!response.body) {
      throw new Error("ANA returned an invalid response.");
    }
    return readAnaSse(response.body, onStatus, signal);
  }
  const payload: unknown = await response.json();
  if (!isAnaChatResponse(payload)) {
    throw new Error("ANA returned an invalid response.");
  }
  return payload;
}
