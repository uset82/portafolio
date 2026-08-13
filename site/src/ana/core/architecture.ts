/**
 * Confirmed Phase 29 runtime path. This is a map of existing modules, not a new orchestrator.
 * Public visitors still talk to CC AI; POST /api/ana stays gated.
 */
export const ANA_RUNTIME_PATH = [
  "user",
  "ana",
  "planner",
  "registry",
  "capability-selection",
  "specialists-tools",
  "sandbox",
  "result-bus",
  "verification",
  "synthesis",
  "user",
] as const;

export type AnaRuntimeStage = (typeof ANA_RUNTIME_PATH)[number];

export const ANA_RUNTIME_MODULES = {
  user: "POST /api/ana via createAnaPostHandler; typed visitor questions remain /api/cc-ai",
  ana: "runAna",
  planner: "draftPlan / understandIntent",
  registry: "indexRepoAgents (runtime SpecialistIndex); AgentRegistry for admission",
  "capability-selection": "routeIntent / planFromDomainGoals / rankCapabilitiesSync",
  "specialists-tools": "executePlan → RepoAgent.execute",
  sandbox: "createAnaSandbox / sandbox.runAgent; runRepository denied in-process",
  "result-bus": "AnaTraceEvent[] and AgentResponse[] from executePlan",
  verification: "completeVerification",
  synthesis: "synthesizeAnaResult",
} as const;

export type AnaRemainingGap = {
  id: string;
  summary: string;
};

export const ANA_REMAINING_GAPS: readonly AnaRemainingGap[] = [
  {
    id: "public-assistant",
    summary:
      "CC AI remains the public visitor assistant. POST /api/ana and exploration chips stay gated by ANA_SPECIALISTS_ENABLED.",
  },
  {
    id: "specialists-disabled",
    summary:
      "Committed audits stay enabled: false. The production runtime registry catalog is empty until a human enablement decision.",
  },
  {
    id: "named-catalog-routing",
    summary:
      "Default selection still names known specialists in the domain catalog, intent keywords, and DAG policy. Protocol execute/verify/synthesize are repository-agnostic; default routing is not fully catalog-free.",
  },
  {
    id: "host-adapters",
    summary:
      "ASTRAEA, pinaculo, StrudelAI, and wave-2 specialists still live as in-repo host adapters. Remotes are not executed from GitHub.",
  },
  {
    id: "spec-diagram-placeholders",
    summary:
      "Energy, Avatar, Video, Design, and market-research appear in the Phase 29 diagram but are catalog, knowledge, or unavailable entries, not executable host adapters.",
  },
  {
    id: "sandbox-docker",
    summary: "In-process runRepository is denied. Docker isolation is a later provider.",
  },
  {
    id: "repo2agent-unpublished",
    summary:
      "Repo2Agent exists as pnpm repo2agent. It is not an npm package. publish is denied. site/package.json stays private.",
  },
  {
    id: "combined-analysis-opt-in",
    summary: "Combined analysis is consent-gated and is not a public homepage chip.",
  },
  {
    id: "ask-portfolio-not-biography",
    summary:
      "Ask My Portfolio navigates public audits in-process. Biography, CV, and case-study questions still defer to CC AI.",
  },
  {
    id: "private-repos",
    summary: "Private repositories never enter the public registry. Contents are not inspected.",
  },
  {
    id: "visitor-permissions",
    summary:
      "Visitor grant remains read + compute. Write and external-action stay denied without an explicit grant.",
  },
  {
    id: "debug-off",
    summary: "ANA_DEBUG_ENABLED stays false in public deploys.",
  },
  {
    id: "phase-30-dod",
    summary:
      "Phase 30 Definition of Done is verified in-process with fixtures. Public ANA stays gated. Production ANA is not live.",
  },
];
