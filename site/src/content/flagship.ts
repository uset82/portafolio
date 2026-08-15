/**
 * The flagship register: ten shipped projects, chosen for range rather than
 * recency, approved by Carlos on 2026-08-13 (closes `Q.11`).
 *
 * Every field here comes from a synced source, not from memory:
 *
 *   - `languages` and `license` come from `brain/github/<repo>/meta.json`,
 *     produced by `brain:sync-github` and checked on 2026-07-31.
 *   - `summary` is written from `brain/github/<repo>/README.snapshot.md`,
 *     the repository's own README as it stood on that date.
 *   - `lastPushed` is the repository's real `pushedAt`.
 *
 * `mentora` is the one entry with no `brain/github` record, because the sync
 * covers own repositories and mentora is a fork. Its framing is the one `Q.9`
 * verified against the commit log rather than assumed, and it is labelled as a
 * fork on the page so nobody reads it as an original work.
 */

export type FlagshipAuthorship =
  /** Carlos wrote it. The repository is his from the first commit. */
  | "own"
  /** A fork he became the primary developer of. Framing is stated on the card. */
  | "fork-primary-developer";

export type FlagshipProject = {
  id: string;
  name: string;
  /** What it is, in one line, in plain language. */
  tagline: string;
  /** Written from the repository's own README, not invented. */
  summary: string;
  /** Top three languages by bytes, from the GitHub language breakdown. */
  languages: readonly string[];
  /** The thread this project belongs to, used to show the range at a glance. */
  thread: string;
  authorship: FlagshipAuthorship;
  /** Exactly what the repository carries today. `null` means no LICENSE file. */
  license: string | null;
  repository: string;
  /** A public, working URL when one exists. Nothing is invented here. */
  liveUrl?: string;
  liveLabel?: string;
  /** The repository's real `pushedAt`, so nothing looks fresher than it is. */
  lastPushed: string;
  /** Present only for `fork-primary-developer`: the honest framing. */
  contributionNote?: string;
};

