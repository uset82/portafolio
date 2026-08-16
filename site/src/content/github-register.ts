import { ARCADE_GAMES } from "@/content/arcade";
import { COSMOS_APPS } from "@/content/cosmos";
import githubRegisterInput from "@/content/github-register.json";

export type GithubWorkEntry = {
  id: string;
  name: string;
  title: string;
  description: string;
  kind: "own" | "fork";
  language: string;
  licenseLabel: string;
  url: string;
  tryUrl: string | null;
  tryLabel: string | null;
  roomHref: string | null;
  roomLabel: string | null;
};

const TITLE_OVERRIDES: Record<string, string> = {
  pinaculo: "Pináculo",
  drone_Lips: "Drone Lips",
  "Monkey-Tug-of-War": "Monkey Tug of War",
  "My-Football-Game": "My Football Game",
  Jacobgolf: "Jacobs Golfspill",
  pacha: "Pasha",
  chaclacayo: "Chaclacayo",
  opennemoclaw: "OpenNemoClaw",
  opennemoclawsite: "OpenNemoClaw Site",
};

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  portafolio: "This portfolio site.",
  mentora: "Fork of a college Mentora base. Carlos is the primary developer of this copy.",
  Jacobgolf: "A browser-based mini golf challenge built with HTML5 canvas and vanilla JavaScript.",
  StillasCalculator:
    "A scaffolding calculator: draw a building perimeter and get a planning material estimate.",
  pacha: "Website for Pasha International Food & Bar in Bergen.",
  chaclacayo: "A property website for a house in Chaclacayo, Lima.",
  QubeSolve:
    "A 3D Rubik's Cube solver with interactive 3D visualization and step-by-step solving algorithms.",
  opennemoclaw:
    "A personal agent framework with modular local architecture, Docker integration, and policy controls.",
  opennemoclawsite: "Live companion website and documentation for OpenNemoClaw.",
};

const ROOM_OVERRIDES: Record<string, { href: string; label: string }> = {
  portafolio: { href: "/", label: "This site" },
  StrudelAI: { href: "/sound", label: "On Sound" },
};

const TRY_OVERRIDES: Record<string, { url: string; label: string }> = {
  StrudelAI: {
    url: "https://strudelzeroai.app.canner.ca/",
    label: "Try StrudelAI",
  },
  Jacobgolf: {
    url: "https://jacobgolf.netlify.app/",
    label: "Play Jacobs Golfspill",
  },
  QubeSolve: {
    url: "https://qubesolve.netlify.app/",
    label: "Solve with QubeSolve",
  },
  opennemoclaw: {
    url: "https://opennemoclaw.netlify.app/",
    label: "Open OpenNemoClaw",
  },
  opennemoclawsite: {
    url: "https://opennemoclaw.netlify.app/",
    label: "Open OpenNemoClaw",
  },
  StillasCalculator: {
    url: "https://stillascalculator.netlify.app/",
    label: "Open StillasCalculator",
  },
  pacha: {
    url: "https://pasharestaurant.netlify.app/",
    label: "Open Pasha",
  },
  chaclacayo: {
    url: "https://chaclacayo.netlify.app/",
    label: "Open Chaclacayo",
  },
};

for (const app of COSMOS_APPS) {
  const name = app.repository.replace("https://github.com/uset82/", "");
  ROOM_OVERRIDES[name] = { href: "/cosmos", label: "On Cosmos" };
  if (app.tryUrl && app.tryLabel) {
    TRY_OVERRIDES[name] = { url: app.tryUrl, label: app.tryLabel };
  }
}

for (const game of ARCADE_GAMES) {
  const name = game.repository.replace("https://github.com/uset82/", "");
  ROOM_OVERRIDES[name] = { href: `/arcade/${game.slug}`, label: "On Arcade" };
}

function licenseLabel(key: string, name: string) {
  if (key === "mit") return "MIT";
  if (key === "lgpl-2.1") return "LGPL-2.1";
  if (key === "cc-by-4.0") return "CC-BY-4.0";
  if (key === "other") return "Licence unparsed";
  if (!key) return "No licence file";
  return name || key;
}

function ownHomepageTry(repository: (typeof githubRegisterInput.repositories)[number]) {
  if (repository.fork || !repository.homepageUrl) return null;
  if (repository.homepageUrl === "https://github.com/uset82") return null;
  if (TRY_OVERRIDES[repository.name]) return null;
  return { url: repository.homepageUrl, label: "Open site" };
}

export const GITHUB_REGISTER_META = {
  source: githubRegisterInput.source,
  checkedOn: githubRegisterInput.checkedOn,
  count: githubRegisterInput.count,
} as const;

export type WorkGroupId =
  | "tools"
  | "ai"
  | "games"
  | "music"
  | "design"
  | "websites"
  | "hardware"
  | "astrology"
  | "business"
  | "creative"
  | "academic"
  | "forks"
  | "starts";

export type WorkGroupDefinition = {
  id: WorkGroupId;
  title: string;
  chartLabel: string;
};

