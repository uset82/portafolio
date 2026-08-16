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

export const ATOMIC_ORBIT_RINGS: readonly AtomicRingDefinition[] = [
  {
    id: "vertical",
    name: "Vertical Polar Orbit",
    radiusX: 5.2,
    radiusZ: 2.1,
    rotationEuler: [0, Math.PI / 2.35, Math.PI / 2],
    bearingBalls: 14,
    projectIds: ["3doodle", "future-energy"],
    initialNodeAngles: [Math.PI, 0],
  },
  {
    id: "horizontal",
    name: "Equatorial Orbit",
    radiusX: 7.8,
    radiusZ: 2.4,
    rotationEuler: [0.36, 0, 0],
    bearingBalls: 18,
    projectIds: ["repo2agent", "smartchatbot"],
    initialNodeAngles: [Math.PI, 0],
  },
  {
    id: "diagonal-a",
    name: "Diagonal Orbit Alpha",
    radiusX: 7.4,
    radiusZ: 2.25,
    rotationEuler: [0.32, 0.24, Math.PI / 5.2],
    bearingBalls: 16,
    projectIds: ["strudelai", "astraea", "pinaculo"],
    initialNodeAngles: [Math.PI, Math.PI * 0.15, Math.PI * 0.28],
  },
  {
    id: "diagonal-b",
    name: "Diagonal Orbit Beta",
    radiusX: 7.4,
    radiusZ: 2.25,
    rotationEuler: [0.32, -0.24, -Math.PI / 5.2],
    bearingBalls: 16,
    projectIds: ["ifoundyou", "avatar-studio", "sound-lab", "arcade"],
    initialNodeAngles: [0, Math.PI * 0.22, Math.PI, Math.PI * 0.85],
  },
] as const;
