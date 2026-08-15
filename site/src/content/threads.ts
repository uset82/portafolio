/**
 * Threads: what a project is *about*, as opposed to what a visitor wants to
 * *do* with it.
 *
 * The navigation answers the second question with four doors — Play, See,
 * Listen, About. Threads answer the first, and they are deliberately not
 * navigation: they are chips on a card that cross-link work which lives in
 * different rooms. Someone who arrived for a game finds the music that way, and
 * someone who arrived for music finds the hardware.
 *
 * Two rules keep this honest.
 *
 *   1. **One home per project.** Every entry declares the single route where
 *      its full card lives. Anywhere else it appears as a one-line mention with
 *      a link, never a second full card, so nobody reads two different framings
 *      of the same project and thinks they are two projects.
 *
 *   2. **Threads are observed, not invented.** Each assignment comes from what
 *      the repository actually is. The crossings are the interesting part:
 *      REACTIONGAME is a game that runs on a circuit board, StrudelAI is music
 *      written as code.
 */

export type ThreadId = "sound" | "games" | "matter" | "symbol" | "intelligence";

/** The route a project's full card lives on. */
export type ProjectHome = "/arcade" | "/work" | "/sound";

export type Thread = {
  id: ThreadId;
  slug: string;
  label: string;
  /** One line, shown on the thread page. */
  description: string;
};

export const THREADS: readonly Thread[] = [
  {
    id: "sound",
    slug: "sound",
    label: "Sound",
    description:
      "Music, instruments, and the systems that make them — whether they run in a browser or on a circuit board.",
  },
  {
    id: "games",
    slug: "games",
    label: "Games",
    description:
      "Things built to be played, from canvas football to a game that lives on hardware.",
  },
  {
    id: "matter",
    slug: "matter",
    label: "Matter",
    description:
      "Work that touches the physical world: microcontrollers, an FPGA, sensors, and irrigation.",
  },
  {
    id: "symbol",
    slug: "symbol",
    label: "Symbol",
    description:
      "Symbolic systems read as pattern — astrology and numerology, built as working software rather than claims.",
  },
  {
    id: "intelligence",
    slug: "intelligence",
    label: "Intelligence",
    description: "Agents, assistants, and tools that put a model to work on a concrete job.",
  },
];

export type ThreadAssignment = {
  /** Matches the `id` used in `flagship.ts` or `arcade.ts`. */
  id: string;
  /** Display name, so a mention can render without loading the other module. */
  name: string;
  home: ProjectHome;
  /** One or two. A third would mean the threads are too vague to be useful. */
  threads: readonly ThreadId[];
};

export const THREAD_ASSIGNMENTS: readonly ThreadAssignment[] = [
  // Games — home is the arcade, because that is where you can press play.
  { id: "mandelbro", name: "MandelBro", home: "/arcade", threads: ["games"] },
  { id: "my-football-game", name: "My Football Game", home: "/arcade", threads: ["games"] },
  { id: "monkey-tug-of-war", name: "Monkey Tug of War", home: "/arcade", threads: ["games"] },
  {
    id: "gimmemycake",
    name: "Gimme My Cake",
    home: "/arcade",
    threads: ["games", "intelligence"],
  },
  { id: "drone-lips", name: "Drone Lips", home: "/arcade", threads: ["games", "intelligence"] },
  { id: "reactiongame", name: "Reaction Game", home: "/arcade", threads: ["games", "matter"] },
  { id: "tetris", name: "Tetris", home: "/arcade", threads: ["games"] },
  { id: "3doodle", name: "3Doodle", home: "/arcade", threads: ["games", "intelligence"] },

  // Sound — StrudelAI's home is the Sound room: it is the one music system with
  // a public build a visitor can open and hear.
  { id: "strudelai", name: "StrudelAI", home: "/sound", threads: ["sound", "intelligence"] },

  // Everything else lives in the register.
  { id: "webdesigner", name: "WebDesigner for Codex", home: "/work", threads: ["intelligence"] },
  { id: "avatar-studio", name: "Codex Avatar Studio", home: "/work", threads: ["intelligence"] },
  { id: "thesis-writer-kit", name: "Thesis Writer Kit", home: "/work", threads: ["intelligence"] },
  { id: "rs232-vhdl", name: "RS-232 for DE2-115", home: "/work", threads: ["matter"] },
  {
    id: "automatic-watering-elephant",
    name: "Automatic Watering Elephant",
    home: "/work",
    threads: ["matter"],
  },
  { id: "lyrigenie", name: "LyriGenie", home: "/work", threads: ["sound", "intelligence"] },
  { id: "mentora", name: "Mentora", home: "/work", threads: ["intelligence"] },

  // The Observatory concepts. They are threaded like everything else so the
  // Symbol thread is not an empty label, but they keep their concept framing on
  // the page: a thread says what a project is about, never that it is finished.
  { id: "project-astraea", name: "ASTRAEA", home: "/work", threads: ["symbol"] },
  { id: "project-pinaculo", name: "PINÁCULO", home: "/work", threads: ["symbol"] },
  { id: "project-future-energy", name: "Future Energy", home: "/work", threads: ["matter"] },
];

export function findThread(slug: string): Thread | undefined {
  return THREADS.find((thread) => thread.slug === slug);
}

export function assignmentFor(id: string): ThreadAssignment | undefined {
  return THREAD_ASSIGNMENTS.find((entry) => entry.id === id);
}

/** The threads a project carries, resolved to full records for rendering. */
export function threadsFor(id: string): readonly Thread[] {
  const assignment = assignmentFor(id);
  if (!assignment) return [];
  return assignment.threads.flatMap((threadId) => {
    const thread = THREADS.find((candidate) => candidate.id === threadId);
    return thread ? [thread] : [];
  });
}

/** Everything on a thread, in registry order, regardless of which room it lives in. */
export function projectsOnThread(threadId: ThreadId): readonly ThreadAssignment[] {
  return THREAD_ASSIGNMENTS.filter((entry) => entry.threads.includes(threadId));
}

/** True when this project's full card belongs on the given route. */
export function livesOn(id: string, route: ProjectHome): boolean {
  return assignmentFor(id)?.home === route;
}
