import { hintCapability } from "../core/intent";
import type { AnaGoal, AnaPlanStep } from "../core/schemas";
import type { RepoAgent } from "../protocol/agent";
import {
  DOMAIN_GOAL_ROUTES,
  domainAgentById,
  executableDomainMembers,
  selectDomainIdsForGoals,
  type DomainMember,
} from "./catalog";

export type DomainAgentLookup = {
  getById(id: string): RepoAgent | undefined;
};

const memberMatchesGoal = (member: DomainMember, goal: AnaGoal): boolean => {
  if (!member.goals || member.goals.length === 0) return false;
  return member.goals.includes(goal);
};

const specialistStep = (
  member: DomainMember,
  agent: RepoAgent,
  message: string,
  domainAgentId: string,
  preferredCapability?: string,
): AnaPlanStep | undefined => {
  const agentId = member.agentId;
  const fallbackCapability = member.capability;
  if (!agentId || !fallbackCapability) return undefined;
  const manifest = agent.manifest();
  const hinted = hintCapability(member.domain, message);
  const capability =
    hinted && manifest.capabilities.includes(hinted)
      ? hinted
      : preferredCapability && manifest.capabilities.includes(preferredCapability)
        ? preferredCapability
        : fallbackCapability;
  if (!manifest.capabilities.includes(capability)) return undefined;
  return {
    agentId,
    capability,
    domain: member.domain,
    domainAgentId,
    dependsOn: [],
  };
};

export const expandDomainMembers = (options: {
  domainAgentId: string;
  goals: readonly AnaGoal[];
  index: DomainAgentLookup;
  message: string;
  preferredCapability?: string;
}): { steps: AnaPlanStep[]; available: boolean } => {
  const definition = domainAgentById(options.domainAgentId);
  if (!definition) return { steps: [], available: false };

  const matchingMembers = executableDomainMembers(definition).filter((member) =>
    options.goals.some((goal) => memberMatchesGoal(member, goal)),
  );
  const candidates =
    options.goals.length === 0 ? executableDomainMembers(definition) : matchingMembers;

  const steps: AnaPlanStep[] = [];
  const seen = new Set<string>();
  for (const member of candidates) {
    const agent = member.agentId ? options.index.getById(member.agentId) : undefined;
    if (!agent) continue;
    const step = specialistStep(
      member,
      agent,
      options.message,
      definition.id,
      options.preferredCapability,
    );
    if (!step) continue;
    const key = `${step.agentId}:${step.capability}`;
    if (seen.has(key)) continue;
    seen.add(key);
    steps.push(step);
  }
  return { steps, available: steps.length > 0 };
};

export const planFromDomainGoals = (options: {
  goals: readonly AnaGoal[];
  index: DomainAgentLookup;
  message: string;
  preferredCapability?: string;
}): { selectedDomains: string[]; steps: AnaPlanStep[]; unavailableAgents: string[] } => {
  const selectedDomains = selectDomainIdsForGoals(options.goals);
  const steps: AnaPlanStep[] = [];
  const unavailableAgents: string[] = [];
  const seen = new Set<string>();

  for (const goal of options.goals) {
    for (const route of DOMAIN_GOAL_ROUTES[goal]) {
      if (route.kind === "specialist") {
        const agent = options.index.getById(route.agentId);
        if (!agent) {
          if (!unavailableAgents.includes(route.agentId)) unavailableAgents.push(route.agentId);
          continue;
        }
        const key = `${route.agentId}:${route.capability}`;
        if (seen.has(key)) continue;
        seen.add(key);
        steps.push({
          agentId: route.agentId,
          capability: route.capability,
          domain: route.domain,
          dependsOn: [],
        });
        continue;
      }

      const expanded = expandDomainMembers({
        domainAgentId: route.domainAgentId,
        goals: options.goals,
        index: options.index,
        message: options.message,
        ...(options.preferredCapability
          ? { preferredCapability: options.preferredCapability }
          : {}),
      });
      if (!expanded.available) {
        if (!unavailableAgents.includes(route.domainAgentId)) {
          unavailableAgents.push(route.domainAgentId);
        }
        continue;
      }
      for (const step of expanded.steps) {
        const key = `${step.agentId}:${step.capability}`;
        if (seen.has(key)) continue;
        seen.add(key);
        steps.push(step);
      }
    }
  }

  unavailableAgents.sort();
  return { selectedDomains, steps, unavailableAgents };
};
