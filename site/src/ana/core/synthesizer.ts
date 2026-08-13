import type { AgentResponse } from "../protocol/schemas";
import { collectProvenance, formatProvenanceSources } from "./provenance";
import type { AnaPlan, AnaProvenance, AnaResultStatus, AnaTraceEvent } from "./schemas";
import { ANA_PORTFOLIO_BOUNDARY } from "./schemas";
import type { AnaVerification } from "./verifier";
import type { SpecialistIndex } from "./router";
import { ANA_COMBINED_CONSENT_FIELD, ANA_COMBINED_CONSENT_PROMPT } from "../privacy/consent";

const SYMBOLIC_CAPABILITIES = new Set([
  "natal-chart",
  "transits",
  "synastry",
  "solar-return",
  "interpretation",
  "numerology-profile",
  "master-numbers",
  "life-cycles",
  "pinnacle-cycles",
]);

const CREATIVE_CAPABILITIES = new Set(["pattern-generate"]);

export type SynthesisKind = "symbolic" | "practical" | "creative";

export type ClassifiedResult = {
  agentId: string;
  capability: string;
  kind: SynthesisKind;
  summary: string;
  confidence?: number;
  status: AgentResponse["status"];
};

export type AnaSynthesis = {
  agreements: string[];
  contradictions: string[];
  highConfidenceFacts: string[];
  assumptions: string[];
  symbolicInterpretation: string[];
  practicalEvidence: string[];
  creativeOpportunities: string[];
  recommendations: string[];
  actionPlan: string[];
  combined: string;
};

const classifyCapability = (capability: string): SynthesisKind => {
  if (SYMBOLIC_CAPABILITIES.has(capability) || capability.startsWith("numerology")) {
    return "symbolic";
  }
  if (CREATIVE_CAPABILITIES.has(capability)) return "creative";
  return "practical";
};

const classifiedFrom = (
  responses: readonly AgentResponse[],
  provenance: readonly AnaProvenance[],
): ClassifiedResult[] =>
  responses.map((response) => {
    const capability =
      provenance.find((entry) => entry.agentId === response.agentId)?.capability ?? "unknown";
    const classified: ClassifiedResult = {
      agentId: response.agentId,
      capability,
      kind: classifyCapability(capability),
      summary: response.summary,
      status: response.status,
    };
    if (response.confidence !== undefined) classified.confidence = response.confidence;
    return classified;
  });

const successful = (items: readonly ClassifiedResult[]) =>
  items.filter((item) => item.status === "success" || item.status === "partial");

const ofKind = (items: readonly ClassifiedResult[], kind: SynthesisKind) =>
  items.filter((item) => item.kind === kind);

const cite = (item: ClassifiedResult) => `${item.summary} [${item.agentId}]`;

const unique = (values: readonly string[]) => [
  ...new Set(values.filter((value) => value.length > 0)),
];