export const FLAGSHIP_PROJECTS: readonly FlagshipProject[] = [
  {
    id: "webdesigner",
    name: "WebDesigner for Codex",
    tagline: "An installable design system and plugin",
    summary:
      "An installable Codex plugin for building websites, product interfaces and apps. It combines the Nightglass design system with a framework-aware orchestration server, and ships as something other people install rather than as a demo.",
    languages: ["JavaScript", "TypeScript", "Python"],
    thread: "Design systems",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/webdesigner",
    lastPushed: "2026-07-24",
  },
  {
    id: "strudelai",
    name: "StrudelAI",
    tagline: "Live-coding music with voice control",
    summary:
      "An AI-assisted live-coding music system with voice control, genetic sound design, and DJ tooling. It carries the largest set of authored documentation of any project here: a diary, a dictionary, and around fifteen planning documents.",
    languages: ["TypeScript", "Python", "JavaScript"],
    thread: "Music systems",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/StrudelAI",
    liveUrl: "https://strudelzeroai.app.canner.ca/",
    liveLabel: "Open the test build",
    lastPushed: "2026-06-21",
  },
  {
    id: "avatar-studio",
    name: "Codex Avatar Studio",
    tagline: "An animated assistant inside the editor",
    summary:
      "A local animated assistant for Visual Studio Code and compatible Cursor builds. It adds an avatar panel that reacts to coding activity, converts pictures to SVG locally, and imports portable avatar packages.",
    languages: ["TypeScript", "JavaScript", "CSS"],
    thread: "Developer tools",
    authorship: "own",
    // GitHub reports NOASSERTION, meaning it could not parse the LICENSE file.
    license: "Unrecognised (GitHub could not parse the LICENSE file)",
    repository: "https://github.com/uset82/avatar-studio",
    lastPushed: "2026-07-14",
  },
  {
    id: "thesis-writer-kit",
    name: "Thesis Writer Kit",
    tagline: "Thesis tooling, written in Rust",
    summary:
      "A kit for thesis writing and the only Rust project in the portfolio. It is also one of the few repositories that already carries an explicit MIT licence, so anyone can read, fork and build on it today.",
    languages: ["Rust", "Python", "TypeScript"],
    thread: "Systems programming",
    authorship: "own",
    license: "MIT",
    repository: "https://github.com/uset82/Thesis-Writer-Kit",
    lastPushed: "2026-01-22",
  },
  {
    id: "my-football-game",
    name: "My Football Game",
    tagline: "Two-player football in a canvas",
    summary:
      "A canvas football match with a Socket.IO server behind it, so two people play the same match at once. It is the arcade's first hosted title and already carries its own deployment configuration.",
    languages: ["JavaScript", "CSS", "HTML"],
    thread: "Games",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/My-Football-Game",
    lastPushed: "2025-12-08",
  },
  {
    id: "monkey-tug-of-war",
    name: "Monkey Tug of War",
    tagline: "A classroom maths game in Flutter",
    summary:
      "A tug-of-war built on mental arithmetic: answer faster than the other side and the rope moves your way. Written in Flutter with Flame, which makes it the one project here built on that stack.",
    languages: ["Dart", "JavaScript", "HTML"],
    thread: "Games",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/Monkey-Tug-of-War",
    lastPushed: "2026-02-12",
  },
  {
    id: "rs232-vhdl",
    name: "RS-232 for DE2-115",
    tagline: "A serial protocol on an FPGA",
    summary:
      "A complete RS-232 communication system implemented on the Altera and Intel DE2-115 development board, built for point-to-point transmission. Written in VHDL as a semester project, and the only hardware-description work in the portfolio.",
    languages: ["VHDL"],
    thread: "Hardware",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/RS232_VHD_DE2115",
    lastPushed: "2025-11-19",
  },
  {
    id: "automatic-watering-elephant",
    name: "Automatic Watering Elephant",
    tagline: "Embedded irrigation, in C++",
    summary:
      "An automatic watering system built on Arduino with PlatformIO. It is the substantial embedded C++ project in the portfolio, sitting between the hardware work and the software work.",
    languages: ["C++", "JavaScript", "CSS"],
    thread: "Embedded",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/Automatic-Watering-Elephant",
    lastPushed: "2025-12-11",
  },
  {
    id: "lyrigenie",
    name: "LyriGenie",
    tagline: "Lyrics, synchronised across platforms",
    summary:
      "A web application that turns lyric viewing into something interactive, synchronising lyrics across several music platforms. It ties three threads together at once: Python, AI, and music.",
    languages: ["Python", "JavaScript", "HTML"],
    thread: "AI and music",
    authorship: "own",
    license: null,
    repository: "https://github.com/uset82/LyriGenie",
    lastPushed: "2025-04-06",
  },
  {
    id: "mentora",
    name: "Mentora",
    tagline: "A study platform, largely rebuilt",
    summary:
      "A learning platform with a study workspace, mind maps, fullscreen artifacts and a responsive chat interface. Carlos shipped the source picker, the mind-map speedup, the fullscreen artifacts, and the responsive study and chat layouts.",
    languages: ["TypeScript"],
    thread: "Education",
    authorship: "fork-primary-developer",
    contributionNote:
      "A fork of a college project rather than an original repository. Of the last 100 commits, 51 are Carlos's and 5 are the upstream owner's, which is why he is described as its primary developer and not as its author.",
    license: "MIT",
    repository: "https://github.com/uset82/mentora",
    lastPushed: "2026-07-05",
  },
];

export const FLAGSHIP_REGISTER = {
  eyebrow: "Work / Register",
  heading: "A working register of systems and ideas.",
  shipped: {
    index: "01",
    label: "Built",
    heading: "Ten projects, chosen for range.",
    description:
      "Web, design systems, Rust, Flutter, VHDL, C++ and Python. The spread is the point: these are not ten versions of the same project. Every language and licence below is read from the repository itself, checked on 2026-07-31.",
  },
  concepts: {
    index: "02",
    label: "Concept",
    heading: "Named, designed, and not yet built.",
    description:
      "These are approved visual and navigational concepts from the Observatory. They are kept apart from the built work on purpose: nothing here implies a shipped result, a working system, or a measured outcome.",
  },
} as const;

/** Distinct threads across the register, in first-appearance order. */
export function flagshipThreads(): readonly string[] {
  return [...new Set(FLAGSHIP_PROJECTS.map((project) => project.thread))];
}
