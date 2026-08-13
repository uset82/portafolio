import { AGENT_CATEGORY_PERMISSIONS, categoryForField } from "../memory/permissions";
import { FIELD_TO_CATEGORY, type MemoryCategory } from "../memory/schemas";

const fieldsForCategories = (categories: readonly MemoryCategory[]): string[] =>
  Object.entries(FIELD_TO_CATEGORY)
    .filter(([, category]) => categories.includes(category))
    .map(([field]) => field);

export const AGENT_FIELD_ALLOWLISTS: Readonly<Record<string, readonly string[]>> = {
  astraea: fieldsForCategories(AGENT_CATEGORY_PERMISSIONS.astraea ?? ["birthProfile"]),
  pinaculo: fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS.pinaculo ?? ["basic", "birthProfile"],
  ).filter((field) => field === "fullName" || field === "birthDate"),
  strudel: fieldsForCategories(AGENT_CATEGORY_PERMISSIONS.strudel ?? ["preferences"]),
  mentora: fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS.mentora ?? ["education", "skills", "goals", "interests"],
  ),
  business: fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS.business ?? ["education", "skills", "goals", "interests"],
  ),
  smartapply: fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS.smartapply ?? ["education", "skills", "goals"],
  ),
  "thesis-writer": fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS["thesis-writer"] ?? ["education", "skills", "goals"],
  ),
  "career-agent": fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS["career-agent"] ?? ["education", "skills", "goals"],
  ),
  "electronics-agent": fieldsForCategories(
    AGENT_CATEGORY_PERMISSIONS["electronics-agent"] ?? ["education", "skills"],
  ),
};

export const fieldsAllowedForAgent = (agentId: string): readonly string[] =>
  AGENT_FIELD_ALLOWLISTS[agentId] ?? [];

export const isPersonalProfileField = (field: string): boolean =>
  categoryForField(field) !== undefined;

export const SECRET_FIELD_PATTERN =
  /^(?:password|secret|api[_-]?key|authorization|credential|openrouter_api_key)$/i;

export const isSecretField = (field: string): boolean => SECRET_FIELD_PATTERN.test(field);
