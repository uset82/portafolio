import { phase2Classifications } from "../repositories/classification-policy";
import type { RecommendedType } from "../repositories/schemas";

export type Wave2IntegrationKind = "agent" | "tool" | "electronics-tool" | "knowledge" | "disabled";

export type Wave2NamedIntegration = {
  repository: string;
  kind: Wave2IntegrationKind;
  classifiedAs: RecommendedType;
  agentId?: string;
  capability?: string;
};

export type Wave2ToolCard = {
  capability: string;
  repository: string;
  role: "tool" | "knowledge";
  title: string;
  summary: string;
  facts: readonly string[];
  relatedRepositories?: readonly string[];
};

/**
 * Spec wave-2 names, integrated as Phase 2 classified — not retyped, not enabled.
 * SmartHomeControl is a tool of the electronics cluster rather than its own LLM agent.
 */
export const WAVE2_NAMED_INTEGRATION: readonly Wave2NamedIntegration[] = [
  {
    repository: "uset82/mentora",
    kind: "agent",
    classifiedAs: "agent",
    agentId: "mentora",
  },
  {
    repository: "uset82/smartapply-app",
    kind: "agent",
    classifiedAs: "agent",
    agentId: "smartapply",
  },
  {
    repository: "uset82/Thesis-Writer-Kit",
    kind: "agent",
    classifiedAs: "agent",
    agentId: "thesis-writer",
  },
  {
    repository: "uset82/StillasCalculator",
    kind: "tool",
    classifiedAs: "tool",
    agentId: "stillas",
    capability: "scaffolding-info",
  },
  {
    repository: "uset82/SmartHomeControl",
    kind: "electronics-tool",
    classifiedAs: "tool",
    agentId: "electronics-agent",
    capability: "smart-home",
  },
  {
    repository: "uset82/avatar-studio",
    kind: "knowledge",
    classifiedAs: "knowledge",
  },
  {
    repository: "uset82/3Doodle",
    kind: "knowledge",
    classifiedAs: "knowledge",
  },
  {
    repository: "uset82/iFoundYou",
    kind: "knowledge",
    classifiedAs: "knowledge",
  },
  {
    repository: "uset82/Paper2Video",
    kind: "disabled",
    classifiedAs: "disabled",
  },
];

export const ELECTRONICS_TOOL_CARDS: readonly Wave2ToolCard[] = [
  {
    capability: "traffic-light",
    repository: "uset82/TRAFFICLIGHT",
    role: "tool",
    title: "Traffic Light",
    summary:
      "ELE201 traffic-light firmware on a Nucleo-F767ZI. Host catalog only; the STM32 image is not executed.",
    facts: [
      "Course work for ELE201 assignment 2 on STM32F767ZI (Nucleo-F767ZI) using STM32Cube HAL.",
      "External LEDs: PB8 red, PB9 yellow, PB10 green, wired active-high.",
      "Pedestrian button on PD3 (EXTI3 interrupt).",
      "Timing uses TIM3 and EXTI instead of HAL_Delay.",
      "On start, only the red LED is on.",
    ],
    relatedRepositories: ["uset82/piano-", "uset82/REACTIONGAME"],
  },
  {
    capability: "fpga-uart",
    repository: "uset82/RS232_VHD_DE2115",
    role: "knowledge",
    title: "FPGA/UART Knowledge",
    summary:
      "ELE111 RS-232 coursework on the DE2-115. Classified as knowledge; this is not a live FPGA tool.",
    facts: [
      "ELE111 semester project 2025: RS-232 on an Altera/Intel DE2-115 FPGA board.",
      "Point-to-point serial between two DE2-115 boards.",
      "README describes configurable baud rates and status visualization.",
    ],
  },
  {
    capability: "microcontroller",
    repository: "uset82/MicrocontrollerPiano",
    role: "tool",
    title: "Microcontroller",
    summary:
      "STM32 Nucleo piano firmware catalog. Related coursework stays knowledge, not a second LLM agent.",
    facts: [
      "Compact digital piano on Nucleo-F767ZI with seven push buttons and PWM-generated notes.",
      "A record button captures up to five seconds of performance for playback.",
      "Sound output is described as PB8 (TIM4 CH3 PWM) to a buzzer or speaker.",
    ],
    relatedRepositories: ["uset82/hvl2025-microcontroller-assignment3", "uset82/piano-"],
  },
  {
    capability: "smart-home",
    repository: "uset82/SmartHomeControl",
    role: "tool",
    title: "Smart Home",
    summary:
      "Flask smart-home control utility. Tool in the electronics cluster, not a specialist LLM.",
    facts: [
      "Flask web app for device monitoring and control.",
      "README describes serial integration with FPGA-connected hardware and a DS3231 RTC.",
      "Features listed in the README include lights/fans control and weather lookup.",
    ],
  },
  {
    capability: "watering-system",
    repository: "uset82/Automatic-Watering-Elephant",
    role: "tool",
    title: "Watering System",
    summary:
      "ADA525 dual-microcontroller plant watering project. Deterministic tool, not an LLM agent.",
    facts: [
      "Course ADA525 HW/SW System Design at Western Norway University of Applied Sciences.",
      "README describes an autonomous watering system with a rotating table mechanism.",
      "Author credited in the README as Carlos Carpio, dated December 2025.",
    ],
    relatedRepositories: ["uset82/elefante"],
  },
];

export const STILLAS_TOOL_CARD: Wave2ToolCard = {
  capability: "scaffolding-info",
  repository: "uset82/StillasCalculator",
  role: "tool",
  title: "Stillas Calculator",
  summary:
    "Scaffolding calculator project card. Load formulas are not extracted, so this host does not compute spans.",
  facts: [
    "Public repository uset82/StillasCalculator is a Next.js scaffolding calculator.",
    "Phase 2 classified it as a deterministic tool, not a specialist LLM.",
    "This adapter returns catalog facts only until a reviewed formula core is extracted.",
  ],
};

export const WAVE2_KNOWLEDGE_REPOSITORIES = WAVE2_NAMED_INTEGRATION.filter(
  (entry) => entry.kind === "knowledge",
).map((entry) => entry.repository);

export const WAVE2_DISABLED_REPOSITORIES = WAVE2_NAMED_INTEGRATION.filter(
  (entry) => entry.kind === "disabled",
).map((entry) => entry.repository);

export const WAVE2_HOST_AGENT_IDS = WAVE2_NAMED_INTEGRATION.filter((entry) => entry.agentId).map(
  (entry) => entry.agentId as string,
);

export const assertWave2MatchesClassification = () => {
  for (const entry of WAVE2_NAMED_INTEGRATION) {
    const classified = phase2Classifications[entry.repository];
    if (!classified) {
      throw new Error(`Wave 2 repository missing from Phase 2 policy: ${entry.repository}`);
    }
    if (classified.recommendedType !== entry.classifiedAs) {
      throw new Error(
        `${entry.repository}: wave-2 integration expected ${entry.classifiedAs}, Phase 2 has ${classified.recommendedType}`,
      );
    }
  }

  for (const card of ELECTRONICS_TOOL_CARDS) {
    const classified = phase2Classifications[card.repository];
    if (!classified) {
      throw new Error(`Electronics tool missing from Phase 2 policy: ${card.repository}`);
    }
    const expected = card.role === "knowledge" ? "knowledge" : "tool";
    if (classified.recommendedType !== expected) {
      throw new Error(
        `${card.repository}: electronics ${card.capability} expected ${expected}, Phase 2 has ${classified.recommendedType}`,
      );
    }
  }
};
