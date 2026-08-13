import "server-only";

import { createAgentPostHandler, createHostSpecialists } from "@/ana/specialists";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createAgentPostHandler({
  enabled: process.env.ANA_SPECIALISTS_ENABLED === "true",
  specialists: createHostSpecialists(),
});
