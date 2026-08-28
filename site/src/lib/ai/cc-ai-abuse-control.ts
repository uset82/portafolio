const LOCAL_SESSION_COOKIE = "cc_ai_session";
const SECURE_SESSION_COOKIE = "__Host-cc_ai_session";
const SESSION_PATTERN = /^[A-Za-z0-9_-]{20,80}$/;

type RateBucket = {
  count: number;
  resetAt: number;
};

export type CcAiAbuseErrorCode = "forbidden" | "rate_limited" | "busy";

export class CcAiAbuseError extends Error {
  readonly code: CcAiAbuseErrorCode;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;

  constructor(code: CcAiAbuseErrorCode, retryable: boolean, retryAfterSeconds?: number) {
    super(code);
    this.name = "CcAiAbuseError";
    this.code = code;
    this.retryable = retryable;
    if (retryAfterSeconds !== undefined) this.retryAfterSeconds = retryAfterSeconds;
  }
}

export type CcAiAbuseLease = {
  responseHeaders: HeadersInit;
  release(): void;
};

export interface CcAiAbuseGuard {
  acquire(request: Request): CcAiAbuseLease;
}

export type CcAiAbuseGuardOptions = {
  allowedOrigin?: string;
  requestLimit?: number;
  windowMs?: number;
  maxConcurrent?: number;
  maxConcurrentPerSession?: number;
  maxTrackedBuckets?: number;
  now?: () => number;
  createSessionId?: () => string;
};

export type CcAiAbuseEnvironment = {
  NEXT_PUBLIC_SITE_URL: string | undefined;
  CC_AI_RATE_LIMIT: string | undefined;
  CC_AI_RATE_WINDOW_SECONDS: string | undefined;
  CC_AI_MAX_CONCURRENT: string | undefined;
};

export class CcAiAbuseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CcAiAbuseConfigurationError";
  }
}

const normalizeOrigin = (value: string, label: string) => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new CcAiAbuseConfigurationError(`${label} must be a valid absolute URL.`);
  }

  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new CcAiAbuseConfigurationError(`${label} must be a credential-free HTTP(S) URL.`);
  }

  return url.origin;
};

const parsePositiveInteger = (value: string | undefined, fallback: number, label: string) => {
  if (!value?.trim()) return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new CcAiAbuseConfigurationError(`${label} must be a positive integer.`);
  }
  return parsed;
};

const readCookie = (request: Request) => {
  const pairs = request.headers.get("cookie")?.split(";") ?? [];
  for (const pair of pairs) {
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    const name = pair.slice(0, separator).trim();
    if (name !== LOCAL_SESSION_COOKIE && name !== SECURE_SESSION_COOKIE) continue;
    const value = pair.slice(separator + 1).trim();
    if (SESSION_PATTERN.test(value)) return value;
  }
  return undefined;
};

const getClientAddress = (request: Request) => {
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || "unavailable";
};

const isLoopbackHostname = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "[::1]" ||
  hostname === "::1" ||
  hostname === "0.0.0.0" ||
  hostname.endsWith(".localhost");

const isLoopbackOrigin = (originUrl: string) => {
  try {
    const parsed = new URL(originUrl);
    return isLoopbackHostname(parsed.hostname);
  } catch {
    return false;
  }
};

const CANONICAL_PRODUCTION_ORIGIN = "https://carloscarpio.dev";

const verifyRequestOrigin = (request: Request, configuredOrigin: string | undefined) => {
  const source = request.headers.get("origin") ?? request.headers.get("referer");
  if (!source || source === "null") throw new CcAiAbuseError("forbidden", false);

  let sourceOrigin: string;
  try {
    sourceOrigin = new URL(source).origin;
  } catch {
    throw new CcAiAbuseError("forbidden", false);
  }

  const requestOrigin = new URL(request.url).origin;

  // 1. Direct match with configured origin, request URL origin, or canonical production origin
  if (
    sourceOrigin === configuredOrigin ||
    sourceOrigin === requestOrigin ||
    sourceOrigin === CANONICAL_PRODUCTION_ORIGIN
  ) {
    return;
  }

  // 2. Match reverse-proxy forwarded host (e.g. Railway, Vercel)
  const forwardedHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host")?.split(",")[0]?.trim();
  if (forwardedHost) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
    if (
      sourceOrigin === `${forwardedProto}://${forwardedHost}` ||
      sourceOrigin === `https://${forwardedHost}` ||
      sourceOrigin === `http://${forwardedHost}`
    ) {
      return;
    }
  }

  // 3. Local loopback origins during development
  if (
    isLoopbackOrigin(sourceOrigin) &&
    (isLoopbackOrigin(requestOrigin) || (configuredOrigin && isLoopbackOrigin(configuredOrigin)))
  ) {
    return;
  }

  throw new CcAiAbuseError("forbidden", false);
};

