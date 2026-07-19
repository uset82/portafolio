import "server-only";

import { OpenRouter } from "@openrouter/sdk";

import {
  buildOpenRouterOptions,
  instantiateOpenRouterClient,
  type OpenRouterEnvironment,
  type OpenRouterFactory,
} from "./openrouter-boundary";

const defaultOpenRouterFactory: OpenRouterFactory<OpenRouter> = (options) =>
  new OpenRouter(options);

const readServerEnvironment = (): OpenRouterEnvironment => {
  const environment: OpenRouterEnvironment = {};
  const apiKey = process.env.OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (apiKey !== undefined) environment.OPENROUTER_API_KEY = apiKey;
  if (siteUrl !== undefined) environment.NEXT_PUBLIC_SITE_URL = siteUrl;

  return environment;
};

export function createOpenRouterClient(environment?: OpenRouterEnvironment): OpenRouter;
export function createOpenRouterClient<TClient>(
  environment: OpenRouterEnvironment,
  factory: OpenRouterFactory<TClient>,
): TClient;
export function createOpenRouterClient<TClient>(
  environment: OpenRouterEnvironment = readServerEnvironment(),
  factory?: OpenRouterFactory<TClient>,
) {
  const options = buildOpenRouterOptions(environment);

  return factory
    ? instantiateOpenRouterClient(options, factory)
    : instantiateOpenRouterClient(options, defaultOpenRouterFactory);
}
