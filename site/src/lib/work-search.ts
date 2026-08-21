import type {
  GithubWorkEntry,
  GithubWorkGroup,
  WorkGroupDefinition,
} from "@/content/github-register";

export const WORK_SEARCH_FACETS = ["all", "playable", "astrology"] as const;

export type WorkSearchFacet = (typeof WORK_SEARCH_FACETS)[number];

const PLAYABLE_TOKENS = new Set(["play", "playable", "try", "demo"]);

export function parseWorkSearchFacet(value: string | null | undefined): WorkSearchFacet {
  if (value === "playable" || value === "astrology") return value;
  return "all";
}

export function normalizeWorkSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isWorkSearchActive(query: string, facet: WorkSearchFacet): boolean {
  return facet !== "all" || normalizeWorkSearchText(query).length > 0;
}

function extraHaystack(repository: GithubWorkEntry, group: WorkGroupDefinition): string[] {
  const tokens = [group.id, group.title, group.chartLabel];

  if (repository.tryUrl) {
    tokens.push("playable", "play", "try");
  }

  if (group.id === "astrology") {
    tokens.push(
      "astro",
      "astrology",
      "astrologia",
      "numerology",
      "numerologia",
      "cosmos",
      "natal",
      "chart",
    );
  }

  if (repository.name === "ASTROEA") {
    tokens.push("astraea", "astraia", "astroea");
  }

  if (repository.name === "pinaculo") {
    tokens.push("pinaculo", "jung");
  }

  return tokens;
}

function haystackWords(repository: GithubWorkEntry, group: WorkGroupDefinition): string[] {
  return normalizeWorkSearchText(
    [
      repository.title,
      repository.name,
      repository.description,
      repository.language,
      repository.licenseLabel,
      repository.kind,
      repository.tryLabel ?? "",
      repository.roomLabel ?? "",
      ...extraHaystack(repository, group),
    ].join(" "),
  )
    .split(/\s+/)
    .filter(Boolean);
}

function wordMatchesToken(word: string, token: string): boolean {
  if (word === token || word.startsWith(token)) return true;
  return token.length >= 4 && word.includes(token);
}

export function workEntryMatches(
  repository: GithubWorkEntry,
  group: WorkGroupDefinition,
  query: string,
  facet: WorkSearchFacet = "all",
): boolean {
  if (facet === "playable" && !repository.tryUrl) return false;
  if (facet === "astrology" && group.id !== "astrology") return false;

  const tokens = normalizeWorkSearchText(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const words = haystackWords(repository, group);
  return tokens.every((token) => {
    if (PLAYABLE_TOKENS.has(token)) return Boolean(repository.tryUrl);
    return words.some((word) => wordMatchesToken(word, token));
  });
}

export function matchingWorkIds(
  groups: readonly GithubWorkGroup[],
  query: string,
  facet: WorkSearchFacet = "all",
): ReadonlySet<string> {
  return new Set(
    groups.flatMap((group) =>
      group.repositories
        .filter((repository) => workEntryMatches(repository, group, query, facet))
        .map((repository) => repository.id),
    ),
  );
}
