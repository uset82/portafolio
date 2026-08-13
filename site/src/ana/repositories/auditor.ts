import {
  classifyRepository,
  inferCapabilities,
  inferDomains,
  inferFlags,
  inferFramework,
  normalizeRepositoryName,
} from "./classifier";
import type { RepositoryInspection } from "./github";
import { repositoryAuditSchema, type RepositoryAudit, type RepositoryOverride } from "./schemas";

const truncate = (value: string, max: number) => {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
};

const duplicateIndex = (inspections: readonly RepositoryInspection[]) => {
  const grouped = new Map<string, string[]>();
  for (const inspection of inspections) {
    if (inspection.repository.private) continue;
    const key = normalizeRepositoryName(inspection.repository.name);
    const group = grouped.get(key) ?? [];
    group.push(inspection.repository.fullName);
    grouped.set(key, group);
  }

  const duplicates = new Map<string, string>();
  for (const group of grouped.values()) {
    if (group.length < 2) continue;
    const [canonical, ...rest] = [...group].sort((left, right) => left.localeCompare(right));
    if (!canonical) continue;
    rest.forEach((fullName) => duplicates.set(fullName, canonical));
  }
  return duplicates;
};

export const auditRepository = (
  inspection: RepositoryInspection,
  duplicateOf?: string,
): RepositoryAudit => {
  const flags = inferFlags(inspection);
  const domain = inferDomains(inspection);
  const capabilities = inferCapabilities(inspection);
  const framework = inferFramework(inspection);
  const classification = classifyRepository(inspection, {
    ...(duplicateOf ? { duplicateOf } : {}),
    flags,
    domain,
    capabilities,
  });
  const description = inspection.repository.description
    ? truncate(inspection.repository.description, 500)
    : undefined;
  const language = inspection.repository.language ?? undefined;
  const readme = inspection.readme ? truncate(inspection.readme, 1_200) : undefined;

  return repositoryAuditSchema.parse({
    repository: inspection.repository.fullName,
    ...(description ? { description } : {}),
    ...(language ? { language } : {}),
    ...(framework ? { framework } : {}),
    ...(readme ? { readme } : {}),
    hasBackend: flags.hasBackend,
    hasAPI: flags.hasAPI,
    hasDatabase: flags.hasDatabase,
    hasLLM: flags.hasLLM,
    domain,
    capabilities,
    status: classification.status,
    agentPotential: classification.agentPotential,
    recommendedType: classification.recommendedType,
    visibility: inspection.repository.visibility,
    enabled: false,
    contentsInspected: inspection.contentsInspected,
    sizeKb: inspection.repository.sizeKb,
    manifestFiles: Object.keys(inspection.manifests).sort((left, right) =>
      left.localeCompare(right),
    ),
  });
};

export const auditRepositories = (inspections: readonly RepositoryInspection[]) => {
  const duplicates = duplicateIndex(inspections);
  return inspections
    .map((inspection) =>
      auditRepository(inspection, duplicates.get(inspection.repository.fullName)),
    )
    .sort((left, right) => left.repository.localeCompare(right.repository));
};

export const applyRepositoryOverride = (
  generated: RepositoryAudit,
  override: RepositoryOverride | undefined,
): RepositoryAudit => {
  if (!override) return generated;
  const fields = Object.fromEntries(Object.entries(override).filter(([key]) => key !== "notes"));
  return repositoryAuditSchema.parse({
    ...generated,
    ...fields,
    repository: generated.repository,
  });
};

export const applyRegistryOverrides = (
  generated: readonly RepositoryAudit[],
  overrides: Readonly<Record<string, RepositoryOverride>>,
) => generated.map((audit) => applyRepositoryOverride(audit, overrides[audit.repository]));
