import { isAnaDebugEnabled, type AnaDebugStore } from "./store";

export type AnaDebugGetHandlerOptions = {
  enabled?: boolean;
  store: AnaDebugStore;
  env?: Record<string, string | undefined>;
};

const jsonResponse = (body: unknown, status: number) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export function createAnaDebugGetHandler({
  store,
  enabled,
  env = process.env,
}: AnaDebugGetHandlerOptions) {
  const open = enabled ?? isAnaDebugEnabled(env);
  return async function handleAnaDebugGet() {
    if (!open) {
      return jsonResponse({ ok: false, error: { code: "not_found" } }, 404);
    }
    return jsonResponse({ ok: true, snapshots: store.list() }, 200);
  };
}
