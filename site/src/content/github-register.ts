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
};

const DESCRIPTION_OVERRIDES: Record<string, string> = {
  portafolio: "This portfolio site.",
  mentora: "Fork of a college Mentora base. Carlos is the primary developer of this copy.",
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
