import "server-only";

import path from "node:path";
import { createAnaPostHandler } from "@/ana/ui";
import { createHostSpecialists } from "@/ana/specialists";
import {
  defaultBrainRepositoriesRoot,
  loadEffectiveRepositoryAuditsSync,
} from "@/ana/repositories/registry";
import { createCcAiAbuseGuardFromEnvironment } from "@/lib/ai/cc-ai-abuse-control";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const abuseGuard = createCcAiAbuseGuardFromEnvironment({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  CC_AI_RATE_LIMIT: process.env.CC_AI_RATE_LIMIT,
  CC_AI_RATE_WINDOW_SECONDS: process.env.CC_AI_RATE_WINDOW_SECONDS,
  CC_AI_MAX_CONCURRENT: process.env.CC_AI_MAX_CONCURRENT,
});

const brainRoot = defaultBrainRepositoriesRoot();
const publicAudits = (() => {
  try {
    return loadEffectiveRepositoryAuditsSync({
      generatedPath: path.join(brainRoot, "registry.generated.json"),
      overridesPath: path.join(brainRoot, "registry.overrides.json"),
    });
  } catch {
    return [];
  }
})();

export const POST = createAnaPostHandler({
  enabled: process.env.ANA_SPECIALISTS_ENABLED === "true",
  runtime: { agents: Object.values(createHostSpecialists()), audits: publicAudits },
  abuseGuard,
});
