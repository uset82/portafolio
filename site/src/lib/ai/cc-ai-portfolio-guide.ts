import { isAskPortfolioQuestion } from "@/ana/core/intent";
import {
  displayPortfolioProjectName,
  isSearchablePortfolioAudit,
  searchPortfolioKnowledge,
  type PortfolioKnowledgeHit,
} from "@/ana/knowledge";
import type { RepositoryAudit } from "@/ana/repositories/schemas";

export type PortfolioLane = "sound" | "form" | "orchestration" | "electronics";
export type PortfolioVisitorRole = "recruiter" | "collaborator" | "curious";

type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type VisitorPortfolioGuide = {
  answer: string;
  hits: PortfolioKnowledgeHit[];
};

const BIOGRAPHY_KEYWORDS = [
  "your cv",
  "your resume",
  "who is carlos",
  "where did you work",
  "employer",
  "curriculum",
  "case study",
  "donde vive",
  "dónde vive",
  "quien es",
  "quién es",
  "sobre carlos",
  "acerca de",
  "en que es bueno",
  "en qué es bueno",
  "habilidades",
  "skills",
  "experience",
  "experiencia",
];

const LANE_QUERY: Record<PortfolioLane, string> = {
  sound: "music",
  form: "3d",
  orchestration: "ai-tooling",
  electronics: "embedded",
};

const LANE_TOKENS: Record<PortfolioLane, readonly string[]> = {
  sound: ["sound", "music", "audio", "strudel", "lyric", "song", "sonido", "musica", "música"],
  form: ["form", "3d", "image", "visual", "doodle", "avatar", "design", "sketch"],
  orchestration: [
    "orchestration",
    "orchestr",
    "agent",
    "tooling",
    "delegat",
    "nemo",
    "claw",
    "systems work",
    "sistema",
  ],
  electronics: [
    "electron",
    "embedded",
    "hardware",
    "fpga",
    "iot",
    "firmware",
    "board",
    "electrónica",
    "electronica",
  ],
};

const includesAny = (haystack: string, needles: readonly string[]) =>
  needles.some((needle) => haystack.includes(needle));

const normalize = (value: string) => value.toLowerCase().trim();

export const inferPortfolioLanes = (text: string): PortfolioLane[] => {
  const normalized = normalize(text);
  return (Object.keys(LANE_TOKENS) as PortfolioLane[]).filter((lane) =>
    includesAny(normalized, LANE_TOKENS[lane]),
  );
};

export const inferPortfolioVisitorRole = (text: string): PortfolioVisitorRole | undefined => {
  const normalized = normalize(text);
  if (includesAny(normalized, ["recruiter", "hiring", "talent", "hr ", "reclutador"])) {
    return "recruiter";
  }
  if (includesAny(normalized, ["collaborator", "partner", "colaborador", "together"])) {
    return "collaborator";
  }
  if (includesAny(normalized, ["curious", "just looking", "browsing", "curioso"])) {
    return "curious";
  }
  return undefined;
};

const wantsCatalog = (text: string) =>
  includesAny(normalize(text), [
    "all of them",
    "everything",
    "just list",
    "list them",
    "show me all",
    "the pile",
    "the catalog",
    "dump",
    "todos",
    "todas",
  ]);

const wantsLink = (text: string) =>
  includesAny(normalize(text), ["github", "repo", "link", "url", "enlace", "repositorio"]);

const wantsAnother = (text: string) =>
  includesAny(normalize(text), ["another", "next", "the other", "one more", "otro", "otra"]);

const isBiographyQuestion = (text: string) => includesAny(normalize(text), BIOGRAPHY_KEYWORDS);

export const isVisitorPortfolioGuide = (content: string): boolean =>
  includesAny(content, [
    "Which of those do you actually want to see?",
    "Are you weighing sound, form, or the orchestration layer?",
    "I have one more in that lane, not a catalog.",
    "Still one at a time.",
    "Pick one of those and I will stay with it.",
    "That is the repo, not a case study.",
    "What are you actually here for",
    "Creativity here is not a mood board.",
    "Which one actually matters to you?",
    "I need a direction, not a nod.",
    "If you want work you can actually open",
  ]);

const lastAssistant = (history: readonly ChatTurn[]): string =>
  [...history].reverse().find((turn) => turn.role === "assistant")?.content ?? "";

const hitFromAudit = (audit: RepositoryAudit): PortfolioKnowledgeHit => ({
  repository: audit.repository,
  href: `https://github.com/${audit.repository}`,
  domains: [...audit.domain],
  capabilities: [...audit.capabilities],
  recommendedType:
    audit.recommendedType === "agent" || audit.recommendedType === "tool"
      ? audit.recommendedType
      : "knowledge",
  ...(audit.description ? { description: audit.description } : {}),
});

const mentionedRepositories = (
  history: readonly ChatTurn[],
  audits: readonly RepositoryAudit[],
): Set<string> => {
  const text = history
    .filter((turn) => turn.role === "assistant")
    .map((turn) => turn.content)
    .join("\n");
  return new Set(
    audits
      .filter((audit) => {
        const name = displayPortfolioProjectName(audit.repository);
        return text.includes(name) || text.includes(audit.repository);
      })
      .map((audit) => audit.repository),
  );
};

