import { parseAgentJsonDocument } from "../manifest/loader";
import type { AgentJsonDocument } from "../manifest/schemas";
import type { RepositoryAudit, RepositoryDomain } from "./schemas";
import {
  parseCapabilityProposal,
  type CapabilityProposal,
  type CapabilityProposalDecision,
  type CapabilityProposalSkipReason,
} from "./proposal-schemas";

export type { CapabilityProposal, CapabilityProposalDecision, CapabilityProposalSkipReason };

const DOMAIN_AGENT_NAMES: Partial<Record<RepositoryDomain, string>> = {
  energy: "Energy Systems Agent",
  astrology: "Astrology Agent",
  numerology: "Numerology Agent",
  music: "Music Agent",
  education: "Education Agent",
  career: "Career Agent",
  electronics: "Electronics Agent",
  construction: "Construction Tool",
};

const toAgentId = (repository: string): string => {
  const name = repository.split("/")[1] ?? repository;
  const id = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id.length > 0 ? id : "discovered-agent";
};

const titleCaseRepo = (repository: string): string => {
  const name = repository.split("/")[1] ?? repository;
  return name
    .split(/[-_]/)
    .filter((part) => part.length > 0)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
};

const suggestedAgentName = (audit: RepositoryAudit): string => {
  const primary = audit.domain[0];
  if (primary && DOMAIN_AGENT_NAMES[primary]) return DOMAIN_AGENT_NAMES[primary];
  const titled = titleCaseRepo(audit.repository);
  return audit.recommendedType === "tool" ? `${titled} Tool` : `${titled} Agent`;
};

const skipReasonFor = (audit: RepositoryAudit): CapabilityProposalSkipReason | undefined => {
  if (audit.visibility === "private") return "private";
  if (audit.status === "empty") return "empty";
  if (audit.status === "duplicate") return "duplicate";
  if (audit.recommendedType === "disabled") return "disabled";
  if (
    audit.status === "fork" &&
    audit.recommendedType !== "agent" &&
    audit.recommendedType !== "tool"
  ) {
    return "fork";
  }
  if (audit.recommendedType === "knowledge") return "knowledge";
  if (audit.domain.length === 0) return "no-domain";
  if (audit.capabilities.length === 0) return "no-capabilities";
  return undefined;
};

const draftDocument = (audit: RepositoryAudit): AgentJsonDocument =>
  parseAgentJsonDocument({
    schema: "repo2agent/v1",
    type: audit.recommendedType === "tool" ? "tool" : "agent",
    id: toAgentId(audit.repository),
    name: suggestedAgentName(audit),
    repository: audit.repository,
    version: "0.0.0",
    description: audit.description
      ? audit.description.slice(0, 500)
      : `Proposed ${audit.recommendedType} for ${audit.repository}. Not activated.`,
    domains: [...audit.domain],
    capabilities: [...audit.capabilities],
    inputs: [{ name: "prompt", type: "string", required: false }],
    outputs: [{ name: "result", type: "object" }],
    permissions: ["read", "compute"],
    sensitivity: "public",
    execution: "local-function",
    timeoutMs: 15_000,
  });

export const proposeCapability = (audit: RepositoryAudit): CapabilityProposal => {
  const skipReason = skipReasonFor(audit);
  const capabilities = [...audit.capabilities];
  const base = {
    repository: audit.repository,
    suggestedAgent: suggestedAgentName(audit),
    capabilities,
    status: "proposed" as const,
    enabled: false as const,
  };
  if (skipReason) {
    return parseCapabilityProposal({
      ...base,
      skipReason,
    });
  }
  return parseCapabilityProposal({
    ...base,
    document: draftDocument(audit),
  });
};

export const proposeCapabilities = (audits: readonly RepositoryAudit[]): CapabilityProposal[] =>
  audits.map(proposeCapability);

export const reviewProposal = (
  proposal: CapabilityProposal,
  decision: CapabilityProposalDecision,
): CapabilityProposal => {
  if (decision.action === "edit" && !decision.document) {
    throw new Error("Edit requires a replacement agent.json document.");
  }
  if (decision.action === "approve" && !proposal.document && !decision.document) {
    throw new Error("Cannot approve a skipped proposal without an agent.json document.");
  }
  const nextStatus =
    decision.action === "approve" ? "approved" : decision.action === "edit" ? "edited" : "ignored";
  const next: CapabilityProposal = {
    repository: proposal.repository,
    suggestedAgent: decision.document?.name ?? proposal.suggestedAgent,
    capabilities: decision.document ? [...decision.document.capabilities] : proposal.capabilities,
    status: nextStatus,
    enabled: false,
  };
  const document = decision.document ?? proposal.document;
  if (document && nextStatus !== "ignored") next.document = document;
  if (proposal.skipReason && nextStatus === "ignored") next.skipReason = proposal.skipReason;
  if (decision.notes) next.notes = decision.notes;
  if (decision.reviewedAt) next.reviewedAt = decision.reviewedAt;
  return parseCapabilityProposal(next);
};

export const activateDiscoveredCapability = (
  proposal: CapabilityProposal,
): { activated: false; reason: "unreviewed-code" | "approval-does-not-enable" } => {
  if (proposal.status === "proposed") {
    return { activated: false, reason: "unreviewed-code" };
  }
  return { activated: false, reason: "approval-does-not-enable" };
};

const displayCapability = (capability: string) => capability.replaceAll("-", " ");

export const formatCapabilityDiscoveryNotice = (proposal: CapabilityProposal): string => {
  const repoName = proposal.repository.split("/")[1] ?? proposal.repository;
  const capabilities =
    proposal.capabilities.length > 0
      ? proposal.capabilities.map((capability) => `- ${displayCapability(capability)}`).join("\n")
      : "- none inferred";
  return [
    "NEW CAPABILITY DISCOVERED",
    "",
    "Repository:",
    repoName,
    "",
    "Suggested agent:",
    proposal.suggestedAgent,
    "",
    "Capabilities:",
    capabilities,
    "",
    "[Approve]",
    "[Edit]",
    "[Ignore]",
  ].join("\n");
};
