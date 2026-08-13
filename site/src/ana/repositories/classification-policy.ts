import type {
  AgentPotential,
  RecommendedType,
  RepositoryAudit,
  RepositoryDomain,
  RepositoryOverride,
  RepositoryStatus,
} from "./schemas";

export type Phase2Classification = {
  recommendedType: RecommendedType;
  domain?: readonly RepositoryDomain[];
  status?: RepositoryStatus;
  agentPotential?: AgentPotential;
  notes: string;
};

const agent = (
  domain: readonly RepositoryDomain[],
  notes: string,
  agentPotential: AgentPotential = "high",
): Phase2Classification => ({
  recommendedType: "agent",
  domain,
  agentPotential,
  notes,
});

const tool = (
  domain: readonly RepositoryDomain[],
  notes: string,
  agentPotential: AgentPotential = "low",
): Phase2Classification => ({
  recommendedType: "tool",
  domain,
  agentPotential,
  notes,
});

const knowledge = (
  notes: string,
  extras: Pick<Phase2Classification, "domain" | "status" | "agentPotential"> = {},
): Phase2Classification => ({
  recommendedType: "knowledge",
  agentPotential: extras.agentPotential ?? "low",
  notes,
  ...(extras.domain ? { domain: extras.domain } : {}),
  ...(extras.status ? { status: extras.status } : {}),
});

const disabled = (
  notes: string,
  extras: Pick<Phase2Classification, "status" | "agentPotential"> = {},
): Phase2Classification => ({
  recommendedType: "disabled",
  agentPotential: extras.agentPotential ?? "none",
  notes,
  ...(extras.status ? { status: extras.status } : {}),
});

/**
 * Human-approved Phase 2 runtime types. Inference in registry.generated.json is not
 * activation. Every public repository is assigned exactly one type. enabled stays false.
 */
