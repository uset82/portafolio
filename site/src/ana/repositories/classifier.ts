import type { RepositoryInspection } from "./github";
import type {
  AgentPotential,
  RecommendedType,
  RepositoryAudit,
  RepositoryDomain,
  RepositoryStatus,
} from "./schemas";

const AGENT_DOMAINS = new Set<RepositoryDomain>([
  "astrology",
  "career",
  "education",
  "energy",
  "music",
  "numerology",
  "research",
  "ai-tooling",
]);

const TOOL_NAME_PATTERN = /calculator|qr-?code|trafficlight|watering|piano|reactiongame|stillas/i;

const EDUCATIONAL_PATTERN = /\b(assignment|coursework|hvl\d*|lab\s*\d+|ele\d+|homework)\b/i;

const EXPERIMENT_PATTERN = /\b(poc|prototype|experiment|scratch|vibe|v0-)\b/i;

const LLM_TOKEN_PATTERN =
  /\b(openrouter|openai|anthropic|langchain|ollama|transformers|@openrouter\/sdk|gpt-4|llm)\b/i;

const DATABASE_TOKEN_PATTERN =
  /\b(prisma|supabase|postgres|postgresql|mongodb|sqlite|drizzle|typeorm|sqlalchemy|redis)\b/i;

const API_TOKEN_PATTERN = /\b(fastapi|express|flask|django|openapi|swagger|hono|trpc)\b/i;

const BACKEND_TOKEN_PATTERN = /\b(fastapi|flask|django|express|spring|rails)\b/i;

const DOMAIN_HINTS: readonly { domain: RepositoryDomain; pattern: RegExp }[] = [
  {
    domain: "astrology",
    pattern: /\b(astraea|astroea|astrology|natal chart|synastry|ephemeris)\b/i,
  },
  { domain: "numerology", pattern: /\b(pinaculo|numerolog)/i },
  { domain: "music", pattern: /\b(strudel|lyrigenie|suno|udio|music|live coding|tidal)\b/i },
  { domain: "education", pattern: /\b(mentora|educativ|edtech|course|thesis)\b/i },
  { domain: "career", pattern: /\b(smartapply|resume|cv\b|career)\b/i },
  { domain: "research", pattern: /\b(thesis|paper2video|research)\b/i },
  {
    domain: "electronics",
    pattern: /\b(trafficlight|microcontroller|stm32|electronics|uart|rs232)\b/i,
  },
  { domain: "embedded", pattern: /\b(embedded|microcontroller|stm32|arduino|platformio)\b/i },
  { domain: "fpga", pattern: /\b(vhdl|fpga|quartus|de2-?115)\b/i },
  { domain: "iot", pattern: /\b(smarthome|iot|watering)\b/i },
  { domain: "energy", pattern: /\b(energy|battery|solar[- ]?(panel|power|farm)|flow-?battery)\b/i },
  { domain: "design", pattern: /\b(webdesigner|design system|nightglass)\b/i },
  { domain: "3d", pattern: /\b(3doodle|avatar-studio|freecad|three\.js|blender)\b/i },
  { domain: "game", pattern: /\b(game|tetris|football|arcade|monkey-tug)\b/i },
  { domain: "drone", pattern: /\b(drone)\b/i },
  { domain: "video", pattern: /\b(paper2video|youtube|video)\b/i },
  {
    domain: "ai-tooling",
    pattern: /\b(thedelegator|opencode|opennemoclaw|repo2agent|multi-agent)\b/i,
  },
  { domain: "osint", pattern: /\b(osiris|osint|ifoundyou)\b/i },
  { domain: "finance", pattern: /\b(bankai|finance)\b/i },
  { domain: "construction", pattern: /\b(stillas|scaffold)\b/i },
  { domain: "portfolio", pattern: /\b(portafolio|portfolio)\b/i },
  { domain: "web", pattern: /\b(next\.js|react|svelte|astro|vite)\b/i },
];

