/**
 * Cosmos: the two public astrology and numerology apps.
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
    status: "Open to try",
    summary:
      "Natal-chart astrology inspired by astro.com, with AI interpretation from the chart data. You can try it on its own site.",
    repository: "https://github.com/uset82/ASTROEA",
    repositoryLabel: "View ASTROEA",
    tryUrl: "https://astraia.netlify.app/",
    tryLabel: "Try ASTROEA",
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

export const COSMOS_CONTRIBUTE = {
  heading: "The repositories are public.",
  body: "You can read the code and open a conversation on GitHub. These two do not carry an MIT licence yet, so this site does not invite reuse the way the four MIT repositories on Support do.",
} as const;