const findNamedProject = (
  message: string,
  audits: readonly RepositoryAudit[],
): PortfolioKnowledgeHit | undefined => {
  const normalized = normalize(message);
  const matches = audits.filter((audit) => {
    if (!isSearchablePortfolioAudit(audit)) return false;
    const slug = (audit.repository.split("/")[1] ?? "").toLowerCase();
    const name = displayPortfolioProjectName(audit.repository).toLowerCase();
    return (slug.length > 2 && normalized.includes(slug)) || normalized.includes(name);
  });
  return matches.length === 1 ? hitFromAudit(matches[0]!) : undefined;
};

const lastUserLanes = (history: readonly ChatTurn[]): PortfolioLane[] => {
  for (const turn of [...history].reverse()) {
    if (turn.role !== "user") continue;
    const lanes = inferPortfolioLanes(turn.content);
    if (lanes.length === 1) return lanes;
  }
  return [];
};

const visitorBlurb = (hit: PortfolioKnowledgeHit): string => {
  if (hit.repository === "uset82/StrudelAI") {
    return "a public live-coding music system, open for testing";
  }
  const description = hit.description?.trim();
  if (description && !/\d+\s*%|\busers\b|\bstars\b|\brevenue\b/i.test(description)) {
    const clipped =
      description.length > 140 ? `${description.slice(0, 137).trimEnd()}…` : description;
    return clipped.replace(/\.$/, "");
  }
  if (hit.capabilities.includes("live-coding")) return "public live-coding music system";
  if (hit.capabilities.includes("generative-music")) return "public generative-music work";
  if (hit.domains.includes("music")) return "public music work";
  if (hit.domains.includes("3d")) return "public 3D work";
  if (hit.domains.includes("ai-tooling")) return "public AI-tooling work";
  if (hit.domains.includes("electronics") || hit.domains.includes("embedded")) {
    return "public electronics work";
  }
  if (hit.domains.includes("design")) return "public design work";
  return "public work";
};

const LANE_CAPABILITIES: Record<PortfolioLane, readonly string[]> = {
  sound: ["live-coding", "generative-music"],
  form: [],
  orchestration: [],
  electronics: ["traffic-light", "smart-home", "fpga-uart"],
};

const laneFit = (hit: PortfolioKnowledgeHit, query: string): number => {
  const lane = (Object.keys(LANE_QUERY) as PortfolioLane[]).find(
    (item) => LANE_QUERY[item] === query,
  );
  if (!lane) return 0;
  return hit.capabilities.filter((capability) => LANE_CAPABILITIES[lane].includes(capability))
    .length;
};

const pickHits = (
  query: string,
  audits: readonly RepositoryAudit[],
  excluded: ReadonlySet<string>,
  limit: number,
): PortfolioKnowledgeHit[] =>
  searchPortfolioKnowledge(query, audits, Math.max(limit + excluded.size, 8))
    .filter((hit) => !excluded.has(hit.repository))
    .sort((left, right) => laneFit(right, query) - laneFit(left, query))
    .slice(0, limit);

const qualifierAnswer = (message: string, role?: PortfolioVisitorRole): string => {
  if (role === "recruiter") {
    return [
      "If you are hiring, a list is how people hide.",
      "",
      "I will not start with eight GitHub links. Are you weighing sound, form, or the orchestration layer?",
    ].join("\n");
  }

  const lanes = inferPortfolioLanes(message);
  const mentionsCreativity =
    includesAny(normalize(message), ["creativ", "creatividad"]) && lanes.length !== 1;
  if (mentionsCreativity) {
    return [
      "Creativity here is not a mood board. It is sound or form.",
      "",
      "Which of those do you actually want to see?",
    ].join("\n");
  }

  if (includesAny(normalize(message), ["ai", "artificial"]) || lanes.length === 0) {
    return [
      "I could list every public repo that mentions AI. That is the easy answer, and it is usually the wrong one.",
      "",
      "Carlos’s AI work is not one pile. It splits three ways:",
      "",
      "Sound — live-coding and lyric systems",
      "Form — sketch-to-3D tools",
      "Orchestration — agents that coordinate other work",
      "",
      "Which of those do you actually want to see? If you are hiring, say that too. The cut is different.",
    ].join("\n");
  }

  return [
    "I could walk the whole public GitHub. That would waste your time.",
    "",
    "What are you actually here for — sound, form, electronics, or the AI orchestration work?",
  ].join("\n");
};

const recommendAnswer = (hit: PortfolioKnowledgeHit, anotherAvailable: boolean): string => {
  const name = displayPortfolioProjectName(hit.repository);
  const offer = anotherAvailable
    ? "I have one more in that lane, not a catalog. Want that, or the public repo?"
    : "Want the public repo, or a different direction?";
  return [
    `Then I will not start with a list.`,
    ``,
    `Start with ${name} — ${visitorBlurb(hit)}.`,
    ``,
    offer,
  ].join("\n");
};

