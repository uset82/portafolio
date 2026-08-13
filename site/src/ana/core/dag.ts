import type { AnaExecutionDag, AnaPlanStep } from "./schemas";

export const AGENT_DEPENDENCY_POLICY: Readonly<Record<string, readonly string[]>> = {
  career: ["education", "mentora", "education-agent"],
  "career-agent": ["education-agent", "education", "mentora"],
  smartapply: ["education-agent", "education", "mentora"],
  business: ["career", "career-agent", "smartapply", "astraea", "pinaculo", "personal-insight"],
};

export const stepId = (step: Pick<AnaPlanStep, "agentId" | "capability">) =>
  `${step.agentId}:${step.capability}`;

const unique = (values: readonly string[]) => [...new Set(values)];

export const applyAgentDependencies = (steps: readonly AnaPlanStep[]): AnaPlanStep[] => {
  const byAgent = new Map<string, AnaPlanStep>();
  for (const step of steps) {
    if (!byAgent.has(step.agentId)) byAgent.set(step.agentId, step);
  }
  const present = new Set(steps.map(stepId));
  return steps.map((step) => {
    const policy = AGENT_DEPENDENCY_POLICY[step.agentId] ?? [];
    const fromPolicy = policy.flatMap((agentId) => {
      const predecessor = byAgent.get(agentId);
      if (!predecessor || predecessor.agentId === step.agentId) return [];
      return [stepId(predecessor)];
    });
    const dependsOn = unique([...step.dependsOn, ...fromPolicy]).filter((id) => present.has(id));
    return { ...step, dependsOn };
  });
};

export const planExecutionWaves = (
  steps: readonly AnaPlanStep[],
): { waves: string[][]; cycles: string[][] } => {
  const ids = steps.map(stepId);
  const order = new Map(ids.map((id, index) => [id, index]));
  const idSet = new Set(ids);
  const indegree = new Map<string, number>();
  const children = new Map<string, string[]>();
  for (const id of ids) {
    indegree.set(id, 0);
    children.set(id, []);
  }
  for (const step of steps) {
    const id = stepId(step);
    const deps = unique(step.dependsOn.filter((dep) => idSet.has(dep)));
    indegree.set(id, deps.length);
    for (const dep of deps) {
      const list = children.get(dep) ?? [];
      list.push(id);
      children.set(dep, list);
    }
  }

  const remaining = new Set(ids);
  const waves: string[][] = [];
  let frontier = ids.filter((id) => indegree.get(id) === 0);
  frontier.sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));

  while (frontier.length > 0) {
    waves.push(frontier);
    const next: string[] = [];
    for (const id of frontier) remaining.delete(id);
    for (const id of frontier) {
      for (const child of children.get(id) ?? []) {
        if (!remaining.has(child)) continue;
        const degree = (indegree.get(child) ?? 1) - 1;
        indegree.set(child, degree);
        if (degree === 0) next.push(child);
      }
    }
    next.sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
    frontier = unique(next);
  }

  return {
    waves,
    cycles: remaining.size > 0 ? [ids.filter((id) => remaining.has(id))] : [],
  };
};

export const detectCycles = (steps: readonly AnaPlanStep[]): string[][] =>
  planExecutionWaves(steps).cycles;

const classifyExecution = (waves: readonly string[][], cycles: readonly string[][]) => {
  if (cycles.length > 0) return "mixed" as const;
  if (waves.length <= 1) return "parallel" as const;
  if (waves.every((wave) => wave.length === 1)) return "sequential" as const;
  return "mixed" as const;
};

export const buildExecutionDag = (steps: readonly AnaPlanStep[]): AnaExecutionDag => {
  const resolved = applyAgentDependencies(steps);
  const { waves, cycles } = planExecutionWaves(resolved);
  return {
    execution: classifyExecution(waves, cycles),
    nodes: resolved.map((step) => ({
      id: stepId(step),
      agentId: step.agentId,
      capability: step.capability,
      dependsOn: step.dependsOn,
    })),
    waves,
    cycles,
  };
};
