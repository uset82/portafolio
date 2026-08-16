import "server-only";

import path from "node:path";

import {
  defaultBrainRepositoriesRoot,
  loadEffectiveRepositoryAuditsSync,
} from "@/ana/repositories/registry";
import { siteContent } from "@/content/site";
import { createCcAiAbuseGuardFromEnvironment } from "@/lib/ai/cc-ai-abuse-control";
import { createCcAiPostHandler } from "@/lib/ai/cc-ai-handler";
import { buildCcAiKnowledgeContext } from "@/lib/ai/cc-ai-knowledge";
import { createCcAiModelPolicy } from "@/lib/ai/model-policy";
import { createOpenRouterChatProvider } from "@/lib/ai/openrouter-chat-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const modelPolicy = createCcAiModelPolicy({
  CC_AI_MODE: process.env.CC_AI_MODE,
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
  OPENROUTER_FALLBACK_MODELS: process.env.OPENROUTER_FALLBACK_MODELS,
  OPENROUTER_PRODUCTION_MODEL: process.env.OPENROUTER_PRODUCTION_MODEL,
  OPENROUTER_PRODUCTION_FALLBACK_MODELS: process.env.OPENROUTER_PRODUCTION_FALLBACK_MODELS,
});
const abuseGuard = createCcAiAbuseGuardFromEnvironment({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CC_AI_RATE_LIMIT: process.env.CC_AI_RATE_LIMIT,
  CC_AI_RATE_WINDOW_SECONDS: process.env.CC_AI_RATE_WINDOW_SECONDS,
  CC_AI_MAX_CONCURRENT: process.env.CC_AI_MAX_CONCURRENT,
});
const knowledgeContext = buildCcAiKnowledgeContext(siteContent);
const brainRoot = defaultBrainRepositoriesRoot();
const portfolioAudits = (() => {
  try {
    return loadEffectiveRepositoryAuditsSync({
      generatedPath: path.join(brainRoot, "registry.generated.json"),
      overridesPath: path.join(brainRoot, "registry.overrides.json"),
    });
  } catch {
    return [];
  }
})();

/* `openrouter/free` routes to whichever free model is currently available, and
 * those endpoints queue: a 12 s budget times out on answers that arrive fine a
 * few seconds later. The paid production fleet keeps the tighter budget.
 * CC_AI_TIMEOUT_MS overrides both. */
const DEFAULT_TIMEOUT_MS = modelPolicy.mode === "production" ? 12_000 : 30_000;
const configuredTimeoutMs = Number.parseInt(process.env.CC_AI_TIMEOUT_MS ?? "", 10);
const timeoutMs =
  Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0
    ? Math.min(configuredTimeoutMs, 60_000)
    : DEFAULT_TIMEOUT_MS;

export const POST = (request: Request) => {
  const userKey = request.headers.get("x-openrouter-key")?.trim();
  const provider = userKey
    ? createOpenRouterChatProvider({
        OPENROUTER_API_KEY: userKey,
        ...(process.env.NEXT_PUBLIC_SITE_URL ? { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL } : {}),
      })
    : createOpenRouterChatProvider();

  const handler = createCcAiPostHandler({
    enabled: process.env.CC_AI_ENABLED === "true",
    abuseGuard,
    portfolioAudits,
    serviceOptions: {
      provider,
      modelPolicy,
      knowledgeContext,
      timeoutMs,
    },
  });

  return handler(request);
};
