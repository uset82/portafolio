import type { SDKOptions } from "@openrouter/sdk";

/* Sent verbatim as OpenRouter's X-Title HTTP header. HTTP header values are
 * ByteStrings, so any character above U+00FF makes the request throw before it
 * is sent — an em dash here failed every CACM AI call as "provider unavailable".
 * Keep this ASCII; `assertHeaderSafe` enforces it. */
export const OPENROUTER_APP_TITLE = "Carlos Alfredo Carpio Meza - CACM AI";

const assertHeaderSafe = (value: string, variableName: string) => {
  if (!/^[ -~]*$/.test(value)) {
    throw new OpenRouterConfigurationError(
      `${variableName} must contain only printable ASCII; HTTP header values cannot carry it otherwise.`,
    );
  }
  return value;
};

export type OpenRouterEnvironment = {
  OPENROUTER_API_KEY?: string;
  NEXT_PUBLIC_SITE_URL?: string;
};

export type OpenRouterFactory<TClient> = (options: SDKOptions) => TClient;

export class OpenRouterConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterConfigurationError";
  }
}

const getPublicOrigin = (value: string | undefined) => {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  if (!URL.canParse(candidate)) {
    throw new OpenRouterConfigurationError("NEXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  const url = new URL(candidate);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new OpenRouterConfigurationError(
      "NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS without embedded credentials.",
    );
  }

  return url.origin;
};

export function buildOpenRouterOptions(environment: OpenRouterEnvironment): SDKOptions {
  const apiKey = environment.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new OpenRouterConfigurationError(
      "CACM AI is unavailable because OPENROUTER_API_KEY is not configured on the server.",
    );
  }

  const httpReferer = getPublicOrigin(environment.NEXT_PUBLIC_SITE_URL);
  const appTitle = assertHeaderSafe(OPENROUTER_APP_TITLE, "OPENROUTER_APP_TITLE");

  return httpReferer ? { apiKey, appTitle, httpReferer } : { apiKey, appTitle };
}

export function instantiateOpenRouterClient<TClient>(
  options: SDKOptions,
  factory: OpenRouterFactory<TClient>,
): TClient {
  return factory(options);
}
