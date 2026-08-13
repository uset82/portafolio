import { auditRepository } from "./auditor";
import { proposeCapabilities, type CapabilityProposal } from "./proposals";
import type { DiscoveredRepository, RepositoryInspection } from "./github";
import type { RepositoryAudit } from "./schemas";

export type OwnedRepositoryDiff = {
  newPublic: DiscoveredRepository[];
  newPrivate: DiscoveredRepository[];
  known: DiscoveredRepository[];
  missingFromGithub: string[];
};

export type OwnedRepositoryScan = {
  newPublic: string[];
  newPrivateCount: number;
  missingFromGithub: string[];
  audits: RepositoryAudit[];
  proposals: CapabilityProposal[];
};

export const diffOwnedRepositories = (
  listed: readonly DiscoveredRepository[],
  knownAudits: readonly RepositoryAudit[],
): OwnedRepositoryDiff => {
  const known = new Set(knownAudits.map((audit) => audit.repository));
  const listedNames = new Set(listed.map((repository) => repository.fullName));
  const newPublic = listed
    .filter((repository) => repository.visibility === "public" && !known.has(repository.fullName))
    .slice()
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
  const newPrivate = listed
    .filter((repository) => repository.visibility === "private" && !known.has(repository.fullName))
    .slice()
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
  const knownListed = listed
    .filter((repository) => known.has(repository.fullName))
    .slice()
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
  const missingFromGithub = [...known]
    .filter((name) => !listedNames.has(name))
    .sort((left, right) => left.localeCompare(right));
  return { newPublic, newPrivate, known: knownListed, missingFromGithub };
};

const inspectionFor = (
  repository: DiscoveredRepository,
  inspections: ReadonlyMap<string, RepositoryInspection>,
): RepositoryInspection =>
  inspections.get(repository.fullName) ?? {
    repository,
    contentsInspected: false,
    treePaths: [],
    manifests: {},
  };

export const scanOwnedRepositories = (options: {
  listed: readonly DiscoveredRepository[];
  knownAudits: readonly RepositoryAudit[];
  inspections?: readonly RepositoryInspection[];
}): OwnedRepositoryScan => {
  const diff = diffOwnedRepositories(options.listed, options.knownAudits);
  const inspections = new Map(
    (options.inspections ?? []).map((inspection) => [inspection.repository.fullName, inspection]),
  );
  const audits = diff.newPublic.map((repository) => {
    const audit = auditRepository(inspectionFor(repository, inspections));
    if (audit.enabled) {
      throw new Error(`Scanner refused to enable ${audit.repository}`);
    }
    return audit;
  });
  return {
    newPublic: diff.newPublic.map((repository) => repository.fullName),
    newPrivateCount: diff.newPrivate.length,
    missingFromGithub: diff.missingFromGithub,
    audits,
    proposals: proposeCapabilities(audits),
  };
};
