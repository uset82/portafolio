/**
 * The music and video library.
 *
 * Carlos's Suno and YouTube profiles are public and confirmed by him, so they
 * are linked here. Individual tracks and videos are added only once he supplies
 * the URL, which keeps invented titles, durations and dates out of the build.
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
 * Tracks Carlos has sent for publication, in the order he sent them.
 *
 * `ABC on Crete Beach` is reachable by link but is not listed on his Suno
 * profile, so the profile link alone will not lead a visitor to it. Its title
 * is copied exactly as Suno stores it, ellipsis and all.
 */
export const MUSIC_TRACKS: readonly MusicTrack[] = [
  {
    id: "abc-on-crete-beach",
    title: "ABC on Crete Beach — Greek x Indi… x ZORBA vs PUNJABI — BEACH BATTLE (Mashup)",
    url: "https://suno.com/song/474592ab-7d93-4307-831b-7e447b11c11a",
    embedUrl: sunoEmbedUrl("474592ab-7d93-4307-831b-7e447b11c11a"),
    description:
      "Greek zorba and sirtaki traded against Punjabi bhangra, with the bouzouki always on top. Three and a half minutes, no vocals to speak of.",
    licence:
      "Made by Carlos with Suno and put here by him. Listening is free; this page grants no reuse rights.",
  },
];

/**
 * Empty until Carlos pastes published YouTube watch URLs. This update received
 * none, so the video shelf stays a channel link rather than invented titles.
 */
export const VIDEO_WORKS: readonly VideoWork[] = [];

export const MUSIC_PROFILE = {
  platform: "Suno",
  handle: "uset182",
  url: "https://suno.com/@uset182",
  description:
    "Tracks arrive on this page one at a time, as the rights on each one are confirmed. The full catalogue stays on Suno.",
} as const;

export const VIDEO_PROFILE = {
  platform: "YouTube",
  handle: "cucciolo182",
  url: "https://www.youtube.com/@cucciolo182",
  description:
    "The video channel. Selected pieces are embedded here once each one is confirmed as published and cleared.",
} as const;

export const SOUND_ROOM = {
  eyebrow: "Sound / 02",
  heading: "Music you can hear, and video you can watch.",
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

/** Suno's own player for one song. It plays for visitors with no Suno account. */
export function sunoEmbedUrl(songId: string): string {
  return `https://suno.com/embed/${songId}`;
}
