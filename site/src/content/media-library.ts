/**
 * The music and moving-image library.
 *
 * The rooms are built; the shelves start empty on purpose. Carlos's Suno and
 * YouTube profiles are public and confirmed by him, so they are linked here.
 * Individual tracks and videos are added only once their published URL is
 * supplied, which keeps invented titles, durations and dates out of the build.
 *
 * One rights question is still open and is tracked as `M.11`: Suno's free tier
 * does not grant the same commercial rights as a paid tier, so `licence` on a
 * track must state what is actually true for that track rather than assuming.
 */

export type MusicTrack = {
  id: string;
  title: string;
  /** The public Suno song page. Required - this is the proof it is published. */
  url: string;
  /** Suno's embeddable player URL, when one exists for this song. */
  embedUrl?: string;
  /** ISO date the song was published, when known. */
  publishedOn?: string;
  /** What is actually true about reuse for this track. Never assumed. */
  licence: string;
  description?: string;
};

export type VideoWork = {
  id: string;
  title: string;
  /** The public YouTube watch URL. */
  url: string;
  /** The video id, used to build a privacy-enhanced embed URL. */
  videoId: string;
  publishedOn?: string;
  description?: string;
};

/**
 * Empty until Carlos supplies the published song URLs. Adding an entry here is
 * the only step needed for it to appear in the Sound room.
 */
export const MUSIC_TRACKS: readonly MusicTrack[] = [];

/**
 * Empty until Carlos supplies the published video URLs. Adding an entry here is
 * the only step needed for it to appear in the Sound room.
 */
export const VIDEO_WORKS: readonly VideoWork[] = [];

export const MUSIC_PROFILE = {
  platform: "Suno",
  handle: "uset182",
  url: "https://suno.com/@uset182",
  description:
    "Everything I have published with Suno lives here. Individual tracks arrive on this page as their rights are confirmed one by one.",
} as const;

export const VIDEO_PROFILE = {
  platform: "YouTube",
  handle: "cucciolo182",
  url: "https://www.youtube.com/@cucciolo182",
  description:
    "The video channel. Selected pieces are embedded here once each one is confirmed as published and cleared.",
} as const;

export const SOUND_ROOM = {
  eyebrow: "Sound and moving image / 02",
  heading: "Sound and moving image as pattern, memory, and response.",
  description:
    "Music made with Suno, video published on YouTube, and StrudelAI — a live-coding music system open for testing.",
  emptyState: {
    music:
      "No track is embedded here yet. The full published catalogue is on Suno in the meantime.",
    video:
      "No video is embedded here yet. The full published channel is on YouTube in the meantime.",
  },
  playbackNote:
    "Players are click-to-load. Loading one shares your IP address and browser information with that provider. The StrudelAI test build opens in its own site.",
} as const;

export const STRUDEL_AI = {
  title: "StrudelAI",
  status: "Open for testing",
  summary:
    "A public live-coding music system. The build is ready for people to try, and people who want to contribute are welcome.",
  demoUrl: "https://strudelzeroai.app.canner.ca/",
  demoLabel: "Open the test build",
  repositoryUrl: "https://github.com/uset82/StrudelAI",
  repositoryLabel: "View the repository",
} as const;

/** Privacy-enhanced YouTube embed: no cookies until playback actually starts. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