const anotherAnswer = (hit: PortfolioKnowledgeHit): string => {
  const name = displayPortfolioProjectName(hit.repository);
  return [
    `The next one is ${name} — ${visitorBlurb(hit)}.`,
    "",
    "Still one at a time. Want the public repo, or a different direction?",
  ].join("\n");
};

const catalogAnswer = (hits: readonly PortfolioKnowledgeHit[]): string => {
  const names = hits.map(
    (hit) => `${displayPortfolioProjectName(hit.repository)} — ${visitorBlurb(hit)}.`,
  );
  return [
    "You can have a catalog. You will not remember it.",
    "",
    "Three names, then I stop listing:",
    "",
    ...names,
    "",
    "Pick one of those and I will stay with it.",
  ].join("\n");
};

const linkAnswer = (hit: PortfolioKnowledgeHit): string =>
  [
    `Public repository: ${hit.href}`,
    "",
    "That is the repo, not a case study. Want another name, or a different direction?",
  ].join("\n");

const emptyLaneAnswer = (): string =>
  [
    "Nothing public in that lane is a clean match, and I will not invent one.",
    "",
    "Sound, form, or orchestration — which do you actually want to see?",
  ].join("\n");

const lastRecommendedHit = (
  content: string,
  audits: readonly RepositoryAudit[],
): PortfolioKnowledgeHit | undefined => {
  let latest: { hit: PortfolioKnowledgeHit; index: number } | undefined;
  for (const audit of audits) {
    if (!isSearchablePortfolioAudit(audit)) continue;
    const name = displayPortfolioProjectName(audit.repository);
    const index = content.lastIndexOf(name);
    if (index < 0) continue;
    if (!latest || index > latest.index) latest = { hit: hitFromAudit(audit), index };
  }
  return latest?.hit;
};

export const guideVisitorPortfolio = (options: {
  message: string;
  history?: readonly ChatTurn[];
  audits: readonly RepositoryAudit[];
}): VisitorPortfolioGuide | null => {
  const message = options.message.trim();
  const history = options.history ?? [];
  if (options.audits.length === 0 || isBiographyQuestion(message)) return null;

  const prior = lastAssistant(history);
  const inGuide = isVisitorPortfolioGuide(prior);
  const userTurnsText = [
    ...history.filter((turn) => turn.role === "user").map((turn) => turn.content),
    message,
  ].join("\n");
  const role = inferPortfolioVisitorRole(userTurnsText);
  const lanes = inferPortfolioLanes(message);
  const ask = isAskPortfolioQuestion(message);
  const excluded = mentionedRepositories(history, options.audits);

  if (!ask && !inGuide) return null;

  if (inGuide && wantsLink(message)) {
    const last = lastRecommendedHit(prior, options.audits);
    if (last) return { answer: linkAnswer(last), hits: [last] };
  }

  if (inGuide && wantsCatalog(message)) {
    const catalogLanes: PortfolioLane[] =
      lanes.length === 1 ? lanes : ["sound", "form", "orchestration"];
    const hits = catalogLanes
      .map((lane) => pickHits(LANE_QUERY[lane], options.audits, new Set(), 1)[0])
      .filter((hit): hit is PortfolioKnowledgeHit => Boolean(hit));
    if (hits.length === 0) return { answer: emptyLaneAnswer(), hits: [] };
    return { answer: catalogAnswer(hits), hits };
  }

  if (inGuide && wantsAnother(message)) {
    const lane = lanes[0] ?? lastUserLanes(history)[0] ?? "sound";
    const hits = pickHits(LANE_QUERY[lane], options.audits, excluded, 1);
    if (hits[0]) return { answer: anotherAnswer(hits[0]), hits };
    return { answer: emptyLaneAnswer(), hits: [] };
  }

  const named = findNamedProject(message, options.audits);
  if (named && (ask || inGuide)) {
    const lane = inferPortfolioLanes(named.domains.join(" "))[0];
    const more = lane
      ? pickHits(LANE_QUERY[lane], options.audits, new Set([named.repository]), 1)
      : [];
    return { answer: recommendAnswer(named, more.length > 0), hits: [named] };
  }

  const focusedLane = lanes.length === 1 ? lanes[0] : undefined;
  const shouldRecommend = Boolean(focusedLane) && (ask || inGuide);

  if (shouldRecommend && focusedLane) {
    const hits = pickHits(LANE_QUERY[focusedLane], options.audits, excluded, 1);
    if (!hits[0]) return { answer: emptyLaneAnswer(), hits: [] };
    const more = pickHits(
      LANE_QUERY[focusedLane],
      options.audits,
      new Set([hits[0].repository]),
      1,
    );
    return { answer: recommendAnswer(hits[0], more.length > 0), hits };
  }

  if (ask || (inGuide && (lanes.length > 1 || Boolean(inferPortfolioVisitorRole(message))))) {
    return { answer: qualifierAnswer(message, role), hits: [] };
  }

  return null;
};
