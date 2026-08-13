import type { AnaGoal } from "../core/schemas";
import type { RepositoryDomain } from "../repositories/schemas";

export const DOMAIN_AGENT_IDS = [
  "creative",
  "engineering",
  "personal-insight",
  "education-agent",
  "career-agent",
] as const;

export type DomainAgentId = (typeof DOMAIN_AGENT_IDS)[number];

export type DomainMemberKind = "specialist" | "knowledge" | "disabled";

export type DomainMember = {
  repository: string;
  kind: DomainMemberKind;
  agentId?: string;
  capability?: string;
  domain: RepositoryDomain;
  goals?: readonly AnaGoal[];
};

export type DomainAgentDefinition = {
  id: DomainAgentId;
  name: string;
  domains: readonly RepositoryDomain[];
  members: readonly DomainMember[];
};

export type DomainGoalRoute =
  | { kind: "domain"; domainAgentId: DomainAgentId }
  | {
      kind: "specialist";
      agentId: string;
      capability: string;
      domain: RepositoryDomain;
    };

/**
 * Five domain agents. Knowledge/disabled members are catalogued but never executed.
 * Paper2Video stays out: it is classified disabled despite the spec tree listing it.
 * Energy has no classified public repository, so Engineering does not invent one.
 */
export const DOMAIN_AGENTS: readonly DomainAgentDefinition[] = [
  {
    id: "creative",
    name: "Creative",
    domains: ["music", "3d", "design"],
    members: [
      {
        repository: "uset82/StrudelAI",
        kind: "specialist",
        agentId: "strudel",
        capability: "pattern-generate",
        domain: "music",
        goals: ["pattern-generate"],
      },
      {
        repository: "uset82/LyriGenie",
        kind: "knowledge",
        domain: "music",
      },
      {
        repository: "uset82/avatar-studio",
        kind: "knowledge",
        domain: "3d",
      },
      {
        repository: "uset82/3Doodle",
        kind: "knowledge",
        domain: "3d",
      },
    ],
  },
  {
    id: "engineering",
    name: "Engineering",
    domains: ["electronics", "embedded", "iot", "fpga"],
    members: [
      {
        repository: "uset82/TRAFFICLIGHT",
        kind: "specialist",
        agentId: "electronics-agent",
        capability: "traffic-light",
        domain: "electronics",
        goals: ["capability-search"],
      },
      {
        repository: "uset82/SmartHomeControl",
        kind: "knowledge",
        domain: "iot",
      },
      {
        repository: "uset82/RS232_VHD_DE2115",
        kind: "knowledge",
        domain: "fpga",
      },
      {
        repository: "uset82/MicrocontrollerPiano",
        kind: "knowledge",
        domain: "embedded",
      },
    ],
  },
  {
    id: "personal-insight",
    name: "Personal Insight",
    domains: ["astrology", "numerology"],
    members: [
      {
        repository: "uset82/ASTROEA",
        kind: "specialist",
        agentId: "astraea",
        capability: "natal-chart",
        domain: "astrology",
        goals: ["personality-analysis", "natal-chart", "combined-analysis"],
      },
      {
        repository: "uset82/pinaculo",
        kind: "specialist",
        agentId: "pinaculo",
        capability: "numerology-profile",
        domain: "numerology",
        goals: ["personality-analysis", "numerology-profile", "combined-analysis"],
      },
    ],
  },
  {
    id: "education-agent",
    name: "Education",
    domains: ["education", "research"],
    members: [
      {
        repository: "uset82/mentora",
        kind: "specialist",
        agentId: "mentora",
        capability: "career-analysis",
        domain: "education",
        goals: ["career-analysis", "combined-analysis"],
      },
      {
        repository: "uset82/Thesis-Writer-Kit",
        kind: "specialist",
        agentId: "thesis-writer",
        capability: "thesis-outline",
        domain: "research",
      },
      {
        repository: "uset82/hvl2025-microcontroller-assignment3",
        kind: "knowledge",
        domain: "education",
      },
    ],
  },
  {
    id: "career-agent",
    name: "Career",
    domains: ["career"],
    members: [
      {
        repository: "uset82/smartapply-app",
        kind: "specialist",
        agentId: "smartapply",
        capability: "application-track",
        domain: "career",
        goals: ["career-analysis", "combined-analysis"],
      },
    ],
  },
];

export const DOMAIN_GOAL_ROUTES: Record<AnaGoal, readonly DomainGoalRoute[]> = {
  "personality-analysis": [{ kind: "domain", domainAgentId: "personal-insight" }],
  "career-analysis": [
    { kind: "domain", domainAgentId: "education-agent" },
    { kind: "domain", domainAgentId: "career-agent" },
  ],
  "business-ideas": [
    { kind: "specialist", agentId: "business", capability: "business-ideas", domain: "career" },
  ],
  "natal-chart": [{ kind: "domain", domainAgentId: "personal-insight" }],
  "numerology-profile": [{ kind: "domain", domainAgentId: "personal-insight" }],
  "pattern-generate": [{ kind: "domain", domainAgentId: "creative" }],
  "capability-search": [{ kind: "domain", domainAgentId: "engineering" }],
  "ask-portfolio": [],
  "combined-analysis": [
    { kind: "domain", domainAgentId: "personal-insight" },
    { kind: "domain", domainAgentId: "education-agent" },
    { kind: "domain", domainAgentId: "career-agent" },
    { kind: "specialist", agentId: "business", capability: "business-ideas", domain: "career" },
    {
      kind: "specialist",
      agentId: "market-research",
      capability: "market-research",
      domain: "career",
    },
  ],
};

export const PAPER2VIDEO_EXCLUDED = "uset82/Paper2Video";

export const domainAgentById = (id: string): DomainAgentDefinition | undefined =>
  DOMAIN_AGENTS.find((agent) => agent.id === id);

export const selectDomainIdsForGoals = (goals: readonly AnaGoal[]): string[] => {
  const ids: string[] = [];
  for (const goal of goals) {
    for (const route of DOMAIN_GOAL_ROUTES[goal]) {
      if (route.kind !== "domain") continue;
      if (!ids.includes(route.domainAgentId)) ids.push(route.domainAgentId);
    }
  }
  return ids;
};

export const domainsForGoals = (goals: readonly AnaGoal[]): RepositoryDomain[] => {
  const domains: RepositoryDomain[] = [];
  for (const goal of goals) {
    for (const route of DOMAIN_GOAL_ROUTES[goal]) {
      if (route.kind === "specialist") {
        if (!domains.includes(route.domain)) domains.push(route.domain);
        continue;
      }
      const definition = domainAgentById(route.domainAgentId);
      if (!definition) continue;
      for (const domain of definition.domains) {
        if (!domains.includes(domain)) domains.push(domain);
      }
    }
  }
  return domains;
};

export const executableDomainMembers = (definition: DomainAgentDefinition): DomainMember[] =>
  definition.members.filter(
    (member) =>
      member.kind === "specialist" &&
      member.agentId !== undefined &&
      member.capability !== undefined &&
      member.repository !== PAPER2VIDEO_EXCLUDED,
  );
