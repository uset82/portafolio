import "server-only";

import { createAnaDebugGetHandler, getAnaDebugStore } from "@/ana/debug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = createAnaDebugGetHandler({
  store: getAnaDebugStore(),
});