export const phase2Classifications: Readonly<Record<string, Phase2Classification>> = {
  "uset82/ASTROEA": agent(
    ["astrology"],
    "Phase 6 Astrology Agent candidate. Dropped false career domain from README focus-area text. Not activated.",
  ),
  "uset82/pinaculo": agent(
    ["numerology"],
    "Phase 6 Numerology Agent candidate. Site status remains concept; this does not upgrade it. Not activated.",
  ),
  "uset82/StrudelAI": agent(
    ["music"],
    "Phase 6 Music Agent candidate. Dropped extra research/video domains. Not activated.",
  ),
  "uset82/mentora": agent(
    ["education"],
    "Named Education Agent candidate. College fork; Carlos is primary developer (Q.9). Status stays fork. Not activated.",
  ),
  "uset82/smartapply-app": agent(["career"], "Named Career Agent candidate. Not activated."),
  "uset82/Thesis-Writer-Kit": agent(["research"], "Named Research Agent candidate. Not activated."),

  "uset82/qr-code-generator": tool(["web"], "Deterministic QR generator. Tool, not an LLM agent."),
  "uset82/StillasCalculator": tool(
    ["construction"],
    "Deterministic scaffolding calculator. Generated agent/LLM signals are not enough for a specialist.",
  ),
  "uset82/TRAFFICLIGHT": tool(
    ["electronics", "embedded"],
    "Deterministic traffic-light state machine. Electronics tool, not a specialist LLM.",
  ),
  "uset82/MicrocontrollerPiano": tool(
    ["electronics", "embedded"],
    "Embedded piano firmware. Engineering tool, not a specialist LLM.",
  ),
  "uset82/piano-": tool(
    ["electronics", "embedded"],
    "Related microcontroller piano work. Tool in the electronics cluster.",
  ),
  "uset82/REACTIONGAME": tool(
    ["electronics", "embedded"],
    "Embedded reaction-game firmware. Tool, not a playable web agent.",
  ),
  "uset82/Automatic-Watering-Elephant": tool(
    ["iot", "embedded"],
    "Deterministic watering controller. Generated agent label rejected; this is a tool.",
  ),
  "uset82/SmartHomeControl": tool(
    ["iot", "embedded"],
    "Smart-home control utility. Dropped false FPGA domain. Tool, not a specialist LLM.",
  ),

  "uset82/3Doodle": knowledge("Wave-2 creative 3D project. Knowledge until a later domain agent.", {
    domain: ["3d"],
  }),
  "uset82/CRM_SaaS_Educativo": knowledge(
    "Educational CRM study. Searchable knowledge, not executable.",
  ),
  "uset82/EFFATA": knowledge("Early web experiment. Knowledge, not a specialist."),
  "uset82/LLM-Web-App": knowledge("Early LLM web experiment. Knowledge, not a named specialist."),
  "uset82/LyriGenie": knowledge(
    "Lyric-generation project. Knowledge until a Creative domain agent.",
    {
      domain: ["music"],
    },
  ),
  "uset82/MandelBro": knowledge("Interactive fractal explorer. Knowledge, not an ANA tool."),
  "uset82/Monkey-Tug-of-War": knowledge("Flutter game. Knowledge, not a specialist agent."),
  "uset82/My-Football-Game": knowledge(
    "Playable football game. Knowledge, not a specialist agent.",
  ),
  "uset82/QubeSolve": knowledge("Cube-solver app. Knowledge until a later tool adapter."),
  "uset82/RS232_VHD_DE2115": knowledge(
    "FPGA/UART coursework. Electronics knowledge, not a live tool.",
    {
      domain: ["fpga", "embedded"],
      status: "educational",
    },
  ),
  "uset82/ReportAIEquinor": knowledge("Report prototype. Knowledge, not a specialist."),
  "uset82/Suno-UDIO-Helper": knowledge(
    "Suno/Udio documentation site. Music knowledge, not an agent.",
    {
      domain: ["music"],
    },
  ),
  "uset82/Tetris": knowledge(
    "Course work on a teacher example (CC-BY-4.0). Knowledge, not an unrelated-fork disable.",
    { domain: ["game"], status: "fork", agentPotential: "none" },
  ),
  "uset82/avatar-studio": knowledge(
    "Wave-2 avatar pipeline. Knowledge until a Creative domain agent.",
    {
      domain: ["3d", "design"],
    },
  ),
  "uset82/bankAI": knowledge("Finance demo app. Knowledge, not a specialist agent.", {
    domain: ["finance", "web"],
  }),
  "uset82/chaclacayo": knowledge("Place/web study. Knowledge, not a specialist."),
  "uset82/cookthis-": knowledge("Recipe app experiment. Knowledge, not a deterministic ANA tool."),
  "uset82/diagramcloner": knowledge(
    "Diagram tooling. Rejected false numerology domain from name/token collision.",
    { domain: ["web"], status: "experiment" },
  ),
  "uset82/drone_Lips": knowledge("Drone game experiment. Knowledge, not a specialist.", {
    domain: ["drone", "game"],
  }),
  "uset82/elefante": knowledge("Course embedded sibling of the watering project. Knowledge.", {
    domain: ["embedded"],
    status: "educational",
  }),
  "uset82/gimmemycake": knowledge("Interactive game. Knowledge, not a specialist."),
  "uset82/hvl2025-microcontroller-assignment3": knowledge(
    "Named coursework assignment. Educational knowledge, not a tool adapter yet.",
    { domain: ["embedded", "electronics"], status: "educational" },
  ),
  "uset82/iFoundYou": knowledge("Wave-2 OSINT project. Knowledge until a later specialist.", {
    domain: ["osint"],
  }),
  "uset82/opennemoclaw": knowledge(
    "Personal AI-tooling platform. Knowledge, not a visitor specialist.",
    {
      domain: ["ai-tooling"],
    },
  ),
  "uset82/opennemoclawsite": knowledge("Companion site for OpenNemoClaw. Knowledge.", {
    domain: ["ai-tooling"],
  }),
  "uset82/pacha": knowledge("Design/web study. Knowledge, not a specialist.", {
    domain: ["design", "web"],
  }),
  "uset82/portafolio": knowledge(
    "ANA host repository. Knowledge only; never a domain specialist. Domain locked to portfolio.",
    { domain: ["portfolio"], status: "prototype", agentPotential: "medium" },
  ),
  "uset82/project-bolt-qrmollebakken-supabase": knowledge(
    "Early Bolt/Supabase QR experiment. Knowledge, not the QR tool.",
  ),
  "uset82/thedelegator": knowledge(
    "Multi-agent CLI for developers. Knowledge/tooling, not a visitor-facing specialist.",
    { domain: ["ai-tooling"] },
  ),
  "uset82/v0-banana-piano-app": knowledge(
    "Small piano experiment. Knowledge, not a tool adapter.",
    {
      status: "experiment",
    },
  ),
  "uset82/webdesigner": knowledge(
    "Design-system exhibit. Knowledge for CC AI /studio, not a visitor specialist agent.",
    { domain: ["design"] },
  ),

  "uset82/antigravity-vibe": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/CALLKIRO": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/chatgptvoiceeffect": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/clase-potatoe": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/DealDash-": disabled("Empty/near-empty placeholder. Disabled.", { status: "empty" }),
  "uset82/FreeCAD": disabled("Unrelated upstream FreeCAD clone. Disabled.", { status: "fork" }),
  "uset82/Jacobgolf": disabled("Near-empty placeholder. Disabled.", { status: "empty" }),
  "uset82/mini": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/nethunter-fix": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/opencode": disabled("Unrelated upstream fork. Disabled.", { status: "fork" }),
  "uset82/osiris": disabled("Unrelated OSINT upstream fork. Disabled.", { status: "fork" }),
  "uset82/pace-drone-commander": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/paginacuzco1": disabled("Empty placeholder. Disabled.", { status: "empty" }),
  "uset82/Paper2Video": disabled(
    "Upstream Paper2Video fork with no recorded Carlos contribution. Disabled despite later wave-2 mention.",
    { status: "fork" },
  ),
  "uset82/skills-github-pages": disabled("Empty GitHub Pages template. Disabled.", {
    status: "empty",
  }),
  "uset82/uset82": disabled("Profile README repo. Disabled as a capability source.", {
    status: "empty",
  }),
  "uset82/youtubedata": disabled("Empty placeholder. Disabled.", { status: "empty" }),
};

