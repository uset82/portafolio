import type { RepositoryDomain } from "../repositories/schemas";
import { isCombinedAnalysisRequest } from "../privacy/consent";
import type { AnaGoal, AnaIntentKind, AnaRequest } from "./schemas";
import { domainsForGoals } from "../domains/catalog";

const MONTHS: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

const BIOGRAPHY_KEYWORDS = [
  "your cv",
  "your resume",
  "who is carlos",
  "where did you work",
  "employer",
  "curriculum",
  "case study",
];

const PORTFOLIO_KEYWORDS = ["portfolio", "your work", "your project", ...BIOGRAPHY_KEYWORDS];

const includesAny = (haystack: string, needles: readonly string[]) =>
  needles.some((needle) => haystack.includes(needle));

const pad2 = (value: string) => value.padStart(2, "0");

const parseNaturalDate = (message: string): string | undefined => {
  const dayFirst = message.match(
    /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/i,
  );
  if (dayFirst?.[1] && dayFirst[2] && dayFirst[3]) {
    const month = MONTHS[dayFirst[2].toLowerCase()];
    if (month) return `${dayFirst[3]}-${month}-${pad2(dayFirst[1])}`;
  }
  const monthFirst = message.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})\b/i,
  );
  if (monthFirst?.[1] && monthFirst[2] && monthFirst[3]) {
    const month = MONTHS[monthFirst[1].toLowerCase()];
    if (month) return `${monthFirst[3]}-${month}-${pad2(monthFirst[2])}`;
  }
  return undefined;
};

const hasValue = (provided: Record<string, unknown>, name: string) =>
  name in provided && provided[name] !== undefined && provided[name] !== "";

export const detectGoals = (message: string): AnaGoal[] => {
  const normalized = message.toLowerCase();
  const explicitNatal = includesAny(normalized, [
    "natal",
    "birth chart",
    "carta natal",
    "astrology",
    "horoscope",
    "astraea",
    "transit",
    "synastry",
    "solar return",
  ]);
  const explicitNumerology = includesAny(normalized, [
    "numerology",
    "numerología",
    "pinaculo",
    "pináculo",
    "master number",
  ]);
  const explicitMusic = includesAny(normalized, [
    "strudel",
    "live coding",
    "generative music",
    "music pattern",
    "pattern-generate",
    "generate music",
  ]);
  const hasName = /\bmy name is\b/i.test(message);
  const hasBirth =
    /\bi was born\b|\bbirth date\b|\bbirthday\b/i.test(message) ||
    /\b\d{4}-\d{2}-\d{2}\b/.test(message) ||
    parseNaturalDate(message) !== undefined;
  const career = includesAny(normalized, [
    "i study",
    "software engineering",
    "career advice",
    "career analysis",
  ]);
  const business = includesAny(normalized, [
    "company",
    "startup",
    "business idea",
    "business ideas",
    "start a",
  ]);
  const musicCompany = includesAny(normalized, ["music company", "start a music"]);
  const electronicsQuery = includesAny(normalized, [
    "stm32",
    "exti",
    "nucleo",
    "fpga",
    "vhdl",
    "uart",
    "rs-232",
    "rs232",
    "gpio",
    "traffic light",
    "watering system",
    "smart home",
  ]);

  const goals: AnaGoal[] = [];
  const add = (goal: AnaGoal) => {
    if (!goals.includes(goal)) goals.push(goal);
  };

  if (isCombinedAnalysisRequest(message)) {
    add("combined-analysis");
    return goals;
  }

  if (explicitNatal) add("natal-chart");
  if (explicitNumerology) add("numerology-profile");
  if (explicitMusic) add("pattern-generate");
  if (hasName && hasBirth && !explicitNatal && !explicitNumerology) add("personality-analysis");
  if (career) add("career-analysis");
  if (business) add("business-ideas");
  if (musicCompany) add("pattern-generate");
  if (electronicsQuery) add("capability-search");

  return goals;
};

export const isAskPortfolioQuestion = (message: string): boolean => {
  const normalized = message.toLowerCase();
  if (includesAny(normalized, BIOGRAPHY_KEYWORDS)) return false;
  return (
    includesAny(normalized, [
      "what has carlos built",
      "what did carlos build",
      "ask my portfolio",
      "embedded systems",
      "which projects",
      "projects combine",
      "combine ai",
      "ai and creativity",
      "built involving",
    ]) ||
    (/\bbuilt\b/.test(normalized) &&
      includesAny(normalized, ["involving", "embedded", "electronics", "project"])) ||
    (/\bprojects?\b/.test(normalized) &&
      includesAny(normalized, ["combine", "creativ", "embedded", "ai", "music", "3d"]))
  );
};

