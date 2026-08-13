import { PAPER2VIDEO_EXCLUDED } from "../domains/catalog";
import { tokenize } from "../discovery/embed";
import type { RepositoryAudit } from "../repositories/schemas";
import { fingerprintInput } from "../core/provenance";
import type { AnaProvenance } from "../core/schemas";

export const ANA_KNOWLEDGE_AGENT_ID = "ana-knowledge";
export const ANA_PORTFOLIO_NAV_LIMIT = 8;

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "ask",
  "built",
  "carlos",
  "combine",
  "did",
  "does",
  "for",
  "has",
  "have",
  "in",
  "involving",
  "my",
  "of",
  "or",
  "portfolio",
  "project",
  "projects",
  "the",
  "to",
  "what",
  "which",
]);

const DOMAIN_ALIASES: Record<string, readonly string[]> = {
  ai: ["ai-tooling", "music", "3d", "design"],
  creativ: ["music", "3d", "design", "ai-tooling"],
  creativity: ["music", "3d", "design", "ai-tooling"],
  electronics: ["electronics", "embedded", "iot", "fpga"],
  embedded: ["electronics", "embedded", "iot", "fpga"],
  fpga: ["fpga", "electronics", "embedded"],
  iot: ["iot", "embedded", "electronics"],
  music: ["music"],
  "3d": ["3d", "design"],
};

export type PortfolioKnowledgeHit = {
  repository: string;
  href: string;
  domains: string[];
  capabilities: string[];
  recommendedType: "agent" | "tool" | "knowledge";
  description?: string;
};

export const isSearchablePortfolioAudit = (audit: RepositoryAudit): boolean =>
  audit.visibility === "public" &&
  audit.recommendedType !== "disabled" &&
  audit.status !== "fork" &&
  audit.status !== "empty" &&
  audit.repository !== PAPER2VIDEO_EXCLUDED;

const queryTokens = (query: string): string[] =>
  [...new Set(tokenize(query))].filter((token) => !STOPWORDS.has(token) && token.length > 1);

const expandedDomains = (tokens: readonly string[]): Set<string> => {
  const domains = new Set<string>();
  for (const token of tokens) {
    const aliases = DOMAIN_ALIASES[token];
    if (aliases) {
      for (const domain of aliases) domains.add(domain);
    }
  }
  return domains;
};

const scoreAudit = (
  audit: RepositoryAudit,
  tokens: readonly string[],
  domains: Set<string>,
): number => {
  if (tokens.length === 0 && domains.size === 0) return 0;
  let score = 0;
  const name = tokenize(audit.repository);
  const description = tokenize(audit.description ?? "");
  const capabilities = new Set(audit.capabilities);
  const auditDomains = new Set<string>(audit.domain);
  for (const token of tokens) {
    if (name.includes(token)) score += 3;
    if (description.includes(token)) score += 1;
    if (capabilities.has(token) || audit.capabilities.some((item) => item.includes(token)))
      score += 2;
    if (auditDomains.has(token)) score += 3;
  }
  for (const domain of domains) {
    if (auditDomains.has(domain)) score += 4;
  }
  if (audit.hasLLM && tokens.includes("ai")) score += 2;
  return score;
};

export const searchPortfolioKnowledge = (
  query: string,
  audits: readonly RepositoryAudit[],
  limit: number = ANA_PORTFOLIO_NAV_LIMIT,
): PortfolioKnowledgeHit[] => {
  const tokens = queryTokens(query);
  const domains = expandedDomains(tokens);
  const ranked = audits
    .filter(isSearchablePortfolioAudit)
    .map((audit) => ({ audit, score: scoreAudit(audit, tokens, domains) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.audit.repository.localeCompare(right.audit.repository);
    })
    .slice(0, Math.max(1, limit));

  return ranked.map((entry) => ({
    repository: entry.audit.repository,
    href: `https://github.com/${entry.audit.repository}`,
    domains: [...entry.audit.domain],
    capabilities: [...entry.audit.capabilities],
    recommendedType:
      entry.audit.recommendedType === "agent" || entry.audit.recommendedType === "tool"
        ? entry.audit.recommendedType
        : "knowledge",
    ...(entry.audit.description ? { description: entry.audit.description } : {}),
  }));
};

export const displayPortfolioProjectName = (repository: string): string => {
  const slug = repository.split("/")[1] ?? repository;
  if (/[-_]/.test(slug)) {
    return slug
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  if (slug === slug.toLowerCase()) return slug;
  return slug;
};

const typeLabel = (type: PortfolioKnowledgeHit["recommendedType"]): string => {
  if (type === "agent") return "agent candidate";
  if (type === "tool") return "tool";
  return "knowledge";
};

export const formatPortfolioNavigation = (options: {
  query: string;
  hits: readonly PortfolioKnowledgeHit[];
  electronicsRegistered?: boolean;
}): { answer: string; provenance: AnaProvenance[]; assumptions: string[] } => {
  const producedAt = new Date().toISOString();
  const fingerprint = fingerprintInput({ query: options.query });
  const lines = [
    "ANA searched public repository knowledge instead of inventing a case study.",
    "",
    "MATCHES",
  ];
  if (options.hits.length === 0) {
    lines.push(
      "No public owned repositories matched that navigation query. ANA will not invent a project list.",
    );
  } else {
    for (const hit of options.hits) {
      const domains = hit.domains.length > 0 ? hit.domains.join(", ") : "uncategorized";
      lines.push(
        `- ${hit.repository} — public ${domains} ${typeLabel(hit.recommendedType)}. ${hit.href}`,
      );
    }
  }
  lines.push("", "SOURCES");
  lines.push(
    "Public GitHub audit of owned repositories. Disabled, private, empty, and fork repositories are omitted.",
  );
  lines.push("ANA did not invent metrics, employers, or contribution claims.");
  if (options.electronicsRegistered) {
    lines.push(
      "The electronics specialist is registered but was not executed; this answer is catalog navigation, not a live tool run.",
    );
  }
  const provenance: AnaProvenance[] = options.hits.map((hit) => ({
    statement: `${hit.repository} is a public ${hit.domains.join("/")} ${typeLabel(hit.recommendedType)}.`,
    agentId: ANA_KNOWLEDGE_AGENT_ID,
    repository: hit.repository,
    capability: "ask-portfolio",
    producedAt,
    inputFingerprint: fingerprint,
  }));
  return {
    answer: lines.join("\n"),
    provenance,
    assumptions: [
      "Navigation lists public owned repositories from the audit registry, not private résumé or held case-study copy.",
    ],
  };
};
