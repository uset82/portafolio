import type { SDKOptions } from "@openrouter/sdk";

export const OPENROUTER_APP_TITLE = "Carlos Carpio — CC AI";

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
      "CC AI is unavailable because OPENROUTER_API_KEY is not configured on the server.",
    );
  }

  const httpReferer = getPublicOrigin(environment.NEXT_PUBLIC_SITE_URL);

  return httpReferer
    ? { apiKey, appTitle: OPENROUTER_APP_TITLE, httpReferer }
    : { apiKey, appTitle: OPENROUTER_APP_TITLE };
}

export function instantiateOpenRouterClient<TClient>(
  options: SDKOptions,
  factory: OpenRouterFactory<TClient>,
): TClient {
  return factory(options);
}