const createSessionCookie = (request: Request, sessionId: string) => {
  const secure = new URL(request.url).protocol === "https:";
  const name = secure ? SECURE_SESSION_COOKIE : LOCAL_SESSION_COOKIE;
  return `${name}=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${secure ? "; Secure" : ""}`;
};

export function createInMemoryCcAiAbuseGuard({
  allowedOrigin,
  requestLimit = 6,
  windowMs = 60_000,
  maxConcurrent = 4,
  maxConcurrentPerSession = 1,
  maxTrackedBuckets = 20_000,
  now = Date.now,
  createSessionId = () => crypto.randomUUID(),
}: CcAiAbuseGuardOptions = {}): CcAiAbuseGuard {
  const normalizedAllowedOrigin = allowedOrigin
    ? normalizeOrigin(allowedOrigin, "allowedOrigin")
    : undefined;
  const numericOptions = {
    requestLimit,
    windowMs,
    maxConcurrent,
    maxConcurrentPerSession,
    maxTrackedBuckets,
  };
  for (const [label, value] of Object.entries(numericOptions)) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new CcAiAbuseConfigurationError(`${label} must be a positive integer.`);
    }
  }

  const buckets = new Map<string, RateBucket>();
  const activeSessions = new Map<string, number>();
  let activeRequests = 0;

  return {
    acquire(request) {
      verifyRequestOrigin(request, normalizedAllowedOrigin);

      const timestamp = now();
      for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= timestamp) buckets.delete(key);
      }

      const sessionId = readCookie(request) ?? createSessionId();
      if (!SESSION_PATTERN.test(sessionId)) {
        throw new CcAiAbuseConfigurationError(
          "createSessionId must return 20–80 URL-safe characters.",
        );
      }

      const keys = [`ip:${getClientAddress(request)}`, `session:${sessionId}`];
      let retryAfterSeconds = 0;
      for (const key of keys) {
        const bucket = buckets.get(key);
        if (bucket && bucket.count >= requestLimit) {
          retryAfterSeconds = Math.max(
            retryAfterSeconds,
            Math.max(1, Math.ceil((bucket.resetAt - timestamp) / 1_000)),
          );
        }
      }
      if (retryAfterSeconds > 0) {
        throw new CcAiAbuseError("rate_limited", true, retryAfterSeconds);
      }

      if (
        activeRequests >= maxConcurrent ||
        (activeSessions.get(sessionId) ?? 0) >= maxConcurrentPerSession
      ) {
        throw new CcAiAbuseError("busy", true, 1);
      }

      const newBucketCount = keys.filter((key) => !buckets.has(key)).length;
      if (buckets.size + newBucketCount > maxTrackedBuckets) {
        throw new CcAiAbuseError("busy", true, 1);
      }

      for (const key of keys) {
        const bucket = buckets.get(key);
        if (bucket) {
          bucket.count += 1;
        } else {
          buckets.set(key, { count: 1, resetAt: timestamp + windowMs });
        }
      }

      activeRequests += 1;
      activeSessions.set(sessionId, (activeSessions.get(sessionId) ?? 0) + 1);
      let released = false;

      return {
        responseHeaders: { "Set-Cookie": createSessionCookie(request, sessionId) },
        release() {
          if (released) return;
          released = true;
          activeRequests -= 1;
          const remaining = (activeSessions.get(sessionId) ?? 1) - 1;
          if (remaining > 0) activeSessions.set(sessionId, remaining);
          else activeSessions.delete(sessionId);
        },
      };
    },
  };
}

export function createCcAiAbuseGuardFromEnvironment(
  environment: CcAiAbuseEnvironment,
): CcAiAbuseGuard {
  const allowedOrigin =
    environment.NEXT_PUBLIC_SITE_URL?.trim() ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "production"
      ? CANONICAL_PRODUCTION_ORIGIN
      : undefined);
  return createInMemoryCcAiAbuseGuard({
    ...(allowedOrigin ? { allowedOrigin } : {}),
    requestLimit: parsePositiveInteger(environment.CC_AI_RATE_LIMIT, 6, "CC_AI_RATE_LIMIT"),
    windowMs:
      parsePositiveInteger(environment.CC_AI_RATE_WINDOW_SECONDS, 60, "CC_AI_RATE_WINDOW_SECONDS") *
      1_000,
    maxConcurrent: parsePositiveInteger(
      environment.CC_AI_MAX_CONCURRENT,
      4,
      "CC_AI_MAX_CONCURRENT",
    ),
  });
}
