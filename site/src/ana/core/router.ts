import type { RepoAgent } from "../protocol/agent";
import type { RepositoryDomain } from "../repositories/schemas";
import { applyAgentDependencies, buildExecutionDag } from "./dag";
import { planFromDomainGoals } from "../domains/select";
import { rankCapabilitiesSync, topExecutableHit, type DiscoveryIndex } from "../discovery";
import { emptyExecutionDag, type AnaPlan, type AnaPlanStep } from "./schemas";

export type SpecialistIndex = {
  list(): readonly RepoAgent[];
  getById(id: string): RepoAgent | undefined;
  findByCapability(capability: string): readonly RepoAgent[];
  findByDomain(domain: RepositoryDomain): readonly RepoAgent[];
};

export type RouteIntentOptions = {
  discoveryIndex?: DiscoveryIndex;
  useEmbeddings?: boolean;
};

export const indexRepoAgents = (agents: readonly RepoAgent[]): SpecialistIndex => {
  const list = () => agents;
  return {
    list,
    getById: (id) => agents.find((agent) => agent.manifest().id === id),
    findByCapability: (capability) =>
      agents.filter((agent) => agent.manifest().capabilities.includes(capability)),
    findByDomain: (domain) => agents.filter((agent) => agent.manifest().domains.includes(domain)),
  };
};

export { buildExecutionDag } from "./dag";

export const collectMissingInputs = (
  steps: readonly AnaPlanStep[],
  provided: Record<string, unknown>,
  index: SpecialistIndex,
): string[] => {
  const missing: string[] = [];
  for (const step of steps) {
    const agent = index.getById(step.agentId);
    if (!agent) continue;
    for (const input of agent.manifest().inputs) {
      if (!input.required) continue;
      const value = provided[input.name];
      if (!(input.name in provided) || value === undefined || value === "") {
        if (!missing.includes(input.name)) missing.push(input.name);
      }
    }
  }
  return missing;
};

const preferredCapabilityFromDiscovery = (
  message: string,
  goals: readonly string[],
  options: RouteIntentOptions,
): string | undefined => {
  if (!goals.includes("capability-search") || !options.discoveryIndex) return undefined;
  const hits = rankCapabilitiesSync(message, options.discoveryIndex, {
    ...(options.useEmbeddings === false ? { useEmbeddings: false } : {}),
  });
  return topExecutableHit(hits)?.capability;
};

export const routeIntent = (
  plan: Omit<AnaPlan, "steps" | "missingInputs" | "unavailableAgents" | "dag">,
  index: SpecialistIndex,
  message: string,
  options: RouteIntentOptions = {},
): Pick<AnaPlan, "steps" | "unavailableAgents" | "dag" | "selectedDomains"> => {
  if (plan.kind !== "specialist") {
    return { steps: [], unavailableAgents: [], selectedDomains: [], dag: emptyExecutionDag() };
  }

  const preferredCapability = preferredCapabilityFromDiscovery(message, plan.goals, options);
  const planned = planFromDomainGoals({
    goals: plan.goals,
    index,
    message,
    ...(preferredCapability ? { preferredCapability } : {}),
  });
  const steps = applyAgentDependencies(planned.steps);
  return {
    steps,
    unavailableAgents: planned.unavailableAgents,
    selectedDomains: planned.selectedDomains,
    dag: buildExecutionDag(steps),
  };
};

export const selectPlanSteps = (
  plan: Omit<AnaPlan, "steps" | "missingInputs" | "unavailableAgents" | "dag">,
  index: SpecialistIndex,
  message: string,
  options: RouteIntentOptions = {},
): AnaPlanStep[] => routeIntent(plan, index, message, options).steps;