export const buildAnaSynthesis = (options: {
  responses: readonly AgentResponse[];
  provenance: readonly AnaProvenance[];
  verification: AnaVerification;
  unavailableAgents: readonly string[];
}): AnaSynthesis => {
  const classified = classifiedFrom(options.responses, options.provenance);
  const ok = successful(classified);
  const symbolic = ofKind(ok, "symbolic");
  const practical = ofKind(ok, "practical");
  const creative = ofKind(ok, "creative");

  const contradictions = unique(options.verification.contradictions);
  const assumptions = unique(options.verification.assumptions);

  const agreements: string[] = [];
  if (ok.length === 1) {
    agreements.push(
      "Only one specialist result is available; ANA will not invent agreement with missing specialists.",
    );
  } else if (ok.length > 1 && contradictions.length === 0) {
    if (symbolic.length > 1) {
      agreements.push("Symbolic specialists did not report conflicting summaries.");
    }
    if (practical.length > 1) {
      agreements.push("Practical specialists did not report conflicting summaries.");
    }
    if (agreements.length === 0) {
      agreements.push("Returned specialist results do not conflict on a shared capability.");
    }
  }

  const flagged = new Set([
    ...options.verification.failedAgentIds,
    ...options.verification.invalidAgentIds,
    ...options.verification.unansweredAgentIds,
  ]);

  const highConfidenceFacts = practical
    .filter(
      (item) =>
        !flagged.has(item.agentId) && item.confidence !== undefined && item.confidence >= 0.7,
    )
    .map(cite);

  const recommendations: string[] = [];
  if (symbolic.length > 0 && practical.length > 0) {
    recommendations.push(
      "Keep symbolic interpretation separate from practical evidence. Do not treat astrology or numerology as career, medical, or legal facts.",
    );
  } else if (symbolic.length > 0) {
    recommendations.push(
      "Treat this as cultural interpretation only. ANA will not turn it into a factual plan.",
    );
  } else if (practical.length > 0 || creative.length > 0) {
    recommendations.push(
      "Weight practical and creative specialist evidence; do not fill gaps with invented domain claims.",
    );
  }
  if (contradictions.length > 0) {
    recommendations.push("Resolve contradictions before acting. ANA does not pick a winner.");
  }
  if (options.verification.findings.length > 0) {
    recommendations.push(
      "Verification flagged specialist output. Do not treat flagged results as settled facts.",
    );
  }
  if (options.unavailableAgents.length > 0) {
    recommendations.push("Do not invent answers for unregistered specialists.");
  }
  if (recommendations.length === 0) {
    recommendations.push("ANA delegated this request and will not invent extra domain output.");
  }

  const actionPlan: string[] = [];
  if (options.unavailableAgents.length > 0) {
    actionPlan.push(
      `Wait for registered specialists (${options.unavailableAgents.join(", ")}) rather than filling those gaps from other domains.`,
    );
  }
  if (contradictions.length > 0) {
    actionPlan.push("Re-run or compare the disagreeing specialists on the disputed capability.");
  }
  if (symbolic.length > 0 && practical.length === 0) {
    actionPlan.push(
      "Do not use this output as an action plan for work, health, or legal decisions.",
    );
  } else if (practical.length > 0) {
    actionPlan.push("Follow up on the practical evidence with the cited repositories.");
  } else if (creative.length > 0) {
    actionPlan.push("Review the creative specialist output as a draft, not a finished production.");
  }

  const combined = [
    `ANA delegated this request instead of answering the specialist domain herself.`,
    `${symbolic.length} symbolic, ${practical.length} practical, and ${creative.length} creative result(s) were compared.`,
    contradictions.length > 0
      ? "Conflicting specialist claims are listed separately and are not treated as facts."
      : "No capability-level conflict was recorded.",
    "ANA did not invent domain output and did not concatenate specialist answers as if they were one voice.",
  ].join(" ");

  return {
    agreements,
    contradictions,
    highConfidenceFacts,
    assumptions,
    symbolicInterpretation: symbolic.map(cite),
    practicalEvidence: practical.map(cite),
    creativeOpportunities: creative.map(cite),
    recommendations,
    actionPlan,
    combined,
  };
};

const section = (title: string, lines: readonly string[]) =>
  `${title}\n${lines.length > 0 ? lines.join("\n") : "None."}`;

const formatCombinedLayout = (synthesis: AnaSynthesis): string[] => {
  const factual =
    synthesis.highConfidenceFacts.length > 0
      ? synthesis.highConfidenceFacts
      : ["No high-confidence factual claims were verified in this turn."];
  return [
    section("FACTUAL ANALYSIS", [
      "Only practical specialist evidence with confidence ≥ 0.7 belongs here. Symbolic claims are excluded.",
      ...factual,
    ]),
    section("SYMBOLIC INTERPRETATION", [
      "This is cultural interpretation, not a career, medical, or legal fact.",
      ...synthesis.symbolicInterpretation,
    ]),
    section("AI INFERENCE", [
      "The following connections are ANA inferences, not verified facts.",
      "ANA did not infer a career, education, or business path from astrology or numerology.",
      synthesis.combined,
      ...synthesis.agreements,
    ]),
    section("ACTIONABLE RECOMMENDATION", [
      "These are suggestions, not facts.",
      ...synthesis.recommendations,
      ...synthesis.actionPlan,
    ]),
  ];
};

