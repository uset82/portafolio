/**
 * The complete set of literal colors permitted in application source.
 * CSS semantic tokens and future Three.js materials must resolve to this contract.
 */
export const naturalPalette = {
  taupe: "#a38772",
  stoneSage: "#c1bfb0",
  mutedSage: "#b1b199",
  sand: "#ecdfcf",
  warmIvory: "#fef4ea",
  clay: "#cfa18a",
  paleSage: "#cccab5",
  offWhite: "#e5dfd3",
  darkSage: "#77715b",
  warmTaupe: "#be967d",
  buff: "#dcc1ac",
  dustyPink: "#e8bdb4",
  parchment: "#e8dfd5",
  stone: "#aea090",
  sceneTaupe: "#9d8a73",
  sceneSand: "#c9b49e",
  linen: "#d7c7b5",
  shadowSage: "#6f6655",
  oak: "#8b755d",
  walnut: "#5f4b35",
  espresso: "#2e2417",
  deepWood: "#4b3520",
  moss: "#69705a",
  deepEspresso: "#2a1d16",
  waterSlate: "#5b6965",
  waterLight: "#87918a",
  pewter: "#9b9d96",
  silver: "#c8c7be",
  textSecondary: "#6e5b4d",
  borderSoft: "#cdb69e",
} as const;

export const threeMaterialPalette = {
  observatoryArchitecture: naturalPalette.parchment,
  ceramicRobot: naturalPalette.offWhite,
  ceramicRobotShadow: naturalPalette.stone,
  waterBasin: naturalPalette.waterSlate,
  waterHighlight: naturalPalette.waterLight,
  astraea: naturalPalette.pewter,
  pinaculo: naturalPalette.oak,
  soundLab: naturalPalette.walnut,
  futureEnergy: naturalPalette.mutedSage,
  electronics: naturalPalette.deepWood,
  warmIndicator: naturalPalette.clay,
} as const;

export type NaturalPaletteColor = (typeof naturalPalette)[keyof typeof naturalPalette];
