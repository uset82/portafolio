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
import { resolveCcAiTimeoutMs } from "@/lib/ai/openrouter-chat-request";

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

/* Named reasoning models such as stealth/ox-alpha at max effort need more
 * than the old 30–60 s prototype budget. Production stays tighter.
 * CC_AI_TIMEOUT_MS overrides both and is capped at 180 s. */
const timeoutMs = resolveCcAiTimeoutMs(modelPolicy.mode, process.env.CC_AI_TIMEOUT_MS);

export const POST = (request: Request) => {
  const userKey = request.headers.get("x-openrouter-key")?.trim();
  const provider = userKey
    ? createOpenRouterChatProvider({
        OPENROUTER_API_KEY: userKey,
        ...(process.env.NEXT_PUBLIC_SITE_URL
          ? { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL }
          : {}),
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
