/**
 * The arcade roster.
 *
 * Every entry is backed by the C.1 build measurements recorded in
 * `public/games/C1-MEASUREMENTS.md` (measured 2026-07-31). Sizes, engines,
 * input methods and hosting tiers are copied from that measurement run rather
 * than estimated, and no game is described as playable here unless this build
 * can actually serve it.
 *
 * Hosting tiers follow `updates/00-master-plan.md` section 8.2:
 *   A - static build vendored into `public/games/<slug>/`, same origin.
 *   B - its own Railway service, reached through an environment-backed URL.
 *   C - already hosted elsewhere; consent-gated embed.
 *   none - not web-playable; documentation only.
 */

export type ArcadeTier = "A" | "B" | "C" | "none";

/** How this build reaches the game, if it can reach it at all. */
export type ArcadeSource =
  /** Vendored into `public/games/<path>` and served from this origin. */
  | { kind: "same-origin"; path: string }
  /** A separate service; the URL arrives from an environment variable. */
  | { kind: "service"; envVar: string }
  /** Live on a third-party host; loaded only after an explicit click. */
  | { kind: "external"; url: string; provider: string }
  /** Nothing to load - the game does not run in a browser. */
  | { kind: "none" };

export type ArcadeStatus =
  /** Reachable right now, from this build. */
  | "playable"
  /** Measured and shippable, but not yet hosted. `blockedBy` says why. */
  | "preparing"
  /** Runs, but not in a browser. Documented instead of embedded. */
  | "documentation";

export type ArcadeGame = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  engine: string;
  /** Plain-language input summary, shown before anyone commits to loading. */
  input: string;
  /** Concrete controls, listed so a visitor knows what they need. */
  controls: readonly string[];
  /** Honest mobile answer, from the C.1 mobile-viability column. */
  mobile: string;
  /** True when the game asks for camera access, so we can warn first. */
  needsCamera: boolean;
  status: ArcadeStatus;
  /** Present when `status` is not `playable`: the specific reason. */
  blockedBy?: string;
  tier: ArcadeTier;
  source: ArcadeSource;
  builtSize: string;
  repository: string;
  /** Licence as it stands in the repository today, not as we wish it were. */
  license: string;
  measuredOn: string;
};

/**
 * The declared type is deliberately widened to `ArcadeGame[]` while the literal
 * initializer is still checked by `satisfies`. Without the annotation every
 * entry keeps its own literal shape, and optional fields such as `blockedBy`
 * become unreachable when iterating the roster.
 */