const CAPABILITY_HINTS: readonly { capability: string; pattern: RegExp }[] = [
  { capability: "natal-chart", pattern: /\b(natal|radix)\b/i },
  { capability: "transits", pattern: /\btransit/i },
  { capability: "synastry", pattern: /\bsynastry\b/i },
  { capability: "solar-return", pattern: /\bsolar return\b/i },
  { capability: "interpretation", pattern: /\binterpret/i },
  { capability: "numerology-profile", pattern: /\bnumerolog/i },
  { capability: "pinnacle-cycles", pattern: /\bpin[aá]culo|pinnacle\b/i },
  { capability: "master-numbers", pattern: /\bmaster numbers?\b|\b11\s*→\s*2\b/i },
  { capability: "life-cycles", pattern: /\bciclos de vida|life cycles?\b/i },
  { capability: "generative-music", pattern: /\bgenerative music|musicgen|strudel\b/i },
  { capability: "live-coding", pattern: /\blive coding\b/i },
  { capability: "voice-control", pattern: /\bvoice control\b/i },
  { capability: "generate-qr", pattern: /\bqr code\b/i },
  { capability: "calculate-scaffolding", pattern: /\bstillas|scaffold/i },
  { capability: "career-analysis", pattern: /\b(smartapply|career analysis)\b/i },
  { capability: "thesis-writing", pattern: /\bthesis\b/i },
  { capability: "simulation", pattern: /\bsimulation\b/i },
  {
    capability: "battery-analysis",
    pattern: /\bbattery analysis\b|\bbattery modelling\b|\bbattery modeling\b/i,
  },
  { capability: "energy-modeling", pattern: /\benergy model/i },
];

const FRAMEWORK_HINTS: readonly { framework: string; pattern: RegExp }[] = [
  { framework: "next", pattern: /\bnext\b/ },
  { framework: "vite", pattern: /\bvite\b/ },
  { framework: "astro", pattern: /\bastro\b/ },
  { framework: "svelte", pattern: /\bsvelte\b/ },
  { framework: "fastapi", pattern: /\bfastapi\b/ },
  { framework: "express", pattern: /\bexpress\b/ },
  { framework: "flask", pattern: /\bflask\b/ },
  { framework: "django", pattern: /\bdjango\b/ },
  { framework: "cargo", pattern: /\bcargo\b/ },
  { framework: "platformio", pattern: /\bplatformio\b/ },
];

const haystackOf = (inspection: RepositoryInspection) => {
  const { repository, manifests, treePaths, readme } = inspection;
  return [
    repository.fullName,
    repository.name,
    repository.description ?? "",
    repository.topics.join(" "),
    readme ?? "",
    treePaths.join("\n"),
    Object.keys(manifests).join("\n"),
    Object.values(manifests).join("\n"),
  ]
    .join("\n")
    .toLowerCase();
};

const uniqueSorted = <T extends string>(values: readonly T[]) =>
  [...new Set(values)].sort((left, right) => left.localeCompare(right));

const parsePackageNames = (manifests: Readonly<Record<string, string>>) => {
  const names: string[] = [];
  for (const [path, content] of Object.entries(manifests)) {
    const basename = path.split("/").at(-1)?.toLowerCase();
    if (basename === "package.json") {
      try {
        const parsed = JSON.parse(content) as {
          dependencies?: Record<string, string>;
          devDependencies?: Record<string, string>;
        };
        names.push(
          ...Object.keys(parsed.dependencies ?? {}),
          ...Object.keys(parsed.devDependencies ?? {}),
        );
      } catch {
        names.push(content);
      }
      continue;
    }
    names.push(content);
  }
  return names.join("\n").toLowerCase();
};

export const inferDomains = (inspection: RepositoryInspection): RepositoryDomain[] => {
  const haystack = haystackOf(inspection);
  return uniqueSorted(
    DOMAIN_HINTS.flatMap(({ domain, pattern }) => (pattern.test(haystack) ? [domain] : [])),
  );
};

export const inferCapabilities = (inspection: RepositoryInspection) =>
  uniqueSorted(
    CAPABILITY_HINTS.flatMap(({ capability, pattern }) =>
      pattern.test(haystackOf(inspection)) ? [capability] : [],
    ),
  );

export const inferFramework = (inspection: RepositoryInspection) => {
  const haystack = `${haystackOf(inspection)}\n${parsePackageNames(inspection.manifests)}`;
  return FRAMEWORK_HINTS.find(({ pattern }) => pattern.test(haystack))?.framework;
};

