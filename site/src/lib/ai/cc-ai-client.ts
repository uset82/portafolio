import type { CcAiRequest, CcAiResponse } from "./cc-ai-contract";

type FetchCcAi = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, "json">>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const modelSelections = new Set(["free-router", "specific-free-model", "named-model"]);
const errorCodes = new Set([
  "disabled",
  "forbidden",
  "invalid_request",
  "configuration",
  "timeout",
  "aborted",
  "rate_limited",
  "payment_required",
  "provider_unavailable",
  "busy",
  "invalid_response",
]);

export function isCcAiResponse(value: unknown): value is CcAiResponse {
  if (!isRecord(value) || typeof value.ok !== "boolean" || typeof value.requestId !== "string") {
    return false;
  }

  if (value.ok) {
    return (
      typeof value.answer === "string" &&
      value.answer.trim().length > 0 &&
      typeof value.truncated === "boolean" &&
      isRecord(value.model) &&
      typeof value.model.requested === "string" &&
      isStringArray(value.model.fallbacks) &&
      typeof value.model.responded === "string" &&
      typeof value.model.selection === "string" &&
      modelSelections.has(value.model.selection) &&
      typeof value.model.variable === "boolean" &&
      isRecord(value.knowledge) &&
      typeof value.knowledge.records === "number" &&
      Number.isInteger(value.knowledge.records) &&
      value.knowledge.records >= 0 &&
      isStringArray(value.knowledge.sourceIds) &&
      typeof value.knowledge.truncated === "boolean"
    );
  }

  return (
    isRecord(value.error) &&
    typeof value.error.code === "string" &&
    errorCodes.has(value.error.code) &&
    typeof value.error.message === "string" &&
    typeof value.error.retryable === "boolean"
  );
}

export async function requestCcAi(
  request: CcAiRequest,
  signal: AbortSignal,
  fetchCcAi: FetchCcAi = fetch,
): Promise<CcAiResponse> {
  const customKey =
    typeof window !== "undefined"
      ? window.sessionStorage?.getItem("cacm_ai_user_key") ||
        window.localStorage?.getItem("cacm_ai_user_key")
      : null;

  const headers: Record<string, string> = { "content-type": "application/json" };
  if (customKey) {
    headers["x-openrouter-key"] = customKey.trim();
  }

  const response = await fetchCcAi("/api/cc-ai", {
    method: "POST",
    headers,
    body: JSON.stringify(request),
    cache: "no-store",
    signal,
  });
  const body: unknown = await response.json();

  if (!isCcAiResponse(body)) {
    throw new Error("CACM AI returned an invalid response.");
  }

  return body;
}
