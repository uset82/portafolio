import { cosineSimilarity, createHashedEmbeddingEngine, embedText } from "./embed";
import { rankByKeywords } from "./keywords";
import type { DiscoveryHit, DiscoveryIndex, EmbeddingEngine } from "./schemas";

const toHit = (
  document: DiscoveryIndex["documents"][number],
  score: number,
  source: DiscoveryHit["source"],
): DiscoveryHit => {
  const hit: DiscoveryHit = {
    id: document.id,
    repository: document.repository,
    score,
    source,
    executable: document.executable,
  };
  if (document.agentId) hit.agentId = document.agentId;
  if (document.capability) hit.capability = document.capability;
  if (document.domainAgentId) hit.domainAgentId = document.domainAgentId;
  return hit;
};

export const rankCapabilities = async (
  query: string,
  index: DiscoveryIndex,
  options: { embedder?: EmbeddingEngine; limit?: number } = {},
): Promise<DiscoveryHit[]> => {
  const limit = options.limit ?? 8;
  const embedder = options.embedder ?? createHashedEmbeddingEngine();
  const available = await embedder.available();
  if (!available) {
    return rankByKeywords(query, index.documents).slice(0, limit);
  }

  const texts = [query, ...index.documents.map((document) => document.text)];
  const vectors = await embedder.embed(texts);
  const queryVector = vectors[0];
  if (!queryVector) return rankByKeywords(query, index.documents).slice(0, limit);

  const ranked = index.documents
    .map((document, offset) => {
      const vector = vectors[offset + 1];
      const score = vector ? cosineSimilarity(queryVector, vector) : 0;
      return toHit(document, score, "embedding");
    })
    .filter((hit) => hit.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));

  return ranked.slice(0, limit);
};

export const rankCapabilitiesSync = (
  query: string,
  index: DiscoveryIndex,
  options: { useEmbeddings?: boolean; limit?: number } = {},
): DiscoveryHit[] => {
  const limit = options.limit ?? 8;
  if (options.useEmbeddings === false) {
    return rankByKeywords(query, index.documents).slice(0, limit);
  }
  const queryVector = embedText(query);
  return index.documents
    .map((document) =>
      toHit(document, cosineSimilarity(queryVector, embedText(document.text)), "embedding"),
    )
    .filter((hit) => hit.score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit);
};

export const topExecutableHit = (hits: readonly DiscoveryHit[]): DiscoveryHit | undefined => {
  const executable = hits.find((hit) => hit.executable && (hit.agentId || hit.domainAgentId));
  if (executable) return executable;
  return hits.find((hit) => hit.domainAgentId);
};
