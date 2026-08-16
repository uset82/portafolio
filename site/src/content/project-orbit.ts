/**
 * The Project Orbit roster is the content supplied in the Claude Design
 * handoff. It intentionally remains separate from the smaller, evidence-led
 * case-study register: the orbit is a navigational constellation, not a claim
 * that every displayed system has a published case study. Where a published
 * case study already exists, its internal route remains the primary link.
 */

export type OrbitDestination = "github" | "internal-route" | "assistant";

export type OrbitIcon =
  | "constellation"
  | "pyramid"
  | "bolt"
  | "waveform"
  | "robot"
  | "code"
  | "cube"
  | "pin"
  | "mic"
  | "chat";

export type OrbitProject = {
  id: string;
  name: string;
  description: string;
  category: string;
  destination: OrbitDestination;
  href: string;
  external: boolean;
  icon: OrbitIcon;
  featured?: boolean;
};

export const ORBIT_PROJECTS = [
  {
    id: "astraea",
    name: "ASTRAEA",
    description: "Celestial intelligence — chart reading and cosmic pattern work.",
    category: "Astrology",
    destination: "internal-route",
    href: "/work/astraea",
    external: false,
    icon: "constellation",
    featured: true,
  },
  {
    id: "pinaculo",
    name: "PINÁCULO",
    description: "Numerological engine built on the pinnacle method.",
    category: "Numerology",
    destination: "internal-route",
    href: "/work/pinaculo",
    external: false,
    icon: "pyramid",
  },
  {
    id: "future-energy",
    name: "FUTURE ENERGY",
    description: "Adaptive flow systems for energy and infrastructure.",
    category: "Energy",
    destination: "internal-route",
    href: "/work/future-energy",
    external: false,
    icon: "bolt",
  },
  {
    id: "sound-lab",
    name: "SOUND LAB",
    description: "The sound foundation — instruments, sessions and releases.",
    category: "Music",
    destination: "internal-route",
    href: "/sound",
    external: false,
    icon: "waveform",
  },
  {
    id: "arcade",
    name: "ARCADE",
    description: "Games you can play here, and the honest state of the rest.",
    category: "Games",
    destination: "internal-route",
    href: "/arcade",
    external: false,
    icon: "cube",
    featured: true,
  },
  {
    id: "repo2agent",
    name: "Repo2Agent",
    description: "Turns a repository into an agent ANA can reason with.",
    category: "Research",
    destination: "internal-route",
    href: "/laboratory",
    external: false,
    icon: "robot",
  },
  {
    id: "strudelai",
    name: "StrudelAI",
    description: "Generative music patterns written as live code.",
    category: "Music",
    destination: "github",
    href: "https://github.com/uset82/StrudelAI",
    external: true,
    icon: "code",
  },
  {
    id: "3doodle",
    name: "3Doodle",
    description: "Sketch in three dimensions straight in the browser.",
    category: "Creative",
    destination: "github",
    href: "https://github.com/uset82/3Doodle",
    external: true,
    icon: "cube",
  },
  {
    id: "ifoundyou",
    name: "iFoundYou",
    description: "Finding people and things through shared signals.",
    category: "Tool",
    destination: "github",
    href: "https://github.com/uset82/iFoundYou",
    external: true,
    icon: "pin",
  },
  {
    id: "avatar-studio",
    name: "Avatar Studio",
    description: "Voice and likeness studio for synthetic presenters.",
    category: "AI",
    destination: "github",
    href: "https://github.com/uset82/avatar-studio",
    external: true,
    icon: "mic",
  },
  {
    id: "smartchatbot",
    name: "SmartChatbot",
    description: "CACM AI's conversational layer over the whole portfolio.",
    category: "AI",
    destination: "assistant",
    href: "/laboratory",
    external: false,
    icon: "chat",
  },
] as const satisfies readonly OrbitProject[];

export const ORBIT_CONFIG = {
  radiusX: 7.5,
  radiusZ: 2.95,
  bearingBalls: 22,
  revolutionSeconds: 32,
  focusAngle: Math.PI / 2,
  focusDurationMs: 820,
  hoverSlowFactor: 0.25,
  dragThresholdPx: 5,
  inertiaDamping: 0.93,
} as const;

export type AtomicRingId = "vertical" | "horizontal" | "diagonal-a" | "diagonal-b";

export type AtomicRingDefinition = {
  id: AtomicRingId;
  name: string;
  radiusX: number;
  radiusZ: number;
  rotationEuler: readonly [number, number, number];
  bearingBalls: number;
  projectIds: readonly string[];
  initialNodeAngles: readonly number[];
};

/**
 * The four shells of the CA²M atom, authored for a front-facing camera so the
 * instrument reads as one centred, mirror-symmetric composition:
 *
 *   - rings live in their local XY plane (the view plane) and only lean a few
 *     degrees out of it for depth — the diagonals lean as exact mirrors;
 *   - `initialNodeAngles` are fixed seats, not starting phases: every node has
 *     a designed position and the pairs mirror each other across the vertical
 *     axis (StrudelAI↔iFoundYou, SOUND LAB↔ASTRAEA, ARCADE↔Avatar Studio,
 *     Repo2Agent↔SmartChatbot, 3Doodle↔FUTURE ENERGY).
 *
 * Angles are in radians on the ring's own ellipse, y-up, counter-clockwise,
 * 0 at the ring's +X axis.
 */
const DIAGONAL_TILT = Math.PI * (34 / 180);

export const ATOMIC_ORBIT_RINGS: readonly AtomicRingDefinition[] = [
  {
    id: "vertical",
    name: "Meridian Orbit",
    radiusX: 1.9,
    radiusZ: 4.5,
    rotationEuler: [0, 0.14, 0],
    bearingBalls: 14,
    projectIds: ["3doodle", "future-energy"],
    initialNodeAngles: [Math.PI / 2, -Math.PI / 2],
  },
  {
    id: "horizontal",
    name: "Equatorial Orbit",
    radiusX: 7.8,
    radiusZ: 1.5,
    rotationEuler: [-0.12, 0, 0],
    bearingBalls: 18,
    projectIds: ["repo2agent", "smartchatbot", "arcade", "avatar-studio"],
    initialNodeAngles: [Math.PI, 0, (-115 * Math.PI) / 180, (-65 * Math.PI) / 180],
  },
  {
    id: "diagonal-a",
    name: "Diagonal Orbit Alpha",
    radiusX: 7.2,
    radiusZ: 2,
    rotationEuler: [0.08, 0.11, DIAGONAL_TILT],
    bearingBalls: 16,
    projectIds: ["ifoundyou", "sound-lab"],
    initialNodeAngles: [(-30 * Math.PI) / 180, (-145 * Math.PI) / 180],
  },
  {
    id: "diagonal-b",
    name: "Diagonal Orbit Beta",
    radiusX: 7.2,
    radiusZ: 2,
    rotationEuler: [0.08, -0.11, -DIAGONAL_TILT],
    bearingBalls: 16,
    projectIds: ["strudelai", "astraea", "pinaculo"],
    initialNodeAngles: [(-150 * Math.PI) / 180, (-35 * Math.PI) / 180, (28 * Math.PI) / 180],
  },
] as const;
