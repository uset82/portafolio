export type AnaExplorationChannel = "ana" | "cc-ai";

export type AnaExplorationId =
  | "career"
  | "education"
  | "personality"
  | "business"
  | "engineering"
  | "music"
  | "astrology"
  | "numerology"
  | "projects";

export type AnaExplorationPrompt = {
  id: AnaExplorationId;
  label: string;
  prompt: string;
  channel: AnaExplorationChannel;
  requiredAgentIds: readonly string[];
};

export const ANA_EXPLORATION_CATALOG: readonly AnaExplorationPrompt[] = [
  {
    id: "career",
    label: "Career",
    prompt: "I want career advice for software engineering.",
    channel: "ana",
    requiredAgentIds: ["mentora", "smartapply"],
  },
  {
    id: "education",
    label: "Education",
    prompt: "I study software engineering and want education guidance.",
    channel: "ana",
    requiredAgentIds: ["mentora"],
  },
  {
    id: "personality",
    label: "Personality",
    prompt: "Help me explore a personality analysis.",
    channel: "ana",
    requiredAgentIds: ["astraea", "pinaculo"],
  },
  {
    id: "business",
    label: "Business",
    prompt: "I want to start a music company.",
    channel: "ana",
    requiredAgentIds: ["business"],
  },
  {
    id: "engineering",
    label: "Engineering",
    prompt: "Help me understand an STM32 interrupt problem.",
    channel: "ana",
    requiredAgentIds: ["electronics-agent"],
  },
  {
    id: "music",
    label: "Music",
    prompt: "Generate a live-coding music pattern.",
    channel: "ana",
    requiredAgentIds: ["strudel"],
  },
  {
    id: "astrology",
    label: "Astrology",
    prompt: "Please calculate a natal chart.",
    channel: "ana",
    requiredAgentIds: ["astraea"],
  },
  {
    id: "numerology",
    label: "Numerology",
    prompt: "Please calculate a numerology profile.",
    channel: "ana",
    requiredAgentIds: ["pinaculo"],
  },
  {
    id: "projects",
    label: "My Projects",
    prompt: "Which projects best show Carlos’s AI work?",
    channel: "cc-ai",
    requiredAgentIds: [],
  },
];

export const selectExplorationPrompts = (options: {
  orchestratorEnabled?: boolean;
  availableAgentIds?: readonly string[];
}): AnaExplorationPrompt[] => {
  if (options.orchestratorEnabled !== true) return [];
  const available = new Set(options.availableAgentIds ?? []);
  const specialistPrompts = ANA_EXPLORATION_CATALOG.filter(
    (entry) =>
      entry.channel === "ana" &&
      entry.requiredAgentIds.length > 0 &&
      entry.requiredAgentIds.every((agentId) => available.has(agentId)),
  );
  if (specialistPrompts.length === 0) return [];
  const projects = ANA_EXPLORATION_CATALOG.find((entry) => entry.id === "projects");
  return projects ? [...specialistPrompts, projects] : specialistPrompts;
};

export type ObservatorySpecialistRef = {
  artifactId: "astraea" | "pinaculo" | "sound-lab" | "electronics-ai";
  agentId: string;
  label: string;
};

export const OBSERVATORY_SPECIALIST_REFS: readonly ObservatorySpecialistRef[] = [
  { artifactId: "astraea", agentId: "astraea", label: "ASTRAEA" },
  { artifactId: "pinaculo", agentId: "pinaculo", label: "PINÁCULO" },
  { artifactId: "sound-lab", agentId: "strudel", label: "Sound Lab" },
  { artifactId: "electronics-ai", agentId: "electronics-agent", label: "Electronics" },
];

export type ObservatorySpecialistStatus = ObservatorySpecialistRef & {
  state: "active" | "standby";
};

export const observatorySpecialistStatuses = (
  activeAgentIds: readonly string[] = [],
): ObservatorySpecialistStatus[] => {
  const active = new Set(activeAgentIds);
  return OBSERVATORY_SPECIALIST_REFS.map((entry) => ({
    ...entry,
    state: active.has(entry.agentId) ? "active" : "standby",
  }));
};
