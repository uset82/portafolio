import "server-only";

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

export const POST = createCcAiPostHandler({
  enabled: process.env.CC_AI_ENABLED === "true",
  abuseGuard,
  serviceOptions: {
    provider: createOpenRouterChatProvider(),
    modelPolicy,
    knowledgeContext,
  },
});