export const ARCADE_GAMES: readonly ArcadeGame[] = [
  {
    id: "mandelbro",
    slug: "mandelbro",
    title: "MandelBro",
    tagline: "Kids world creator",
    description:
      "Pick a character, describe the world you want, and build it from one of six templates: blocky caves, sky defence, racing, retro arcade, ocean, or galaxy. The simplified build runs entirely in your browser with no account and no network calls.",
    engine: "HTML5 Canvas",
    input: "Mouse or touch",
    controls: [
      "Click or tap to choose a character and a template",
      "Type a description of the world you want",
    ],
    mobile: "Works on phones; the template grid is easier to read on a larger screen.",
    needsCamera: false,
    status: "playable",
    tier: "A",
    source: { kind: "same-origin", path: "/games/mandelbro/index.html" },
    builtSize: "74 KB, single self-contained file",
    repository: "https://github.com/uset82/MandelBro",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "jacobgolf",
    slug: "jacobgolf",
    title: "Jacobs Golfspill",
    tagline: "Browser mini golf",
    description:
      "A browser-based mini golf challenge built with HTML5 canvas and vanilla JavaScript. Click or drag to aim, then release to shoot.",
    engine: "HTML5 Canvas and vanilla JavaScript",
    input: "Mouse or touch",
    controls: ["Click or drag from the ball to aim", "Release to shoot", "Avoid water and rocks"],
    mobile: "The live build is a canvas game that accepts click or drag aim.",
    needsCamera: false,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://jacobgolf.netlify.app/",
      provider: "Netlify",
    },
    builtSize: "17 KB hosted (702 B HTML, 14.9 KB JS, 1.4 KB CSS), measured 2026-08-16",
    repository: "https://github.com/uset82/Jacobgolf",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-16",
  },
  {
    id: "my-football-game",
    slug: "football",
    title: "My Football Game",
    tagline: "Two-player canvas football",
    description:
      "A canvas football match with a Socket.IO server behind it, so two people can play the same match at once. It carries its own Railway configuration and runs as a separate service rather than inside this build.",
    engine: "Canvas 2D and Socket.IO",
    input: "Keyboard, with on-screen touch controls",
    controls: [
      "Arrow keys or WASD to move",
      "On-screen touch pad on phones",
      "Two players share one match",
    ],
    mobile: "Touch controls are built in; two-player is more comfortable on a desktop.",
    needsCamera: false,
    status: "preparing",
    blockedBy:
      "Its own service is not deployed yet. As soon as NEXT_PUBLIC_FOOTBALL_GAME_URL points at a running instance, this page serves it.",
    tier: "B",
    source: { kind: "service", envVar: "NEXT_PUBLIC_FOOTBALL_GAME_URL" },
    builtSize: "4.85 MB deployed (0.14 MB client, 4.70 MB server dependencies)",
    repository: "https://github.com/uset82/My-Football-Game",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "monkey-tug-of-war",
    slug: "monkey-tug-of-war",
    title: "Monkey Tug of War",
    tagline: "Classroom mental arithmetic",
    description:
      "A Flutter and Flame classroom game: answer the arithmetic faster than the other side and pull the rope your way. Built for a browser and meant for a shared screen.",
    engine: "Flutter and Flame",
    input: "Touch or tap keypad",
    controls: ["Tap the number keypad to answer", "No keyboard required"],
    mobile: "Runs in any browser, but the payload is heavy on a phone connection.",
    needsCamera: false,
    status: "preparing",
    blockedBy:
      "The committed Flutter build is 35.6 MB, of which 31.6 MB is the CanvasKit renderer. It needs a fresh HTML-renderer build before it is fair to serve.",
    tier: "A",
    source: { kind: "none" },
    builtSize: "35.59 MB (4.02 MB without CanvasKit)",
    repository: "https://github.com/uset82/Monkey-Tug-of-War",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "gimmemycake",
    slug: "gimmemycake",
    title: "Gimme My Cake",
    tagline: "Reach for the cake with your hands",
    description:
      "A three-dimensional scene you play with your hands: MediaPipe reads the webcam and your grasp moves the cake. A touch mode exists for machines without a camera.",
    engine: "Vite, Three.js and MediaPipe Hands",
    input: "Webcam hand tracking, with a touch fallback",
    controls: [
      "Allow camera access, then move your hands in view",
      "Touch mode is available without a camera",
    ],
    mobile: "Needs HTTPS and camera permission; the touch fallback carries phones.",
    needsCamera: true,
    status: "preparing",
    blockedBy:
      "The build is 33.8 MB and a single 29.5 MB model file accounts for nearly all of it. That model has to be optimised or moved off the page first.",
    tier: "A",
    source: { kind: "none" },
    builtSize: "33.78 MB (29.49 MB is one model file)",
    repository: "https://github.com/uset82/gimmemycake",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "drone-lips",
    slug: "drone-lips",
    title: "Drone Lips",
    tagline: "Fly a drone with your face",
    description:
      "MediaPipe tracks facial landmarks and turns them into flight input, so the drone answers your expression rather than a controller. Built and tuned against a phone camera.",
    engine: "Astro, React Three Fiber and MediaPipe Face",
    input: "Webcam face tracking",
    controls: ["Allow camera access", "Move your head and mouth to steer"],
    mobile: "Written with a phone camera in mind; needs HTTPS and camera permission.",
    needsCamera: true,
    status: "preparing",
    blockedBy:
      "The build is 27.3 MB, dominated by 18.1 MB of MediaPipe WebAssembly. That has to load from a shared location before it belongs in this build.",
    tier: "A",
    source: { kind: "none" },
    builtSize: "27.30 MB (18.1 MB MediaPipe WebAssembly)",
    repository: "https://github.com/uset82/drone_Lips",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "3doodle",
    slug: "3doodle",
    title: "3Doodle",
    tagline: "Draw, and keep what you drew",
    description:
      "A drawing canvas with a real back end, so sketches are stored rather than lost on refresh. The client is small; the database is what makes it a service rather than a static page.",
    engine: "Vite and React, Express, Drizzle and Postgres",
    input: "Mouse or touch drawing",
    controls: ["Draw with a pointer or a finger", "A mobile drawing layout ships with it"],
    mobile: "A mobile drawing layout ships with it.",
    needsCamera: false,
    status: "preparing",
    blockedBy:
      "It needs a Postgres database alongside its service. The client build is only 2.7 MB - the database is the whole dependency.",
    tier: "B",
    source: { kind: "none" },
    builtSize: "2.73 MB (2.71 MB client, 20 KB server)",
    repository: "https://github.com/uset82/3Doodle",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "reactiongame",
    slug: "reaction-game",
    title: "Reaction Game",
    tagline: "Reflexes, on real hardware",
    description:
      "A reaction-timing game written in C for a microcontroller, with physical buttons and lights. It is a real, finished game; it simply does not live in a browser.",
    engine: "C on a microcontroller",
    input: "Physical buttons",
    controls: ["Hardware buttons on the board"],
    mobile: "Not applicable - this one runs on a circuit board.",
    needsCamera: false,
    status: "documentation",
    blockedBy: "It runs on hardware, not in a browser. The repository is the honest record.",
    tier: "none",
    source: { kind: "none" },
    builtSize: "0.8 MB source",
    repository: "https://github.com/uset82/REACTIONGAME",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-07-31",
  },
  {
    id: "tetris",
    slug: "tetris",
    title: "Tetris",
    tagline: "Course work, in Java",
    description:
      "Carlos's own implementation from a course where the teacher supplied an example. The code is his; it is a desktop Java application, so it is listed here rather than embedded.",
    engine: "Java on the desktop",
    input: "Keyboard",
    controls: ["Arrow keys, on a desktop Java runtime"],
    mobile: "Not applicable - desktop Java.",
    needsCamera: false,
    status: "documentation",
    blockedBy: "Desktop Java does not run in a browser. Excluded for shape, not for authorship.",
    tier: "none",
    source: { kind: "none" },
    builtSize: "1.8 MB source",
    repository: "https://github.com/uset82/Tetris",
    license: "CC-BY-4.0 - attribution required",
    measuredOn: "2026-07-31",
  },
] as const satisfies readonly ArcadeGame[];

