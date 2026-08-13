import { tokenize } from "./embed";
import type { DiscoveryDocument, DiscoveryHit } from "./schemas";

export const keywordScore = (query: string, document: DiscoveryDocument): number => {
  const queryTokens = [...new Set(tokenize(query))];
  if (queryTokens.length === 0) return 0;
  const haystack = tokenize(
    [
      document.text,
      document.agentId,
      document.capability,
      document.domainAgentId,
      document.fields.capabilities,
    ]
      .filter((part): part is string => Boolean(part))
      .join(" "),
  );
  const present = new Set(haystack);
  let hits = 0;
  for (const token of queryTokens) {
    if (present.has(token)) hits += 1;
  }
  let score = hits / queryTokens.length;
  if (document.capability && query.toLowerCase().includes(document.capability.replace(/-/g, " "))) {
    score += 0.15;
  }
  if (document.agentId && query.toLowerCase().includes(document.agentId)) {
    score += 0.1;
  }
  return Math.min(1, score);
};

export const rankByKeywords = (
  query: string,
  documents: readonly DiscoveryDocument[],
): DiscoveryHit[] =>
  documents
    .map((document) => {
      const hit: DiscoveryHit = {
        id: document.id,
        repository: document.repository,
        score: keywordScore(query, document),
        source: "keyword",
        executable: document.executable,
      };
      if (document.agentId) hit.agentId = document.agentId;
      if (document.capability) hit.capability = document.capability;
      if (document.domainAgentId) hit.domainAgentId = document.domainAgentId;
      return hit;
    })
    .filter((hit) => hit.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
