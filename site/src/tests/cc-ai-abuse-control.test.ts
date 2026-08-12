import assert from "node:assert/strict";
import test from "node:test";

import {
  CcAiAbuseConfigurationError,
  CcAiAbuseError,
  createCcAiAbuseGuardFromEnvironment,
  createInMemoryCcAiAbuseGuard,
} from "@/lib/ai/cc-ai-abuse-control";
import { createCcAiPostHandler } from "@/lib/ai/cc-ai-handler";
import type { CcAiErrorResponse } from "@/lib/ai/cc-ai-contract";
import type { CcAiProvider } from "@/lib/ai/cc-ai-service";
import { createCcAiModelPolicy } from "@/lib/ai/model-policy";

const origin = "https://portfolio.example";
const sessionOne = "session_one_12345678901234567890";
const sessionTwo = "session_two_12345678901234567890";
const requestId = "00000000-0000-4000-8000-000000000002";
const modelPolicy = createCcAiModelPolicy({
  CC_AI_MODE: undefined,
  OPENROUTER_MODEL: undefined,
  OPENROUTER_FALLBACK_MODELS: undefined,
  OPENROUTER_PRODUCTION_MODEL: undefined,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: undefined,
});

const request = ({
  sourceOrigin = origin,
  fetchSite = "same-origin",
  ip = "203.0.113.10",
  session,
}: {
  sourceOrigin?: string | null;
  fetchSite?: string | null;
  ip?: string;
  session?: string;
} = {}) => {
  const headers = new Headers({
    "content-type": "application/json",
    "x-vercel-forwarded-for": ip,
  });
  if (sourceOrigin !== null) headers.set("origin", sourceOrigin);
  if (fetchSite !== null) headers.set("sec-fetch-site", fetchSite);
  if (session) headers.set("cookie", `__Host-cc_ai_session=${session}`);

  return new Request(`${origin}/api/cc-ai`, {
    method: "POST",
    headers,
    body: JSON.stringify({ message: "Question" }),
  });
};

test("abuse guard issues a hardened server session cookie for an accepted request", () => {
  const guard = createInMemoryCcAiAbuseGuard({
    allowedOrigin: origin,
    createSessionId: () => sessionOne,
  });
  const lease = guard.acquire(request());
  const headers = new Headers(lease.responseHeaders);

  assert.match(
    headers.get("set-cookie") ?? "",
    /^__Host-cc_ai_session=.*; Path=\/; HttpOnly; SameSite=Strict; Max-Age=86400; Secure$/,
  );
  lease.release();
  lease.release();
});

test("abuse guard rejects cross-site, same-site, and unverifiable request origins", () => {
  const guard = createInMemoryCcAiAbuseGuard({ allowedOrigin: origin });

  for (const untrusted of [
    request({ sourceOrigin: "https://attacker.example", fetchSite: "cross-site" }),
    request({ sourceOrigin: "https://sub.portfolio.example", fetchSite: "same-site" }),
    request({ sourceOrigin: null, fetchSite: null }),
  ]) {
    assert.throws(
      () => guard.acquire(untrusted),
      (error: unknown) => error instanceof CcAiAbuseError && error.code === "forbidden",
    );
  }
});

test("abuse guard applies fixed-window limits to both IP and server session", () => {
  const guard = createInMemoryCcAiAbuseGuard({
    allowedOrigin: origin,
    requestLimit: 1,
    windowMs: 60_000,
    now: () => 10_000,
  });

  const first = guard.acquire(request({ session: sessionOne }));
  first.release();

  assert.throws(
    () => guard.acquire(request({ session: sessionTwo })),
    (error: unknown) =>
      error instanceof CcAiAbuseError &&
      error.code === "rate_limited" &&
      error.retryAfterSeconds === 60,
  );

  const sessionGuard = createInMemoryCcAiAbuseGuard({
    allowedOrigin: origin,
    requestLimit: 1,
    now: () => 10_000,
  });
  sessionGuard.acquire(request({ session: sessionOne })).release();
  assert.throws(
    () => sessionGuard.acquire(request({ session: sessionOne, ip: "203.0.113.11" })),
    (error: unknown) => error instanceof CcAiAbuseError && error.code === "rate_limited",
  );
});

test("abuse guard enforces global and per-session concurrency ceilings", () => {
  const globalGuard = createInMemoryCcAiAbuseGuard({
    allowedOrigin: origin,
    requestLimit: 10,
    maxConcurrent: 1,
  });
  const first = globalGuard.acquire(request({ session: sessionOne }));
  assert.throws(
    () => globalGuard.acquire(request({ session: sessionTwo, ip: "203.0.113.11" })),
    (error: unknown) => error instanceof CcAiAbuseError && error.code === "busy",
  );
  first.release();
  globalGuard.acquire(request({ session: sessionTwo, ip: "203.0.113.11" })).release();

  const sessionGuard = createInMemoryCcAiAbuseGuard({
    allowedOrigin: origin,
    requestLimit: 10,
    maxConcurrent: 2,
    maxConcurrentPerSession: 1,
  });
  const sessionLease = sessionGuard.acquire(request({ session: sessionOne }));
  assert.throws(
    () => sessionGuard.acquire(request({ session: sessionOne, ip: "203.0.113.11" })),
    (error: unknown) => error instanceof CcAiAbuseError && error.code === "busy",
  );
  sessionLease.release();
});