export const understandIntent = (
  message: string,
): { kind: AnaIntentKind; goals: AnaGoal[]; domains: RepositoryDomain[] } => {
  const normalized = message.toLowerCase();
  const biographyQuestion = includesAny(normalized, BIOGRAPHY_KEYWORDS);
  const projectQuestion = includesAny(normalized, PORTFOLIO_KEYWORDS);
  const navigationQuestion = isAskPortfolioQuestion(message);
  const calculation = includesAny(normalized, [
    "natal",
    "birth chart",
    "carta natal",
    "calculate",
    "generate a",
    "numerology",
    "numerología",
    "pattern-generate",
    "generate music",
  ]);
  if (biographyQuestion && !calculation) {
    return { kind: "portfolio-fact", goals: [], domains: ["portfolio"] };
  }
  if (navigationQuestion && !calculation) {
    return { kind: "portfolio-fact", goals: ["ask-portfolio"], domains: ["portfolio"] };
  }
  if (projectQuestion && !calculation) {
    return { kind: "portfolio-fact", goals: [], domains: ["portfolio"] };
  }
  if (isCombinedAnalysisRequest(message)) {
    const goals = detectGoals(message);
    return { kind: "specialist", goals, domains: domainsForGoals(goals) };
  }
  const goals = detectGoals(message);
  if (goals.length > 0) {
    return { kind: "specialist", goals, domains: domainsForGoals(goals) };
  }
  if (projectQuestion) return { kind: "portfolio-fact", goals: [], domains: ["portfolio"] };
  return { kind: "unknown", goals: [], domains: [] };
};

export const hintCapability = (domain: RepositoryDomain, message: string): string | undefined => {
  const normalized = message.toLowerCase();
  if (domain === "astrology") {
    if (normalized.includes("transit")) return "transits";
    if (normalized.includes("synastry")) return "synastry";
    if (normalized.includes("solar return")) return "solar-return";
    if (includesAny(normalized, ["natal", "birth chart", "carta natal"])) return "natal-chart";
  }
  if (domain === "numerology") {
    if (normalized.includes("master number")) return "master-numbers";
    if (normalized.includes("life cycle")) return "life-cycles";
    if (normalized.includes("pinnacle")) return "pinnacle-cycles";
    return "numerology-profile";
  }
  if (domain === "music") return "pattern-generate";
  if (domain === "electronics" || domain === "embedded" || domain === "fpga" || domain === "iot") {
    if (includesAny(normalized, ["watering"])) return "watering-system";
    if (includesAny(normalized, ["smart home", "smarthome"])) return "smart-home";
    if (includesAny(normalized, ["uart", "rs-232", "rs232", "vhdl", "fpga"])) return "fpga-uart";
    if (includesAny(normalized, ["piano", "pwm"])) return "microcontroller";
    if (includesAny(normalized, ["traffic", "exti", "interrupt", "stm32"])) return "traffic-light";
  }
  return undefined;
};

export const extractProvided = (request: AnaRequest): Record<string, unknown> => {
  const provided: Record<string, unknown> = { ...(request.input ?? {}) };
  const isoDate = request.message.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoDate?.[1] && !hasValue(provided, "birthDate")) provided.birthDate = isoDate[1];
  const naturalDate = parseNaturalDate(request.message);
  if (naturalDate && !hasValue(provided, "birthDate")) provided.birthDate = naturalDate;
  const time = request.message.match(/\b(\d{1,2}:\d{2})\b/);
  if (time?.[1] && !hasValue(provided, "birthTime")) provided.birthTime = time[1];
  const named = request.message.match(/\bmy name is ([a-z][a-z\s'-]{1,80}?)(?:[.,]|$)/i);
  if (named?.[1] && !hasValue(provided, "fullName")) provided.fullName = named[1].trim();
  const place = request.message.match(/\bin\s+([A-Z][a-zA-Z]+)\b/);
  if (place?.[1] && !hasValue(provided, "birthPlace")) provided.birthPlace = place[1];
  const study = request.message.match(/\bi study ([a-z][a-z\s-]{1,80}?)(?:\s+and\b|[.!?]|$)/i);
  if (study?.[1] && !hasValue(provided, "fieldOfStudy")) provided.fieldOfStudy = study[1].trim();
  const prompt = request.message.match(/\bprompt:\s*(.+)$/i);
  if (prompt?.[1] && !hasValue(provided, "prompt")) provided.prompt = prompt[1].trim();
  const startA = request.message.match(/\bstart a [^.]{3,80}/i);
  if (startA?.[0] && !hasValue(provided, "prompt")) {
    provided.prompt = startA[0].trim().replace(/[.,;]+$/, "");
  }
  const labeled = (label: string): string | undefined => {
    const nextLabel =
      "Name|Education|Skills|Interests|Goals|Business ideas?|Field of study|Current situation";
    const match = request.message.match(
      new RegExp(`${label}\\s*:\\s*(.+?)(?=\\s+(?:${nextLabel})\\s*:|$)`, "is"),
    );
    const value = match?.[1]?.trim().replace(/[.,;]+$/, "");
    return value && value.length > 0 ? value : undefined;
  };
  const assignLabeled = (field: string, label: string) => {
    if (hasValue(provided, field)) return;
    const value = labeled(label);
    if (value) provided[field] = value;
  };
  assignLabeled("fullName", "Name");
  assignLabeled("education", "Education");
  assignLabeled("skills", "Skills");
  assignLabeled("interests", "Interests");
  assignLabeled("goals", "Goals");
  assignLabeled("fieldOfStudy", "Field of study");
  if (!hasValue(provided, "prompt")) {
    const idea = labeled("Business ideas") ?? labeled("Business idea");
    if (idea) provided.prompt = idea;
  }
  return provided;
};
