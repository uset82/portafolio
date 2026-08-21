/**
 * The arcade roster.
 *
 * Every entry is backed by the C.1 build measurements recorded in
 * `public/games/C1-MEASUREMENTS.md` (measured 2026-07-31). Sizes, engines,
 * input methods and hosting tiers are copied from that measurement run rather
 * than estimated, and no game is described as playable here unless this build
 * can actually serve it.
 *
 * Roster order is render order: the index groups by status and then keeps this
 * order inside each group, so moving an entry here moves its card.
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
    id: "jacobgolf",
    slug: "jacobgolf",
    title: "Jacobs Golfspill",
    tagline: "Browser mini golf",
    description:
      "This one is not mine. My son Jacob made it when he was nine: his idea, his game. I talked him through the instructions, and he did the fixing himself. It is a browser mini golf challenge in HTML5 canvas and vanilla JavaScript - click or drag to aim, then release to shoot.",
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
    id: "qubesolve",
    slug: "qubesolve",
    title: "QubeSolve",
    tagline: "3D Rubik's Cube solver",
    description:
      "A 3D Rubik's Cube solver and interactive puzzle built with Three.js. Rotate and manipulate the 3D cube, input any state, and follow step-by-step optimal solving solutions.",
    engine: "TypeScript and Three.js",
    input: "Mouse or touch",
    controls: [
      "Click or drag to rotate cube faces and inspect from all angles",
      "Follow step-by-step solving algorithms",
    ],
    mobile: "Interactive 3D canvas runs in modern mobile and desktop browsers.",
    needsCamera: false,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://qubesolve.netlify.app/",
      provider: "Netlify",
    },
    builtSize: "Hosted on Netlify, measured 2026-08-16",
    repository: "https://github.com/uset82/QubeSolve",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-16",
  },
  {
    id: "my-football-game",
    slug: "football",
    title: "My Football Game",
    tagline: "Two-player canvas football",
    description:
      "This one is Jacob's as well. My son made it when he was nine: his idea, his game, and his own fixes once I had talked him through the instructions. It is a canvas football match - one player against the AI, or two players sharing one keyboard. An online mode ships with it too, but the Socket.IO server it dials no longer answers, so the local modes are the ones to rely on.",
    engine: "Canvas 2D, with Socket.IO behind the online mode",
    input: "Keyboard, with on-screen touch controls",
    controls: [
      "Player one: arrow keys to move, space to kick, shift and space for a power shot",
      "Player two: WASD to move, E to kick, Q and E for a power shot",
      "On-screen touch pad on phones",
    ],
    mobile: "Touch controls are built in; two players on one keyboard needs a desktop.",
    needsCamera: false,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://poetic-faun-843df2.netlify.app/",
      provider: "Netlify",
    },
    builtSize: "36 KB transferred from the live host (1.9 KB HTML), 154 KB decoded",
    repository: "https://github.com/uset82/My-Football-Game",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-21",
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
    mobile:
      "Runs in any browser; the Flutter payload is still a few megabytes on a phone connection.",
    needsCamera: false,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://monkeytugofwar.netlify.app/",
      provider: "Netlify",
    },
    builtSize:
      "774 KB transferred from the live host, 2.6 MB decoded, plus the CanvasKit renderer the page pulls from a Google CDN",
    repository: "https://github.com/uset82/Monkey-Tug-of-War",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-21",
  },
  {
    id: "gimmemycake",
    slug: "gimmemycake",
    title: "Gimme My Cake",
    tagline: "Reach for the cake with your hands",
    description:
      "A three-dimensional scene you play with your hands: MediaPipe reads the webcam and your grasp flicks cake to the crying baby, and a drag-and-flick mode carries machines without a camera. It is by far the heaviest thing here, so open it on a connection that can take it.",
    engine: "Vite, Three.js and MediaPipe Hands",
    input: "Webcam hand tracking, with a touch fallback",
    controls: [
      "Allow camera access, then move your hands in view",
      "Touch mode is available without a camera",
    ],
    mobile:
      "Needs HTTPS and camera permission, and it is a 33 MB download - unkind to a phone connection.",
    needsCamera: true,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://gimmemycake.netlify.app/",
      provider: "Netlify",
    },
    builtSize:
      "32.7 MB transferred from the live host, of which one 29.5 MB model file is nearly all of it, plus MediaPipe from a CDN",
    repository: "https://github.com/uset82/gimmemycake",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-21",
  },
  {
    id: "drone-lips",
    slug: "drone-lips",
    title: "Drone Lips",
    tagline: "Fly a drone with your face",
    description:
      "MediaPipe tracks facial landmarks and turns them into flight input, so the drone answers your expression rather than a controller. It flies forward on its own; you steer it through the diamonds and past the enemies with your face.",
    engine: "Astro, React Three Fiber and MediaPipe Face",
    input: "Webcam face tracking",
    controls: [
      "Allow camera access, then press start",
      "Move your mouth left, right, up or down to strafe",
      "Open your mouth to boost; blink to fire, and hold a long blink to keep firing",
    ],
    mobile: "Written with a phone camera in mind; needs HTTPS and camera permission.",
    needsCamera: true,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://superlative-pony-49581f.netlify.app/",
      provider: "Netlify",
    },
    builtSize:
      "201 KB transferred to open the page, then about 10 MB once you press start - almost all of it the MediaPipe face model",
    repository: "https://github.com/uset82/drone_Lips",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-21",
  },
  {
    id: "3doodle",
    slug: "3doodle",
    title: "3Doodle",
    tagline: "Draw, and keep what you drew",
    description:
      "A drawing canvas for children: pick a colour, a brush size, and a tool, sketch an outline, then press Generate 3D and the result lands in the gallery beside the canvas. The live build carries its own back end, so a doodle is stored rather than lost on refresh.",
    engine: "Vite and React, with an Express, Drizzle and Postgres back end",
    input: "Mouse or touch drawing",
    controls: [
      "Draw with a pointer or a finger",
      "Choose a colour, a brush size, or the eraser and fill tools",
      "Press Generate 3D to send the sketch to the gallery",
    ],
    mobile: "A mobile drawing layout ships with it.",
    needsCamera: false,
    status: "playable",
    tier: "C",
    source: {
      kind: "external",
      url: "https://3doodle.netlify.app/draw",
      provider: "Netlify",
    },
    builtSize:
      "140 KB transferred from the live host (2.1 KB HTML, 126 KB JS, 12 KB CSS), 493 KB decoded",
    repository: "https://github.com/uset82/3Doodle",
    license: "No LICENSE file in the repository yet - all rights reserved by Carlos Carpio",
    measuredOn: "2026-08-21",
  },
  {
    id: "mandelbro",
    slug: "mandelbro",
    title: "MandelBro",
    tagline: "Kids world creator",
    description:
      "This was an idea project: a prototype made to test whether the concept held up, not a finished game. Pick a character, describe the world you want, and build it from one of six templates: blocky caves, sky defence, racing, retro arcade, ocean, or galaxy. The simplified build runs entirely in your browser with no account and no network calls.",
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
    "Every game here is mine, apart from the mini golf and the football: those two are my son Jacob's, built when he was nine. Most of them run in this page; two run on hardware or a desktop runtime and never will. Each one says which it is, what it needs, and where the code lives.",
  measurementNote:
    "Build sizes come from a real build of each repository on 2026-07-31, not from repository size. The games served from a live Netlify host were re-measured against that host instead: Jacobs Golfspill and QubeSolve on 2026-08-16, and 3Doodle, My Football Game, Monkey Tug of War, Gimme My Cake and Drone Lips on 2026-08-21.",
} as const;