export const phase2SpecialistAgents = Object.entries(phase2Classifications)
  .filter(([, value]) => value.recommendedType === "agent")
  .map(([repository]) => repository)
  .sort((left, right) => left.localeCompare(right));

export const phase2Tools = Object.entries(phase2Classifications)
  .filter(([, value]) => value.recommendedType === "tool")
  .map(([repository]) => repository)
  .sort((left, right) => left.localeCompare(right));

export const toPhase2Override = (classification: Phase2Classification): RepositoryOverride => ({
  recommendedType: classification.recommendedType,
  enabled: false,
  notes: classification.notes,
  ...(classification.domain ? { domain: [...classification.domain] } : {}),
  ...(classification.status ? { status: classification.status } : {}),
  ...(classification.agentPotential ? { agentPotential: classification.agentPotential } : {}),
});

export const toPhase2OverridesFile = () => ({
  schemaVersion: 1 as const,
  overrides: Object.fromEntries(
    Object.entries(phase2Classifications)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([repository, classification]) => [repository, toPhase2Override(classification)]),
  ),
});

export const assertPhase2Classification = (audits: readonly RepositoryAudit[]) => {
  const names = audits
    .map((audit) => audit.repository)
    .sort((left, right) => left.localeCompare(right));
  const expected = Object.keys(phase2Classifications).sort((left, right) =>
    left.localeCompare(right),
  );
  if (names.join("\n") !== expected.join("\n")) {
    throw new Error(
      "Phase 2 policy and generated public registry do not cover the same repositories",
    );
  }

  for (const audit of audits) {
    const approved = phase2Classifications[audit.repository];
    if (!approved) throw new Error(`Missing Phase 2 classification for ${audit.repository}`);
    if (audit.recommendedType !== approved.recommendedType) {
      throw new Error(
        `${audit.repository}: expected ${approved.recommendedType}, received ${audit.recommendedType}`,
      );
    }
    if (audit.enabled) {
      throw new Error(`${audit.repository}: Phase 2 must not enable repositories`);
    }
    if (audit.visibility === "private") {
      throw new Error(
        `${audit.repository}: private repositories must not appear in the public classification`,
      );
    }
    if (approved.domain && audit.domain.join(",") !== approved.domain.join(",")) {
      throw new Error(
        `${audit.repository}: expected domain [${approved.domain.join(", ")}], received [${audit.domain.join(", ")}]`,
      );
    }
  }
};