export const inferFlags = (inspection: RepositoryInspection) => {
  const paths = inspection.treePaths.map((path) => path.replaceAll("\\", "/").toLowerCase());
  const haystack = haystackOf(inspection);
  const packages = parsePackageNames(inspection.manifests);
  const combined = `${haystack}\n${packages}`;
  const hasApiPath = paths.some(
    (path) =>
      /(^|\/)(api|routers|routes)(\/|$)/.test(path) ||
      /(^|\/)(src\/)?app\/api\//.test(path) ||
      /(^|\/)pages\/api\//.test(path),
  );
  const hasBackendPath = paths.some((path) => /(^|\/)(backend|server|api)(\/|$)/.test(path));
  const hasDatabasePath = paths.some((path) => /(prisma\/schema\.prisma$|supabase\/)/.test(path));

  return {
    hasBackend: hasBackendPath || BACKEND_TOKEN_PATTERN.test(combined),
    hasAPI: hasApiPath || API_TOKEN_PATTERN.test(combined) || hasBackendPath,
    hasDatabase: hasDatabasePath || DATABASE_TOKEN_PATTERN.test(combined),
    hasLLM: LLM_TOKEN_PATTERN.test(combined),
  };
};

export const normalizeRepositoryName = (name: string) =>
  name.toLowerCase().replaceAll("_", "-").replace(/-+$/g, "");

export type ClassificationDecision = Pick<
  RepositoryAudit,
  "status" | "agentPotential" | "recommendedType"
>;

export const classifyRepository = (
  inspection: RepositoryInspection,
  options: {
    duplicateOf?: string;
    flags: ReturnType<typeof inferFlags>;
    domain: readonly RepositoryDomain[];
    capabilities: readonly string[];
  },
): ClassificationDecision => {
  const { repository, contentsInspected, treePaths } = inspection;
  const sourceFiles = treePaths.filter((path) =>
    /\.(ts|tsx|js|jsx|py|rs|c|cpp|h|hpp|vhd|vhdl|svelte|go|java)$/i.test(path),
  );

  let status: RepositoryStatus = "prototype";
  if (repository.fork) status = "fork";
  else if (options.duplicateOf) status = "duplicate";
  else if (repository.sizeKb < 50 && (contentsInspected === false || sourceFiles.length === 0)) {
    status = "empty";
  } else if (EDUCATIONAL_PATTERN.test(haystackOf(inspection))) {
    status = "educational";
  } else if (EXPERIMENT_PATTERN.test(haystackOf(inspection))) {
    status = "experiment";
  } else if (
    repository.homepage &&
    repository.sizeKb >= 200 &&
    (options.flags.hasAPI || options.flags.hasBackend)
  ) {
    status = "production";
  }

  const agentDomain = options.domain.some((domain) => AGENT_DOMAINS.has(domain));
  const toolLike = TOOL_NAME_PATTERN.test(repository.name);
  const hostPortfolio = options.domain.includes("portfolio");

  let agentPotential: AgentPotential = "none";
  if (status === "empty" || status === "duplicate") agentPotential = "none";
  else if (status === "fork" && !agentDomain) agentPotential = "none";
  else if (hostPortfolio) agentPotential = "medium";
  else if (agentDomain && (options.flags.hasLLM || options.capabilities.length > 0)) {
    agentPotential = "high";
  } else if (agentDomain) agentPotential = "high";
  else if (options.flags.hasLLM && (options.flags.hasAPI || options.flags.hasBackend)) {
    agentPotential = "medium";
  } else if (toolLike || options.flags.hasAPI || options.flags.hasBackend) {
    agentPotential = "low";
  } else if (contentsInspected && (inspection.readme || sourceFiles.length > 0)) {
    agentPotential = "low";
  }

  let recommendedType: RecommendedType = "disabled";
  if (status === "empty" || status === "duplicate") recommendedType = "disabled";
  else if (hostPortfolio) recommendedType = "knowledge";
  else if (agentPotential === "high") recommendedType = "agent";
  else if (toolLike || (agentPotential === "low" && (options.flags.hasAPI || toolLike))) {
    recommendedType = "tool";
  } else if (status === "educational" || agentPotential === "low" || agentPotential === "none") {
    recommendedType = status === "fork" && agentPotential === "none" ? "disabled" : "knowledge";
  } else if (agentPotential === "medium" && options.flags.hasLLM) recommendedType = "agent";
  else if (agentPotential === "medium") recommendedType = "tool";

  if (status === "fork" && recommendedType === "agent") recommendedType = "knowledge";

  return { status, agentPotential, recommendedType };
};
