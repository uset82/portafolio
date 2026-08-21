import { parseWorkSearchFacet, type WorkSearchFacet } from "@/lib/work-search";

export type WorkSearchLocation = {
  query: string;
  facet: WorkSearchFacet;
};

const listeners = new Set<() => void>();
let cached: WorkSearchLocation = { query: "", facet: "all" };

function notify() {
  for (const listener of listeners) listener();
}

function syncFromWindow() {
  const params = new URLSearchParams(globalThis.location.search);
  const query = params.get("q") ?? "";
  const facet = parseWorkSearchFacet(params.get("show"));
  if (cached.query === query && cached.facet === facet) return;
  cached = { query, facet };
}

export function subscribeWorkSearchLocation(onStoreChange: () => void) {
  syncFromWindow();
  listeners.add(onStoreChange);
  const handlePopState = () => {
    syncFromWindow();
    onStoreChange();
  };
  globalThis.addEventListener("popstate", handlePopState);
  return () => {
    listeners.delete(onStoreChange);
    globalThis.removeEventListener("popstate", handlePopState);
  };
}

export function getWorkSearchLocationSnapshot(): WorkSearchLocation {
  return cached;
}

export function writeWorkSearchLocation(query: string, facet: WorkSearchFacet) {
  const url = new URL(globalThis.location.href);
  const trimmed = query.trim();
  if (trimmed) url.searchParams.set("q", trimmed);
  else url.searchParams.delete("q");
  if (facet !== "all") url.searchParams.set("show", facet);
  else url.searchParams.delete("show");

  const next = `${url.pathname}${url.search}${url.hash}`;
  const current = `${globalThis.location.pathname}${globalThis.location.search}${globalThis.location.hash}`;
  if (current !== next) {
    globalThis.history.replaceState(null, "", next);
  }

  cached = { query, facet };
  notify();
}