const formatSynthesis = (
  synthesis: AnaSynthesis,
  provenance: readonly AnaProvenance[],
  unavailableAgents: readonly string[],
  combinedAnalysis: boolean,
): string => {
  const blocks = combinedAnalysis ? formatCombinedLayout(synthesis) : [];
  blocks.push(
    synthesis.combined,
    section("AGREEMENTS", synthesis.agreements),
    section("CONTRADICTIONS", synthesis.contradictions),
    section("HIGH-CONFIDENCE FACTS", synthesis.highConfidenceFacts),
    section("ASSUMPTIONS", synthesis.assumptions),
    section("SYMBOLIC INTERPRETATION", synthesis.symbolicInterpretation),
    section("PRACTICAL EVIDENCE", synthesis.practicalEvidence),
    section("CREATIVE OPPORTUNITIES", synthesis.creativeOpportunities),
    section("RECOMMENDATIONS", synthesis.recommendations),
    section("ACTION PLAN", synthesis.actionPlan),
  );
  if (unavailableAgents.length > 0) {
    blocks.push(
      `UNAVAILABLE SPECIALISTS\n${unavailableAgents.join(", ")} are not registered. ANA did not invent those answers.`,
    );
  }
  blocks.push(`ANA SYNTHESIS\n${synthesis.combined}`);
  if (provenance.length > 0) {
    blocks.push(formatProvenanceSources(provenance));
  }
  return blocks.join("\n\n");
};

export const synthesizeAnaResult = (options: {
  plan: AnaPlan;
  responses: readonly AgentResponse[];
  verification: AnaVerification;
  index: SpecialistIndex;
  traces?: readonly AnaTraceEvent[];
  now?: () => string;
}): {
  status: AnaResultStatus;
  answer: string;
  provenance: AnaProvenance[];
} => {
  const collectOptions = {
    plan: options.plan,
    responses: options.responses,
    index: options.index,
    ...(options.traces ? { traces: options.traces } : {}),
    ...(options.now ? { now: options.now } : {}),
  };
  const provenance = collectProvenance(collectOptions);

  if (options.plan.kind === "portfolio-fact") {
    return { status: "deferred", answer: ANA_PORTFOLIO_BOUNDARY, provenance: [] };
  }

  if (options.plan.kind === "unknown") {
    return {
      status: "failed",
      answer:
        "ANA needs a specialist goal (astrology, numerology, or music) or a portfolio question for CC AI.",
      provenance: [],
    };
  }

  if (options.plan.steps.length === 0) {
    return {
      status: "failed",
      answer:
        "No registered specialist can handle this domain yet. ANA will not invent the answer.",
      provenance: [],
    };
  }

  if (options.plan.missingInputs.length > 0) {
    const answer = options.plan.missingInputs.includes(ANA_COMBINED_CONSENT_FIELD)
      ? ANA_COMBINED_CONSENT_PROMPT
      : `ANA needs ${options.plan.missingInputs.join(", ")} before delegating.`;
    return {
      status: "needs-input",
      answer,
      provenance: [],
    };
  }

  if (options.responses.length === 0) {
    return {
      status: "failed",
      answer:
        "A capable specialist exists, so ANA refused to answer the domain without delegation.",
      provenance: [],
    };
  }

  const synthesis = buildAnaSynthesis({
    responses: options.responses,
    provenance,
    verification: options.verification,
    unavailableAgents: options.plan.unavailableAgents,
  });

  const status: AnaResultStatus =
    options.verification.failedAgentIds.length === options.responses.length ? "failed" : "answered";

  return {
    status,
    answer: formatSynthesis(
      synthesis,
      provenance,
      options.plan.unavailableAgents,
      options.plan.goals.includes("combined-analysis"),
    ),
    provenance,
  };
};