test("environment configuration rejects unsafe or non-numeric limits", () => {
  assert.throws(
    () =>
      createCcAiAbuseGuardFromEnvironment({
        NEXT_PUBLIC_SITE_URL: "javascript:alert(1)",
        CC_AI_RATE_LIMIT: undefined,
        CC_AI_RATE_WINDOW_SECONDS: undefined,
        CC_AI_MAX_CONCURRENT: undefined,
      }),
    CcAiAbuseConfigurationError,
  );
  assert.throws(
    () =>
      createCcAiAbuseGuardFromEnvironment({
        NEXT_PUBLIC_SITE_URL: origin,
        CC_AI_RATE_LIMIT: "0",
        CC_AI_RATE_WINDOW_SECONDS: undefined,
        CC_AI_MAX_CONCURRENT: undefined,
      }),
    /positive integer/,
  );
});

test("handler returns user-facing limit state without an automatic provider retry", async () => {
  let providerCalls = 0;
  const provider: CcAiProvider = {
    async complete() {
      providerCalls += 1;
      return { text: "Answer", model: "example/responding-model" };
    },
  };
  const handler = createCcAiPostHandler({
    enabled: true,
    abuseGuard: createInMemoryCcAiAbuseGuard({
      allowedOrigin: origin,
      requestLimit: 1,
      now: () => 10_000,
      createSessionId: () => sessionOne,
    }),
    serviceOptions: { provider, modelPolicy },
    createRequestId: () => requestId,
  });

  const accepted = await handler(request());
  const cookie = accepted.headers.get("set-cookie")?.split(";")[0];
  const limitedRequest = request();
  limitedRequest.headers.set("cookie", cookie ?? "");
  const limited = await handler(limitedRequest);
  const body = (await limited.json()) as CcAiErrorResponse;

  assert.equal(accepted.status, 200);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("retry-after"), "60");
  assert.equal(body.error.code, "rate_limited");
  assert.equal(body.error.retryable, true);
  assert.equal(providerCalls, 1);
});

test("handler blocks a cross-origin request before provider work", async () => {
  let providerCalls = 0;
  const handler = createCcAiPostHandler({
    enabled: true,
    abuseGuard: createInMemoryCcAiAbuseGuard({ allowedOrigin: origin }),
    serviceOptions: {
      modelPolicy,
      provider: {
        async complete() {
          providerCalls += 1;
          return { text: "Unexpected", model: "unexpected" };
        },
      },
    },
    createRequestId: () => requestId,
  });

  const response = await handler(
    request({ sourceOrigin: "https://attacker.example", fetchSite: "cross-site" }),
  );
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 403);
  assert.equal(body.error.code, "forbidden");
  assert.equal(providerCalls, 0);
});

test("handler rejects an oversized body before provider work", async () => {
  let providerCalls = 0;
  const handler = createCcAiPostHandler({
    enabled: true,
    abuseGuard: createInMemoryCcAiAbuseGuard({ allowedOrigin: origin }),
    serviceOptions: {
      modelPolicy,
      provider: {
        async complete() {
          providerCalls += 1;
          return { text: "Unexpected", model: "unexpected" };
        },
      },
    },
    createRequestId: () => requestId,
  });
  const oversized = new Request(`${origin}/api/cc-ai`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "sec-fetch-site": "same-origin",
      "x-vercel-forwarded-for": "203.0.113.10",
    },
    body: JSON.stringify({ message: "x".repeat(17_000) }),
  });

  const response = await handler(oversized);
  const body = (await response.json()) as CcAiErrorResponse;

  assert.equal(response.status, 413);
  assert.equal(body.error.code, "invalid_request");
  assert.equal(providerCalls, 0);
});

test("handler returns a user-facing busy state at the concurrency ceiling", async () => {
  let announceStarted: (() => void) | undefined;
  let finishProvider: (() => void) | undefined;
  const started = new Promise<void>((resolve) => {
    announceStarted = resolve;
  });
  const provider: CcAiProvider = {
    complete() {
      announceStarted?.();
      return new Promise((resolve) => {
        finishProvider = () => resolve({ text: "Answer", model: "example/responding-model" });
      });
    },
  };
  const handler = createCcAiPostHandler({
    enabled: true,
    abuseGuard: createInMemoryCcAiAbuseGuard({
      allowedOrigin: origin,
      requestLimit: 10,
      maxConcurrent: 1,
    }),
    serviceOptions: { provider, modelPolicy },
    createRequestId: () => requestId,
  });

  const firstResponse = handler(request({ session: sessionOne }));
  await started;
  const busyResponse = await handler(request({ session: sessionTwo, ip: "203.0.113.11" }));
  const body = (await busyResponse.json()) as CcAiErrorResponse;

  assert.equal(busyResponse.status, 503);
  assert.equal(busyResponse.headers.get("retry-after"), "1");
  assert.deepEqual(body.error, {
    code: "busy",
    message: "CACM AI is helping other visitors right now. Please try again shortly.",
    retryable: true,
  });

  assert.ok(finishProvider);
  finishProvider();
  assert.equal((await firstResponse).status, 200);
});
