/**
 * Cosmos: the two public astrology and numerology apps, plus the travel hold.
 *
 * These repositories are public to read. They are not on the MIT contribution
 * list in /support. This portfolio does not host the apps, iframe them, or
 * collect names or birth dates.
 */
export type CosmosApp = {
  id: "astraea" | "pinaculo";
  name: string;
  kind: string;
  status: string;
  summary: string;
  repository: string;
  repositoryLabel: string;
  tryUrl: string | null;
  tryLabel: string | null;
};

export const COSMOS_APPS: readonly CosmosApp[] = [
  {
    id: "astraea",
    name: "ASTROEA",
    kind: "Astrology",
    status: "Code on GitHub",
    summary:
      "Natal-chart astrology inspired by astro.com, with AI interpretation from the chart data. The repository is public. No try-it URL is listed yet.",
    repository: "https://github.com/uset82/ASTROEA",
    repositoryLabel: "View ASTROEA",
    tryUrl: null,
    tryLabel: null,
  },
  {
    id: "pinaculo",
    name: "Pináculo",
    kind: "Numerology",
    status: "Open to try",
    summary:
      "A 24-position numerology system. Interpretations draw on Carl Jung. You can try it on its own site.",
    repository: "https://github.com/uset82/pinaculo",
    repositoryLabel: "View Pináculo",
    tryUrl: "https://pinaculo.netlify.app/",
    tryLabel: "Try Pináculo",
  },
];

export const astraeaApp: CosmosApp = COSMOS_APPS[0]!;
export const pinaculoApp: CosmosApp = COSMOS_APPS[1]!;

export const COSMOS_TRAVEL = {
  name: "Travel notes",
  status: "Held for privacy",
  summary:
    "Specific journeys, places, dates, and images stay unpublished until Carlos approves their privacy and reuse rights.",
} as const;

export const COSMOS_CONTRIBUTE = {
  heading: "The repositories are public.",
  body: "You can read the code and open a conversation on GitHub. These two do not carry an MIT licence yet, so this site does not invite reuse the way the four MIT repositories on Support do.",
} as const;
