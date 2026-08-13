import type { EmbeddingEngine } from "./schemas";

const DIMENSIONS = 256;

export const tokenize = (text: string): string[] =>
  text.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) ?? [];

const fnv1a = (token: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

export const embedText = (text: string): number[] => {
  const vector = Array.from({ length: DIMENSIONS }, () => 0);
  for (const token of tokenize(text)) {
    const bucket = fnv1a(token) % DIMENSIONS;
    vector[bucket] = (vector[bucket] ?? 0) + 1;
  }
  let norm = 0;
  for (const value of vector) norm += value * value;
  const scale = Math.sqrt(norm);
  if (scale === 0) return vector;
  return vector.map((value) => value / scale);
};

export const cosineSimilarity = (left: readonly number[], right: readonly number[]): number => {
  const length = Math.min(left.length, right.length);
  let dot = 0;
  for (let index = 0; index < length; index += 1) {
    dot += (left[index] ?? 0) * (right[index] ?? 0);
  }
  return dot;
};

export const createHashedEmbeddingEngine = (): EmbeddingEngine => ({
  available: () => true,
  embed: async (texts) => texts.map((text) => embedText(text)),
});

export const createUnavailableEmbeddingEngine = (): EmbeddingEngine => ({
  available: () => false,
  embed: async () => {
    throw new Error("Embeddings are unavailable");
  },
});
