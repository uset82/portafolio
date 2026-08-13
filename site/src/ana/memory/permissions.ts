import { FIELD_TO_CATEGORY, type MemoryCategory } from "./schemas";

export const AGENT_CATEGORY_PERMISSIONS: Readonly<Record<string, readonly MemoryCategory[]>> = {
  astraea: ["birthProfile"],
  pinaculo: ["basic", "birthProfile"],
  strudel: ["preferences"],
  mentora: ["education", "skills", "goals", "interests"],
  business: ["education", "skills", "goals", "interests"],
  smartapply: ["education", "skills", "goals"],
  "thesis-writer": ["education", "skills", "goals"],
  "career-agent": ["education", "skills", "goals"],
  "electronics-agent": ["education", "skills"],
};

export const categoriesAllowedForAgent = (agentId: string): readonly MemoryCategory[] =>
  AGENT_CATEGORY_PERMISSIONS[agentId] ?? [];

export const categoryForField = (field: string): MemoryCategory | undefined =>
  FIELD_TO_CATEGORY[field];

export const filterRecordForAgent = (
  agentId: string,
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const allowed = new Set(categoriesAllowedForAgent(agentId));
  const filtered: Record<string, unknown> = {};
  for (const [field, value] of Object.entries(record)) {
    const category = categoryForField(field);
    if (!category || !allowed.has(category)) continue;
    if (value === undefined || value === "") continue;
    filtered[field] = value;
  }
  return filtered;
};