export type GithubWorkGroup = WorkGroupDefinition & {
  repositories: readonly GithubWorkEntry[];
};

export const WORK_GROUPS: readonly WorkGroupDefinition[] = [
  { id: "tools", title: "Tools and utilities", chartLabel: "Herramientas y utilidades" },
  { id: "ai", title: "AI and agents", chartLabel: "IA y agentes" },
  { id: "games", title: "Games", chartLabel: "Juegos" },
  { id: "music", title: "Music and audio", chartLabel: "Música y audio" },
  { id: "design", title: "Design and web", chartLabel: "Diseño y web" },
  { id: "websites", title: "Website creation", chartLabel: "Creación de sitios" },
  { id: "hardware", title: "Hardware and embedded", chartLabel: "Hardware y embebido" },
  { id: "astrology", title: "Astrology and numerology", chartLabel: "Astrología y numerología" },
  { id: "business", title: "Business and SaaS", chartLabel: "Negocio y SaaS" },
  { id: "creative", title: "Creative and 3D", chartLabel: "Creativo y 3D" },
  { id: "academic", title: "Academic writing", chartLabel: "Escritura académica" },
  { id: "forks", title: "Forks", chartLabel: "Forks" },
  { id: "starts", title: "Starts", chartLabel: "Starts" },
];

const GROUP_BY_NAME: Record<string, WorkGroupId> = {
  "qr-code-generator": "tools",
  StillasCalculator: "tools",
  "project-bolt-qrmollebakken-supabase": "tools",
  SmartHomeControl: "tools",
  iFoundYou: "tools",
  opennemoclawsite: "tools",
  thedelegator: "ai",
  "LLM-Web-App": "ai",
  EFFATA: "ai",
  bankAI: "ai",
  opennemoclaw: "ai",
  ReportAIEquinor: "ai",
  "cookthis-": "ai",
  "Monkey-Tug-of-War": "games",
  "My-Football-Game": "games",
  MandelBro: "games",
  drone_Lips: "games",
  gimmemycake: "games",
  REACTIONGAME: "games",
  Jacobgolf: "games",
  QubeSolve: "games",
  StrudelAI: "music",
  LyriGenie: "music",
  "Suno-UDIO-Helper": "music",
  "v0-banana-piano-app": "music",
  MicrocontrollerPiano: "music",
  "piano-": "music",
  webdesigner: "design",
  "avatar-studio": "design",
  diagramcloner: "design",
  portafolio: "design",
  chaclacayo: "websites",
  pacha: "websites",
  RS232_VHD_DE2115: "hardware",
  "Automatic-Watering-Elephant": "hardware",
  elefante: "hardware",
  TRAFFICLIGHT: "hardware",
  "hvl2025-microcontroller-assignment3": "hardware",
  ASTROEA: "astrology",
  pinaculo: "astrology",
  CRM_SaaS_Educativo: "business",
  "smartapply-app": "business",
  "3Doodle": "creative",
  "Thesis-Writer-Kit": "academic",
  mentora: "forks",
  osiris: "forks",
  FreeCAD: "forks",
  opencode: "forks",
  Paper2Video: "forks",
  Tetris: "forks",
  mini: "starts",
  "nethunter-fix": "starts",
  "pace-drone-commander": "starts",
  "DealDash-": "starts",
  "skills-github-pages": "starts",
  "antigravity-vibe": "starts",
  CALLKIRO: "starts",
  paginacuzco1: "starts",
  "clase-potatoe": "starts",
  chatgptvoiceeffect: "starts",
  youtubedata: "starts",
  uset82: "starts",
};

function groupIdFor(name: string): WorkGroupId {
  const groupId = GROUP_BY_NAME[name];
  if (!groupId) {
    throw new Error(`Unclassified public repository: ${name}`);
  }
  return groupId;
}

export const GITHUB_REGISTER: readonly GithubWorkEntry[] = githubRegisterInput.repositories.map(
  (repository) => {
    const tryOverlay = TRY_OVERRIDES[repository.name] ?? ownHomepageTry(repository);
    const room = ROOM_OVERRIDES[repository.name];
    const description = DESCRIPTION_OVERRIDES[repository.name] ?? repository.description ?? "";

    return {
      id: `github-${repository.name}`,
      name: repository.name,
      title: TITLE_OVERRIDES[repository.name] ?? repository.name,
      description: description || "No GitHub description.",
      kind: repository.fork ? "fork" : "own",
      language: repository.language,
      licenseLabel: licenseLabel(repository.license, repository.licenseName),
      url: repository.url,
      tryUrl: tryOverlay?.url ?? null,
      tryLabel: tryOverlay?.label ?? null,
      roomHref: room?.href ?? null,
      roomLabel: room?.label ?? null,
    };
  },
);

export const GITHUB_REGISTER_GROUPS: readonly GithubWorkGroup[] = WORK_GROUPS.map((group) => ({
  ...group,
  repositories: GITHUB_REGISTER.filter((repository) => groupIdFor(repository.name) === group.id),
})).filter((group) => group.repositories.length > 0);