export function findArcadeGame(slug: string): ArcadeGame | undefined {
  return ARCADE_GAMES.find((game) => game.slug === slug);
}

/**
 * Resolves the URL this build can actually load for a game, or `null` when it
 * cannot load one. Environment-backed services resolve only when their variable
 * is set, so an undeployed service never renders a broken frame.
 */
export function resolveArcadeSource(game: ArcadeGame): string | null {
  switch (game.source.kind) {
    case "same-origin":
      return game.source.path;
    case "external":
      return game.source.url;
    case "service": {
      const configured = process.env[game.source.envVar];
      return configured && configured.length > 0 ? configured : null;
    }
    case "none":
      return null;
  }
}

/** True when a visitor can press play and something loads. */
export function isArcadeGamePlayable(game: ArcadeGame): boolean {
  return game.status === "playable" && resolveArcadeSource(game) !== null;
}

export const ARCADE_SUMMARY = {
  eyebrow: "Arcade / Play",
  heading: "Games you can play, and the honest state of the rest.",
  description:
    "Every game here is mine. Some run in this page, some are waiting on hosting, and two run on hardware or a desktop runtime and never will. Each one says which it is, what it needs, and where the code lives.",
  measurementNote:
    "Most build sizes come from a real build of each repository on 2026-07-31, not from repository size. Jacobs Golfspill was measured from its live Netlify host on 2026-08-16.",
} as const;
