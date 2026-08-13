/**
 * Support: the two things a visitor can do for the work after they have played
 * something or listened to something.
 *
 * Both halves are deliberately conservative about what they claim.
 *
 * Contributing: only repositories that carry an explicit open-source licence
 * are listed as open to contribution. The licence audit in
 * `updates/02-github-inventory.md` section 2.3 found 7 of 42 own repositories
 * licensed, of which 4 are MIT and authored rather than forked. The remaining
 * repositories are readable on GitHub but are all-rights-reserved by default,
 * and this page says so rather than implying an invitation that does not
 * legally exist yet.
 *
 * Tipping: the destination is read from the environment so that no placeholder
 * or guessed handle is ever rendered as a real link. When the variable is
 * absent the tip card does not render at all.
 */

export type ContributableRepo = {
  id: string;
  name: string;
  description: string;
  language: string;
  license: string;
  repository: string;
  /** Where a first-time contributor should actually start. */
  issuesUrl: string;
};

export const CONTRIBUTABLE_REPOS: readonly ContributableRepo[] = [
  {
    id: "portafolio",
    name: "portafolio",
    description:
      "This site. Next.js and TypeScript, with the content model, the arcade and the sound room all in the open.",
    language: "TypeScript",
    license: "MIT",
    repository: "https://github.com/uset82/portafolio",
    issuesUrl: "https://github.com/uset82/portafolio/issues",
  },
  {
    id: "thesis-writer-kit",
    name: "Thesis-Writer-Kit",
    description:
      "A writing kit for thesis work, and the one project written in Rust. The best place to help if systems languages are your thing.",
    language: "Rust",
    license: "MIT",
    repository: "https://github.com/uset82/Thesis-Writer-Kit",
    issuesUrl: "https://github.com/uset82/Thesis-Writer-Kit/issues",
  },
  {
    id: "smarthomecontrol",
    name: "SmartHomeControl",
    description:
      "Home automation control in Python. Small enough to read in one sitting, which makes it a fair first contribution.",
    language: "Python",
    license: "MIT",
    repository: "https://github.com/uset82/SmartHomeControl",
    issuesUrl: "https://github.com/uset82/SmartHomeControl/issues",
  },
  {
    id: "qr-code-generator",
    name: "qr-code-generator",
    description:
      "A small JavaScript QR generator. The smallest repository on this list and the shortest path to a first pull request.",
    language: "JavaScript",
    license: "MIT",
    repository: "https://github.com/uset82/qr-code-generator",
    issuesUrl: "https://github.com/uset82/qr-code-generator/issues",
  },
] as const satisfies readonly ContributableRepo[];

export const OPEN_SOURCE = {
  eyebrow: "Open source / Contribute",
  heading: "Four repositories are open to contribution today.",
  description:
    "These carry an MIT licence, which means you can read, fork, change and reuse them. Open an issue, or send a pull request; both are read.",
  profileUrl: "https://github.com/uset82",
  profileLabel: "All repositories on GitHub",
  /**
   * The honest counterpart to the invitation above. Counts come from the
   * licence audit, not from a live API call.
   */
  licensingNote: {
    heading: "The rest are readable, not yet reusable.",
    body: "37 of my 42 own repositories still have no licence file, which by default means all rights reserved. You can read them on GitHub, but you cannot legally build on them until that changes. Applying MIT across them is an open decision, not an oversight I am hiding.",
    auditedOn: "2026-07-31",
  },
} as const;

export type TipDestination = {
  platform: string;
  envVar: string;
  /** Rendered next to the button so nobody wonders where the money goes. */
  note: string;
};

export const TIP: TipDestination = {
  platform: "Buy Me a Coffee",
  envVar: "NEXT_PUBLIC_BUYMEACOFFEE_URL",
  note: "Entirely optional. The games, the music and the code stay free and unchanged either way.",
};

export const SUPPORT_TEASER = {
  eyebrow: "Support / Contribute",
  status: "4 MIT repositories",
  heading: "The work you can help with.",
  description:
    "Four repositories carry an MIT licence. Open an issue or send a pull request. The rest stay readable on GitHub until their licences change.",
  actionLabel: "Contribute",
  actionHref: "/support",
} as const;

export const SUPPORT_SUMMARY = {
  eyebrow: "Support / 06",
  heading: "If something here was worth your time.",
  description:
    "There are two ways to give something back, and neither is required. Contribute to the code, or buy me a coffee.",
} as const;

/**
 * Resolves the tip URL, or `null` when no destination is configured. Returning
 * `null` keeps the tip card out of the page entirely rather than rendering a
 * link to a handle that may not exist.
 */
export function resolveTipUrl(): string | null {
  const configured = process.env[TIP.envVar];
  if (!configured) return null;
  const trimmed = configured.trim();
  return trimmed.length > 0 ? trimmed : null;
}
